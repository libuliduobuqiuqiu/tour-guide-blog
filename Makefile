# Tour Guide Blog - Makefile
# 目标：按场景组织，保持可读、可维护、可复用。

SHELL := /bin/bash
.DEFAULT_GOAL := help

# ==============================
# 可覆盖变量（本地）
# ==============================
NEXT_PUBLIC_API_URL ?= http://localhost:8080

DB_HOST ?= 127.0.0.1
DB_PORT ?= 3306
DB_USER ?= root
DB_PASS ?=
DB_NAME ?= tour_guide
UPLOADS_DIR ?= backend/uploads

# ==============================
# 可覆盖变量（远程）
# ==============================
SSH_HOST ?= 123.207.65.202
SSH_USER ?= root
SSH_PORT ?= 22
SSH_OPTS ?= -o StrictHostKeyChecking=accept-new
REMOTE_DIR ?= /opt
REMOTE_DB_HOST ?= 127.0.0.1
REMOTE_DB_PORT ?= 3306
REMOTE_DB_USER ?= root
REMOTE_DB_PASS ?=
REMOTE_DB_NAME ?= tour_guide

BACKEND_SERVICE ?= tour-guide-backend
FRONTEND_SERVICE ?= tour-guide-frontend
SYSTEMD_DIR ?= /etc/systemd/system
REMOTE_UPLOADS_DIR ?= $(REMOTE_DIR)/backend/uploads

# ==============================
# 可覆盖变量（产物）
# ==============================
DIST_DIR ?= dist
BACKUP_DIR ?= backups
REMOTE_DATA_ARCHIVE ?= remote-data-export.tar.gz
LOCAL_DATA_ARCHIVE ?= $(BACKUP_DIR)/remote-data-export-$(SSH_HOST)-$(shell date +%Y%m%d_%H%M%S).tar.gz

SSH := ssh -p $(SSH_PORT) $(SSH_OPTS) $(SSH_USER)@$(SSH_HOST)
SCP := scp -P $(SSH_PORT) $(SSH_OPTS)

.PHONY: \
	help \
	dev-frontend dev-backend-amd64 dev-backend-arm64 \
	test-frontend test-backend-unit test-backend-integration test-backend test-all \
	quality-frontend quality-backend quality-all check-all \
	build-backend build-frontend package-backend package-frontend package \
	remote-deploy-backend remote-deploy-frontend remote-deploy-all \
	install-services restart-backend restart-frontend restart-services \
	data-package-local data-push-server data-apply-server data-export-server data-download-server \
	dump-db clean-unused-uploads clean-unused-uploads-apply changelog \
	frontend backend mac deploy-backend deploy-frontend deploy deploy-data package-data upload-data remote-import-data

# ==============================
# 帮助
# ==============================
help:
	@echo "";
	@echo "Tour Guide Blog Make Targets";
	@echo "";
	@echo "[1] 本地开发";
	@echo "  dev-frontend             启动前端开发服务";
	@echo "  dev-backend-amd64        启动后端（linux/amd64）";
	@echo "  dev-backend-arm64        启动后端（darwin/arm64）";
	@echo "  test-backend-unit        后端单元测试";
	@echo "  test-backend-integration 后端集成测试（integration tag）";
	@echo "  test-backend             后端全量测试";
	@echo "  test-frontend            前端测试（若未配置 test 脚本则跳过）";
	@echo "  test-all                 前后端测试";
	@echo "  quality-backend          后端质量检查（go vet）";
	@echo "  quality-frontend         前端质量检查（lint + build）";
	@echo "  quality-all              前后端质量检查";
	@echo "  check-all                前后端测试 + 质量检查";
	@echo "";
	@echo "[2] 远程部署";
	@echo "  remote-deploy-backend    打包并部署后端";
	@echo "  remote-deploy-frontend   打包并部署前端";
	@echo "  remote-deploy-all        一次部署前后端";
	@echo "  install-services         安装/更新 systemd 服务文件";
	@echo "  restart-services         重启远程前后端服务";
	@echo "";
	@echo "[3] 数据库 + 图片（上传/下载）";
	@echo "  data-package-local       打包本地数据库+图片到 dist/data.tar.gz";
	@echo "  data-push-server         上传 data.tar.gz 到服务器";
	@echo "  data-apply-server        上传并导入到远程数据库+图片目录";
	@echo "  data-export-server       在服务器打包数据库+图片";
	@echo "  data-download-server     从服务器下载打包数据到 backups/";
	@echo "  clean-unused-uploads     扫描 backend/uploads 中未被数据库引用的图片（dry-run）";
	@echo "  clean-unused-uploads-apply 真正删除未被引用的上传图片";
	@echo "";
	@echo "[其他]";
	@echo "  package                  打包前后端发布产物";
	@echo "  dump-db                  导出本地数据库到 dist/db_dump.sql";
	@echo "  changelog                根据 docs/commit-log-*.md 生成 CHANGELOG.md";

# ==============================
# 1) 本地开发
# ==============================
dev-frontend:
	cd frontend && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm run dev

dev-backend-amd64:
	cd backend && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go run ./cmd/main.go -d

dev-backend-arm64:
	cd backend && CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go run ./cmd/main.go -d

test-backend-unit:
	cd backend && GOCACHE=/tmp/go-build-cache go test ./... -cover

test-backend-integration:
	cd backend && GOCACHE=/tmp/go-build-cache go test -tags=integration ./...

test-backend: test-backend-unit test-backend-integration

test-frontend:
	cd frontend && npm ci && \
	if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)"; then \
		npm run test; \
	else \
		echo "No frontend test script configured. Skip."; \
	fi

test-all: test-backend test-frontend

quality-backend:
	cd backend && GOCACHE=/tmp/go-build-cache go vet ./...

quality-frontend:
	cd frontend && npm ci && npm run lint && npm run build

quality-all: quality-backend quality-frontend

check-all: test-all quality-all

# ==============================
# 构建与打包（部署基础）
# ==============================
build-backend:
	@set -e; \
	mkdir -p $(DIST_DIR)/backend; \
	echo "Building backend..."; \
	cd backend && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ../$(DIST_DIR)/backend/tour-guide-backend ./cmd/main.go; \
	cp -a backend/configs $(DIST_DIR)/backend/; \
	echo "Backend build output: $(DIST_DIR)/backend"

build-frontend:
	@set -e; \
	echo "Building frontend..."; \
	cd frontend && npm ci && npm run build; \
	rm -rf $(DIST_DIR)/frontend; \
	mkdir -p $(DIST_DIR)/frontend/.next; \
	cp -a frontend/.next/standalone/. $(DIST_DIR)/frontend/; \
	cp -a frontend/.next/static $(DIST_DIR)/frontend/.next/; \
	cp -a frontend/public $(DIST_DIR)/frontend/; \
	echo "Frontend build output: $(DIST_DIR)/frontend"

package-backend: build-backend
	@set -e; \
	mkdir -p $(DIST_DIR); \
	COPYFILE_DISABLE=1 tar -czf $(DIST_DIR)/backend.tar.gz -C $(DIST_DIR)/backend .; \
	echo "Created $(DIST_DIR)/backend.tar.gz"

package-frontend: build-frontend
	@set -e; \
	mkdir -p $(DIST_DIR); \
	COPYFILE_DISABLE=1 tar -czf $(DIST_DIR)/frontend.tar.gz -C $(DIST_DIR)/frontend .; \
	echo "Created $(DIST_DIR)/frontend.tar.gz"

package: package-backend package-frontend

# ==============================
# 2) 远程部署
# ==============================
remote-deploy-backend: package-backend
	@set -e; \
	$(SSH) "mkdir -p $(REMOTE_DIR) $(REMOTE_DIR)/backend"; \
	$(SCP) $(DIST_DIR)/backend.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$(SSH) "set -e; tar -xzf $(REMOTE_DIR)/backend.tar.gz -C $(REMOTE_DIR)/backend; systemctl restart $(BACKEND_SERVICE); systemctl --no-pager --full status $(BACKEND_SERVICE) | head -n 20"; \
	echo "Remote backend deployed: $(REMOTE_DIR)/backend"

remote-deploy-frontend: package-frontend
	@set -e; \
	$(SSH) "mkdir -p $(REMOTE_DIR)"; \
	$(SCP) $(DIST_DIR)/frontend.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$(SSH) "set -e; rm -rf $(REMOTE_DIR)/frontend; mkdir -p $(REMOTE_DIR)/frontend; tar -xzf $(REMOTE_DIR)/frontend.tar.gz -C $(REMOTE_DIR)/frontend; systemctl restart $(FRONTEND_SERVICE); systemctl --no-pager --full status $(FRONTEND_SERVICE) | head -n 20"; \
	echo "Remote frontend deployed: $(REMOTE_DIR)/frontend"

remote-deploy-all: remote-deploy-backend remote-deploy-frontend

install-services:
	@set -e; \
	$(SCP) deploy/systemd/tour-guide-backend.service deploy/systemd/tour-guide-frontend.service $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$(SSH) "set -e; cp $(REMOTE_DIR)/tour-guide-backend.service $(SYSTEMD_DIR)/$(BACKEND_SERVICE).service; cp $(REMOTE_DIR)/tour-guide-frontend.service $(SYSTEMD_DIR)/$(FRONTEND_SERVICE).service; systemctl daemon-reload; systemctl enable $(BACKEND_SERVICE) $(FRONTEND_SERVICE)"; \
	echo "Systemd services installed: $(BACKEND_SERVICE), $(FRONTEND_SERVICE)"

restart-backend:
	$(SSH) "systemctl restart $(BACKEND_SERVICE) && systemctl --no-pager --full status $(BACKEND_SERVICE) | head -n 20"

restart-frontend:
	$(SSH) "systemctl restart $(FRONTEND_SERVICE) && systemctl --no-pager --full status $(FRONTEND_SERVICE) | head -n 20"

restart-services: restart-backend restart-frontend

# ==============================
# 3) 数据库 + 图片（上传/下载）
# ==============================
dump-db:
	@set -e; \
	mkdir -p $(DIST_DIR); \
	if [ -z "$(DB_PASS)" ]; then \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER)"; \
	else \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS)"; \
	fi; \
	echo "Exporting database $(DB_NAME) to $(DIST_DIR)/db_dump.sql"; \
	$$MYSQLDUMP --single-transaction --routines --events --triggers $(DB_NAME) > $(DIST_DIR)/db_dump.sql; \
	echo "Database export completed."

clean-unused-uploads:
	@set -e; \
	cd backend && GOCACHE=/tmp/go-build-cache go run ./cmd/cleanup_uploads

clean-unused-uploads-apply:
	@set -e; \
	cd backend && GOCACHE=/tmp/go-build-cache go run ./cmd/cleanup_uploads --apply

data-package-local: dump-db
	@set -e; \
	rm -rf $(DIST_DIR)/data && mkdir -p $(DIST_DIR)/data; \
	cp -a $(DIST_DIR)/db_dump.sql $(DIST_DIR)/data/; \
	if [ -d "$(UPLOADS_DIR)" ]; then \
		mkdir -p $(DIST_DIR)/data/uploads; \
		cp -a "$(UPLOADS_DIR)/." $(DIST_DIR)/data/uploads/; \
	fi; \
	COPYFILE_DISABLE=1 tar -czf $(DIST_DIR)/data.tar.gz -C $(DIST_DIR)/data .; \
	echo "Created $(DIST_DIR)/data.tar.gz"

data-push-server: data-package-local
	@set -e; \
	$(SSH) "mkdir -p $(REMOTE_DIR)"; \
	$(SCP) $(DIST_DIR)/data.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded $(DIST_DIR)/data.tar.gz to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

data-apply-server: data-push-server
	@set -e; \
	$(SSH) "set -e; \
		tmp_dir=/tmp/tour_guide_data_\$$(date +%Y%m%d_%H%M%S); \
		mkdir -p \$${tmp_dir}; \
		tar -xzf $(REMOTE_DIR)/data.tar.gz -C \$${tmp_dir}; \
		if [ -z '$(REMOTE_DB_PASS)' ]; then \
			MYSQL='mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)'; \
		else \
			MYSQL='mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)'; \
		fi; \
		echo 'Importing DB into $(REMOTE_DB_NAME)...'; \
		\$${MYSQL} $(REMOTE_DB_NAME) < \$${tmp_dir}/db_dump.sql; \
		mkdir -p $(REMOTE_UPLOADS_DIR); \
		if [ -d \$${tmp_dir}/uploads ]; then \
			rm -rf $(REMOTE_UPLOADS_DIR)/*; \
			cp -a \$${tmp_dir}/uploads/. $(REMOTE_UPLOADS_DIR)/; \
		fi; \
		rm -rf \$${tmp_dir}; \
		systemctl restart $(BACKEND_SERVICE)"; \
	echo "Remote DB + uploads applied and backend restarted."

data-export-server:
	@set -e; \
	$(SSH) "set -e; \
		tmp_dir=/tmp/tour_guide_export_\$$(date +%Y%m%d_%H%M%S); \
		mkdir -p \$${tmp_dir}; \
		if [ -z '$(REMOTE_DB_PASS)' ]; then \
			MYSQLDUMP='mysqldump -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)'; \
		else \
			MYSQLDUMP='mysqldump -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)'; \
		fi; \
		\$${MYSQLDUMP} --single-transaction --routines --events --triggers $(REMOTE_DB_NAME) > \$${tmp_dir}/db_dump.sql; \
		if [ -d $(REMOTE_UPLOADS_DIR) ]; then \
			mkdir -p \$${tmp_dir}/uploads; \
			cp -a $(REMOTE_UPLOADS_DIR)/. \$${tmp_dir}/uploads/; \
		fi; \
		tar -czf $(REMOTE_DIR)/$(REMOTE_DATA_ARCHIVE) -C \$${tmp_dir} .; \
		rm -rf \$${tmp_dir}"; \
	echo "Remote export created: $(REMOTE_DIR)/$(REMOTE_DATA_ARCHIVE)"

data-download-server: data-export-server
	@set -e; \
	mkdir -p $(BACKUP_DIR); \
	$(SCP) $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/$(REMOTE_DATA_ARCHIVE) $(LOCAL_DATA_ARCHIVE); \
	echo "Downloaded remote data archive to $(LOCAL_DATA_ARCHIVE)"

# ==============================
# 文档
# ==============================
changelog:
	python3 scripts/generate_changelog.py

# ==============================
# 兼容旧命名（逐步废弃）
# ==============================
frontend: dev-frontend
backend: dev-backend-amd64
mac: dev-backend-arm64

deploy-backend: remote-deploy-backend
deploy-frontend: remote-deploy-frontend
deploy: remote-deploy-all

package-data: data-package-local
upload-data: data-push-server
remote-import-data: data-apply-server
deploy-data: data-apply-server

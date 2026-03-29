# ==============================
# Tour Guide Blog - Makefile
# 说明：
# - 所有变量都可在命令行覆盖，例如：
#   make deploy-frontend SSH_HOST=1.2.3.4 SSH_USER=root REMOTE_DIR=/opt
# - 默认值偏向本地开发环境
# ==============================

# ---------- 前端构建配置 ----------
# Next.js 构建期会注入该变量，前端通过它访问后端 API/静态资源
# 说明：生产环境建议留空以使用相对路径；本地开发可显式设置为 http://localhost:8080
NEXT_PUBLIC_API_URL ?= http://localhost:8080


# ---------- 本地数据库配置 ----------
DB_HOST ?= 127.0.0.1
DB_PORT ?= 3306
DB_USER ?= root
DB_PASS ?=
DB_NAME ?= tour_guide
MIGRATIONS_DIR ?= backend/migrations

# ---------- 本地文件与备份配置 ----------
UPLOADS_DIR ?= backend/uploads
BUNDLE_OUT_DIR ?= backups
BUNDLE_FILE ?=

# ---------- 远程部署配置 ----------
SSH_HOST ?= 123.207.65.202
SSH_USER ?= root
SSH_PORT ?= 22
REMOTE_DIR ?= /opt
FRONTEND_PORT ?= 3000
BACKEND_PORT ?= 8080
BACKEND_SERVICE ?= tour-guide-backend
FRONTEND_SERVICE ?= tour-guide-frontend
SYSTEMD_DIR ?= /etc/systemd/system

# ---------- 远程数据库配置 ----------
REMOTE_DB_HOST ?= 127.0.0.1
REMOTE_DB_PORT ?= 3306
REMOTE_DB_USER ?= root
REMOTE_DB_PASS ?=
REMOTE_DB_NAME ?= tour_guide

.PHONY: \
	help \
	backend mac frontend \
	build-backend build-frontend \
	package-backend package-frontend package \
	upload upload-backend upload-frontend \
	deploy deploy-backend deploy-frontend deploy-static \
	migrate remote-migrate \
	dump-db upload-db remote-import-db deploy-db \
	bundle import-bundle \
	install-services restart-backend restart-frontend restart-services \
	package-data upload-data remote-import-data deploy-data

# ==============================
# 帮助
# ==============================
help:
	@echo "Available targets:"; \
	echo ""; \
	echo "[本地开发]"; \
	echo "  backend          启动后端（linux/amd64 环境变量）"; \
	echo "  mac              启动后端（darwin/arm64 环境变量）"; \
	echo "  frontend         启动前端开发服务"; \
	echo ""; \
	echo "[构建与打包]"; \
	echo "  build-backend    构建后端产物到 dist/backend"; \
	echo "  build-frontend   构建前端产物到 dist/frontend"; \
	echo "  package-backend  打包后端 tar.gz"; \
	echo "  package-frontend 打包前端 tar.gz"; \
	echo "  package          一次性打包前后端"; \
	echo ""; \
	echo "[部署]"; \
	echo "  upload           上传前后端压缩包"; \
	echo "  deploy-backend   解包并更新远程后端"; \
	echo "  deploy-frontend  解包并更新远程前端完整服务"; \
	echo "  deploy-static    仅更新前端静态资源（public + .next/static）"; \
	echo ""; \
	echo "[数据库]"; \
	echo "  migrate          本地按顺序执行未应用 migration"; \
	echo "  remote-migrate   远程执行 migration"; \
	echo "  dump-db          导出本地数据库"; \
	echo "  deploy-db        导出并导入远程数据库（覆盖）"; \
	echo ""; \
	echo "[备份恢复]"; \
	echo "  bundle           打包数据库 + uploads + migrations"; \
	echo "  import-bundle    使用 bundle 覆盖导入本地数据库与图片";

# ==============================
# 本地开发
# ==============================

# 启动后端服务（开发）- 以 Linux amd64 目标环境执行
# 说明：会修改当前 Go 环境变量（go env -w）
backend:
	go env -w CGO_ENABLED=0
	go env -w GOOS=linux
	go env -w GOARCH=amd64
	cd backend && go run ./cmd/main.go -d

# 启动后端服务（开发）- 以 macOS arm64 目标环境执行
# 说明：会修改当前 Go 环境变量（go env -w）
mac:
	go env -w CGO_ENABLED=0
	go env -w GOOS=darwin
	go env -w GOARCH=arm64
	cd backend && go run ./cmd/main.go -d

# 启动前端开发服务
frontend:
	cd frontend && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm run dev

# ==============================
# 构建与打包
# ==============================

# 构建后端二进制（Linux amd64）
# 输出目录：dist/backend
build-backend:
	@set -e; \
	mkdir -p dist/backend; \
	echo "Building backend..."; \
	cd backend && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ../dist/backend/tour-guide-backend ./cmd/main.go && cd ../;\
	cp -a backend/configs dist/backend/; \
	echo "Backend build output: dist/backend"

# 构建前端（Next.js 生产构建）
# 输出目录：dist/frontend（含 .next、public、package.json 等）
build-frontend:
	@set -e; \
	echo "Building frontend..."; \
	cd frontend &&  npm ci && npm run build && cd ../; \
	rm -rf dist/frontend; \
	mkdir -p dist/frontend/.next; \
	cp -a frontend/.next/standalone/. dist/frontend/; \
	cp -a frontend/.next/static dist/frontend/.next/; \
	cp -a frontend/public dist/frontend/; \
	echo "Frontend build output: dist/frontend"

# 打包后端构建产物
package-backend: build-backend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/backend.tar.gz -C dist/backend .; \
	echo "Created dist/backend.tar.gz"

# 打包前端构建产物
package-frontend: build-frontend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/frontend.tar.gz -C dist/frontend .; \
	echo "Created dist/frontend.tar.gz"

# 一次性打包前后端
package: package-backend package-frontend

# ==============================
# 上传与远程部署
# ==============================

# 上传前后端压缩包到远程目录（不解压）
upload:
	@set -e; \
	if [ -z "$(SSH_HOST)" ] || [ -z "$(SSH_USER)" ]; then \
		echo "Please set SSH_HOST and SSH_USER"; \
		exit 1; \
	fi; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)"; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/backend.tar.gz dist/frontend.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded packages to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

# 上传后端压缩包到远程目录（不解压）
upload-backend:
	@set -e; \
	if [ -z "$(SSH_HOST)" ] || [ -z "$(SSH_USER)" ]; then \
		echo "Please set SSH_HOST and SSH_USER"; \
		exit 1; \
	fi; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)"; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/backend.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded backend package to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

# 上传前端压缩包到远程目录（不解压）
upload-frontend:
	@set -e; \
	if [ -z "$(SSH_HOST)" ] || [ -z "$(SSH_USER)" ]; then \
		echo "Please set SSH_HOST and SSH_USER"; \
		exit 1; \
	fi; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)"; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/frontend.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded frontend package to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

# 执行 package + upload（仅上传，不会自动解包到运行目录）
deploy: package upload

# 解包并更新远程后端
# 适用：发布后端新版本（二进制/配置）
deploy-backend: package-backend upload-backend
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	mkdir -p $(REMOTE_DIR)/backend; \
	tar -xzf $(REMOTE_DIR)/backend.tar.gz -C $(REMOTE_DIR)/backend; \
	systemctl restart $(BACKEND_SERVICE); \
	systemctl --no-pager --full status $(BACKEND_SERVICE) | head -n 20"; \
	echo "Remote backend updated and restarted: $(REMOTE_DIR)/backend"

# 更新前端服务（完整包）
# 适用场景：
# - 修改了页面代码、服务端渲染逻辑、API 调用逻辑、next.config.js、依赖等
# - 你准备发布一个“完整前端版本”
# 动作说明：
# - 使用 package-frontend 打完整包（包含 .next 全量产物、public、package.json 等）
# - 上传并解压到远程 $(REMOTE_DIR)/frontend
# 影响与注意：
# - 通常需要配合重启/reload 前端进程（如 systemd/pm2），让新的服务端代码生效
deploy-frontend: package-frontend upload-frontend
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	rm -rf $(REMOTE_DIR)/frontend; \
	mkdir -p $(REMOTE_DIR)/frontend; \
	tar -xzf $(REMOTE_DIR)/frontend.tar.gz -C $(REMOTE_DIR)/frontend; \
	systemctl restart $(FRONTEND_SERVICE); \
	systemctl --no-pager --full status $(FRONTEND_SERVICE) | head -n 20"; \
	echo "Remote frontend updated and restarted: $(REMOTE_DIR)/frontend"

# 仅更新前端静态文件（增量包）
# 适用场景：
# - 只改了图片、字体、静态资源、前端编译后的静态 chunk（不涉及 Node 运行逻辑）
# - 想快速发布前端资源，减少上传体积与发布时间
# 动作说明：
# - 仅打包 public 和 .next/static 两个目录并覆盖到远程
# 影响与注意：
# - 一般不需要重启前端 Node 服务（取决于你的部署/缓存策略）
# - 不会更新 .next/standalone、package.json、next.config.js 等“服务级”文件
# - 如果改动涉及 SSR/路由/服务端组件，请使用 deploy-frontend 而不是 deploy-static
deploy-static: build-frontend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/frontend-static.tar.gz -C dist/frontend public .next/static; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/frontend-static.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)/frontend && tar -xzf $(REMOTE_DIR)/frontend-static.tar.gz -C $(REMOTE_DIR)/frontend"; \
	echo "Remote frontend static updated"

# 安装/更新远程 systemd service，并启用开机自启
install-services:
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	SCP_CMD="scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SCP_CMD deploy/systemd/tour-guide-backend.service deploy/systemd/tour-guide-frontend.service $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	cp $(REMOTE_DIR)/tour-guide-backend.service $(SYSTEMD_DIR)/$(BACKEND_SERVICE).service; \
	cp $(REMOTE_DIR)/tour-guide-frontend.service $(SYSTEMD_DIR)/$(FRONTEND_SERVICE).service; \
	systemctl daemon-reload; \
	systemctl enable $(BACKEND_SERVICE) $(FRONTEND_SERVICE)"; \
	echo "Systemd services installed: $(BACKEND_SERVICE), $(FRONTEND_SERVICE)"

restart-backend:
	@set -e; \
	ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new $(SSH_USER)@$(SSH_HOST) "systemctl restart $(BACKEND_SERVICE) && systemctl --no-pager --full status $(BACKEND_SERVICE) | head -n 20"

restart-frontend:
	@set -e; \
	ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new $(SSH_USER)@$(SSH_HOST) "systemctl restart $(FRONTEND_SERVICE) && systemctl --no-pager --full status $(FRONTEND_SERVICE) | head -n 20"

restart-services: restart-backend restart-frontend

# ==============================
# 数据库（本地 / 远程）
# ==============================

# 根据 migrations 目录顺序执行未应用的迁移（仅执行一次）
# Example: make migrate DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASS=123456 DB_NAME=tour_guide MIGRATIONS_DIR=backend/migrations
migrate:
	@set -e; \
	if [ ! -d "$(MIGRATIONS_DIR)" ]; then \
		echo "Migrations目录不存在: $(MIGRATIONS_DIR)"; \
		exit 1; \
	fi; \
	if [ -z "$$(ls -1 $(MIGRATIONS_DIR)/*.sql 2>/dev/null)" ]; then \
		echo "未找到迁移文件: $(MIGRATIONS_DIR)/*.sql"; \
		exit 0; \
	fi; \
	if [ -z "$(DB_PASS)" ]; then \
		MYSQL="mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER)"; \
	else \
		MYSQL="mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS)"; \
	fi; \
	echo "连接数据库: $(DB_USER)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)"; \
	$$MYSQL $(DB_NAME) -e "CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"; \
	for file in $$(ls -1 $(MIGRATIONS_DIR)/*.sql | sort); do \
		name=$$(basename $$file); \
		applied=$$($$MYSQL -N -s $(DB_NAME) -e "SELECT COUNT(1) FROM schema_migrations WHERE filename='$$name'"); \
		if [ "$$applied" = "0" ]; then \
			echo "Applying migration: $$name"; \
			$$MYSQL $(DB_NAME) < $$file; \
			$$MYSQL $(DB_NAME) -e "INSERT INTO schema_migrations(filename) VALUES('$$name')"; \
		else \
			echo "Skip migration (already applied): $$name"; \
		fi; \
	done; \
	echo "Migrate完成。"

# 远程执行 migrations
# 前提：远程 backend/migrations 已存在（可先执行 deploy-backend）
remote-migrate:
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	if [ -z \"$(REMOTE_DB_PASS)\" ]; then \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)\"; \
	else \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)\"; \
	fi; \
	\$$MYSQL $(REMOTE_DB_NAME) -e \"CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)\"; \
	for file in \$$([ -d $(REMOTE_DIR)/backend/migrations ] && ls -1 $(REMOTE_DIR)/backend/migrations/*.sql 2>/dev/null | sort); do \
		name=\$$(basename \$$file); \
		applied=\$$(\$$MYSQL -N -s $(REMOTE_DB_NAME) -e \"SELECT COUNT(1) FROM schema_migrations WHERE filename='\$$name'\"); \
		if [ \"\$$applied\" = \"0\" ]; then \
			echo \"Applying migration: \$$name\"; \
			\$$MYSQL $(REMOTE_DB_NAME) < \$$file; \
			\$$MYSQL $(REMOTE_DB_NAME) -e \"INSERT INTO schema_migrations(filename) VALUES('\$$name')\"; \
		else \
			echo \"Skip migration (already applied): \$$name\"; \
		fi; \
	done; \
	echo \"Remote migrate completed.\""

# 导出本地数据库到 dist/db_dump.sql
dump-db:
	@set -e; \
	mkdir -p dist; \
	if [ -z "$(DB_PASS)" ]; then \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER)"; \
	else \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS)"; \
	fi; \
	echo "Exporting database $(DB_NAME) to dist/db_dump.sql"; \
	$$MYSQLDUMP --single-transaction --routines --events --triggers $(DB_NAME) > dist/db_dump.sql; \
	echo "Database export completed."

# 上传 SQL dump 到远程
upload-db: dump-db
	@set -e; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/db_dump.sql $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded dist/db_dump.sql to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

# 打包本地静态文件（uploads）+ 数据库记录（db_dump.sql）
package-data: dump-db
	@set -e; \
	rm -rf dist/data && mkdir -p dist/data; \
	cp -a dist/db_dump.sql dist/data/; \
	if [ -d "$(UPLOADS_DIR)" ]; then \
		mkdir -p dist/data/uploads; \
		cp -a "$(UPLOADS_DIR)/." dist/data/uploads/; \
	fi; \
	COPYFILE_DISABLE=1 tar -czf dist/data.tar.gz -C dist/data .; \
	echo "Created dist/data.tar.gz"

upload-data: package-data
	@set -e; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/data.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	echo "Uploaded dist/data.tar.gz to $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)"

remote-import-data: upload-data
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	tmp_dir=/tmp/tour_guide_data_\$$(date +%Y%m%d_%H%M%S); \
	mkdir -p \$$tmp_dir; \
	tar -xzf $(REMOTE_DIR)/data.tar.gz -C \$$tmp_dir; \
	if [ -z \"$(REMOTE_DB_PASS)\" ]; then \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)\"; \
	else \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)\"; \
	fi; \
	echo \"Importing DB into $(REMOTE_DB_NAME)...\"; \
	\$$MYSQL $(REMOTE_DB_NAME) < \$$tmp_dir/db_dump.sql; \
	mkdir -p $(REMOTE_DIR)/backend/uploads; \
	if [ -d \$$tmp_dir/uploads ]; then \
		rm -rf $(REMOTE_DIR)/backend/uploads/*; \
		cp -a \$$tmp_dir/uploads/. $(REMOTE_DIR)/backend/uploads/; \
	fi; \
	rm -rf \$$tmp_dir; \
	systemctl restart $(BACKEND_SERVICE); \
	echo \"Remote data import completed and backend restarted.\""

deploy-data: remote-import-data

# 远程导入 SQL dump（会覆盖同名数据库）
remote-import-db: upload-db
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	if [ -z \"$(REMOTE_DB_PASS)\" ]; then \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)\"; \
	else \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)\"; \
	fi; \
	echo \"Importing $(REMOTE_DIR)/db_dump.sql into $(REMOTE_DB_NAME)...\"; \
	\$$MYSQL -e \"DROP DATABASE IF EXISTS \`$(REMOTE_DB_NAME)\`; CREATE DATABASE \`$(REMOTE_DB_NAME)\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"; \
	\$$MYSQL $(REMOTE_DB_NAME) < $(REMOTE_DIR)/db_dump.sql; \
	systemctl restart $(BACKEND_SERVICE); \
	echo \"Remote DB import completed.\""

# 一键导出并导入远程数据库（覆盖式）
deploy-db: remote-import-db

# ==============================
# 备份与恢复（本地）
# ==============================

# 打包导出：数据库 SQL + 本地 uploads + migrations
# Example: make bundle DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASS=123456 DB_NAME=tour_guide
bundle:
	@set -e; \
	ts=$$(date +%Y%m%d_%H%M%S); \
	tmp_dir="/tmp/tour_guide_bundle_$$ts"; \
	out_file="$(BUNDLE_OUT_DIR)/tour_guide_bundle_$$ts.tar.gz"; \
	mkdir -p "$$tmp_dir" "$(BUNDLE_OUT_DIR)"; \
	echo "准备导出到: $$out_file"; \
	if [ -z "$(DB_PASS)" ]; then \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER)"; \
	else \
		MYSQLDUMP="mysqldump -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS)"; \
	fi; \
	$$MYSQLDUMP --single-transaction --routines --events --triggers $(DB_NAME) > "$$tmp_dir/db_dump.sql"; \
	if [ -d "$(UPLOADS_DIR)" ]; then \
		mkdir -p "$$tmp_dir/uploads"; \
		cp -a "$(UPLOADS_DIR)/." "$$tmp_dir/uploads/"; \
	fi; \
	if [ -d "$(MIGRATIONS_DIR)" ]; then \
		mkdir -p "$$tmp_dir/migrations"; \
		cp -a "$(MIGRATIONS_DIR)/." "$$tmp_dir/migrations/"; \
	fi; \
	printf "created_at=%s\n" "$$ts" > "$$tmp_dir/manifest.txt"; \
	printf "db_name=%s\n" "$(DB_NAME)" >> "$$tmp_dir/manifest.txt"; \
	printf "uploads_dir=%s\n" "$(UPLOADS_DIR)" >> "$$tmp_dir/manifest.txt"; \
	printf "migrations_dir=%s\n" "$(MIGRATIONS_DIR)" >> "$$tmp_dir/manifest.txt"; \
	tar -czf "$$out_file" -C "$$tmp_dir" .; \
	rm -rf "$$tmp_dir"; \
	echo "打包完成: $$out_file"

# 导入覆盖：清空当前数据库和本地图片，使用压缩包中的内容覆盖
# Example: make import-bundle BUNDLE_FILE=backups/tour_guide_bundle_20260227_150000.tar.gz DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASS=123456 DB_NAME=tour_guide
import-bundle:
	@set -e; \
	if [ -z "$(BUNDLE_FILE)" ]; then \
		echo "请提供 BUNDLE_FILE，例如: make import-bundle BUNDLE_FILE=backups/xxx.tar.gz"; \
		exit 1; \
	fi; \
	if [ ! -f "$(BUNDLE_FILE)" ]; then \
		echo "找不到压缩包: $(BUNDLE_FILE)"; \
		exit 1; \
	fi; \
	tmp_dir="/tmp/tour_guide_import_$$(date +%Y%m%d_%H%M%S)"; \
	mkdir -p "$$tmp_dir"; \
	tar -xzf "$(BUNDLE_FILE)" -C "$$tmp_dir"; \
	if [ -z "$(DB_PASS)" ]; then \
		MYSQL="mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER)"; \
	else \
		MYSQL="mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS)"; \
	fi; \
	echo "重建数据库并导入SQL..."; \
	$$MYSQL -e "DROP DATABASE IF EXISTS \`$(DB_NAME)\`; CREATE DATABASE \`$(DB_NAME)\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"; \
	if [ -f "$$tmp_dir/db_dump.sql" ]; then \
		$$MYSQL $(DB_NAME) < "$$tmp_dir/db_dump.sql"; \
	else \
		echo "压缩包中未找到 db_dump.sql"; \
		rm -rf "$$tmp_dir"; \
		exit 1; \
	fi; \
	echo "覆盖本地图片目录: $(UPLOADS_DIR)"; \
	rm -rf "$(UPLOADS_DIR)"; \
	mkdir -p "$(UPLOADS_DIR)"; \
	if [ -d "$$tmp_dir/uploads" ]; then \
		cp -a "$$tmp_dir/uploads/." "$(UPLOADS_DIR)/"; \
	fi; \
	rm -rf "$$tmp_dir"; \
	echo "导入完成。"

# 通用配置（可在命令行覆盖）
NEXT_PUBLIC_API_URL ?= http://localhost:8080

DB_HOST ?= 127.0.0.1
DB_PORT ?= 3306
DB_USER ?= root
DB_PASS ?=
DB_NAME ?= tour_guide
MIGRATIONS_DIR ?= backend/migrations
UPLOADS_DIR ?= backend/uploads
BUNDLE_OUT_DIR ?= backups
BUNDLE_FILE ?=

SSH_HOST ?= 123.207.65.202
SSH_USER ?= root
SSH_PORT ?= 22
REMOTE_DIR ?= /opt
FRONTEND_PORT ?= 3000
BACKEND_PORT ?= 8080
REMOTE_DB_HOST ?= 127.0.0.1
REMOTE_DB_PORT ?= 3306
REMOTE_DB_USER ?= root
REMOTE_DB_PASS ?=
REMOTE_DB_NAME ?= tour_guide

.PHONY: backend frontend migrate bundle import-bundle build-backend build-frontend package-backend package-frontend package upload \
	upload-backend upload-frontend deploy deploy-backend deploy-frontend deploy-static remote-migrate dump-db upload-db remote-import-db deploy-db

# 启动后端服务（开发）Amd环境
backend:
	go env -w CGO_ENABLED=0
	go env -w GOOS=linux
	go env -w GOARCH=amd64
	cd backend && go run ./cmd/main.go

# 启动后端服务（开发）Arm环境
mac:
	go env -w CGO_ENABLED=0
	go env -w GOOS=darwin
	go env -w GOARCH=arm64
	cd backend && go run ./cmd/main.go

# 启动前端服务（开发）
frontend:
	cd frontend && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm run dev

# 构建后端二进制（Linux amd64）
build-backend:
	@set -e; \
	mkdir -p dist/backend; \
	echo "Building backend..."; \
	cd backend && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ../dist/backend/tour-guide-backend ./cmd/main.go && cd ../;\
	cp -a backend/configs dist/backend/; \
	echo "Backend build output: dist/backend"

# 构建前端（Next.js 生产构建）
build-frontend:
	@set -e; \
	echo "Building frontend..."; \
	cd frontend && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm ci && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm run build && cd ../; \
	mkdir -p dist/frontend; \
	cp -a frontend/.next dist/frontend/; \
	cp -a frontend/public dist/frontend/; \
	cp -a frontend/package.json dist/frontend/; \
	if [ -f frontend/package-lock.json ]; then cp -a frontend/package-lock.json dist/frontend/; fi; \
	if [ -f frontend/next.config.js ]; then cp -a frontend/next.config.js dist/frontend/; fi; \
	echo "Frontend build output: dist/frontend"

package-backend: build-backend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/backend.tar.gz -C dist/backend .; \
	echo "Created dist/backend.tar.gz"

package-frontend: build-frontend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/frontend.tar.gz -C dist/frontend .; \
	echo "Created dist/frontend.tar.gz"

package: package-backend package-frontend

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

deploy: package upload

# 解包并更新远程后端
deploy-backend: package-backend upload-backend
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)/backend && tar -xzf $(REMOTE_DIR)/backend.tar.gz -C $(REMOTE_DIR)/backend"; \
	echo "Remote backend updated: $(REMOTE_DIR)/backend"

# 解包并更新远程前端
deploy-frontend: package-frontend upload-frontend
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)/frontend && tar -xzf $(REMOTE_DIR)/frontend.tar.gz -C $(REMOTE_DIR)/frontend"; \
	echo "Remote frontend updated: $(REMOTE_DIR)/frontend"

# 仅更新前端静态文件（public + .next/static）
deploy-static: build-frontend
	@set -e; \
	mkdir -p dist; \
	COPYFILE_DISABLE=1 tar -czf dist/frontend-static.tar.gz -C dist/frontend public .next/static; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	scp -P $(SSH_PORT) -o StrictHostKeyChecking=accept-new dist/frontend-static.tar.gz $(SSH_USER)@$(SSH_HOST):$(REMOTE_DIR)/; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "mkdir -p $(REMOTE_DIR)/frontend && tar -xzf $(REMOTE_DIR)/frontend-static.tar.gz -C $(REMOTE_DIR)/frontend"; \
	echo "Remote frontend static updated"

# 远程执行 migrations
remote-migrate:
	@set -e; \
	SSH_CMD="ssh -p $(SSH_PORT) -o StrictHostKeyChecking=accept-new"; \
	$$SSH_CMD $(SSH_USER)@$(SSH_HOST) "set -e; \
	if [ -z \"$(REMOTE_DB_PASS)\" ]; then \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER)\"; \
	else \
		MYSQL=\"mysql -h $(REMOTE_DB_HOST) -P $(REMOTE_DB_PORT) -u $(REMOTE_DB_USER) -p$(REMOTE_DB_PASS)\"; \
	fi; \
	$$MYSQL $(REMOTE_DB_NAME) -e \"CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)\"; \
	for file in $$(ls -1 $(REMOTE_DIR)/backend/migrations/*.sql 2>/dev/null | sort); do \
		name=$$(basename $$file); \
		applied=$$($$MYSQL -N -s $(REMOTE_DB_NAME) -e \"SELECT COUNT(1) FROM schema_migrations WHERE filename='$$name'\"); \
		if [ \"$$applied\" = \"0\" ]; then \
			echo \"Applying migration: $$name\"; \
			$$MYSQL $(REMOTE_DB_NAME) < $$file; \
			$$MYSQL $(REMOTE_DB_NAME) -e \"INSERT INTO schema_migrations(filename) VALUES('$$name')\"; \
		else \
			echo \"Skip migration (already applied): $$name\"; \
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
	$$MYSQL -e \"DROP DATABASE IF EXISTS \`$(REMOTE_DB_NAME)\`; CREATE DATABASE \`$(REMOTE_DB_NAME)\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"; \
	$$MYSQL $(REMOTE_DB_NAME) < $(REMOTE_DIR)/db_dump.sql; \
	echo \"Remote DB import completed.\""

# 一键导出并导入远程数据库
deploy-db: remote-import-db

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

# 打包导出：数据库SQL记录 + 本地图片 + migrations 文件
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

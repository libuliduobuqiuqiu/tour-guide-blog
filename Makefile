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

.PHONY: backend frontend migrate bundle import-bundle

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

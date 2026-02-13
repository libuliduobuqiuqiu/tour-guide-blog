# 通用配置（可在命令行覆盖）
NEXT_PUBLIC_API_URL ?= http://localhost:8080

DB_HOST ?= 127.0.0.1
DB_PORT ?= 3306
DB_USER ?= root
DB_PASS ?=
DB_NAME ?= tour_guide
MIGRATION_FILE ?= backend/migrations/001_init.sql

.PHONY: backend frontend migrate

# 启动后端服务（开发）
backend:
	cd backend && go run ./cmd/main.go

# 启动前端服务（开发）
frontend:
	cd frontend && NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) npm run dev

# 更新/初始化表结构（运行迁移SQL）
# Example: make migrate DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASS=123456 DB_NAME=tour_guide MIGRATION_FILE=backend/migrations/001_init.sql
migrate:
	@if [ -z "$(DB_PASS)" ]; then \
		echo "执行迁移（无密码）: $(DB_USER)@$(DB_HOST):$(DB_PORT)/$(DB_NAME) < $(MIGRATION_FILE)"; \
		mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) $(DB_NAME) < $(MIGRATION_FILE); \
	else \
		echo "执行迁移: $(DB_USER)@$(DB_HOST):$(DB_PORT)/$(DB_NAME) < $(MIGRATION_FILE)"; \
		mysql -h $(DB_HOST) -P $(DB_PORT) -u $(DB_USER) -p$(DB_PASS) $(DB_NAME) < $(MIGRATION_FILE); \
	fi

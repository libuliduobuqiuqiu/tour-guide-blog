# Commit Log

Date: 2026-04-03
Branch: `main`

## This Round Summary

本轮工作围绕“测试基线 + CI/CD 第一阶段 + Makefile 场景化重构”展开，目标是先把工程化骨架落地，便于后续分阶段迭代。

主要完成：

- 补齐后端单元测试与基础集成测试
- 新增 GitHub Actions 的 CI、staging CD、production CD 工作流骨架
- 新增 CI/CD 总指南与第一阶段实施文档
- 输出临时迁移策略文档（当前优先 AutoMigrate）
- 将 Makefile 彻底按三类场景重构：本地开发、远程部署、数据库+图片上传/下载

## Implementation Details

### 1) 后端测试基线

新增测试文件：

- `backend/internal/model/string_list_test.go`
- `backend/internal/service/auth_test.go`
- `backend/internal/service/social_helpers_test.go`
- `backend/api/handlers/auth_test.go`
- `backend/api/middleware/auth_test.go`
- `backend/api/routers/router_integration_test.go`（`integration` build tag）

覆盖重点：

- `StringList` 序列化/反序列化
- 登录认证与 JWT 校验逻辑
- 登录限流逻辑
- 中间件鉴权行为
- 路由层登录、鉴权和 CORS 预检链路

### 2) CI/CD 工作流骨架

新增：

- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`

设计要点：

- CI 拆分为 backend unit / backend integration / frontend quality
- staging 作为预发环境部署入口（workflow_run + 手动触发）
- production 采用手动触发，配合 environment 审批

### 3) 文档体系补齐

新增：

- `docs/ci-cd-master-guide.zh-CN.md`
- `docs/ci-cd-test-implementation-plan.zh-CN.md`
- `docs/migration-strategy-temporary.zh-CN.md`

用途：

- 给后续跨会话推进提供统一操作指南
- 记录“为什么这么做、当前做了什么、下一步怎么做”
- 暂存迁移策略，避免当前阶段误用迁移命令

### 4) Makefile 场景化重构

更新：

- `Makefile`

核心重构：

- 本地开发：`dev-* / test-* / quality-* / check-all`
- 远程部署：`remote-deploy-* / install-services / restart-*`
- 数据库+图片：`data-package-local / data-push-server / data-apply-server / data-export-server / data-download-server`

兼容策略：

- 保留旧 target 别名（如 `frontend`、`backend`、`deploy-*`、`deploy-data`）避免历史脚本立即失效

### 5) migration 命令处理

调整：

- 从 `Makefile` 移除 `migrate` / `remote-migrate` 执行入口

原因：

- 当前阶段优先保持部署稳定和无感发布
- 迁移工具体系后续再统一选型落地

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-build-cache go test ./...`
- `cd backend && GOCACHE=/tmp/go-build-cache go test -tags=integration ./...`
- `make help`
- `make -n test-frontend`
- `make -n data-export-server`

Results:

- backend unit tests passed
- backend integration tests passed
- Makefile help output is grouped by scenarios as designed
- critical new targets can be expanded by make dry-run without syntax errors

## Current Working Tree Scope

本轮纳入提交：

- `Makefile`
- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/auth_test.go`
- `backend/internal/service/social_helpers_test.go`
- `backend/api/handlers/auth_test.go`
- `backend/api/middleware/auth_test.go`
- `backend/api/routers/router_integration_test.go`
- `docs/ci-cd-master-guide.zh-CN.md`
- `docs/ci-cd-test-implementation-plan.zh-CN.md`
- `docs/migration-strategy-temporary.zh-CN.md`
- `docs/commit-log-2026-04-03-ci-cd-tests-and-makefile-restructure.md`
- `CHANGELOG.md`

## Recommended Next Step

建议下一轮按“只推进一个阶段”继续：

1. 前端引入 Vitest + Testing Library（先覆盖 `lib` / `hooks`）
2. 后端集成测试接入 MySQL service + migration 演练
3. CI 增加覆盖率阈值门禁

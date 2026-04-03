# CI/CD 与测试体系落地说明（第一阶段）

> 建议配合总指南一起使用：`docs/ci-cd-master-guide.zh-CN.md`

## 1. 本次目标与边界

本次以“先补测试，再接 CI/CD”作为第一阶段目标，聚焦以下内容：

- 后端单元测试（核心逻辑）
- 后端集成测试（HTTP 路由链路）
- GitHub Actions CI 门禁（PR 必须通过）
- CD 分阶段工作流骨架（staging 自动/手动触发 + production 手动审批触发）

当前未在本次引入前端测试框架（如 Vitest/Jest），前端先以 `lint + build` 作为质量门禁。

## 2. 设计思路

### 2.1 测试分层

采用“分层 + 分阶段”模型：

- 单元测试：覆盖纯逻辑函数、认证/JWT、限流逻辑、数据转换逻辑
- 集成测试：覆盖 Gin 路由 + 中间件 + handler 的真实请求路径

为了让集成测试可控，使用 `integration` build tag：

- 默认 `go test ./...` 跑单元层
- `go test -tags=integration ./...` 跑集成层

### 2.2 CI 设计

在 `CI` 中拆分为三个 job：

- `backend-unit`
- `backend-integration`
- `frontend-quality`（`npm ci` + `lint` + `build`）

这样做的好处：

- 问题定位更快（单元失败 vs 集成失败）
- 可以单独演进某一层测试
- 后续可独立加缓存、并行策略和覆盖率阈值

### 2.3 CD 设计（分阶段）

- Staging：基于 CI 成功后打包与部署（也支持手动触发）
- Production：仅手动触发，建议配合 GitHub Environment 审批

注：CD workflow 已落地为可执行骨架，依赖仓库 Secrets 才会实际部署。

## 3. 本次实际改动清单

## 3.1 新增后端单元测试

- `backend/internal/model/string_list_test.go`
  - `StringList.Value()`
  - `StringList.Scan()`
  - 异常类型扫描

- `backend/internal/service/auth_test.go`
  - 登录（明文密码）
  - 登录（bcrypt 密码）
  - 无效凭证
  - JWT 签名算法校验失败路径

- `backend/internal/service/social_helpers_test.go`
  - `sanitizePostLimit`
  - `normalizePlatformUsername`
  - `selectPlatformError`
  - `buildTikTokFeedItemFromYTDLP`

- `backend/api/handlers/auth_test.go`
  - 登录限流行为
  - 限流窗口过期后恢复
  - 登录成功路径
  - 达到限流后的 429

- `backend/api/middleware/auth_test.go`
  - 缺失 token
  - 非法 token
  - 合法 token 通过并注入上下文

## 3.2 新增后端集成测试

- `backend/api/routers/router_integration_test.go`（`//go:build integration`）
  - `/admin/login` 登录链路
  - `/api/admin/tours` 无鉴权时返回 401
  - CORS 预检请求行为

## 3.3 Makefile 增强

更新文件：`Makefile`

新增目标：

- `make test`
- `make test-backend`
- `make test-backend-unit`
- `make test-backend-integration`
- `make test-frontend`

## 3.4 新增 CI/CD workflow

- `.github/workflows/ci.yml`
  - 后端单元测试
  - 后端集成测试（integration tag）
  - 前端 lint + build

- `.github/workflows/cd-staging.yml`
  - CI 成功后（main）或手动触发
  - 打包 `backend.tar.gz` / `frontend.tar.gz`
  - 在存在 Staging Secrets 时执行上传+部署

- `.github/workflows/cd-production.yml`
  - 手动触发（输入 release tag）
  - 打包产物
  - 在存在 Production Secrets 时执行上传+部署
  - 可与 `production` Environment 审批策略配合

## 4. 你现在可以怎么用

本地执行：

```bash
make test-backend-unit
make test-backend-integration
make test
```

CI 行为：

- 任意 PR 自动触发 `CI`
- push 到 `main` 触发 `CI`
- `CD Staging` 可由 `CI` 成功后触发（或手动）
- `CD Production` 手动触发

## 5. 需要配置的 GitHub Secrets

Staging（`cd-staging.yml`）建议最少配置：

- `STAGING_SSH_HOST`
- `STAGING_SSH_USER`
- `STAGING_SSH_KEY`
- `STAGING_REMOTE_DIR`

可选：

- `STAGING_SSH_PORT`
- `STAGING_BACKEND_SERVICE`
- `STAGING_FRONTEND_SERVICE`

Production（`cd-production.yml`）同理：

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`
- `PROD_REMOTE_DIR`
- 以及可选端口和 service 名称

## 6. 当前限制与后续优化建议

当前限制：

- 前端暂未引入真正的单元/集成测试框架
- 后端集成测试目前未覆盖“真实数据库读写场景”

后续建议按优先级推进：

1. 前端接入 Vitest + Testing Library，先覆盖 `lib` 和核心组件
2. 后端集成测试加入 MySQL service（GitHub Actions `services`）+ migration
3. 在 CI 中加入覆盖率阈值门禁（例如后端先 40%，逐步提升）
4. CD 增加健康检查与回滚脚本（失败自动回滚）
5. 生产发布升级为蓝绿或灰度切流（降低发布风险）

# Tour Guide Blog

一个包含前后端的完整旅游向导博客与管理后台项目。前端基于 Next.js（App Router），后端使用 Go（Gin + GORM + Viper），提供文章（Blog）、旅游项目（Tours）、轮播图（Carousel）、用户评论（Reviews）、联系表单（Contact）等功能，并内置简易的管理后台与认证流程。

## 技术栈

- 前端：Next.js 16、React 19、TypeScript、Tailwind CSS
- 后端：Go 1.23、Gin、GORM（MySQL）、Viper
- 数据库：MySQL（建议 8.x）
- 其他：Axios（前端请求）、本地文件上传（静态目录）

## 项目结构

- backend：Go 后端服务
  - 入口与配置读取：[main.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/cmd/main.go#L13-L33)
  - 路由与中间件：[router.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/api/routers/router.go#L10-L47)
  - 数据库初始化与迁移：[db.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/dao/db.go#L14-L37)
  - 配置示例：[config_temp.yaml](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/configs/config_temp.yaml#L1-L15)
- frontend：Next.js 前端应用
  - 基础 Axios 配置与后端地址：[axios.ts](file:///Users/linshukai/data/MyRepo/tour-guide-blog/frontend/lib/axios.ts#L3-L7)
  - 管理后台页面：`/app/admin/*`
  - 公开页面：`/app/*`（博客、旅行、联系等）

## 快速开始

### 前置要求

- macOS 或 Linux
- Go 1.23+
- Node.js 20+ 与 npm（或 pnpm、yarn）
- MySQL 8.x（本地或远程）

### 使用 Makefile 启动与迁移

1) 创建数据库（示例）

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库（推荐使用 utf8mb4）
CREATE DATABASE tour_guide DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

2) 运行数据库迁移（初始化表结构）

支持通过 Makefile 执行迁移（默认脚本位于 [001_init.sql](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/migrations/001_init.sql)）：

```bash
# 以本地数据库为例（按需替换参数）
make migrate \
  DB_HOST=127.0.0.1 \
  DB_PORT=3306 \
  DB_USER=root \
  DB_PASS=你的密码 \
  DB_NAME=tour_guide \
  MIGRATION_FILE=backend/migrations/001_init.sql
```

3) 准备后端配置文件

```bash
cd /Users/linshukai/data/MyRepo/tour-guide-blog/backend
cp configs/config_temp.yaml configs/config.yaml
```

- 请将 `configs/config.yaml` 中的 `database.dsn` 修改为你的 MySQL 连接，例如：
  `root:root@tcp(127.0.0.1:3306)/tour_guide?charset=utf8mb4&parseTime=True&loc=Local`
- 可以调整 `server.port`（默认 `8080`）与 `upload.path`（静态文件目录）

4) 启动后端服务（开发）

```bash
# 使用 Makefile 一键启动
make backend
```

- 后端默认监听：`http://localhost:8080`
- 静态上传目录：`/uploads`（由配置项 `upload.path` 指向）

5) 启动前端服务（开发）

```bash
# 设置后端地址并启动（可按需覆盖）
make frontend NEXT_PUBLIC_API_URL=http://localhost:8080
```

前端默认运行在：`http://localhost:3000`。前端通过 `NEXT_PUBLIC_API_URL` 访问后端，且在 [next.config.ts](file:///Users/linshukai/data/MyRepo/tour-guide-blog/frontend/next.config.ts#L4-L14) 中重写了 `/uploads/*` 到后端地址，保证图片等静态资源可同源访问。

### 常规前端操作（可选）

```bash
cd /Users/linshukai/data/MyRepo/tour-guide-blog/frontend
npm install
```

生产构建与启动：

```bash
cd /Users/linshukai/data/MyRepo/tour-guide-blog/frontend
npm run build
npm run start
```

- 同样可通过 `NEXT_PUBLIC_API_URL` 指向生产后端地址

## 管理后台与认证

- 管理后台入口：`/admin`（前端路由）
- 登录接口：`POST /admin/login`（后端）
- 认证说明：
  - 开发模式下，后端使用简易的 Bearer Token 校验，期望值为 `mock-token`（见中间件与服务逻辑）
  - 默认账号密码支持 `admin/admin`（仅用于开发测试）
  - 登录成功后，前端将把 token 存入 `localStorage.admin_token` 并自动为后续请求添加 `Authorization: Bearer <token>`
- 相关代码：
  - 中间件：[auth.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/api/middleware/auth.go#L10-L28)
  - 登录逻辑：[service/auth.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/service/auth.go#L15-L38)

## 功能与 API 路径（概览）

- 公开 API 分组：`/api`
- 管理 API 分组：`/admin`（部分路径需认证）
- 模块示例：Tours、Posts、Carousel、Reviews、Contact、Config、Upload
- 路由注册参考：[routers/router.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/api/routers/router.go#L31-L45)

## 开发提示

- 配置文件路径固定为 `configs/config.yaml`（由 Viper 读取）
- 若使用 GORM 自动迁移以外的手动迁移，可通过 Makefile 的 `migrate` 目标执行 SQL
- 首次启动包含基础数据种子（如轮播图与示例评论），参见 [seed.go](file:///Users/linshukai/data/MyRepo/tour-guide-blog/backend/internal/seed/seed.go#L45-L63)
- 上传目录由配置 `upload.path` 决定，同时通过 `/uploads` 提供静态访问
- 若需要更严格的认证，请将当前的 `mock-token` 替换为 JWT 或其他方案

## 常见问题

- 启动后端报数据库连接失败：检查 `database.dsn` 与 MySQL 是否已启动、数据库是否存在
- 前端 401 自动跳转登录：确认已成功登录并在本地存有 `admin_token`
- 跨域与静态资源：后端已设置允许跨域并提供 `/uploads` 静态目录

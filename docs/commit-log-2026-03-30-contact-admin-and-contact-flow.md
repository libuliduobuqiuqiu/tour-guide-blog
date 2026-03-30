# Commit Log

Date: 2026-03-30
Branch: `main`

## This Round Summary

本轮工作聚焦三个方向：

- 修复前台 Contact 表单请求链路，并补上联系页展示与防滥用保护
- 重构后台 Contacts 管理页，补齐批量删除能力
- 调整后台导航顺序，并新增公安备案号配置与前台展示

## Code Changes

### 1. 修复前台 `/api/contact` 请求没有到后端的问题

Summary:

- 为 Next 前端补充 `/api/*` 和 `/uploads/*` 的 rewrites
- 当前端使用相对路径请求时，会自动转发到 Go 后端
- 保留 `API_URL` / `NEXT_PUBLIC_API_URL` 作为优先配置来源

Impact:

- 本地只启动前端时，`/api/contact` 不会再误打到 Next 自身
- 部署环境不依赖 Nginx 也能把 API 请求正确转发到后端

Files touched:

- `frontend/next.config.js`

### 2. Contact 页面改为 WhatsApp + 并列二维码展示

Summary:

- 将 `Contact Now` 中的 `Phone` 文案改为 `WhatsApp`
- 新增 WeChat / WhatsApp 二维码展示卡片
- 二维码支持后台设置上传或填写 URL
- 前端表单增加更明确的错误提示

Impact:

- 联系页信息结构更符合当前业务需求
- 用户可以直接扫码联系
- 提交失败时前端能显示更真实的后端错误原因

Files touched:

- `frontend/app/contact/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `frontend/lib/api.ts`

### 3. 联系表单后端增加校验、防刷与配置检查

Summary:

- `/contact` 改为显式请求结构，不再直接绑定到数据库模型
- 增加姓名、邮箱、主题、消息长度校验
- 增加隐藏蜜罐字段拦截基础机器人
- 增加基于 IP 的内存限流
- 提交前检查后台配置的联系邮箱是否存在且格式合法
- 保存 `site_settings` 时同步校验联系邮箱，阻止明显占位邮箱

Impact:

- 联系表单不再是“无校验直写数据库”
- 可以减少高频重试和简单脚本滥用
- 配置阶段即可发现假邮箱或错误邮箱

Files touched:

- `backend/api/handlers/contact.go`
- `backend/api/handlers/config.go`

### 4. 后台 Contacts 管理页重排并补齐批量删除

Summary:

- 后台 Contacts 页去掉错误的电话图标与 `phone` 字段展示
- 新增 `Subject` 展示
- 将卡片布局重排为更易读的消息管理视图
- 超过 10 条后分页展示
- 支持当前页选择、单选、批量删除
- 后端补充 Contact 单删和批量删除接口
- 同时补齐 `/admin/*` 和 `/api/admin/*` 两套管理路由入口

Impact:

- 后台联系人消息阅读体验更直接
- 管理员可一次性清理多条历史消息
- 前后端能力保持一致，不再出现前端有按钮但接口缺失的情况

Files touched:

- `frontend/app/admin/contacts/page.tsx`
- `backend/internal/service/contact.go`
- `backend/api/handlers/contact.go`
- `backend/api/routers/contact.go`
- `backend/api/routers/router.go`

### 5. 后台侧边栏顺序调整并新增公安备案号设置

Summary:

- 将后台侧边栏中 `Contacts` 调整到 `Settings` 上方
- 后台设置新增 `Public Security Filing Number`
- 前台 Footer 新增公安备案号展示，并链接到公安备案站点

Impact:

- 后台导航顺序更符合常用操作路径
- 网站页脚支持同时展示 ICP 备案号和公安备案号

Files touched:

- `frontend/components/admin/AdminSidebar.tsx`
- `frontend/app/admin/settings/page.tsx`
- `frontend/components/Footer.tsx`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build go test ./...`
- `npm run lint`

Results:

- backend tests passed
- frontend lint passed with existing warnings only

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/api/handlers/config.go`
- `backend/api/handlers/contact.go`
- `backend/api/routers/contact.go`
- `backend/api/routers/router.go`
- `backend/internal/service/contact.go`
- `frontend/app/admin/contacts/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/contact/page.tsx`
- `frontend/components/Footer.tsx`
- `frontend/components/admin/AdminSidebar.tsx`
- `frontend/lib/api.ts`
- `frontend/next.config.js`
- `docs/commit-log-2026-03-30-contact-admin-and-contact-flow.md`


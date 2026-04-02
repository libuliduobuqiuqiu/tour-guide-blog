# Commit Log

Date: 2026-04-02
Branch: `main`

## This Round Summary

本轮工作主要聚焦三件事：

- 全项目安全审查：从代码安全、敏感信息、前端依赖漏洞、后端依赖漏洞四个层面做了一轮核查
- 安全加固落地：补上后台登录限流、上传文件内容类型校验、社媒图片代理主机白名单、前端内容渲染消毒、服务端 CORS 收口
- 生产构建修复：修复 `react-quill-new` 的 `ref` 类型问题，并去掉 `next/font/google` 对 `Poppins` 的构建期外网依赖，确保前端可在当前环境完成生产构建

本轮同时纳入了工作区里已存在的前端依赖版本变更：`next` 升级到 `16.2.2`，`react-quill-new` / lockfile 调整为当前工作树状态。

## Security Review Findings

### 已修复

1. 后台文章 / Tour 内容渲染存在 XSS 面

Summary:

- `ContentShell` 之前直接把 HTML 传给 `dangerouslySetInnerHTML`
- 新增了基础 HTML 消毒逻辑，移除脚本、事件处理器和危险 URL

Impact:

- 降低后台富文本内容被植入脚本后在前台执行的风险

Files touched:

- `frontend/components/ContentShell.tsx`

2. 图片上传接口只校验扩展名

Summary:

- 上传接口此前只看文件后缀和大小
- 现在会读取文件头并校验 MIME，与允许的图片类型交叉验证

Impact:

- 降低伪造扩展名文件被当作图片写入公开目录的风险

Files touched:

- `backend/api/handlers/upload.go`

3. 社媒图片代理存在 SSRF 面

Summary:

- `GET /api/social/image` 之前允许传任意外部 URL，由后端代取
- 现在只允许已知社媒 CDN / 域名后缀，并拒绝 `localhost`、`.local` 和私网 IP

Impact:

- 阻断通过图片代理探测或访问内网地址的 SSRF 路径

Files touched:

- `backend/api/handlers/social.go`

4. CORS 配置过宽且与 credentials 组合不安全

Summary:

- 服务端此前对所有来源返回 `Access-Control-Allow-Origin: *`，同时开启了 credentials
- 现在改为只对白名单来源回显 `Origin`，默认保留本地开发地址，并支持 `server.frontend_origin` / `FRONTEND_ORIGIN`

Impact:

- 降低后台接口被任意第三方站点跨域调用的暴露面

Files touched:

- `backend/api/routers/router.go`

5. 后台登录接口缺少限流

Summary:

- 为登录接口新增基于客户端 IP 的 10 分钟窗口限流

Impact:

- 降低后台口令被暴力尝试的风险

Files touched:

- `backend/api/handlers/auth.go`

6. 前端生产构建阻塞项修复

Summary:

- `Editor` 修复了 `next/dynamic()` 包装组件后的 `ref` 类型不匹配问题
- `layout.tsx` 去掉 `next/font/google` 的 `Poppins` 远程抓取，改为本地字体栈，避免构建环境联网依赖

Impact:

- `npx tsc --noEmit` 通过
- `npx next build --webpack` 可在当前环境完成

Files touched:

- `frontend/components/admin/Editor.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`

### 仍需跟进

1. 本地未提交配置包含真实敏感信息

Summary:

- 工作区中的 `backend/configs/config.yaml` 含有实际管理员密码、JWT secret 和数据库 DSN
- 该文件当前被 `backend/.gitignore` 忽略，未纳入版本控制

Recommended next step:

- 立即轮换本地密码和 JWT secret
- 将生产配置迁移到环境变量或受控密钥管理，不再保留真实值到本地模板文件

2. 后端运行时 Go 版本存在已知漏洞

Summary:

- `govulncheck` 显示当前环境 `go1.23.3` 命中了多项 Go 标准库漏洞
- 还命中了 `github.com/quic-go/quic-go@v0.54.0` 的已知 DoS 公告

Recommended next step:

- 将构建 / 部署环境升级到较新的 Go 1.24.x 或更高的安全版本
- 升级 `quic-go` 到审计结果建议的修复版本或让相关间接依赖更新

3. 前端依赖树仍有 1 条低危公告

Summary:

- `npm audit` 命中 `quill@2.0.3` 的低危 XSS 公告 `GHSA-v3m3-f69x-jf25`
- `react-quill-new` 当前最新版本仍依赖 `quill ~2.0.3`，暂时无法通过简单升级彻底消除

Recommended next step:

- 持续关注 `quill` / `react-quill-new` 上游发布
- 在未来如有 patched release 时尽快升级并回归验证

## Validation

Checks run:

- `rg` 扫描敏感信息和危险 API 使用
- `npm audit --json`
- `cd backend && /root/go/bin/govulncheck ./...`
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npx next build --webpack`
- `cd backend && GOCACHE=/tmp/go-build go build ./...`

Results:

- 敏感信息扫描未发现已跟踪文件中的明文密钥泄漏
- 发现本地未跟踪配置文件 `backend/configs/config.yaml` 含真实敏感信息
- frontend type-check passed
- frontend webpack production build passed
- backend build passed
- frontend dependency audit reported 1 low severity advisory in `quill@2.0.3`
- backend vulnerability audit reported multiple Go runtime / standard library findings on `go1.23.3`

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/api/handlers/auth.go`
- `backend/api/handlers/social.go`
- `backend/api/handlers/upload.go`
- `backend/api/routers/router.go`
- `frontend/components/ContentShell.tsx`
- `frontend/components/admin/Editor.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `frontend/package.json`
- `frontend/package-lock.json`
- `docs/commit-log-2026-04-02-security-hardening-and-build-fixes.md`

## Recommended Next Step

如果下一轮继续做安全收口，建议按这个顺序推进：

1. 升级生产服务器的 Go toolchain，并重新跑一次 `govulncheck`
2. 把后台 token 从 `localStorage` 迁移到更安全的 `HttpOnly` cookie 方案
3. 给内容消毒和图片代理白名单补自动化测试，防止回归

# Changelog

This file is generated from the commit log documents in `docs/commit-log-*.md`.
The format is intentionally close to Keep a Changelog: chronological releases with human-written change summaries.

## 2026-03-30

Source: `docs/commit-log-2026-03-30.md`

## This Round Summary

本轮工作聚焦两个方向：

- 首页社交媒体轮播样式调整
- TikTok 自动同步失败排查与保护性修复

本轮没有完成 TikTok 自动同步恢复，但已经明确定位失败原因，并把可行的下一阶段方案整理成中文文档。

## Code Changes

### 1. 首页社交区块改为单行轮播

Summary:

- 将 Instagram 和 TikTok 的首页展示从双行拆分改成单行连续轮播
- 移除了原先按奇偶项分成上下两行的逻辑
- 统一了社交卡片宽度，减少不同平台卡片尺寸跳动

Impact:

- 首页社交媒体区块更符合当前视觉需求
- 轮播结构更简单，也更容易继续微调

Files touched:

- `frontend/components/SocialShowcase.tsx`

### 2. 去掉轮播两侧的渐隐遮罩

Summary:

- 删除了 `.social-marquee-mask::before` 和 `.social-marquee-mask::after`
- 去掉原先左右两侧用于制造“渐隐/遮罩”效果的线性渐变层
- 同时去掉了社交卡片自身的大阴影，减少边缘被裁切后看起来像“虚影”的现象

Impact:

- 首页轮播边缘不再出现明显的左右发灰遮罩
- 社交图片展示更直接

Files touched:

- `frontend/app/globals.css`
- `frontend/components/SocialShowcase.tsx`

### 3. TikTok JSON 结构兼容性增强

Summary:

- 为 TikTok 公开页面解析增加了更多 payload 结构兼容
- 新增对 `__NEXT_DATA__` 的解析入口
- 新增 `extractTikTokItemsFromPayload`
- 新增更宽松的帖子识别逻辑 `looksLikeTikTokPost`
- 新增 `buildTikTokFeedItem` 统一 TikTok 帖子转换逻辑

Impact:

- 能覆盖比旧实现更多的 TikTok 页面 JSON 结构
- 对未来再次出现结构性调整时，也更容易继续扩展

Files touched:

- `backend/internal/service/social.go`

### 4. TikTok 同步失败时保留已有缓存

Summary:

- 调整同步写回逻辑
- 只有当平台同步成功时，才覆盖该平台当前缓存
- 如果 TikTok 同步失败，不再把已有 TikTok 缓存内容清空

Impact:

- 避免后台一次同步失败导致首页 TikTok 区块内容整体消失
- 提高同步失败时的用户可见稳定性

Files touched:

- `backend/internal/service/social.go`

### 5. 改善 TikTok 同步错误信息

Summary:

- 当 TikTok 页面能返回账号信息且 `videoCount > 0`，但页面 payload 中没有帖子列表时
- 后端不再只返回模糊的 “found no posts”
- 改为返回更精确的错误语义：
  当前页面只返回账号信息，剩余帖子请求看起来依赖签名客户端调用

Impact:

- 后台报错信息更接近真实原因
- 后续排障时不再误判为“账号私密”或“只是页面结构微调”

Files touched:

- `backend/internal/service/social.go`

## Investigation Notes

本轮还做了较大规模的 TikTok 自动同步排查，核心结论如下：

### 1. 公开主页首屏不再直接返回帖子列表

实测：

- 桌面页和移动页的 `webapp.user-detail.userInfo.itemList` 都为空
- 但 `videoCount` 为正数

说明：

- TikTok 当前只在首屏返回账号信息
- 视频列表已改成浏览器运行后再异步加载

### 2. TikTok 页面确实会发 `/api/post/item_list/`

使用 Playwright 真实打开用户页后，可以观测到页面请求：

- `/api/post/item_list/`

这个请求会携带：

- `X-Bogus`
- `X-Gnarly`
- `verifyFp`
- `device_id`
- `msToken`

说明：

- 视频列表不是不存在
- 而是被放到了签名客户端请求后面

### 3. 当前会被 TikTok 风控拦截

实测结果：

- 页面会出现滑块验证提示
- `/api/post/item_list/` 虽然返回 `200`
- 但响应体长度为 `0`

说明：

- 即使进入浏览器执行阶段，当前无登录抓取依然会被风控阻断

### 4. 当前阶段最现实的自动同步方案

目前如果必须保留 TikTok 自动同步，建议下一阶段改为：

- 服务端登录态 + Playwright 浏览器同步

而不是继续只修纯 Go 的公开页面解析。

详细排查过程已单独写入：

- `docs/tiktok-sync-investigation-2026-03-30.zh-CN.md`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build-cache go build ./...`
- `npm run lint -- frontend/components/SocialShowcase.tsx`

Results:

- backend build passed
- frontend lint passed with existing `@next/next/no-img-element` warning only

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/internal/service/social.go`
- `frontend/app/globals.css`
- `frontend/components/SocialShowcase.tsx`
- `docs/tiktok-sync-investigation-2026-03-30.zh-CN.md`
- `docs/commit-log-2026-03-30.md`

## Recommended Next Step

如果下一轮继续推进 TikTok 自动同步，优先顺序建议如下：

1. 引入服务端 Playwright 同步能力
2. 支持导入并维护 TikTok 登录态
3. 从浏览器上下文中抓取视频链接和封面图
4. 下载并缓存到现有 social feed 本地资源目录

## 2026-03-30

Source: `docs/commit-log-2026-03-30-ytdlp-and-ui.md`

## This Round Summary

本轮工作聚焦四个方向：

- 用 `yt-dlp` 恢复 TikTok 主页自动同步
- 补齐 TikTok 同步设计、排障和部署文档
- 调整首页社交媒体区块视觉和页面底部过渡
- 精简后台社交媒体配置界面

## Code Changes

### 1. TikTok 同步主路径改为 `yt-dlp`

Summary:

- 新增 `syncTikTokYTDLP()`
- 同步时优先调用 `yt-dlp` 抓取 TikTok 主页视频列表
- 从返回 JSON 中提取视频链接、标题/描述、封面图和时间戳
- 保留原来的公开页面解析作为回退路径

Impact:

- TikTok 同步不再主要依赖公开 HTML payload
- 输入主页 URL 后，能更稳定拿到视频链接和封面图
- 继续复用现有本地图片缓存和首页轮播接口

Files touched:

- `backend/internal/service/social.go`

### 2. 新增 TikTok 同步和部署文档

Summary:

- 新增 TikTok 官方授权接入手册
- 新增 `yt-dlp` 同步说明
- 新增 TikTok 同步设计与排障手册

Impact:

- 后续排查 TikTok 同步失败时有统一文档入口
- 新机器初始化和升级发布时更容易发现依赖要求

Files touched:

- `docs/tiktok-official-api-setup.zh-CN.md`
- `docs/tiktok-ytdlp-sync.zh-CN.md`
- `docs/tiktok-sync-design-and-troubleshooting.zh-CN.md`

### 3. 部署链路加入 `yt-dlp`

Summary:

- 初始化脚本增加 `yt-dlp` 安装
- 后端环境变量示例增加 `SOCIAL_TIKTOK_YT_DLP_BIN`
- 部署文档增加新机器安装和旧机器补装说明

Impact:

- 新服务器初始化后即可满足 TikTok 同步依赖
- 后续迁移、重装、发布时不容易漏掉抓取器安装

Files touched:

- `scripts/init_ubuntu.sh`
- `deploy/systemd/tour-guide-backend.env.example`
- `deploy/DEPLOYMENT.md`

### 4. 首页社交区块和底部过渡优化

Summary:

- Instagram 和 TikTok 轮播左上角增加平台图标和标题
- 调整平台头部样式，让识别更明确但不过度抢戏
- 去掉 footer 顶部多余留白
- 将首页两段偏白背景改为更接近整体蓝色基调的渐变

Impact:

- 社交区块平台识别更直观
- 页脚上方不再出现明显白色断层
- 首页上下过渡更统一

Files touched:

- `frontend/components/SocialShowcase.tsx`
- `frontend/components/Footer.tsx`
- `frontend/app/page.tsx`

### 5. 后台社交媒体设置简化

Summary:

- 社交同步说明文案改为更直接的 URL 配置说明
- 每个平台只保留 `Profile URL` 配置项
- 移除用户名、post limit、OAuth 和 token 等输入项
- 保留并排的同步按钮

Impact:

- 管理界面更简洁
- 更符合当前“只填 URL 即可同步”的使用方式

Files touched:

- `frontend/app/admin/settings/page.tsx`

### 6. 增加基于 commit log 的 changelog 生成脚本

Summary:

- 新增 `scripts/generate_changelog.py`
- 自动扫描 `docs/commit-log-*.md`
- 生成项目根目录 `CHANGELOG.md`
- Makefile 新增 `changelog` 目标

Impact:

- 后续只需维护 commit log 文档
- changelog 可以一键重新生成
- 不依赖外部 changelog 生成器

Files touched:

- `scripts/generate_changelog.py`
- `Makefile`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build-cache go build ./...`
- `npm run lint -- app/admin/settings/page.tsx components/SocialShowcase.tsx components/Footer.tsx app/page.tsx`
- `bash -n scripts/init_ubuntu.sh`
- `/tmp/yt-dlp --no-warnings -J --flat-playlist --playlist-end 5 https://www.tiktok.com/@tourjanet`

Results:

- backend build passed
- frontend lint passed with existing warnings only
- init script syntax check passed
- yt-dlp extractor returned TikTok playlist metadata successfully

## Notes

本轮未纳入提交的工作区改动：

- `frontend/app/contact/page.tsx`

该文件存在现有修改，但不属于本轮任务范围，因此不会一起提交。

## 2026-03-30

Source: `docs/commit-log-2026-03-30-contact-admin-and-contact-flow.md`

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

## 2026-03-29

Source: `docs/commit-log-2026-03-29.md`

## Recent Commits

### `cb715c0` feat: add ICP setting and footer display

Summary:

- added an ICP setting in admin settings
- rendered ICP info in the footer
- updated seed/default config data accordingly

Impact:

- improves compliance-related site metadata support
- adds one more editable site-level setting in admin

Files touched:

- `backend/internal/seed/seed.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/components/Footer.tsx`

### `426f022` perf(admin): reduce dashboard/blog/tours download cost

Summary:

- reduced admin payload sizes by avoiding unnecessary longtext downloads
- introduced stats endpoint for aggregated admin dashboard data
- reduced eager frontend bundle loading in admin

Impact:

- faster admin page loads
- lower bandwidth and browser memory use
- cleaner separation between list views and detail content

Files touched:

- admin handlers and services for posts/tours
- router aliases under `/api/admin`
- admin dashboard, blog, tours pages
- admin sidebar
- frontend API helper

### `845c789` fix(admin): route backend admin APIs via /api/admin and prevent list map crash

Summary:

- switched admin frontend requests away from `/admin/*` to `/api/admin/*`
- added protected backend aliases for those API routes
- normalized frontend list parsing to avoid map/array shape crashes

Impact:

- fixed frontend/backend route collisions with Next.js admin pages
- improved admin resilience against inconsistent list payload shapes

### `d0574f7` feat(deploy): add daily log rotation for backend/frontend

Summary:

- added backend/frontend log rotation support
- expanded deployment and systemd configuration
- updated bootstrap/init script

Impact:

- better production operational hygiene
- lower risk of unbounded log growth

### `f2e6e9b` fix: route admin login via api

Summary:

- routed admin login through API path

Impact:

- fixed admin login flow against route conflicts

### `b38a397` chore: update nginx.conf

Summary:

- adjusted frontend nginx config

Impact:

- deployment-level behavior refinement

### `c74bdea` docs: update deployment notes

Summary:

- documented `/api` and `/uploads` proxy expectations
- documented `NEXT_PUBLIC_API_URL` and `API_URL` guidance for frontend/server use

Impact:

- improves deployment clarity and reduces SSR/API misconfiguration risk

### `c9c6398` fix: normalize public asset URLs

Summary:

- introduced public URL helper
- removed hardcoded localhost assumptions
- aligned nginx/service env with asset and API URL behavior

Impact:

- fixed production asset URL resolution
- improved SSR and browser API path consistency

### `7261a15` add http logging and debug flag

Summary:

- added HTTP logging middleware and router support
- added debug flag handling
- adjusted backend startup and DB setup accordingly

Impact:

- easier server-side debugging and request tracing

### `385df26` chore: reorganize Makefile and fix homepage image URL handling

Summary:

- reorganized Makefile targets and notes
- fixed hero image URL handling for uploaded assets
- replaced invalid fallback image handling

Impact:

- better local/deploy command ergonomics
- more reliable homepage hero rendering

### `29f428a` chore: update nginx configuration file

Summary:

- small nginx config adjustment

Impact:

- incremental deployment config refinement

### `4b01c28` chore: update Makefile

Summary:

- updated Makefile structure and commands

Impact:

- baseline maintenance and task flow cleanup

## Current Social Media Work Summary

This workstream focuses on homepage social feed integration and admin-side sync management.

Main changes prepared in the working tree:

- added backend social feed routes, handlers, and sync service
- added public-profile-based Instagram/TikTok sync workflow
- added fallback parsing and local media handling for synced assets
- added homepage social wall UI with two-row carousel treatment
- added admin settings UI for social configuration and sync controls
- added Chinese and English design documentation for the social feed architecture
- adjusted homepage data fetching to read social feed live instead of stale cached data

Core files involved:

- `backend/api/handlers/social.go`
- `backend/api/routers/social.go`
- `backend/api/routers/router.go`
- `backend/internal/service/social.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/components/SocialShowcase.tsx`
- `frontend/components/ReviewCards.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/url.ts`
- `frontend/lib/social.ts`
- `frontend/lib/reviews.ts`
- `docs/social-feed-design.md`
- `docs/social-feed-design.zh-CN.md`

## Validation Notes

Checks run during this workstream:

- `npm run lint`
- `GOCACHE=/tmp/go-build go test ./...`

Results:

- frontend lint passed with existing project warnings only
- backend tests/build passed

## Push Scope

Recommended push scope for this round:

- only social-feed-related backend/frontend/doc changes
- exclude unrelated worktree changes unless explicitly reviewed and requested

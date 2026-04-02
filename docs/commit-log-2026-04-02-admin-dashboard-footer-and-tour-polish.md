# Commit Log

Date: 2026-04-02
Branch: `main`

## This Round Summary

本轮工作主要聚焦四个方向：

- 后台 Dashboard 提醒区增强：联系人与待审核评价支持滚动、忽略、详情/编辑弹框和快速删除
- 后台 Contacts 列表版式收口：信息分区更稳定，邮件、日期、主题、正文层级更清晰
- 前台 Tours 详情页视觉强化：侧边信息卡片标题更醒目，底部 `Book Now` 改为独立居中的强提示区块
- 前台 Footer 可运营化：页脚标题和描述接入后台 Settings，同时优化备案与社媒排版

本轮同时修复了 Dashboard 忽略提醒时报错的问题，根因是后端 CORS 白名单缺少 `PATCH`。

## Code Changes

### 1. Dashboard 提醒队列支持忽略、弹框与固定高度滚动

Summary:

- `contacts` 与 `pending reviews` 卡片改为固定高度滚动区域，避免数据增多后无限拉长
- 新增 `show_on_dashboard` 字段，联系人与评价都可以单独从 Dashboard 忽略
- 联系人提醒支持在当前页弹框查看完整信息并直接删除
- 评价提醒支持在当前页弹框编辑、隐藏和删除
- Dashboard 数据读取改为完整对象，支持弹框内展示和编辑所需字段

Impact:

- Dashboard 从只读提示面板升级为可操作的工作台
- 管理员可以在首页快速处理提醒，而不必反复跳转管理列表页
- 提醒区在数据量增加时依旧保持稳定版式

Files touched:

- `frontend/app/admin/page.tsx`
- `backend/internal/model/models.go`
- `backend/internal/service/contact.go`
- `backend/internal/service/review.go`
- `backend/api/handlers/contact.go`
- `backend/api/handlers/review.go`
- `backend/api/routers/contact.go`
- `backend/api/routers/review.go`
- `backend/api/routers/router.go`
- `backend/migrations/007_add_dashboard_visibility_flags.sql`

### 2. Contacts 列表排版优化

Summary:

- 邮箱地址与日期改为稳定的上下两行结构
- `Subject` 调整到 `Message` 上方，字号更轻
- `Message` 区域加大，阅读重点更明确
- 整体列宽关系收口，避免因邮箱长度或日期变化导致信息区域跳动

Impact:

- 联系人列表扫描效率更高
- 长邮件地址或不同时间格式不会破坏信息卡片布局
- 主题与正文的主次关系更符合阅读习惯

Files touched:

- `frontend/app/admin/contacts/page.tsx`

### 3. Dashboard 忽略提醒接口报错修复

Summary:

- 修复浏览器调用 Dashboard 忽略提醒接口时的异常
- 原因是服务端 CORS 允许的方法列表缺少 `PATCH`

Impact:

- 联系人和评价的“关闭提醒”操作恢复正常
- 前端 `handleHideContactFromDashboard` / `handleHideReviewFromDashboard` 不再因预检失败报错

Files touched:

- `backend/api/routers/router.go`

### 4. Tours 详情页侧边信息与预订引导强化

Summary:

- 左侧 `Highlights` / `Places to Visit` 卡片标题改为更粗、更深、更醒目的强调色
- 原先嵌在正文容器中的 `Book Now` 卡片拆出，改为正文下方独立居中的 CTA 区块
- CTA 标题、说明和按钮尺寸同步放大

Impact:

- Tours 详情页侧边提示信息更容易被用户注意到
- 预订入口从“正文附属信息”升级为更明确的转化引导

Files touched:

- `frontend/app/tours/[id]/page.tsx`

### 5. Footer 信息架构优化并接入后台配置

Summary:

- 页脚改为更清晰的品牌说明 + 社媒入口 + 备案信息三段式结构
- ICP 备案与公安备案改为同一行展示，并为公安备案添加图标
- 社媒入口由弱图标升级为更明显的按钮式链接
- 去掉过于突兀的外层大框，让页脚更自然地融入背景
- 新增 `footer_title` / `footer_description`，可在后台 Settings 中编辑
- 页脚读取 `site_settings` 改为 `no-store`，确保设置保存后立即生效

Impact:

- 页脚信息更清晰，重点更集中
- 社媒跳转入口更明显
- 页脚核心文案实现后台可运营化，不再依赖写死内容

Files touched:

- `frontend/components/Footer.tsx`
- `frontend/app/admin/settings/page.tsx`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build go test ./...`
- `npm run lint -- app/admin/contacts/page.tsx`
- `npm run lint -- app/admin/page.tsx`
- `npm run lint -- app/tours/[id]/page.tsx`
- `npm run lint -- components/Footer.tsx`
- `npm run lint -- app/admin/settings/page.tsx components/Footer.tsx`

Results:

- backend tests passed
- targeted frontend lint passed
- repository still has existing lint warnings in `frontend/app/admin/settings/page.tsx` and existing `no-img-element` warnings; no new lint errors were introduced

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/api/handlers/contact.go`
- `backend/api/handlers/review.go`
- `backend/api/routers/contact.go`
- `backend/api/routers/review.go`
- `backend/api/routers/router.go`
- `backend/internal/model/models.go`
- `backend/internal/service/contact.go`
- `backend/internal/service/review.go`
- `backend/migrations/007_add_dashboard_visibility_flags.sql`
- `frontend/app/admin/contacts/page.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/Footer.tsx`
- `docs/commit-log-2026-04-02-admin-dashboard-footer-and-tour-polish.md`

## Recommended Next Step

如果下一轮继续优化，可按这个顺序推进：

1. 在 Dashboard 的忽略提醒弹框里增加“恢复显示”入口，减少误操作成本
2. 为 Footer 增加后台可配置的品牌小标题或版权年份策略
3. 为 Dashboard 提醒流补一个前后端联调用例，覆盖 `PATCH` 显隐接口

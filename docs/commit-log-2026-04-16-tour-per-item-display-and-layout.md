# Commit Log

Date: 2026-04-16
Branch: `master`

## This Round Summary

本轮围绕 Tours / Blog 的响应式排版收口与 Tours 配置项去全局化展开，重点解决了笔记本尺寸下内容过大拥挤、详情页侧栏挤压正文，以及 Tours 业务文案应按单个 Tour 维护并支持草稿暂存的问题。

主要完成：

- 修复首页、Tours/Blog 详情页在中等屏幕下比例过大与拥挤问题，统一收敛字号、留白和容器宽度
- 重构详情页正文与侧栏关系，避免侧栏挤压正文主轴，确保正文与标题区同轴对齐
- 将 Tours 的 `Cancellation Policy`、`Minimum Guest Notice`、`Price Suffix` 从全局 Settings 改为每个 Tour 独立字段
- 三个字段全部接入 Tours 草稿/发布流程：`Save Draft` 可暂存，`Publish` 才正式发布
- 清理 Settings 页面中已废弃的 Tours 全局配置入口，并在保存时清除历史遗留键

## Implementation Details

### 1) 响应式比例与详情页布局修复

更新：

- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/components/HeroCarousel.tsx`
- `frontend/components/ContentShell.tsx`
- `frontend/components/TourContentWithAside.tsx`
- `frontend/components/TourRouteTimeline.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/blog/[id]/page.tsx`

核心调整：

- 在笔记本断点区间下调全局基准字号，并将正文与标题改为 `clamp()` 连续缩放
- 收敛详情页与首页容器宽度、区块留白和大标题断点策略
- 详情页侧栏改为“空间足够右侧浮动，否则回流到底部”，杜绝被裁切
- Blog 详情正文排版对齐 Tours 样式，同时保留章节卡片并复用 Tours 风格侧栏行为
- Tours 详情标题区改为更稳的双列结构，并使 `Minimum Guest Notice` 在桌面端不换行

### 2) Tours 文案从全局配置改为单 Tour 字段 + 草稿支持

后端更新：

- `backend/internal/model/models.go`
- `backend/internal/service/tour.go`
- `backend/migrations/011_add_tour_cancellation_policy.sql`
- `backend/migrations/012_add_tour_minimum_notice.sql`
- `backend/migrations/013_add_tour_price_suffix.sql`

前端更新：

- `frontend/app/admin/tours/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/tours/page.tsx`
- `frontend/app/page.tsx`

核心调整：

- `tours` 新增字段：`cancellation_policy`、`minimum_notice`、`price_suffix`
- `TourDraftData` 同步新增上述字段，草稿保存/发布逻辑一并支持
- Tours Admin 编辑器改为在 Tour 表单内编辑三项文案，不再依赖全局 settings
- Tours 列表页、首页精选 Tours、Tours 详情页均改为优先读取 Tour 自身字段（保留默认展示回退）

### 3) 清理 Settings 中失效的 Tours 全局项

更新：

- `frontend/app/admin/settings/page.tsx`

核心调整：

- 移除 Settings 中 `Price Suffix`、`Minimum Guest Notice`、`Cancellation Policy` 的输入入口
- 读取和保存 `site_settings` 时清理上述历史键，避免继续回写无效全局配置

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/.gocache go fmt ./internal/model ./internal/service`
- `cd backend && GOCACHE=/tmp/.gocache go test ./... -run '^$' -exec /bin/true`
- `cd frontend && npm run lint -- app/admin/tours/page.tsx app/tours/[id]/page.tsx app/tours/page.tsx app/page.tsx app/admin/settings/page.tsx`

Results:

- backend compile-level tests passed
- frontend lint passed with pre-existing warnings only (unused `err` vars and `<img>` usage in settings page)

## Migration Notes

上线前请按顺序执行以下 migration：

1. `backend/migrations/011_add_tour_cancellation_policy.sql`
2. `backend/migrations/012_add_tour_minimum_notice.sql`
3. `backend/migrations/013_add_tour_price_suffix.sql`

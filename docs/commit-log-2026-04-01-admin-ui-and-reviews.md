# Commit Log

Date: 2026-04-01
Branch: `main`

## This Round Summary

本轮工作聚焦两个方向：

- 重构前后台 Reviews 流程，补齐游客评价提交流程、图片上传与后台审核排序能力
- 统一后台管理界面，重做侧边栏、Dashboard、弹框、分页、列表交互，并让 Tours、Blog、Carousels 接入一致的管理模式

本轮同时补了 Tours / Posts 的排序持久化字段与接口，后台各模块的交互方式和视觉风格已经基本统一。

## Code Changes

### 1. 前台 Reviews 页面升级为可投稿、可看图的完整评价体验

Summary:

- 新增前台评价提交弹框，支持游客填写国家、评分、正文和最多 3 张图片
- 新增前台评价图片上传接口调用
- Reviews 页面改成客户端壳层，支持打开投稿弹框
- 评价卡片新增图片展示、大图预览与更完整的详情弹层
- 新增国家数据源与前台评价辅助函数

Impact:

- 游客现在可以直接从前台提交评价
- 评价内容可带图片，展示层更完整
- 前台 Reviews 页从“静态展示”提升为“展示 + 投稿 + 详情浏览”完整闭环

Files touched:

- `frontend/app/reviews/page.tsx`
- `frontend/components/ReviewsPageClient.tsx`
- `frontend/components/ReviewSubmissionModal.tsx`
- `frontend/components/ReviewCards.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/reviews.ts`
- `frontend/lib/countries.ts`

### 2. 后端 Reviews 能力补齐公开提交流程、图片字段和审核排序

Summary:

- `Review` 模型新增 `photos` JSON 字段
- 新增公开评价提交流程与图片 URL 校验
- 为公开评价提交增加基础限流与蜜罐字段防刷
- 新增后台 Reviews 重排接口
- Review service 改为支持排序、默认日期、默认排序号和全字段更新
- 新增评论图片迁移脚本

Impact:

- 前台评价提交流程不再依赖后台手工录入
- 后台可审核、排序、置顶含图评论
- Review 数据结构可以正式承载图片型评价内容

Files touched:

- `backend/internal/model/models.go`
- `backend/api/handlers/review.go`
- `backend/internal/service/review.go`
- `backend/api/routers/review.go`
- `backend/migrations/004_add_review_photos.sql`

### 3. 后台 Reviews 页面重构为卡片审核工作台

Summary:

- 后台 Reviews 改为卡片式列表
- 支持分页、拖拽排序、置顶排序
- 支持评论图片管理和预览
- 新增统一详情弹框用于创建、编辑、审核
- 生成初始评论、审核状态、评分和日期信息都重新排版

Impact:

- Reviews 后台从“简单列表页”升级为实际可用的审核与排序工具
- 更适合作为其他内容管理页的统一模板

Files touched:

- `frontend/app/admin/reviews/page.tsx`
- `frontend/components/admin/AdminModal.tsx`
- `frontend/components/admin/AdminPagination.tsx`

### 4. 后台整体视觉和交互统一

Summary:

- 重做后台侧边栏背景、图标、字体层级和激活态
- 后台 Layout 调整壳层结构，避免弹框和页面动效互相干扰
- 新增统一后台弹框样式和分页组件
- 全局样式新增 `fade-up`、`fade-in`、`scale-in` 的后台过渡能力
- Dashboard 重做为运营面板，新增 KPI、管理信号、最近联系人和待审核评价区块

Impact:

- 后台整体视觉更统一，侧边栏更清晰
- 页面切换与弹框进入不再生硬
- Dashboard 从简单计数页升级为更有管理价值的首页

Files touched:

- `frontend/components/admin/AdminSidebar.tsx`
- `frontend/app/admin/layout.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/globals.css`
- `frontend/components/admin/AdminModal.tsx`
- `frontend/components/admin/AdminPagination.tsx`

### 5. Tours、Blog、Carousels 接入统一后台内容管理模式

Summary:

- Tours、Blog、Carousels 全部改成与 Reviews 类似的卡片式后台页面
- 三个页面都支持分页、拖拽排序、置顶排序和详情弹框
- Tours / Blog 保留富文本编辑器，同时接入新的统一弹框与排序流
- Carousels 从网格编辑切换为统一内容管理卡片流

Impact:

- 后台内容管理方式统一，学习成本明显下降
- Tours、Blog、Carousels 的日常维护效率更高

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/carousels/page.tsx`

### 6. Tours、Posts、Carousels 的排序能力后端持久化

Summary:

- Tours 和 Posts 模型新增 `sort_order`
- 新增 Tours、Posts、Carousels 的 reorder handler / route / service
- Tours / Posts 查询顺序改为按 `sort_order` 优先，再按创建时间降序
- 新增 Tours / Posts 排序迁移

Impact:

- 后台拖拽和置顶不再只是前端假动作
- Tours、Blog、Carousels 的展示顺序可以稳定持久化

Files touched:

- `backend/internal/model/models.go`
- `backend/internal/service/tour.go`
- `backend/internal/service/post.go`
- `backend/internal/service/carousel.go`
- `backend/api/handlers/tour.go`
- `backend/api/handlers/post.go`
- `backend/api/handlers/carousel.go`
- `backend/api/routers/tour.go`
- `backend/api/routers/post.go`
- `backend/api/routers/carousel.go`
- `backend/api/routers/router.go`
- `backend/migrations/005_add_sort_order_to_tours_posts.sql`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build go test ./...`
- `npm run lint`
- `npx tsc --noEmit`

Results:

- backend tests passed
- frontend type check passed
- frontend lint passed with existing warnings only (`no-img-element` and a few pre-existing unused variable warnings)

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/api/handlers/review.go`
- `backend/api/handlers/tour.go`
- `backend/api/handlers/post.go`
- `backend/api/handlers/carousel.go`
- `backend/api/routers/review.go`
- `backend/api/routers/tour.go`
- `backend/api/routers/post.go`
- `backend/api/routers/carousel.go`
- `backend/api/routers/router.go`
- `backend/internal/model/models.go`
- `backend/internal/service/review.go`
- `backend/internal/service/tour.go`
- `backend/internal/service/post.go`
- `backend/internal/service/carousel.go`
- `backend/migrations/004_add_review_photos.sql`
- `backend/migrations/005_add_sort_order_to_tours_posts.sql`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/reviews/page.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/carousels/page.tsx`
- `frontend/app/admin/contacts/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/admin/layout.tsx`
- `frontend/app/reviews/page.tsx`
- `frontend/app/globals.css`
- `frontend/components/ReviewCards.tsx`
- `frontend/components/ReviewSubmissionModal.tsx`
- `frontend/components/ReviewsPageClient.tsx`
- `frontend/components/admin/AdminSidebar.tsx`
- `frontend/components/admin/AdminModal.tsx`
- `frontend/components/admin/AdminPagination.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/reviews.ts`
- `frontend/lib/countries.ts`
- `docs/commit-log-2026-04-01-admin-ui-and-reviews.md`

## Recommended Next Step

如果下一轮继续推进后台质量，优先顺序建议如下：

1. 把后台图片展示统一替换为 `next/image` 或统一图片组件，清掉当前 lint warning
2. 为 Tours / Blog / Carousels 增加批量操作能力
3. 给 Dashboard 增加更明确的待办队列与快捷过滤入口
4. 为公开评价提交流程补更完整的审核通知或后台提醒

# Commit Log

Date: 2026-04-02
Branch: `main`

## This Round Summary

本轮工作聚焦前台 Blog / Tours 文章详情页的阅读体验收口，主要完成了三部分：

- 重做 Blog / Tours 详情页的头图、标题区、正文排版和整体版心比例
- 修复并重构 Blog 目录侧边栏，让目录文本抽取、视觉层级和浮动布局更稳定
- 为 Tours 详情页新增后台可编辑的 `Highlights` / `Places to Visit`，并改造成右侧浮动信息卡片

本轮同时补齐了 Tours 后端字段和迁移文件，前后台的数据结构已经连通。

## Code Changes

### 1. Blog / Tours 详情页整体版式重构

Summary:

- 重做 Blog / Tours 详情页头图展示方式，改为更大的卡片式封面
- 统一调整标题区、正文区、底部卡片区的宽度比例和位置关系
- 重写正文阅读框样式，优化字号、行高、标题层级、段距、图片和引用块表现
- 收口文章页动画表现，减少原先背景铺图和内容区域的割裂感

Impact:

- Blog / Tours 详情页整体阅读体验更稳定，页面结构更接近常见长文阅读布局
- 头图质感更好，标题区与正文区比例更协调
- 长文阅读时的文字密度、节奏和可读性明显提升

Files touched:

- `frontend/app/blog/[id]/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/globals.css`

### 2. Blog 目录侧边栏和内容壳层重构

Summary:

- 修复目录从标题中抽取文本时出现多余字符的问题
- 新增更稳定的标题文本清洗逻辑，处理 HTML 实体、零宽字符和残留 Markdown 符号
- 重构 `ContentRenderer` / `ContentShell`，支持 Blog 目录和 Tours 侧边卡片两种壳层布局
- 取消目录缩进按钮，改为稳定展示的右侧浮动目录卡片

Impact:

- Blog 目录的章节文本更干净，定位更准确
- 目录与正文的视觉关系更统一
- 内容壳层具备更好的扩展性，后续可以继续承载不同详情页的侧边结构

Files touched:

- `frontend/components/ContentRenderer.tsx`
- `frontend/components/ContentShell.tsx`
- `frontend/app/blog/[id]/page.tsx`
- `frontend/app/globals.css`

### 3. Tours 详情页改为右侧浮动信息卡片

Summary:

- Tours 详情页移除目录，改为右侧 `Highlights` / `Places to Visit` 两张浮动卡片
- 两张卡片改为真正独立右侧列布局，并支持随页面滚动 `sticky`
- 多轮收口 Tours 底部 `Booking` 卡片，让它与正文内容分离，但仍保持在同一文章容器体系下

Impact:

- Tours 详情页的信息结构从“长文 + 目录”调整为“正文 + 关键信息侧栏”
- 游客更容易快速浏览路线亮点和地点信息
- Tours 页面更符合 itinerary / travel article 的阅读方式

Files touched:

- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/ContentRenderer.tsx`
- `frontend/components/ContentShell.tsx`
- `frontend/app/globals.css`

### 4. Tours 后台字段和后端模型补齐

Summary:

- `Tour` 模型新增 `highlights` / `places` JSON 字段
- 后台 Tours 编辑页新增两个字段，按每行一条维护内容
- 新增数据库迁移 `006_add_tour_highlights_and_places.sql`

Impact:

- 后台现在可以直接维护 Tours 详情页右侧两张卡片的数据
- 前后端字段已经连通，详情页不再依赖写死内容

Files touched:

- `backend/internal/model/models.go`
- `backend/migrations/006_add_tour_highlights_and_places.sql`
- `frontend/app/admin/tours/page.tsx`

## Validation

Checks run:

- `npm run lint`
- `GOCACHE=/tmp/go-build-cache go test ./...`

Results:

- frontend lint passed with existing warnings only (`no-img-element` and a few pre-existing unused variable warnings)
- backend tests passed

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/internal/model/models.go`
- `backend/migrations/006_add_tour_highlights_and_places.sql`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/blog/[id]/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/globals.css`
- `frontend/components/ContentRenderer.tsx`
- `frontend/components/ContentShell.tsx`
- `docs/commit-log-2026-04-02-article-detail-layout-and-tour-sidebar.md`

## Recommended Next Step

如果下一轮继续打磨详情页体验，优先顺序建议如下：

1. 为 Blog / Tours 详情页补充更明确的当前章节高亮态
2. 为 Tours 右侧浮动卡片增加在 `lg` 尺寸下的降级展示策略
3. 继续统一正文框、底部卡片和标题卡之间的边框 / 阴影层级

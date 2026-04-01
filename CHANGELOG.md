# Changelog

This file is generated from the commit log documents in `docs/commit-log-*.md`.
The format is intentionally close to Keep a Changelog: chronological releases with human-written change summaries.

## 2026-04-01

Source: `docs/commit-log-2026-04-01-admin-editor-upload-and-pagination.md`

## This Round Summary

本轮工作继续聚焦后台编辑体验，主要完成了三部分：

- 调整后台分页区域，去掉外层卡片感并固定在列表底部
- 将 Tours / Blog 的 Content 提示文案从编辑器区域移动到字段区域
- 为富文本编辑器接入后台图片上传流，补齐本地选图、粘贴图片、拖拽图片插入，并增加图片选中与初步缩放交互

这轮仍然不涉及后端数据结构变更，重点是让后台内容编辑流程更接近日常文档工具，而不是依赖手填图片路径。

## Code Changes

### 1. 后台分页改为底部独立按钮区

Summary:

- `AdminPagination` 去掉外层卡片容器
- 分页文案和上一页 / 下一页按钮改为更轻量的底部布局
- Tours / Blog 等后台页面继续复用同一个分页组件

Impact:

- 后台列表页底部层次更干净
- 分页控件不再像嵌在一个单独信息框里，视觉上更贴近内容区底部操作

Files touched:

- `frontend/components/admin/AdminPagination.tsx`

### 2. Content 提示文案回归字段区域

Summary:

- 移除编辑器组件内部的 Markdown 粘贴提示
- 将提示文案挪到 Tours / Blog 表单的 `Content` 字段标签下

Impact:

- 提示信息归属于字段本身，而不是编辑器工具区
- 表单语义更清楚，编辑器本体更干净

Files touched:

- `frontend/components/admin/Editor.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`

### 3. 富文本编辑器接入图片上传与自动插入

Summary:

- 工具栏图片按钮改为本地文件选择，不再要求手填相对路径或图片 URL
- 接入已有后台上传接口 `uploadAdminImage`
- 支持三种图片插入方式：本地选图、粘贴图片、拖拽图片到编辑器
- 修复首次选图后不生效的问题：记录插入位置并在插入后主动同步 HTML
- 新增上传中与错误提示

Impact:

- 后台编辑内容时的插图流程明显简化
- 内容层仍只保存图片 URL，不把图片二进制塞进数据库
- 当前项目已经具备更合理的“上传后插入引用”编辑模型

Files touched:

- `frontend/components/admin/Editor.tsx`

### 4. 补充后台编辑器图片模块设计文档

Summary:

- 新增中文设计文档，说明为什么不直接把图片内容存数据库
- 说明当前项目采用“上传文件 + 正文保存 URL”的原因与边界
- 补充后续可扩展方向，包括压缩、对象存储、媒体元数据表

Impact:

- 后续继续迭代编辑器图片能力时，有统一的设计依据
- 团队可以更清楚地区分“内容存储”和“媒体存储”的边界

Files touched:

- `docs/admin-editor-image-upload-design.zh-CN.md`

### 5. 接入图片选中态与初步拖拽缩放交互

Summary:

- 点击编辑器中的图片后增加选中高亮
- 增加图片覆盖层和右下角缩放手柄
- 禁用图片原生拖拽，避免浏览器默认拖动行为干扰
- 为后续继续打磨更接近文档编辑器的图片缩放交互打基础

Impact:

- 后台图片编辑交互开始从“纯插入”走向“可视化编辑”
- 当前交互基础已接通，但仍有继续细化空间

Files touched:

- `frontend/components/admin/Editor.tsx`
- `frontend/app/globals.css`

## Validation

Checks run:

- `npm run lint`

Results:

- frontend lint passed with existing warnings only (`no-img-element` and a few pre-existing unused variable warnings)

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/globals.css`
- `frontend/components/admin/AdminPagination.tsx`
- `frontend/components/admin/Editor.tsx`
- `docs/admin-editor-image-upload-design.zh-CN.md`
- `docs/commit-log-2026-04-01-admin-editor-upload-and-pagination.md`

## Recommended Next Step

如果下一轮继续推进后台富文本编辑体验，优先顺序建议如下：

1. 继续收口图片拖拽缩放交互，做到稳定可预期
2. 为图片增加对齐方式与说明文字能力
3. 在服务端增加上传阶段压缩和尺寸约束

## 2026-04-01

Source: `docs/commit-log-2026-04-01-admin-ui-and-reviews.md`

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

## 2026-04-01

Source: `docs/commit-log-2026-04-01-admin-modal-and-editor-polish.md`

## This Round Summary

本轮工作聚焦后台管理界面的体验收口，主要完成了两部分：

- 修复后台弹框遮罩、分页落位和弹框表单的视觉一致性问题
- 重构 Tours / Blog 富文本编辑器，补齐 Markdown 粘贴转换、全屏编辑和图片插入稳定性

这轮改动不涉及后端接口调整，重点是前端管理体验的稳定性和可用性。

## Code Changes

### 1. 后台弹框改为真正覆盖整个浏览器，并统一弹框表单观感

Summary:

- `AdminModal` 改为通过 `createPortal` 挂载到 `document.body`
- 解决后台页面过渡动画导致的“遮罩只覆盖中间区域”问题
- 打开弹框时统一锁定 `html` 和 `body` 滚动
- 统一增强后台弹框内 `input / textarea / select` 的边框、底色和阴影表现

Impact:

- 后台各模块弹框的遮罩行为与前台 Reviews 的弹框保持一致
- 弹框表单输入框不再像“裸文本区域”，字段边界更清晰
- 整体后台弹框视觉更稳定、更易读

Files touched:

- `frontend/components/admin/AdminModal.tsx`
- `frontend/app/globals.css`

### 2. 后台分页区域固定到底部，避免贴着最后一条数据浮动

Summary:

- 调整后台主布局为纵向 `flex` 结构
- Tours、Blog、Carousels、Reviews、Contacts 的列表区改为撑满剩余高度
- 统一分页组件风格，并让 Contacts 接入同一套分页组件

Impact:

- 数据较少时分页仍稳定出现在底部
- 后台多个管理页的分页交互和视觉保持一致

Files touched:

- `frontend/app/admin/layout.tsx`
- `frontend/components/admin/AdminPagination.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/carousels/page.tsx`
- `frontend/app/admin/reviews/page.tsx`
- `frontend/app/admin/contacts/page.tsx`

### 3. Tours / Blog 富文本编辑器重构为统一的一体式编辑体验

Summary:

- 移除 Markdown / 富文本双模式切换，仅保留富文本编辑器
- 支持直接粘贴 Markdown 文本并自动转换为富文本内容
- 全屏编辑改为独立 portal 覆盖整个浏览器
- 全屏按钮并入工具栏末尾，只保留图标并通过悬停提示说明作用
- 将编辑器重构为常见的“一体式工具栏 + 编辑区”结构
- 调整编辑器字号、行高、段落间距、列表间距和标题层级
- 修复插入图片时选区为空触发的 `Cannot read properties of null (reading 'index')`

Impact:

- Tours / Blog 编辑内容时不再需要手动切换编辑模式
- 粘贴已有 Markdown 内容的迁移成本更低
- 长内容编辑时的阅读和排版观感更自然
- 图片插入和全屏编辑的稳定性明显提升

Files touched:

- `frontend/components/admin/Editor.tsx`
- `frontend/app/globals.css`

## Validation

Checks run:

- `npm run lint`

Results:

- frontend lint passed with existing warnings only (`no-img-element` and a few pre-existing unused variable warnings)

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `frontend/app/admin/blog/page.tsx`
- `frontend/app/admin/carousels/page.tsx`
- `frontend/app/admin/contacts/page.tsx`
- `frontend/app/admin/layout.tsx`
- `frontend/app/admin/reviews/page.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/globals.css`
- `frontend/components/admin/AdminModal.tsx`
- `frontend/components/admin/AdminPagination.tsx`
- `frontend/components/admin/Editor.tsx`
- `docs/commit-log-2026-04-01-admin-modal-and-editor-polish.md`

## Recommended Next Step

如果下一轮继续打磨后台编辑体验，优先顺序建议如下：

1. 为富文本编辑器接入后台图片上传，而不是仅靠图片 URL
2. 为后台弹框补充更明显的字段校验提示和错误态
3. 继续收敛后台页面文案语言，统一中英文风格

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

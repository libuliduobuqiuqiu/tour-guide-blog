# Changelog

This file is generated from the commit log documents in `docs/commit-log-*.md`.
The format is intentionally close to Keep a Changelog: chronological releases with human-written change summaries.

## 2026-04-15

Source: `docs/commit-log-2026-04-15-tour-display-settings-and-draft-safeguard.md`

## This Round Summary

本轮工作围绕 Tours 页面展示文案可配置化、取消政策信息补齐，以及草稿保存链路保护展开，同时顺手调整了首页 Why Choose Me 卡片图标顺序。

主要完成：

- 为 Tours 列表页和详情页新增共享展示配置，支持后台维护价格后缀、最少成团提示和取消政策
- Tours 详情页在 `Places to Visit` 下方新增红色 `Cancellation Policy` 信息卡
- 删除 availability 日期弹层中关于颜色含义的说明文案，保留更精简的提示
- 将共享 Tours 展示配置同步放入 Tours 后台编辑弹窗，便于在编辑线路时直接调整
- 修复 Tours 后台“保存草稿”误把共享站点配置立即发布到前台的问题
- 首页 Why Choose Me 区块按需求调整前两张卡片图标

## Code Changes

### 1. Tours 共享展示配置

Summary:

- 抽出 `tour_price_suffix`、`tour_minimum_notice`、`tour_cancellation_policy` 三个共享配置及默认值
- Tours 列表页价格后缀改为读取配置，不再写死 `/ person`
- Tours 详情页价格区和最少成团提示改为读取配置
- Settings 后台新增 `Tours Display` 区块，可统一维护这三项文本
- site settings seed 补齐默认 Tours 展示配置，确保新环境可直接使用

Files touched:

- `frontend/lib/tour-settings.ts`
- `frontend/app/tours/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `backend/internal/seed/seed.go`

### 2. Tours 详情页取消政策与 availability 提示收口

Summary:

- 在详情页侧边信息区新增红色高亮 `Cancellation Policy` 卡片
- 取消政策支持按换行拆成多条展示
- availability 浮层去掉颜色图例与说明区块
- 浮层顶部只保留基础提示和最大人数信息，交互更简洁

Files touched:

- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/TourAvailabilityButton.tsx`

### 3. Tours 后台编辑入口与草稿保护

Summary:

- Tours 编辑弹窗中新增 `Price Suffix`、`Minimum Guest Notice`、`Cancellation Policy`
- 编辑弹窗打开时会同时读取当前 `site_settings` 中的 Tours 展示配置
- 只有点击 `Publish Tour` 时才会把共享展示配置写回 `site_settings`
- 点击 `Save Draft` 时只保存当前 tour 的草稿数据，避免共享配置提前影响线上前台

Files touched:

- `frontend/app/admin/tours/page.tsx`

### 4. 首页 Why Choose Me 图标调整

Summary:

- 第一张卡片图标改为时间图标
- 第二张卡片图标改为金钱相关图标

Files touched:

- `frontend/app/page.tsx`

## 2026-04-14

## This Round Summary

本轮工作主要围绕后台配置可编辑性与首页 Hero 图片上传体验收口展开，重点解决了 Tours 后台数字输入体验、Why Choose Me 卡片配置落库，以及首页图片裁剪与前台展示不一致的问题。

主要完成：

- 修复后台 Tours / Settings 中数字输入框连续输入多位数字时被重置的问题
- Settings 新增 Why Choose Me 三张卡片的后台编辑能力，并持久化到 `site_settings`
- 首页 Why Choose Me 区块改为从配置读取，移除前台写死内容
- Settings 首页 Hero 图片上传改为内嵌式裁剪流程，接入主流固定裁剪框交互
- 统一首页 Hero 图片的后台裁剪尺寸、预览比例与前台显示规则，避免上传后前台再次被额外裁切
- 首页 Hero 最终改为全宽且按固定比例渲染，前后台展示结果保持一致

## Code Changes

### 1. 后台数字输入与 Tours 编辑体验修复

Summary:

- 修正后台 `AdminNumberInput` 在父组件重渲染时的使用方式
- 去掉 Tours 价格、最大预约人数、availability 已预约人数等输入项上按当前值重挂载的 `key`
- 数字输入现在支持连续输入多位数，不会出现“每次只能输入一位”的问题

Files touched:

- `frontend/components/admin/AdminNumberInput.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/app/admin/settings/page.tsx`

### 2. Why Choose Me 改为后台配置

Summary:

- Settings 新增 Why Choose Me 三张卡片的标题与描述编辑区
- 配置通过 `site_settings.why_choose_me_cards` 保存
- 首页 Why Choose Me 区块改为读取配置，并为历史数据提供默认回退值
- site settings seed 补齐默认 Why Choose Me 数据

Files touched:

- `frontend/app/admin/settings/page.tsx`
- `frontend/app/page.tsx`
- `backend/internal/seed/seed.go`

### 3. 首页 Hero 图片裁剪与显示一致性调整

Summary:

- Settings 首页图片上传改为字段内嵌裁剪，而不是整页弹层
- 裁剪器改用 `react-easy-crop`，支持固定裁剪框、拖拽图片与精确像素导出
- 去掉裁剪界面的导航栏虚影提示，保留更简洁的裁剪交互
- 首页 Hero 图片显示位置固定为 `top center`
- 首页 Hero 容器改为全宽并按统一比例渲染，避免后台裁好后前台再次被裁切
- 抽出共享的 Hero 图片尺寸与显示常量，统一后台裁剪、后台预览和前台展示

Files touched:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/components/admin/ImageCropInline.tsx`
- `frontend/lib/hero-image.ts`
- `frontend/app/admin/settings/page.tsx`
- `frontend/components/HeroCarousel.tsx`

## This Round Summary

本轮工作集中收口 Tours 的前后台细节，重点修复了草稿/发布双版本逻辑、后台状态展示、预约人数颜色提示，以及 Tour 行程正文中英文内容的富文本清洗与换行问题。

主要完成：

- 为 Tours 建立“发布数据 + 草稿数据”双副本机制，前台只读取正式发布数据，后台编辑优先读取草稿数据
- 后台新增并收口 `Save Draft` / `Publish Tour` 流程，草稿状态与已发布状态按真实状态切换
- 修复后台 Tours 列表状态标签判断，避免 `published` 数据被误标为 `Draft`
- 在 Tours 前台详情页补充最少成团红字提示、可编辑额外 tag，以及按预约人数分级着色的 availability 日历
- 追查并修复 Tour 行程正文英文单词换行异常的根源：清洗 `&nbsp;`、零宽字符、`span/style/class` 等富文本残留
- 禁止后台 tour 编辑弹窗点击遮罩后直接关闭，避免编辑器意外消失

## Code Changes

### 1. Tours 草稿与发布双数据流

Summary:

- `Tour` 模型新增 `status` 与 `draft_data`
- 已发布 Tour 保存草稿时只更新 `draft_data`，不会覆盖当前线上正式内容
- 发布时才把草稿内容写回正式字段，并清空 `draft_data`
- 新建草稿不会出现在前台，前台继续只显示正式发布数据

Files touched:

- `backend/internal/model/models.go`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/tour.go`
- `backend/api/handlers/tour.go`
- `backend/api/routers/router.go`
- `backend/api/routers/tour.go`
- `backend/migrations/009_add_tour_status.sql`
- `backend/migrations/010_add_tour_draft_data.sql`

### 2. Tours 后台状态与编辑体验

Summary:

- Tours 后台列表状态标签改为真实反映 `draft/published`
- 去掉列表中无业务意义的 `#id` 标签
- Tour 编辑弹窗支持 `Save Draft` 与 `Publish Tour`
- 编辑弹窗禁用遮罩点击关闭，避免正在编辑时误关

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `frontend/components/admin/AdminModal.tsx`

### 3. Tours 前台标签、预订提示与 availability 配色

Summary:

- 详情页价格区下方新增最少 6 人成团的红色加粗提示
- 详情页与 tours 列表页都支持展示后台可编辑的额外 `booking_tag`
- availability 浮层按已预约人数分色：少于 6 人绿色，6 人以上未满橙色，满员灰色

Files touched:

- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/tours/page.tsx`
- `frontend/components/TourAvailabilityButton.tsx`

### 4. Tours 富文本内容清洗与英文换行根因修复

Summary:

- 新增富文本规范化逻辑，清洗 `&nbsp;`、零宽字符、`<wbr>`、`span/style/class` 等编辑器残留
- 在编辑器粘贴、编辑器输出、保存前、前台渲染前四个环节做兜底清洗
- 收口 tour 路线正文容器宽度与块级正文换行规则，避免英文单词被中间截断或内容撑出正文框

Files touched:

- `frontend/lib/content.ts`
- `frontend/components/admin/Editor.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/components/TourRouteTimeline.tsx`
- `frontend/app/globals.css`
- `backend/internal/service/tour.go`

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-build go test ./...`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

Results:

- backend tests passed
- frontend build passed
- frontend lint completed with only pre-existing warnings outside this change scope

## 2026-04-06

Source: `docs/commit-log-2026-04-06-tour-route-editor-upload-cleanup-and-home-review-fixes.md`

## This Round Summary

本轮工作主要围绕 Tours 线路编辑重构、详情页时间线展示、后台编辑体验修复，以及上传与首页配置链路问题收口展开。

主要完成：

- 将 Tours 后台正文从单块富文本改为“多个旅游点”编辑模式，并补齐后端 `route_points` 数据结构
- 将 Tours 前台详情页改为时间线式线路展示，保留右侧浮动信息卡片并使其可跟随正文滚动
- 收口 Tours / Blog 内容壳层宽度、Blog 右侧目录卡宽度和文字密度
- 修复后台数字输入无法删空重输的问题，优化路线图片上传布局与富文本工具栏
- 修复 `.jpg` 上传 MIME 校验误判问题
- 新增 uploads 清理脚本和 Makefile 入口，可扫描并删除数据库未引用的上传图片
- 修复首页精选 review 配置链路，使后台选择与前台展示逻辑保持一致

## Code Changes

### 1. Tours 路线点位编辑与后端数据模型

Summary:

- `Tour` 模型新增 `route_points` JSON 字段
- 后端保存 Tours 时会规范化线路点位，并同步生成兼容旧链路的 `content`
- 后台 Tours 编辑页改造成多个旅游点编辑器：每个点支持标题、图片、富文本介绍、顺序调整和增删

Impact:

- Tours 内容结构从“单块正文”升级为“结构化线路点位”
- 后台维护效率更高，前台也更容易做时间线式展示
- 与旧 `content` 字段保持兼容，避免已有链路直接断裂

Files touched:

- `backend/internal/model/models.go`
- `backend/internal/service/tour.go`
- `frontend/app/admin/tours/page.tsx`

### 2. Tours 前台时间线与浮动侧边卡片

Summary:

- Tours 详情页正文改为线路时间线展示，左侧为图片，中间为序号轨道，右侧为标题和介绍
- 新增 `TourRouteTimeline` 组件，通过实际测量序号位置绘制时间线，避免首尾连线误差
- 恢复并保留 `Highlights / Places to Visit` 卡片
- 新增 `TourContentWithAside`，让右侧卡片在桌面端跟随正文滚动，同时不挤占正文宽度

Impact:

- Tours 页面更接近真实 itinerary 阅读体验
- 时间线连接逻辑更稳定，不再依赖静态高度估算
- 右侧信息卡在滚动时跟随正文，交互更符合预期

Files touched:

- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/TourRouteTimeline.tsx`
- `frontend/components/TourContentWithAside.tsx`
- `frontend/app/globals.css`
- `frontend/components/ContentShell.tsx`

### 3. 内容壳层与后台编辑体验优化

Summary:

- 富文本渲染逻辑抽到 `frontend/lib/content.ts`，供详情页和通用正文组件复用
- Blog 右侧目录卡加宽，目录文字与层级缩进更紧凑
- 后台路线图片上传改为更大的纵向预览，按钮放到图片下方
- 富文本工具栏默认标题态改为 `Normal`，并显式保留清除格式按钮
- 新增统一后台数字输入组件，允许清空后重新输入，失焦时再按规则回落默认值

Impact:

- 正文渲染与富文本清洗逻辑更统一
- Blog 目录卡阅读效率更高
- 后台编辑器手感更自然，避免数字输入强制残留 `0`

Files touched:

- `frontend/lib/content.ts`
- `frontend/components/ContentRenderer.tsx`
- `frontend/components/ContentShell.tsx`
- `frontend/components/admin/ImageUpload.tsx`
- `frontend/components/admin/Editor.tsx`
- `frontend/components/admin/AdminNumberInput.tsx`
- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/app/admin/settings/page.tsx`

### 4. 上传校验与 uploads 清理脚本

Summary:

- 修复 `.jpg` 文件内容校验映射错误，接受标准 `image/jpeg`
- 新增 `cleanup_uploads` 脚本，扫描数据库中被引用的 `/uploads/...` 路径
- 支持从 `backend/uploads` 中找出未被引用的文件
- 在 Makefile 增加 dry-run 和 apply 两个目标

Impact:

- 正常 `.jpg` 文件上传不再被误判拦截
- 可以定期清理未使用的上传图片，减少磁盘堆积
- 脚本默认 dry-run，更适合安全运维

Files touched:

- `backend/api/handlers/upload.go`
- `backend/cmd/cleanup_uploads/main.go`
- `Makefile`

### 5. 首页精选 Review 配置链路修复

Summary:

- 首页 reviews / config 拉取改为 `no-store`
- 首页精选 review 只按 active review 参与匹配和补位
- 后台 Settings 的首页 review 选择器只显示 active review

Impact:

- 后台设置首页展示 review 后，前台刷新即可看到最新效果
- 避免选择到未启用 review，造成“配置了但首页不生效”的错觉

Files touched:

- `frontend/lib/api.ts`
- `frontend/app/page.tsx`
- `frontend/app/admin/settings/page.tsx`

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-build-cache go test ./...`
- `cd frontend && npm run build -- --webpack`
- `cd frontend && npm run lint -- 'app/tours/[id]/page.tsx' components/TourRouteTimeline.tsx components/TourContentWithAside.tsx`
- `cd frontend && npm run lint -- app/admin/tours/page.tsx app/admin/settings/page.tsx components/admin/TourAvailabilityEditor.tsx components/admin/AdminNumberInput.tsx`
- `cd frontend && npm run lint -- app/page.tsx app/admin/settings/page.tsx lib/api.ts`

Results:

- backend tests passed
- frontend webpack build passed
- targeted frontend lint passed; remaining warnings are pre-existing `settings` page warnings only

## Current Working Tree Scope

本轮纳入提交的主要文件：

- `Makefile`
- `backend/api/handlers/upload.go`
- `backend/cmd/cleanup_uploads/main.go`
- `backend/internal/model/models.go`
- `backend/internal/service/tour.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/ContentRenderer.tsx`
- `frontend/components/ContentShell.tsx`
- `frontend/components/TourContentWithAside.tsx`
- `frontend/components/TourRouteTimeline.tsx`
- `frontend/components/admin/AdminNumberInput.tsx`
- `frontend/components/admin/Editor.tsx`
- `frontend/components/admin/ImageUpload.tsx`
- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/content.ts`
- `docs/commit-log-2026-04-06-tour-route-editor-upload-cleanup-and-home-review-fixes.md`
- `CHANGELOG.md`

## Recommended Next Step

建议下一轮优先收口两件事：

1. 为 uploads 清理脚本增加“预计释放空间”统计和白名单机制
2. 继续统一后台 `settings` 页遗留的 `<img>` 与未使用变量 warning，降低 lint 噪音

## 2026-04-05

Source: `docs/commit-log-2026-04-05-tour-booking-availability.md`

## This Round Summary

本轮工作围绕 Tours 详情页的 booking 引导与可订日期管理展开，目标是让前台价格区更直接、预订入口更明确，同时让后台可以按日期维护开放状态和已订人数。

主要完成：

- 收口 Tours 详情页底部 CTA，只保留更醒目的文案和 `BOOK NOW` 按钮
- 调整 Tours 详情页价格区展示，去掉旧黑底卡片，改成更突出的纯文本价格布局
- 新增后台可维护的 `Booking Note`，前台作为价格下方提示文本显示
- 为 Tours 增加按日期维护的 availability 数据结构和最大可订人数
- 前台新增 `check availability` 绿色按钮和带动效的日期浮层
- 后台新增 availability 日历编辑器，可逐日开放/关闭并维护已订人数

## Implementation Details

### 1) Tours 详情页 CTA 与价格区重构

更新：

- `frontend/app/tours/[id]/page.tsx`

核心调整：

- 底部 booking 区去掉原先的卡片式视觉，只保留提示文案和 `BOOK NOW`
- 文案与按钮做了放大强化，提升 CTA 识别度
- 标题区价格展示去掉黑色背景，改为纯文本强调价格
- 价格下面支持显示后台维护的 `Booking Note`

### 2) Tours availability 数据结构补齐

更新：

- `backend/internal/model/models.go`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/tour.go`
- `backend/migrations/008_add_tour_booking_tags.sql`

核心调整：

- 新增 `TourAvailabilitySlot` / `TourAvailability` JSON 结构
- `Tour` 模型新增 `max_bookings` 与 `availability`
- 将价格下方提示信息字段定义为 `booking_note`（复用 `booking_tag_2` 列）
- 为 availability 的 JSON 序列化/反序列化补充测试
- `ListLite` 查询补齐 booking / availability 相关字段

### 3) 前台可订日期组件

新增：

- `frontend/components/TourAvailabilityButton.tsx`
- `frontend/lib/tour-availability.ts`

设计要点：

- 价格区下方新增绿色 `check availability` 按钮
- 点击后不是全屏遮罩弹层，而是在按钮附近展开日期浮层
- 浮层使用现有 `scale-in` 动效，交互更柔和
- 开放日期高亮、满员日期置灰、关闭日期维持普通态
- 鼠标移到日期上可直接看到当天已订人数

### 4) 后台 availability 编辑器

新增 / 更新：

- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/app/admin/tours/page.tsx`

核心能力：

- Tours 编辑表单新增 `Booking Note`
- Tours 编辑表单新增 `Max Bookings`
- 后台日历支持点击日期来开放 / 关闭 booking
- 选中开放日期后可直接修改该日期的已订人数
- 保存时会自动将已订人数限制在 `max_bookings` 以内

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-build-cache go test ./...`
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run lint -- 'app/tours/[id]/page.tsx' 'app/admin/tours/page.tsx' 'components/TourAvailabilityButton.tsx' 'components/admin/TourAvailabilityEditor.tsx' 'lib/tour-availability.ts'`

Results:

- backend tests passed
- frontend type check passed
- targeted frontend lint passed with one existing project warning only (`<img>` in admin tours list)

## Current Working Tree Scope

本轮纳入提交：

- `backend/internal/model/models.go`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/tour.go`
- `backend/migrations/008_add_tour_booking_tags.sql`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/TourAvailabilityButton.tsx`
- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/lib/tour-availability.ts`
- `docs/commit-log-2026-04-05-tour-booking-availability.md`
- `CHANGELOG.md`

## Recommended Next Step

建议下一轮优先做两件事中的一个：

1. 把后台已无实际用途的 `Price Tag 1` 一并移除，避免编辑表单里残留无效字段
2. 为 availability 增加“快速复制到下周 / 下个月”的批量日期操作

## 2026-04-03

Source: `docs/commit-log-2026-04-03-ci-cd-tests-and-makefile-restructure.md`

## This Round Summary

本轮工作围绕“测试基线 + CI/CD 第一阶段 + Makefile 场景化重构”展开，目标是先把工程化骨架落地，便于后续分阶段迭代。

主要完成：

- 补齐后端单元测试与基础集成测试
- 新增 GitHub Actions 的 CI、staging CD、production CD 工作流骨架
- 新增 CI/CD 总指南与第一阶段实施文档
- 输出临时迁移策略文档（当前优先 AutoMigrate）
- 将 Makefile 彻底按三类场景重构：本地开发、远程部署、数据库+图片上传/下载

## Implementation Details

### 1) 后端测试基线

新增测试文件：

- `backend/internal/model/string_list_test.go`
- `backend/internal/service/auth_test.go`
- `backend/internal/service/social_helpers_test.go`
- `backend/api/handlers/auth_test.go`
- `backend/api/middleware/auth_test.go`
- `backend/api/routers/router_integration_test.go`（`integration` build tag）

覆盖重点：

- `StringList` 序列化/反序列化
- 登录认证与 JWT 校验逻辑
- 登录限流逻辑
- 中间件鉴权行为
- 路由层登录、鉴权和 CORS 预检链路

### 2) CI/CD 工作流骨架

新增：

- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`

设计要点：

- CI 拆分为 backend unit / backend integration / frontend quality
- staging 作为预发环境部署入口（workflow_run + 手动触发）
- production 采用手动触发，配合 environment 审批

### 3) 文档体系补齐

新增：

- `docs/ci-cd-master-guide.zh-CN.md`
- `docs/ci-cd-test-implementation-plan.zh-CN.md`
- `docs/migration-strategy-temporary.zh-CN.md`

用途：

- 给后续跨会话推进提供统一操作指南
- 记录“为什么这么做、当前做了什么、下一步怎么做”
- 暂存迁移策略，避免当前阶段误用迁移命令

### 4) Makefile 场景化重构

更新：

- `Makefile`

核心重构：

- 本地开发：`dev-* / test-* / quality-* / check-all`
- 远程部署：`remote-deploy-* / install-services / restart-*`
- 数据库+图片：`data-package-local / data-push-server / data-apply-server / data-export-server / data-download-server`

兼容策略：

- 保留旧 target 别名（如 `frontend`、`backend`、`deploy-*`、`deploy-data`）避免历史脚本立即失效

### 5) migration 命令处理

调整：

- 从 `Makefile` 移除 `migrate` / `remote-migrate` 执行入口

原因：

- 当前阶段优先保持部署稳定和无感发布
- 迁移工具体系后续再统一选型落地

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-build-cache go test ./...`
- `cd backend && GOCACHE=/tmp/go-build-cache go test -tags=integration ./...`
- `make help`
- `make -n test-frontend`
- `make -n data-export-server`

Results:

- backend unit tests passed
- backend integration tests passed
- Makefile help output is grouped by scenarios as designed
- critical new targets can be expanded by make dry-run without syntax errors

## Current Working Tree Scope

本轮纳入提交：

- `Makefile`
- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/auth_test.go`
- `backend/internal/service/social_helpers_test.go`
- `backend/api/handlers/auth_test.go`
- `backend/api/middleware/auth_test.go`
- `backend/api/routers/router_integration_test.go`
- `docs/ci-cd-master-guide.zh-CN.md`
- `docs/ci-cd-test-implementation-plan.zh-CN.md`
- `docs/migration-strategy-temporary.zh-CN.md`
- `docs/commit-log-2026-04-03-ci-cd-tests-and-makefile-restructure.md`
- `CHANGELOG.md`

## Recommended Next Step

建议下一轮按“只推进一个阶段”继续：

1. 前端引入 Vitest + Testing Library（先覆盖 `lib` / `hooks`）
2. 后端集成测试接入 MySQL service + migration 演练
3. CI 增加覆盖率阈值门禁

## 2026-04-02

Source: `docs/commit-log-2026-04-02-social-sync-and-admin-dashboard-fixes.md`

## This Round Summary

本轮工作主要聚焦三件事：

- 社媒同步配置增强：后台开放 Instagram / TikTok 同步条数，并确保后端同步逻辑真正使用该值
- 首页社媒轮播体验收口：统一 Instagram / TikTok 轮播速度，整体放慢，避免观感过快
- 后台 Dashboard 快捷入口修复：从 Dashboard 点击创建 Tour / Blog 后弹框可正常关闭，不再反复弹出

此外，本轮一并纳入了 Review 默认激活状态的配置调整。

## Code Changes

### 1. 社媒同步条数开放并打通前后端

Summary:

- 后台 Settings 的 Instagram / TikTok 卡片新增 `Sync Item Count` 输入项
- 输入范围限制为 `1-24`，用户可直接填写每次同步条数
- 后端 Instagram Graph API 同步参数由固定值改为读取 `post_limit`

Impact:

- 运营可按平台动态控制同步数量
- Instagram 与 TikTok 的同步条数配置行为保持一致
- 同步结果更可控，便于平衡内容新鲜度与请求成本

Files touched:

- `frontend/app/admin/settings/page.tsx`
- `backend/internal/service/social.go`

### 2. 首页社媒轮播速度统一并放慢

Summary:

- `SocialShowcase` 增加统一的轮播时长计算函数
- 轮播时长改为按条目数线性计算并设置最小值，避免内容少时滚动过快

Impact:

- Instagram / TikTok 轮播节奏更一致
- 首页社媒区阅读体验更平稳，不再“过快掠过”

Files touched:

- `frontend/components/SocialShowcase.tsx`

### 3. Dashboard 快捷创建弹框可关闭性修复

Summary:

- Tours / Blog 管理页针对 `?action=new` 增加“一次性消费”逻辑
- 首次触发创建弹框后会清理 URL 中的 `action` 参数
- 关闭弹框时也会再次兜底清理该参数

Impact:

- 从 Dashboard 点击 `Publish New Tour` / `Write Blog Post` 后，弹框不再关闭即重开
- 管理端创建流程恢复正常，交互符合预期

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`

### 4. Review 默认状态调整

Summary:

- `Review.IsActive` 的默认值由 `true` 调整为 `false`

Impact:

- 新提交评价默认进入待审核状态
- 降低未审核内容直接展示到前台的风险

Files touched:

- `backend/internal/model/models.go`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build-cache go test ./...`
- `npm run lint -- app/admin/settings/page.tsx`
- `npm run lint -- app/admin/tours/page.tsx app/admin/blog/page.tsx components/SocialShowcase.tsx`

Results:

- backend tests passed
- frontend lint passed with existing `no-img-element` warnings only

## Current Working Tree Scope

本轮计划纳入提交的主要文件：

- `backend/internal/model/models.go`
- `backend/internal/service/social.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/components/SocialShowcase.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/admin/blog/page.tsx`
- `docs/commit-log-2026-04-02-social-sync-and-admin-dashboard-fixes.md`

## Recommended Next Step

如果下一轮继续优化，可按这个顺序推进：

1. 在后台 `Sync Item Count` 旁增加“推荐值”提示（如 8/12/16）
2. 为 Dashboard 快捷创建链路补一个轻量 e2e 用例，防止 query 参数回归
3. 让社媒轮播速度支持后台配置（而非仅代码默认值）

## 2026-04-02

Source: `docs/commit-log-2026-04-02-security-hardening-and-build-fixes.md`

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

## 2026-04-02

Source: `docs/commit-log-2026-04-02-article-detail-layout-and-tour-sidebar.md`

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

## 2026-04-02

Source: `docs/commit-log-2026-04-02-admin-dashboard-footer-and-tour-polish.md`

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

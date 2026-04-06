# Commit Log

Date: 2026-04-06
Branch: `main`

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

# Commit Log

Date: 2026-04-05
Branch: `main`

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

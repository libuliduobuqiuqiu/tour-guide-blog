# Commit Log

Date: 2026-04-26
Branch: `main`

## This Round Summary

本轮集中收口 Tours 的后台运营体验与预约日历逻辑，重点解决三个问题：价格货币符号改为每个 Tour 可独立维护、Tours 显示/隐藏改成列表中的直观眼睛按钮、预约日历去掉人数逻辑后只保留开放日期管理。

主要完成：

- 为 Tours 增加 `currency_symbol` 与 `is_active` 字段，并补齐迁移、后端查询过滤和草稿/发布数据流支持
- 后台 Tours 编辑器新增可留空的 `Currency Symbol` 输入，不再强制回填默认值
- Tours 列表页新增眼睛显隐按钮，支持不进入编辑弹窗直接切换前台显示状态
- Tours 前台列表、首页精选和详情页价格展示改为读取每个 Tour 自身货币符号
- 预约日历移除最大预约数与已预约人数逻辑，前后台统一只维护“日期是否开放”
- 过去日期自动灰显，开放日期显示绿色，并统一增加 `Available` 小字提示

## Code Changes

### 1. Tours 货币符号与显示状态字段补齐

Summary:

- `Tour` / `TourDraftData` 新增 `currency_symbol`、`is_active`
- 新增数据库迁移 `014_add_tour_currency_and_visibility.sql`
- Tours 前台接口只返回 `is_active = true` 的线路，隐藏线路不再出现在列表和详情页
- 后台完整列表继续保留全部线路，便于运营直接管理

Files touched:

- `backend/internal/model/models.go`
- `backend/internal/service/tour.go`
- `backend/internal/model/string_list_test.go`
- `backend/internal/service/tour_test.go`
- `backend/migrations/014_add_tour_currency_and_visibility.sql`

### 2. 后台 Tours 可见性改为列表眼睛按钮

Summary:

- 删除编辑弹窗内的“是否显示 Tour”复选框
- 在 Tours 列表操作区新增 `Eye` / `EyeOff` 按钮
- 新增独立的 Tours visibility PATCH 接口，只更新 `is_active`
- 后台列表继续显示 `Visible` / `Hidden` 状态标签，和眼睛按钮联动

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `backend/api/handlers/tour.go`
- `backend/api/routers/tour.go`
- `backend/api/routers/router.go`
- `backend/internal/service/tour.go`

### 3. Tours 预约日历收口为“开放日期”模式

Summary:

- 后台移除 `Max Bookings` 与按日期 `Booked Guests` 编辑
- 保存 availability 时统一清空 `booked_count`，只保留 `date` + `is_open`
- 前后台日历都改为：开放日期绿色、关闭日期灰色、过去日期自动灰色
- 开放日期下方统一显示 `Available`

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `frontend/components/admin/TourAvailabilityEditor.tsx`
- `frontend/components/TourAvailabilityButton.tsx`
- `frontend/lib/tour-availability.ts`
- `frontend/app/tours/[id]/page.tsx`

### 4. Tours 前台价格展示改为读取每条线路货币符号

Summary:

- Tours 列表页、首页精选、详情页价格前缀改为读取 `currency_symbol`
- 货币符号支持留空，不再自动补 `$`
- 后台 Tours 卡片摘要价格也同步改为读取当前线路货币符号

Files touched:

- `frontend/app/admin/tours/page.tsx`
- `frontend/app/tours/page.tsx`
- `frontend/app/page.tsx`
- `frontend/app/tours/[id]/page.tsx`

## Validation

Checks run:

- `cd backend && GOCACHE=/tmp/go-cache GOTMPDIR=/tmp/go-tmp go test ./...`
- `cd frontend && npm run lint -- app/admin/tours/page.tsx app/tours/page.tsx 'app/tours/[id]/page.tsx' app/page.tsx`
- `cd frontend && npm run lint -- app/admin/tours/page.tsx app/tours/'[id]'/page.tsx components/TourAvailabilityButton.tsx components/admin/TourAvailabilityEditor.tsx lib/tour-availability.ts`
- `cd frontend && npm run lint -- components/TourAvailabilityButton.tsx components/admin/TourAvailabilityEditor.tsx`

Results:

- backend tests passed
- targeted frontend lint checks passed

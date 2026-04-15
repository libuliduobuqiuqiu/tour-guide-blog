# Commit Log

Date: 2026-04-15
Branch: `main`

## This Round Summary

本轮工作围绕 Tours 页面展示文案可配置化、取消政策信息补齐，以及草稿保存链路保护展开，同时顺手调整了首页 Why Choose Me 卡片图标顺序。

主要完成：

- 为 Tours 列表页和详情页新增共享展示配置，支持后台维护价格后缀、最少成团提示和取消政策
- Tours 详情页在 `Places to Visit` 下方新增红色 `Cancellation Policy` 信息卡
- 删除 availability 日期弹层中关于颜色含义的说明文案，保留更精简的提示
- 将共享 Tours 展示配置同步放入 Tours 后台编辑弹窗，便于在编辑线路时直接调整
- 修复 Tours 后台“保存草稿”误把共享站点配置立即发布到前台的问题
- 首页 Why Choose Me 区块按需求调整前两张卡片图标

## Implementation Details

### 1) Tours 共享展示配置

新增 / 更新：

- `frontend/lib/tour-settings.ts`
- `frontend/app/tours/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/admin/settings/page.tsx`
- `backend/internal/seed/seed.go`

核心调整：

- 抽出 `tour_price_suffix`、`tour_minimum_notice`、`tour_cancellation_policy` 三个共享配置及默认值
- Tours 列表页价格后缀改为读取配置，不再写死 `/ person`
- Tours 详情页价格区和最少成团提示改为读取配置
- Settings 后台新增 `Tours Display` 区块，可统一维护这三项文本
- site settings seed 补齐默认 Tours 展示配置，确保新环境可直接使用

### 2) Tours 详情页取消政策与 availability 提示收口

更新：

- `frontend/app/tours/[id]/page.tsx`
- `frontend/components/TourAvailabilityButton.tsx`

核心调整：

- 在详情页侧边信息区新增红色高亮 `Cancellation Policy` 卡片
- 取消政策支持按换行拆成多条展示
- availability 浮层去掉颜色图例与说明区块
- 浮层顶部只保留基础提示和最大人数信息，交互更简洁

### 3) Tours 后台编辑入口与草稿保护

更新：

- `frontend/app/admin/tours/page.tsx`

核心调整：

- Tours 编辑弹窗中新增 `Price Suffix`、`Minimum Guest Notice`、`Cancellation Policy`
- 编辑弹窗打开时会同时读取当前 `site_settings` 中的 Tours 展示配置
- 只有点击 `Publish Tour` 时才会把共享展示配置写回 `site_settings`
- 点击 `Save Draft` 时只保存当前 tour 的草稿数据，避免共享配置提前影响线上前台

### 4) 首页 Why Choose Me 图标调整

更新：

- `frontend/app/page.tsx`

核心调整：

- 第一张卡片图标改为时间图标
- 第二张卡片图标改为金钱相关图标

## Validation

Checks run:

- `cd frontend && npm run lint -- app/admin/tours/page.tsx`
- `cd frontend && npm run lint`

Results:

- targeted frontend lint passed
- project lint passed with pre-existing warnings only (`<img>` usage and existing unused vars outside this change scope)

## Current Working Tree Scope

本轮纳入提交：

- `backend/internal/seed/seed.go`
- `frontend/app/admin/settings/page.tsx`
- `frontend/app/admin/tours/page.tsx`
- `frontend/app/page.tsx`
- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/tours/page.tsx`
- `frontend/components/TourAvailabilityButton.tsx`
- `frontend/lib/tour-settings.ts`
- `docs/commit-log-2026-04-15-tour-display-settings-and-draft-safeguard.md`
- `CHANGELOG.md`

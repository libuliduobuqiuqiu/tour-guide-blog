# Commit Log

Date: 2026-04-17
Branch: `main`

## This Round Summary

本轮继续收口 Tours 的后台编辑体验，重点解决可选文案字段在留空时仍被默认值或占位文案干扰的问题，确保后台留空即可在前台真正隐藏对应信息。

主要完成：

- 去掉 Tours 后台多个可选输入框中的默认占位文案，避免误导为必须填写
- `Price Suffix`、`Minimum Guest Notice`、`Cancellation Policy`、`Booking Note`、`Extra Tag` 允许留空
- Tours 详情页、Tours 列表页、首页精选 Tours 不再对这些字段自动回退默认展示文案
- 后台 `Cancellation Policy` 字段补充更明确的“留空即隐藏”提示

## Code Changes

### 1. Tours 后台可选字段改为真正可留空

Summary:

- 移除 `Extra Tag`、`Booking Note`、`Price Suffix`、`Minimum Guest Notice` 输入框上的示例占位文案
- 移除 `Cancellation Policy` 文本域上的默认占位内容
- 为 `Cancellation Policy` 增加明确提示：留空时前台隐藏

Files touched:

- `frontend/app/admin/tours/page.tsx`

### 2. Tours 前台展示取消默认回退文案

Summary:

- Tours 详情页不再读取旧的全局默认 `tour_price_suffix`、`tour_minimum_notice`、`tour_cancellation_policy`
- 当 Tour 自身的 `price_suffix`、`minimum_notice`、`cancellation_policy` 为空时，前台直接不显示
- Tours 列表页与首页精选卡片的价格后缀也改为仅在当前 Tour 字段非空时显示

Files touched:

- `frontend/app/tours/[id]/page.tsx`
- `frontend/app/tours/page.tsx`
- `frontend/app/page.tsx`

## Validation

Checks run:

- `cd frontend && npm run lint -- app/admin/tours/page.tsx 'app/tours/[id]/page.tsx' app/tours/page.tsx app/page.tsx`

Results:

- targeted frontend lint passed

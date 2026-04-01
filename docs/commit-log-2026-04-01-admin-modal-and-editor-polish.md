# Commit Log

Date: 2026-04-01
Branch: `main`

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

# Commit Log

Date: 2026-04-01
Branch: `main`

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

# Commit Log

Date: 2026-04-17
Branch: `main`

## This Round Summary

本轮主要围绕前台移动端体验收口，重点修复 Tours 详情页信息结构、首页 Hero 在手机上的显示问题，以及 Reviews 详情弹窗在移动端无法滚动和关闭的问题。

主要完成：

- 调整 Tours 详情页标题卡位置，并将原有右侧三张信息卡合并为标题区下方的一体式信息面板
- 修复首页 Hero 在手机上的标题、副标题和 `Explore` 按钮被裁切的问题，同时保留原始图片亮度
- 收紧手机端导航栏排布，尽量保持菜单项单行展示
- 修复 Reviews 详情弹窗在移动端内容过长时只能滚动背景页的问题
- 将 Reviews 提交表单中的 `Country` 从下拉选择改为自由输入框

## Code Changes

### 1. Tours 详情页标题区与信息面板重排

Summary:

- 标题白卡进一步上移，增强与头图的叠压关系
- 将 `Highlights`、`Places to Visit`、`Cancellation Policy` 三个独立卡片合并为一个统一信息框
- 合并框改为桌面端三列、移动端自动换行，并统一正文颜色与更紧凑的行距
- `Highlights` / `Places to Visit` 标题使用蓝色，`Cancellation Policy` 标题使用红色
- 正文区移除旧的右侧浮动侧栏布局，避免信息块与正文分离

Files touched:

- `frontend/app/tours/[id]/page.tsx`

### 2. 首页 Hero 与移动端导航适配

Summary:

- Hero 改为移动端更高的展示比例和最小高度，避免静态图上的文案被挤出可视区域
- 标题、副标题和按钮在移动端改为更稳的靠下排布，确保 `Explore` 按钮可见
- 去掉额外的暗色遮罩，恢复首页图片原始亮度
- 导航栏保留原有 logo 与品牌字号，但收紧菜单项之间的间距
- 移动端菜单改为优先单行横向排列，极窄屏幕下可横向滑动而不换行

Files touched:

- `frontend/components/HeroCarousel.tsx`
- `frontend/components/Navbar.tsx`
- `frontend/app/globals.css`

### 3. Reviews 移动端弹窗与表单体验修复

Summary:

- Reviews 详情弹窗增加最大高度和内部滚动容器，移动端超长内容可在弹窗内完整浏览
- 弹窗打开时锁住页面背景滚动，避免手势落到背后的页面
- 关闭按钮固定在弹窗顶部，长内容情况下仍可直接关闭
- 有图 review 的文字区和图片区在移动端做了间距、尺寸和圆角收紧
- Reviews 提交表单中的 `Country` 改为普通输入框，不再要求用户从固定列表选择

Files touched:

- `frontend/components/ReviewCards.tsx`
- `frontend/components/ReviewSubmissionModal.tsx`

## Validation

Checks run:

- `cd frontend && npm run lint -- 'app/tours/[id]/page.tsx'`
- `cd frontend && npm run lint -- components/ReviewSubmissionModal.tsx`
- `cd frontend && npm run lint -- components/ReviewCards.tsx`
- `cd frontend && npm run lint -- components/HeroCarousel.tsx app/page.tsx`
- `cd frontend && npm run lint -- components/Navbar.tsx`

Results:

- targeted frontend lint passed
- `ReviewCards.tsx` and `ReviewSubmissionModal.tsx` still report existing `<img>` warnings only

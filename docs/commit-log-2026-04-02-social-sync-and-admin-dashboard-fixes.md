# Commit Log

Date: 2026-04-02
Branch: `main`

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

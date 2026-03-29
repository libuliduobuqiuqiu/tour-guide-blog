# Commit Log

Date: 2026-03-30
Branch: `main`

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

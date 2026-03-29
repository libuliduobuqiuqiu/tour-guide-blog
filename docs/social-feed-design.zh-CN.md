# 社交媒体 Feed 设计说明

## 一、背景

首页需要展示 Instagram 和 TikTok 的最新帖子，并以双行轮播的形式呈现。

项目原本已经具备以下基础能力：

- 后端有社交媒体 feed 缓存结构
- 管理后台有社交媒体设置和手动同步接口
- 首页已经可以读取缓存后的社交媒体内容并展示

但原始方案依赖官方授权信息，例如：

- Instagram Business Account ID
- Meta App ID / Secret / Redirect URI / Access Token
- TikTok Open ID / Client Key / Access Token

这套方式配置成本高，而且在当前项目场景下不现实，维护负担也太大。

## 二、问题定义

这次希望实现的效果，接近很多 Shopify 社交媒体 feed 插件的工作方式：

- 填一个社交媒体主页链接
- 同步公开帖子
- 在首页直接展示

核心约束是：

- 无法方便地走 Instagram / TikTok 官方完整授权
- 希望尽量降低后台配置难度
- 又不想重写整套首页展示逻辑

所以真正要解决的问题是：

能不能保留现有“后端缓存 + 前端读取 feed”的架构，只把“同步数据来源”换成公开主页抓取模式？

## 三、可行性评估

### 方案 A：继续走官方 API

优点：

- 结构化返回更稳定
- 合规性更高
- 数据契约更清晰

缺点：

- 需要平台注册应用
- 需要维护 token、回调地址、权限范围
- 某些能力还涉及审核、Advanced Access、App Review
- 对当前这个只是首页展示用的需求来说，配置成本过高

补充说明：

- Instagram Basic Display API 已经不适合作为长期方案
- Instagram oEmbed 虽然还可用，但更适合“嵌入某一条帖子”，而且仍需要 Meta app 和 `oEmbed Read` 权限
- TikTok 官方提供的更多是单条视频 embed/player，不是一个简单的“无授权拉整条账号 feed”的接口

参考资料：

- Meta Instagram oEmbed 文档：<https://developers.facebook.com/docs/instagram-platform/oembed>
- TikTok Embed Player 文档：<https://developers.tiktok.com/doc/embed-player>

结论：

官方 API 方案理论上更规范，但不适合当前项目的现实使用条件。

### 方案 B：公开主页抓取 + 本地缓存

优点：

- 后台配置非常轻
- 只需要填 `Profile URL` 和 `Post Limit`
- 复用现有后端缓存和首页展示结构
- 更接近很多 Shopify feed 插件的实际使用体验

缺点：

- 依赖公开页面结构，平台改版后可能失效
- 可能被限流、拦截或者触发反爬策略
- 稳定性一定弱于官方 API

结论：

这是当前项目里最务实、最能快速落地的方案。

## 四、最终设计选择

最终采用的是一个“混合架构”：

- 保留官方 token 模式，作为后备能力
- 默认走公开主页同步模式
- 同步后统一写入现有 feed 缓存
- 前端继续读取原来的 `/api/social/feed`

这样做的好处是：

- 不需要重写首页数据流
- 不需要推翻现有社交媒体模块
- 可以在最低改动下，把强依赖 OAuth 的模式改成“填链接即可同步”

## 五、已经落地的改动

### 1. 管理后台配置模型

为每个平台新增了两个核心字段：

- `profile_url`
- `post_limit`

这两个字段现在是推荐优先填写的配置项。

相关代码：

- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L21)
- [frontend/lib/social.ts](/data/MyRepo/tour-guide-blog/frontend/lib/social.ts#L17)

### 2. 管理后台 UI

后台设置页面已经调整为“公开主页同步优先”的引导方式。

当前核心输入项是：

- Username
- Profile URL
- Post Limit

旧的 OAuth 字段仍然保留，但只是作为可选备用项，不再是主流程。

相关代码：

- [frontend/app/admin/settings/page.tsx](/data/MyRepo/tour-guide-blog/frontend/app/admin/settings/page.tsx#L386)

### 3. 后端同步逻辑

#### Instagram

当前逻辑：

- 如果同时存在 `access_token` 和 `account_id`，优先走官方 Graph API
- 否则自动降级为公开主页抓取

公开主页抓取流程：

1. 从 `profile_url` 或 `username` 推导用户名
2. 请求 Instagram 的公开 web profile 接口
3. 从返回的 JSON 结构中提取帖子节点
4. 统一转换成内部 `SocialFeedItem`
5. 写入现有缓存

#### TikTok

当前逻辑：

- 默认走公开主页抓取

公开主页抓取流程：

1. 从 `profile_url` 或 `username` 推导用户名
2. 请求 TikTok 公开主页 HTML
3. 从页面中的脚本标签提取内嵌 JSON 数据
4. 遍历数据结构，提取帖子项
5. 统一转换成内部 `SocialFeedItem`
6. 写入现有缓存

相关代码：

- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L156)
- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go#L308)

### 4. 前端展示层

首页社交媒体区块已重做为：

- Instagram 一个完整展示区块
- TikTok 一个完整展示区块
- 每个平台内部都是双行连续轮播
- 视觉上偏向商用社交媒体 feed widget 的 image-first 风格

相关代码：

- [frontend/components/SocialShowcase.tsx](/data/MyRepo/tour-guide-blog/frontend/components/SocialShowcase.tsx)
- [frontend/app/globals.css](/data/MyRepo/tour-guide-blog/frontend/app/globals.css)

## 六、为什么这样设计

这次设计的核心目标，不是做一套“最标准的社交媒体官方接入系统”。

真正的目标是：

- 让首页社交媒体展示尽快可用
- 让后台配置尽可能简单
- 保持现有前后端接口和缓存结构基本不变
- 避免依赖难以获取的官方权限

所以这次方案本质上是一个工程上的务实取舍，而不是理论上最完美的方案。

## 七、已知风险

### 1. 公开抓取天然脆弱

Instagram 和 TikTok 可能随时修改：

- 页面结构
- 脚本数据结构
- 反爬策略
- 访问频率限制

一旦平台改动，当前抓取逻辑就可能失效，需要更新解析器。

### 2. 部署环境可能影响结果

TikTok 和 Instagram 的返回内容可能会受到以下因素影响：

- 服务器地区
- IP 信誉
- 访问频率
- 平台风控策略

也就是说，同样一套代码，在不同服务器环境下可能出现不同结果。

### 3. 合规性和平台政策风险

这个方案是工程上务实可用的折中，不代表它是平台官方推荐的长期集成方式。

如果未来项目对稳定性、可持续性、合规性要求更高，就应该重新评估是否迁回官方或授权数据源方案。

## 八、当前建议的使用方式

建议在后台这样使用：

1. 填入 `Profile URL`
2. 设置 `Post Limit`
3. `Username` 可填可不填
4. 点击 `Sync Instagram`、`Sync TikTok` 或 `Sync All`

## 九、后续建议

### 1. 增加手动兜底 feed

建议后续增加一个“手动备用帖子列表”功能。

这样即使公开抓取临时失效，也能手动填几条帖子链接或图片，保证首页不断内容。

这是最值得优先补的一项可靠性增强。

### 2. 增加同步预览

建议在后台增加一个同步结果预览面板，显示：

- 实际抓取到的帖子数量
- 抓取到的前几条内容
- 当前解析错误信息

这样以后排查问题会方便很多。

### 3. 增加定时同步

## 十、2026-03-30 补充结论

在 2026-03-30 针对 `@tourjanet` 的实际排查中，已经确认：

- TikTok 当前公开用户页首屏只返回账号信息，不再直接返回帖子列表
- `videoCount` 可以拿到，但 `itemList` 为空
- 页面真实会再发起带 `X-Bogus` / `X-Gnarly` 的 `/api/post/item_list/` 请求
- 当前无登录抓取链路会触发滑块验证，接口虽然返回 `200`，但响应体为空

这意味着：

- 纯靠后端 HTTP 请求抓公开主页
- 再配合静态 HTML / JSON 解析

在当前 TikTok 页面模式下，已经不足以稳定完成自动同步。

如果后续必须继续保留 TikTok 自动同步，当前更现实的方向是：

- 使用服务端登录态
- 配合 Playwright 之类的浏览器运行环境
- 从页面真实异步请求中提取视频链接和封面图

详细排查过程见：

- [docs/tiktok-sync-investigation-2026-03-30.zh-CN.md](/data/MyRepo/tour-guide-blog/docs/tiktok-sync-investigation-2026-03-30.zh-CN.md)

如果部署环境支持 cron 或定时任务，建议把手动同步升级成定时自动刷新。

### 4. 增强诊断信息

建议后续记录更详细的同步元数据，例如：

- 当前使用的是 `official` 还是 `public`
- 上游返回的 HTTP 状态
- 解析失败发生在哪个阶段

## 十、这次改动的核心取舍

这次实现本质上是在“低配置成本”和“长期稳定性”之间做取舍。

得到的收益是：

- 配置简单
- 上线快
- 复用现有架构
- 首页效果能立即落地

承担的代价是：

- 后续可能需要维护抓取逻辑
- 平台一改结构就可能失效

对于当前项目阶段，这个取舍是合理的。

## 十一、已完成的验证

本地已经做过如下验证：

- `npm run lint`
- `go test ./...`，使用 `GOCACHE=/tmp/go-build`

结果：

- 前端 lint 通过，只有项目中原本已有的 warning
- 后端编译和测试通过

## 十二、总结

这次社交媒体 feed 的实现，核心不是追求“官方接入最完整”，而是追求“在当前现实约束下最容易落地、最容易维护、最能满足首页展示效果”。

最终采用的方案是：

- 公开主页抓取为主
- 官方 token 方案为辅
- 统一写入现有缓存
- 前端复用同一套 feed 展示接口

这是一个非常明确的工程务实方案：

- 短期更省事
- 中期可能需要适度维护
- 长期如果业务升级，再考虑切回更正式的数据接入方式

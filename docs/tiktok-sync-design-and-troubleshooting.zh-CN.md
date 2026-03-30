# TikTok 同步设计与排障手册

日期：2026-03-30

## 一、目标

当前项目里，TikTok 社交区块需要完成这条链路：

1. 后台输入 TikTok 主页 URL
2. 后端自动获取该主页下的视频帖子
3. 提取每条帖子的跳转链接和封面图地址
4. 下载封面图到本地
5. 写入现有 social feed 缓存
6. 首页继续按现有轮播组件展示

这次实现不追求：

- 下载 TikTok 视频文件
- 获取评论、点赞、作者详情等完整元数据
- 支持任意复杂的 TikTok 页面交互

核心只保留首页真正需要的两类数据：

- 视频链接
- 封面图片

## 二、为什么这次改成 `yt-dlp`

此前项目里的 TikTok 同步主路径，是：

- 请求公开主页 HTML
- 解析页面脚本里的 JSON
- 试图从首屏 payload 里找出帖子列表

这条路的问题已经在前一轮排查中确认：

- TikTok 首屏通常只返回账号信息
- 帖子列表不再稳定地放在 HTML payload 中
- 浏览器异步接口带签名参数和风控校验
- 无登录公开抓取容易返回空结果

因此这次不再把“猜公开页面结构”作为主方案，而是改成：

- 后端同步请求里直接调用 `yt-dlp`
- 让 `yt-dlp` 处理 TikTok 站点提取逻辑
- 本项目只消费 `yt-dlp` 输出的标准 JSON

这样做的直接收益是：

- 代码量显著低于自建浏览器抓取
- 仍然保留“输入 URL 自动同步”的使用方式
- 首页现有轮播接口和图片缓存逻辑可以复用

## 三、当前实现方案

### 1. 总体流程

当前 TikTok 同步顺序如下：

1. 后台点击 `Sync TikTok`
2. Gin 进入现有同步接口
3. `SocialService.syncTikTok()` 优先执行 `syncTikTokYTDLP()`
4. 后端调用 `yt-dlp --no-warnings -J --flat-playlist`
5. 从返回 JSON 中提取：
   - `id`
   - `url`
   - `title`
   - `description`
   - `timestamp`
   - `thumbnails`
6. 组装成项目内的 `SocialFeedItem`
7. 调用现有 `localizeFeedMedia()` 下载封面图到本地
8. 写入现有 social feed 缓存
9. 首页继续读 `/api/social/feed`

### 2. 回退逻辑

如果 `yt-dlp` 不可用或执行失败：

- 后端会自动回退到旧的 `syncTikTokPublic()` 公开页面解析逻辑

这样做的目的不是依赖旧方案，而是：

- 避免因为本机缺少 `yt-dlp` 直接完全失能
- 给排障保留一个兜底路径

### 3. 代码位置

本次核心代码位于：

- [backend/internal/service/social.go](/data/MyRepo/tour-guide-blog/backend/internal/service/social.go)

关键入口：

- `syncTikTok()`
- `syncTikTokYTDLP()`
- `findYTDLPBinary()`
- `buildTikTokFeedItemFromYTDLP()`
- `pickYTDLPThumbnail()`
- `localizeFeedMedia()`

## 四、为什么没有单独拆 worker

这次实现按当前项目诉求，仍保留在现有 Gin 同步请求里执行。

原因是：

- 当前后台已经有手动同步入口
- 用户接受“点一下同步，等待请求完成”的交互方式
- 这次目标是先尽快恢复 TikTok 自动获取能力

这意味着当前实现是：

- 同步请求
- 非异步任务队列
- 非独立 worker

这在项目当前阶段是可接受的，但要明确它的边界：

- 单次同步耗时会比 Instagram 长
- 如果 TikTok 上游慢，请求会等待更久
- 不适合未来扩展成高并发批量抓取

## 五、部署依赖

这次新增的关键运行依赖只有一个：

- `yt-dlp`

推荐安装位置：

- `/usr/local/bin/yt-dlp`

后端查找顺序：

1. 配置项 `social.tiktok.yt_dlp_bin`
2. 环境变量 `SOCIAL_TIKTOK_YT_DLP_BIN`
3. `/tmp/yt-dlp`
4. `PATH` 中的 `yt-dlp`

因此最稳的部署方式是：

- 初始化脚本里直接安装 `yt-dlp`
- 后端通过系统 `PATH` 直接找到它

## 六、数据是怎么映射到首页的

`yt-dlp` 返回的数据不会直接原样暴露给前端。

后端会把它转换成现有统一结构：

- `ID`
  - TikTok 视频 ID
- `Permalink`
  - TikTok 视频页地址
- `Caption`
  - 优先 `description`，否则 `title`
- `MediaURL`
  - 选中的封面图 URL，随后会被替换为本地缓存路径
- `ThumbnailURL`
  - 同上
- `Timestamp`
  - 视频时间戳

这样首页不需要知道 TikTok 是通过公开页面、官方 API 还是 `yt-dlp` 得到的数据。

## 七、图片缓存策略

TikTok 返回的缩略图地址一般带签名和过期时间，不适合长期直接用于首页。

因此当前策略是：

1. 同步时立即下载图片
2. 保存在本地 `uploads/social/tiktok/`
3. 将 feed 中的 `MediaURL` / `ThumbnailURL` 改为本地路径
4. 首页优先展示本地缓存图

这能避免：

- 上游图片地址过期
- 首页访问时再次依赖 TikTok CDN
- 轮播内容突然失效

## 八、常见故障与排查方法

### 1. 报错：`yt-dlp binary not found`

说明：

- 服务器上没有安装 `yt-dlp`
- 或安装了但不在后端可见的路径中

排查：

```bash
which yt-dlp
yt-dlp --version
```

如需手动指定：

```bash
export SOCIAL_TIKTOK_YT_DLP_BIN=/usr/local/bin/yt-dlp
```

### 2. 报错：`yt-dlp execution failed`

说明：

- `yt-dlp` 命令调用失败
- 可能是网络问题、TikTok 风控、上游页面变化，或当前版本 extractor 失效

排查：

先在服务器直接执行：

```bash
yt-dlp --no-warnings -J --flat-playlist --playlist-end 5 https://www.tiktok.com/@yourhandle
```

重点看：

- 是否能返回 JSON
- 是否能返回 `entries`
- `entries` 里是否包含 `url` 和 `thumbnails`

### 3. 报错：`yt-dlp returned no tiktok posts`

说明：

- 命令执行成功了
- 但没有提取出帖子列表

常见原因：

- 账号为空、被限制、页面结构变化
- 该 `yt-dlp` 版本对当前 TikTok 页面不兼容

排查建议：

1. 升级 `yt-dlp`
2. 用浏览器人工打开该主页，确认账号存在且公开
3. 在服务器上直接执行最小验证命令

### 4. 同步成功，但首页没显示新图

说明：

- 抓取可能成功了
- 但图片下载、本地写入、缓存写回，或首页读缓存某一环失败

排查顺序：

1. 后台 `social status` 是否显示 `item_count > 0`
2. `uploads/social/tiktok/` 下是否生成了新文件
3. `/api/social/feed` 返回的 `media_url` 是否为本地路径
4. Nginx 是否正确代理 `/uploads/`

### 5. 同步很慢

这是当前同步请求模型的正常现象之一。

原因：

- 要调用外部站点
- 要解析返回 JSON
- 要下载每条封面图

优化方向：

- 降低 `Post Limit`
- 先只同步最近 6 到 8 条
- 后续如有必要，再引入异步任务机制

## 九、后续维护建议

### 1. 定期升级 `yt-dlp`

这是当前方案最重要的维护动作。

原因：

- TikTok 页面和反爬策略会变化
- `yt-dlp` 会持续修复 extractor

建议：

- 初始化脚本装最新版
- 升级服务器时顺手执行一次更新

### 2. 保留当前公开页解析作为兜底

即使它不是主路径，也建议继续保留。

原因：

- 某些环境下 `yt-dlp` 不可用时，仍有机会拿到少量结果
- 可以帮助排查是“二进制问题”还是“上游页面整体变化”

### 3. 后续可补充日志

如果你后面还想增强排障效率，建议继续补这几类日志：

- 实际调用的 `yt-dlp` 路径
- 命令耗时
- 返回的帖子数量
- 图片下载成功/失败数量

## 十、当前方案的边界

这次方案已经满足当前业务目标：

- 输入 TikTok 主页 URL
- 自动抓帖子
- 自动抓封面
- 自动下载到本地
- 首页继续轮播展示

但它不是“完全没有维护成本”的方案。

它的真实边界是：

- 依赖第三方抓取器 `yt-dlp`
- 依赖 TikTok 页面提取兼容性
- 后续可能需要随着上游变化而升级二进制

在当前项目阶段，这是一个足够务实、投入产出比合适的实现。

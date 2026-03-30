# TikTok 官方授权接入手册

日期：2026-03-30

## 一、适用场景

这份手册用于把当前项目里的 TikTok 同步方案，从“公开主页抓取”升级为“TikTok 官方授权 API”。

适合的前提是：

- 你要展示的是你们自己可登录、可授权的 TikTok 账号
- 你接受先让该 TikTok 账号完成一次授权
- 后端保存 `access_token` / `refresh_token`，之后定时自动刷新

如果你的目标是“后台随便填一个任意第三方 TikTok 主页 URL，就自动抓帖子”，那这份手册不适用。官方 API 不支持对任意未授权账号直接拉视频列表。

## 二、这次接入要拿到哪些数据

按当前项目后台字段，对应关系如下：

- `Profile URL`
  - 例如：`https://www.tiktok.com/@tourjanet`
  - 作用：用于页面展示、兜底识别用户名
- `Username`
  - 例如：`@tourjanet`
  - 作用：生成视频跳转链接时作为补充字段
- `Open ID`
  - TikTok OAuth 返回
  - 填到后台的 `Account ID`
- `Client Key`
  - TikTok Developer Portal 里的应用凭据
  - 填到后台的 `Client ID`
- `Client Secret`
  - TikTok Developer Portal 里的应用凭据
  - 填到后台的 `Client Secret`
- `Redirect URI`
  - TikTok 登录授权完成后的回调地址
  - 填到后台的 `Redirect URI`
- `Access Token`
  - TikTok OAuth 返回
  - 填到后台的 `Access Token`
- `Refresh Token`
  - TikTok OAuth 返回
  - 填到后台的 `Refresh Token`

真正用于首页轮播的数据，则来自 TikTok Display API 的视频接口：

- `id`
- `cover_image_url`
- `share_url`
- `embed_link`
- `title` / `video_description`

其中：

- `cover_image_url` 可用于下载封面图到本地
- `share_url` 可直接作为轮播卡片点击跳转地址
- `id` 可作为本地缓存文件命名和去重主键

## 三、在 TikTok 网站上需要完成的事

你需要在 `https://developers.tiktok.com/` 完成 4 件事：

1. 注册开发者账号
2. 创建应用
3. 给应用添加 `Login Kit` 和 `Display API`
4. 申请并启用 `user.info.basic` 与 `video.list` scope

做完后，才能拿到：

- `Client Key`
- `Client Secret`
- 用户授权得到的 `code`
- 再换取 `open_id`
- 再换取 `access_token`
- 再换取 `refresh_token`

## 四、TikTok Developer Portal 操作步骤

### 1. 注册开发者账号

打开：

- `https://developers.tiktok.com/`

然后：

1. 登录或注册 TikTok Developer 账号
2. 进入 `Manage apps`
3. 如果系统提示先创建组织，就先创建一个组织

建议：

- 使用公司邮箱
- 应用名称写你网站或品牌名称，不要写得过于泛化

## 2. 创建 App

在 `Manage apps` 页面：

1. 点击 `Connect an app`
2. 选择 app owner
3. 选择平台类型
   - 对你这个项目，优先选 `Web`
4. 填写网站地址
5. 保存

创建完成后，在应用的基础信息页面里可以看到：

- `Client key`
- `Client secret`

这两个值分别对应你后台里的：

- `Client ID` = `Client key`
- `Client Secret` = `Client secret`

## 3. 添加产品

进入应用详情页后，点击 `Add products`，至少添加：

- `Login Kit`
- `Display API`

原因：

- `Login Kit` 负责让 TikTok 用户授权
- `Display API` 负责读取该用户自己的公开视频列表

## 4. 配置 Redirect URI

在 `Login Kit` 的产品设置里，配置回调地址 `Redirect URI`。

例如：

- 生产环境：`https://your-domain.com/api/social/tiktok/callback`
- 测试环境：`https://dev.your-domain.com/api/social/tiktok/callback`

注意限制：

- 必须是完整绝对地址
- 必须以 `https` 开头
- 不能带动态 query 参数
- 必须和授权请求里传入的 `redirect_uri` 完全一致

这个值就是你后台里的：

- `Redirect URI`

## 5. 添加 scopes

在应用的 `Scopes` 设置里，申请并启用：

- `user.info.basic`
- `video.list`

用途：

- `user.info.basic` 用来拿用户基础信息
- `video.list` 用来列出该用户公开视频

注意：

- 仅仅在开发者后台里加了 scope，还不够
- 最终仍需要 TikTok 用户在授权页勾选并同意

## 五、如何拿到 Open ID / Access Token / Refresh Token

### 1. 先拼授权链接

用户点击“Connect TikTok”按钮后，应跳转到：

```text
https://www.tiktok.com/v2/auth/authorize/?client_key=YOUR_CLIENT_KEY&response_type=code&scope=user.info.basic,video.list&redirect_uri=YOUR_REDIRECT_URI&state=RANDOM_CSRF_TOKEN
```

参数说明：

- `client_key`
  - 应用的 Client Key
- `response_type`
  - 固定填 `code`
- `scope`
  - 这里至少要带 `user.info.basic,video.list`
- `redirect_uri`
  - 必须和开发者后台登记的一模一样
- `state`
  - 建议服务端生成随机字符串，防 CSRF

### 2. 用户在 TikTok 页面完成授权

完成后，TikTok 会跳回你的 `Redirect URI`，并附带：

- `code`
- `scopes`
- `state`

你真正要用来换 token 的关键字段是：

- `code`

### 3. 用 code 换 token

服务端向 TikTok 发请求：

```bash
curl --location --request POST 'https://open.tiktokapis.com/v2/oauth/token/' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_key=YOUR_CLIENT_KEY' \
  --data-urlencode 'client_secret=YOUR_CLIENT_SECRET' \
  --data-urlencode 'code=AUTH_CODE_FROM_CALLBACK' \
  --data-urlencode 'grant_type=authorization_code' \
  --data-urlencode 'redirect_uri=YOUR_REDIRECT_URI'
```

成功后，响应里会包含：

- `open_id`
- `scope`
- `access_token`
- `expires_in`
- `refresh_token`
- `refresh_expires_in`
- `token_type`

当前项目里应映射为：

- `Account ID` = `open_id`
- `Access Token` = `access_token`
- `Refresh Token` = `refresh_token`

### 4. 刷新 access token

`access_token` 到期后，应通过 `refresh_token` 刷新：

```bash
curl --location --request POST 'https://open.tiktokapis.com/v2/oauth/token/' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_key=YOUR_CLIENT_KEY' \
  --data-urlencode 'client_secret=YOUR_CLIENT_SECRET' \
  --data-urlencode 'grant_type=refresh_token' \
  --data-urlencode 'refresh_token=YOUR_REFRESH_TOKEN'
```

注意：

- TikTok 可能返回新的 `refresh_token`
- 如果返回的新值和旧值不同，必须覆盖保存

## 六、如何拿到视频列表、封面图和跳转链接

当你已经有用户的 `access_token` 后，就可以调用视频列表接口。

### 1. 列出视频

```bash
curl --location --request POST 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,embed_link' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "max_count": 20
  }'
```

你主要关心这些字段：

- `id`
- `cover_image_url`
- `share_url`
- `embed_link`
- `title`
- `video_description`

在当前项目里的使用方式建议是：

- `id`
  - 写入 `SocialFeedItem.ID`
- `share_url`
  - 写入 `SocialFeedItem.Permalink`
- `cover_image_url`
  - 先写入 `MediaURL` / `ThumbnailURL`
  - 再走现有本地下载逻辑缓存到 `/uploads/social/tiktok/`
- `title` 或 `video_description`
  - 写入 `Caption`

### 2. 处理封面图过期

TikTok 官方文档明确说明：

- `cover_image_url` 不是永久地址
- 过一段时间后会失效

因此应该：

1. 一次同步时立刻下载封面到本地
2. 后续再次同步时，用最新接口结果覆盖缓存
3. 如果只想刷新某几条视频封面，可调用 `video/query`

### 3. 查询指定视频元数据

```bash
curl --location --request POST 'https://open.tiktokapis.com/v2/video/query/?fields=id,cover_image_url,share_url,embed_link' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "filters": {
      "video_ids": [
        "1234567890123456789"
      ]
    }
  }'
```

这个接口适合：

- 已有本地缓存
- 只想刷新部分视频封面
- 或只想校验某条视频是否还存在

## 七、回填到当前项目后台时怎么填

如果你保持当前后台表单不变，TikTok 这一栏建议这样填：

- `Username`
  - TikTok 用户名，例如 `@tourjanet`
- `Profile URL`
  - `https://www.tiktok.com/@tourjanet`
- `Post Limit`
  - 你希望首页最多显示几条
- `Open ID`
  - 授权后 token 响应里的 `open_id`
- `Client Key`
  - TikTok app 的 `client_key`
- `Client Secret`
  - TikTok app 的 `client_secret`
- `Redirect URI`
  - Login Kit 配置的回调地址
- `Access Token`
  - OAuth 换回来的 `access_token`
- `Refresh Token`
  - OAuth 换回来的 `refresh_token`

## 八、建议的接入顺序

为了降低改造风险，建议按这个顺序推进：

1. 先保留现有 Instagram 逻辑不动
2. 给 TikTok 增加一条官方 OAuth 授权链路
3. 后端保存 `open_id` / `access_token` / `refresh_token`
4. 新增 TikTok 官方 `video/list` 同步逻辑
5. 继续复用现有本地封面下载逻辑
6. 同步成功后仍输出到现有 `/api/social/feed`

这样前端首页轮播基本不用重写。

## 九、实现层面的注意事项

### 1. 不要再依赖公开主页 HTML

既然已经改成官方方案，就不应该再以公开主页抓取作为主方案。公开页抓取可以保留成兜底，但不应再是核心路径。

### 2. token 必须只保存在服务端

不要把：

- `client_secret`
- `access_token`
- `refresh_token`

暴露到前端浏览器。

### 3. 要做定时刷新

建议后端定时任务：

- 在 `access_token` 快过期前刷新
- 每隔一段时间重新同步视频列表

### 4. 要优先下载封面到本地

因为 `cover_image_url` 会过期，所以首页正式展示应尽量使用本地缓存图，而不是长期直接引用 TikTok CDN 地址。

## 十、你在 TikTok 网站里最终能拿到什么

你真正需要从 TikTok 网站和授权流程拿回来的值，只有这些：

- `Client Key`
- `Client Secret`
- `Redirect URI`
- `open_id`
- `access_token`
- `refresh_token`

拿到这些值后，视频列表、封面图、跳转链接都不再靠页面抓取，而是靠 TikTok 官方 API 返回。

## 参考资料

- TikTok Register Your App
  - <https://developers.tiktok.com/doc/getting-started-create-an-app>
- TikTok Login Kit for Web
  - <https://developers.tiktok.com/doc/login-kit-web>
- TikTok Login Kit Overview
  - <https://developers.tiktok.com/doc/login-kit-overview>
- TikTok Manage User Access Tokens with OAuth v2
  - <https://developers.tiktok.com/doc/oauth-user-access-token-management/>
- TikTok Display API Get Started
  - <https://developers.tiktok.com/doc/display-api-get-started//>
- TikTok Scopes Overview
  - <https://developers.tiktok.com/doc/scopes-overview/>

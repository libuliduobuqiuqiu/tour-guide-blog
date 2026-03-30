# TikTok `yt-dlp` 同步说明

日期：2026-03-30

当前项目的 TikTok 同步已经新增一条基于 `yt-dlp` 的主路径：

- 后台输入 `Profile URL`
- 后端调用 `yt-dlp` 抓取该 TikTok 主页下的视频列表
- 提取视频链接和封面图地址
- 下载封面图到本地 `uploads/social/tiktok/`
- 首页继续通过原来的 `/api/social/feed` 输出轮播数据

## 二进制查找顺序

后端会按下面顺序查找 `yt-dlp`：

1. 配置项 `social.tiktok.yt_dlp_bin`
2. 环境变量 `SOCIAL_TIKTOK_YT_DLP_BIN`
3. 固定路径 `/tmp/yt-dlp`
4. 系统 `PATH` 中的 `yt-dlp`

如果找不到，会在后台同步时报错：

```text
yt-dlp binary not found; set social.tiktok.yt_dlp_bin or SOCIAL_TIKTOK_YT_DLP_BIN
```

## 推荐部署方式

推荐直接安装到固定路径，例如：

```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod +x /usr/local/bin/yt-dlp
yt-dlp --version
```

或者保存在你自己的业务目录里，再通过环境变量指定：

```bash
export SOCIAL_TIKTOK_YT_DLP_BIN=/opt/backend/bin/yt-dlp
```

## 当前行为

- TikTok 同步优先使用 `yt-dlp`
- 如果 `yt-dlp` 同步失败，会回退到原来的公开页面解析逻辑
- 同步成功后仍复用现有本地图片缓存逻辑
- 前端首页和轮播组件不需要改

## 已验证的最小命令

```bash
yt-dlp --no-warnings -J --flat-playlist --playlist-end 5 https://www.tiktok.com/@tourjanet
```

这个命令已经验证可返回：

- 视频 ID
- 视频页面 URL
- 标题 / 描述
- 缩略图数组 `thumbnails`

后端当前会优先从 `cover`、`originCover`、`dynamicCover` 中选封面图。

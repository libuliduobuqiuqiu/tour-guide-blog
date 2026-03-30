# Commit Log

Date: 2026-03-30
Branch: `main`

## This Round Summary

本轮工作聚焦四个方向：

- 用 `yt-dlp` 恢复 TikTok 主页自动同步
- 补齐 TikTok 同步设计、排障和部署文档
- 调整首页社交媒体区块视觉和页面底部过渡
- 精简后台社交媒体配置界面

## Code Changes

### 1. TikTok 同步主路径改为 `yt-dlp`

Summary:

- 新增 `syncTikTokYTDLP()`
- 同步时优先调用 `yt-dlp` 抓取 TikTok 主页视频列表
- 从返回 JSON 中提取视频链接、标题/描述、封面图和时间戳
- 保留原来的公开页面解析作为回退路径

Impact:

- TikTok 同步不再主要依赖公开 HTML payload
- 输入主页 URL 后，能更稳定拿到视频链接和封面图
- 继续复用现有本地图片缓存和首页轮播接口

Files touched:

- `backend/internal/service/social.go`

### 2. 新增 TikTok 同步和部署文档

Summary:

- 新增 TikTok 官方授权接入手册
- 新增 `yt-dlp` 同步说明
- 新增 TikTok 同步设计与排障手册

Impact:

- 后续排查 TikTok 同步失败时有统一文档入口
- 新机器初始化和升级发布时更容易发现依赖要求

Files touched:

- `docs/tiktok-official-api-setup.zh-CN.md`
- `docs/tiktok-ytdlp-sync.zh-CN.md`
- `docs/tiktok-sync-design-and-troubleshooting.zh-CN.md`

### 3. 部署链路加入 `yt-dlp`

Summary:

- 初始化脚本增加 `yt-dlp` 安装
- 后端环境变量示例增加 `SOCIAL_TIKTOK_YT_DLP_BIN`
- 部署文档增加新机器安装和旧机器补装说明

Impact:

- 新服务器初始化后即可满足 TikTok 同步依赖
- 后续迁移、重装、发布时不容易漏掉抓取器安装

Files touched:

- `scripts/init_ubuntu.sh`
- `deploy/systemd/tour-guide-backend.env.example`
- `deploy/DEPLOYMENT.md`

### 4. 首页社交区块和底部过渡优化

Summary:

- Instagram 和 TikTok 轮播左上角增加平台图标和标题
- 调整平台头部样式，让识别更明确但不过度抢戏
- 去掉 footer 顶部多余留白
- 将首页两段偏白背景改为更接近整体蓝色基调的渐变

Impact:

- 社交区块平台识别更直观
- 页脚上方不再出现明显白色断层
- 首页上下过渡更统一

Files touched:

- `frontend/components/SocialShowcase.tsx`
- `frontend/components/Footer.tsx`
- `frontend/app/page.tsx`

### 5. 后台社交媒体设置简化

Summary:

- 社交同步说明文案改为更直接的 URL 配置说明
- 每个平台只保留 `Profile URL` 配置项
- 移除用户名、post limit、OAuth 和 token 等输入项
- 保留并排的同步按钮

Impact:

- 管理界面更简洁
- 更符合当前“只填 URL 即可同步”的使用方式

Files touched:

- `frontend/app/admin/settings/page.tsx`

### 6. 增加基于 commit log 的 changelog 生成脚本

Summary:

- 新增 `scripts/generate_changelog.py`
- 自动扫描 `docs/commit-log-*.md`
- 生成项目根目录 `CHANGELOG.md`
- Makefile 新增 `changelog` 目标

Impact:

- 后续只需维护 commit log 文档
- changelog 可以一键重新生成
- 不依赖外部 changelog 生成器

Files touched:

- `scripts/generate_changelog.py`
- `Makefile`

## Validation

Checks run:

- `GOCACHE=/tmp/go-build-cache go build ./...`
- `npm run lint -- app/admin/settings/page.tsx components/SocialShowcase.tsx components/Footer.tsx app/page.tsx`
- `bash -n scripts/init_ubuntu.sh`
- `/tmp/yt-dlp --no-warnings -J --flat-playlist --playlist-end 5 https://www.tiktok.com/@tourjanet`

Results:

- backend build passed
- frontend lint passed with existing warnings only
- init script syntax check passed
- yt-dlp extractor returned TikTok playlist metadata successfully

## Notes

本轮未纳入提交的工作区改动：

- `frontend/app/contact/page.tsx`

该文件存在现有修改，但不属于本轮任务范围，因此不会一起提交。

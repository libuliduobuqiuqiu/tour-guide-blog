# Tour Guide Blog 部署与持续更新方案

本文档基于当前仓库（`Makefile` + `deploy/systemd` + `deploy/nginx`）整理，覆盖：
- 新服务器初始化
- systemd 托管后端/前端
- 后续增量发布并自动重启
- 本地静态文件 + MySQL 数据打包推送
- Nginx 反向代理前端服务

## 1. 服务器初始化（一次性）

### 1.1 初始化系统依赖

在新服务器执行：

```bash
cd /opt
git clone <你的仓库地址> tour-guide-blog
cd tour-guide-blog
bash scripts/init_ubuntu.sh
```

该脚本会安装并启用：
- `nginx`
- `mysql-server`
- `redis-server`
- `nodejs 20`
- 常用工具：`curl/git/rsync/zip/unzip` 等

### 1.2 创建业务目录

```bash
mkdir -p /opt/backend /opt/frontend
```

### 1.3 准备后端配置

```bash
cp backend/configs/config_temp.yaml backend/configs/config.yaml
```

按实际环境修改 `backend/configs/config.yaml`：
- `server.port` 建议 `8080`
- `database.dsn` 指向线上 MySQL
- `upload.path` 建议保留 `./uploads`（对应 `/opt/backend/uploads`）
- `jwt.secret` 改为强随机值

## 2. Systemd 服务托管

仓库已提供服务模板：
- `deploy/systemd/tour-guide-backend.service`
- `deploy/systemd/tour-guide-frontend.service`

并已优化为：
- 开机自启
- 失败自动拉起（`Restart=always`）
- 启动前配置检查（`ExecStartPre`）
- journald 日志输出

### 2.1 安装服务文件

本地执行（自动复制到远端并启用）：

```bash
make install-services \
  SSH_HOST=<服务器IP> \
  SSH_USER=root \
  SSH_PORT=22
```

默认服务名：
- `tour-guide-backend`
- `tour-guide-frontend`

可通过变量覆盖：
- `BACKEND_SERVICE`
- `FRONTEND_SERVICE`

### 2.2 可选：环境变量文件

可在服务器创建：
- `/etc/default/tour-guide-backend`
- `/etc/default/tour-guide-frontend`

参考模板：
- `deploy/systemd/tour-guide-backend.env.example`
- `deploy/systemd/tour-guide-frontend.env.example`

## 3. Nginx 代理配置

仓库提供：`deploy/nginx/frontend.conf`

核心行为：
- `80` 端口接入
- 反向代理到 `127.0.0.1:3000`（frontend service）
- 透传 `X-Forwarded-*`
- 对 `/_next/static/` 开缓存头

服务器部署：

```bash
cp deploy/nginx/frontend.conf /etc/nginx/conf.d/tour-guide-frontend.conf
nginx -t
systemctl restart nginx
```

## 4. 首次发布（应用代码）

> 当前前端已切换 Next.js `standalone` 打包，可直接由 systemd 运行 `server.js`，无需线上执行 `npm ci`。

### 4.1 发布后端（自动重启）

```bash
make deploy-backend \
  SSH_HOST=<服务器IP> \
  SSH_USER=root \
  REMOTE_DIR=/opt
```

### 4.2 执行远程迁移（建议首次发布后执行）

```bash
make remote-migrate \
  SSH_HOST=<服务器IP> \
  SSH_USER=root \
  REMOTE_DIR=/opt \
  REMOTE_DB_HOST=127.0.0.1 \
  REMOTE_DB_PORT=3306 \
  REMOTE_DB_USER=root \
  REMOTE_DB_PASS=<密码> \
  REMOTE_DB_NAME=tour_guide
```

### 4.3 发布前端（自动重启）

```bash
make deploy-frontend \
  SSH_HOST=<服务器IP> \
  SSH_USER=root \
  REMOTE_DIR=/opt
```

## 5. 持续更新流程（推荐）

### 5.1 仅后端更新

```bash
make deploy-backend SSH_HOST=<服务器IP> SSH_USER=root REMOTE_DIR=/opt
```

### 5.2 仅前端更新

```bash
make deploy-frontend SSH_HOST=<服务器IP> SSH_USER=root REMOTE_DIR=/opt
```

### 5.3 手动重启服务

```bash
make restart-backend SSH_HOST=<服务器IP> SSH_USER=root
make restart-frontend SSH_HOST=<服务器IP> SSH_USER=root
make restart-services SSH_HOST=<服务器IP> SSH_USER=root
```

## 6. 本地静态文件 + MySQL 数据推送

已新增完整链路：`package-data -> upload-data -> remote-import-data -> deploy-data`

### 6.1 一键推送并应用数据

```bash
make deploy-data \
  SSH_HOST=<服务器IP> \
  SSH_USER=root \
  REMOTE_DIR=/opt \
  DB_HOST=127.0.0.1 \
  DB_PORT=3306 \
  DB_USER=root \
  DB_PASS=<本地密码> \
  DB_NAME=tour_guide \
  UPLOADS_DIR=backend/uploads \
  REMOTE_DB_HOST=127.0.0.1 \
  REMOTE_DB_PORT=3306 \
  REMOTE_DB_USER=root \
  REMOTE_DB_PASS=<远端密码> \
  REMOTE_DB_NAME=tour_guide
```

该命令会：
1. 导出本地 MySQL 为 `dist/db_dump.sql`
2. 打包 `db_dump.sql + backend/uploads`
3. 上传并在远端覆盖导入数据库
4. 同步远端 `/opt/backend/uploads`
5. 自动重启后端服务

注意：该流程是“覆盖式更新”，会重建远端同名数据库。

## 7. 线上验证清单

```bash
systemctl status tour-guide-backend --no-pager
systemctl status tour-guide-frontend --no-pager
systemctl status nginx --no-pager
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1
journalctl -u tour-guide-backend -n 100 --no-pager
journalctl -u tour-guide-frontend -n 100 --no-pager
```

## 8. 回滚建议

建议每次发布保留版本包（例如 `backend_时间戳.tar.gz`、`frontend_时间戳.tar.gz`），回滚时：
1. 替换 `/opt/backend` 或 `/opt/frontend` 为历史包内容
2. `systemctl restart tour-guide-backend tour-guide-frontend`
3. 若涉及数据回滚，使用 `mysqldump` 备份文件恢复

## 9. 本次已完成的部署优化

- 前端改为 `standalone` 打包运行（减少线上依赖安装）
- `deploy-backend` / `deploy-frontend` 增加自动重启和状态检查
- 增加 `install-services`、`restart-*` 运维目标
- 增加 `deploy-data` 数据覆盖发布链路
- systemd 模板增加 `EnvironmentFile`、启动前检查、日志与资源限制
- Nginx 配置增加静态资源缓存和代理超时设置

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> Updating apt indexes"
sudo apt-get update -y

echo "==> Installing base tools"
sudo apt-get install -y curl ca-certificates gnupg lsb-release rsync unzip zip git

echo "==> Installing Nginx"
sudo apt-get install -y nginx

echo "==> Installing MySQL and Redis"
sudo apt-get install -y mysql-server redis-server

echo "==> Installing logrotate"
sudo apt-get install -y logrotate

echo "==> Installing Node.js 20.x"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Enabling services"
sudo systemctl enable --now nginx
sudo systemctl enable --now mysql
sudo systemctl enable --now redis-server

echo "==> Creating /data directory"
sudo mkdir -p /data
sudo chown "$USER:$USER" /data

echo "==> Creating application log directory"
sudo mkdir -p /var/log/tour-guide
sudo chmod 755 /var/log/tour-guide

FRONTEND_LOGROTATE_FILE="${REPO_ROOT}/deploy/logrotate/tour-guide-frontend"
if [[ -f "${FRONTEND_LOGROTATE_FILE}" ]]; then
  echo "==> Installing frontend logrotate config"
  sudo cp "${FRONTEND_LOGROTATE_FILE}" /etc/logrotate.d/tour-guide-frontend
  sudo chmod 644 /etc/logrotate.d/tour-guide-frontend
else
  echo "==> Skipping frontend logrotate config (file not found: ${FRONTEND_LOGROTATE_FILE})"
fi

echo "==> Done"

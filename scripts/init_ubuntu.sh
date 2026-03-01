#!/usr/bin/env bash
set -euo pipefail

echo "==> Updating apt indexes"
sudo apt-get update -y

echo "==> Installing base tools"
sudo apt-get install -y curl ca-certificates gnupg lsb-release rsync unzip zip git

echo "==> Installing Nginx"
sudo apt-get install -y nginx

echo "==> Installing MySQL and Redis"
sudo apt-get install -y mysql-server redis-server

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

echo "==> Done"

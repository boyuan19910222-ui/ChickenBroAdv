#!/bin/bash
# ChickenBro 快速更新脚本
# 用于代码更新后的快速部署

set -e

APP_DIR="/opt/chickenbro"

echo "拉取最新代码..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main

echo "安装依赖..."
npm ci --production=false

echo "构建前端..."
npm run build

echo "重启服务..."
pm2 restart chickenbro-server

echo "部署完成！"
pm2 status

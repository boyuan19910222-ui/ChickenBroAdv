#!/bin/bash
# ChickenBro 服务器部署脚本
# 在云服务器上执行此脚本进行初始化部署

set -e

APP_DIR="/opt/chickenbro"
REPO_URL="https://github.com/boyuan19910222-ui/ChickenBroAdv.git"

echo "=========================================="
echo "  ChickenBro 部署脚本"
echo "=========================================="

# 1. 安装系统依赖
echo ""
echo "[1/6] 安装系统依赖..."
dnf update -y
dnf install -y git curl

# 2. 安装 Node.js 20.x (LTS)
echo ""
echo "[2/6] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
fi
node -v
npm -v

# 3. 安装 PM2
echo ""
echo "[3/6] 安装 PM2..."
npm install -g pm2

# 4. 克隆/更新代码
echo ""
echo "[4/6] 部署代码..."
if [ -d "$APP_DIR" ]; then
    echo "更新现有代码..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "首次克隆代码..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 5. 安装依赖并构建
echo ""
echo "[5/6] 安装依赖并构建..."
cd $APP_DIR
npm ci --production=false
npm run build

# 创建日志目录
mkdir -p $APP_DIR/logs

# 6. 启动/重启服务
echo ""
echo "[6/6] 启动服务..."
pm2 delete chickenbro-server 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# 配置防火墙
echo ""
echo "配置防火墙..."
firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=4173/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "  后端 API: http://$(curl -s ifconfig.me):3001"
echo "  前端预览: http://$(curl -s ifconfig.me):4173"
echo ""
echo "  常用命令:"
echo "    pm2 status          - 查看进程状态"
echo "    pm2 logs            - 查看日志"
echo "    pm2 restart all     - 重启所有服务"
echo ""
echo "  启动前端预览:"
echo "    cd $APP_DIR && npm run preview -- --host 0.0.0.0 --port 4173"
echo ""
echo "=========================================="

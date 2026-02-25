#!/bin/bash
# ChickenBro 一键部署脚本
# 适用于腾讯云 OpenCloudOS 服务器

set -e

APP_DIR="/opt/chickenbro"
REPO_URL="https://github.com/boyuan19910222-ui/ChickenBroAdv.git"
NODE_VERSION="v20.18.0"

echo "=========================================="
echo "  ChickenBro 一键部署"
echo "=========================================="

# 1. 系统更新和基础工具
echo ""
echo "[1/7] 安装系统依赖..."
dnf install -y git curl tar xz

# 2. 安装 Node.js (使用官方二进制包)
echo ""
echo "[2/7] 安装 Node.js $NODE_VERSION..."
cd /tmp
curl -fsSL https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.xz -o node.tar.xz
tar -xJf node.tar.xz
rm -rf /usr/local/node
mv node-$NODE_VERSION-linux-x64 /usr/local/node
rm node.tar.xz

# 配置环境变量
cat > /etc/profile.d/nodejs.sh << 'EOF'
export PATH=/usr/local/node/bin:$PATH
EOF
source /etc/profile.d/nodejs.sh
export PATH=/usr/local/node/bin:$PATH

# 创建符号链接
ln -sf /usr/local/node/bin/node /usr/bin/node
ln -sf /usr/local/node/bin/npm /usr/bin/npm
ln -sf /usr/local/node/bin/npx /usr/bin/npx

echo "Node.js 版本: $(node -v)"
echo "NPM 版本: $(npm -v)"

# 3. 安装 PM2
echo ""
echo "[3/7] 安装 PM2..."
npm install -g pm2
ln -sf /usr/local/node/bin/pm2 /usr/bin/pm2

# 4. 克隆代码
echo ""
echo "[4/7] 克隆项目代码..."
rm -rf $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# 5. 安装依赖
echo ""
echo "[5/7] 安装项目依赖..."
npm ci

# 6. 构建前端
echo ""
echo "[6/7] 构建前端..."
npm run build

# 创建日志目录
mkdir -p $APP_DIR/logs

# 7. 启动服务
echo ""
echo "[7/7] 启动服务..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 start "npm run preview -- --host 0.0.0.0 --port 4173" --name chickenbro-frontend
pm2 save

# 设置开机启动
pm2 startup systemd -u root --hp /root
pm2 save

# 配置防火墙
echo ""
echo "配置防火墙..."
systemctl start firewalld 2>/dev/null || true
firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=4173/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "124.223.51.33")

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  🎮 游戏地址: http://$PUBLIC_IP:4173"
echo "  🔌 API 地址: http://$PUBLIC_IP:3001"
echo ""
echo "  📋 常用命令:"
echo "    pm2 status       - 查看进程状态"
echo "    pm2 logs         - 查看日志"
echo "    pm2 restart all  - 重启服务"
echo ""
echo "=========================================="

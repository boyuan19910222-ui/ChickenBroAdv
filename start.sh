#!/bin/bash
# ChickenBro 游戏启动脚本
# 用法: ./start.sh

cd "$(dirname "$0")"

# ── 环境选择 ─────────────────────────────────────────────────
echo ""
echo "请选择启动环境:"
echo "  [1] 开发环境 (development) - 默认"
echo "  [2] 生产环境 (production)"
echo ""
read -r -p "输入选项 (直接回车选 1): " choice

if [ "$choice" = "2" ]; then
    NODE_ENV=production
    echo "已选择: 生产环境"
else
    NODE_ENV=development
    echo "已选择: 开发环境"
fi
export NODE_ENV
echo ""
# ─────────────────────────────────────────────────────────────

echo "正在启动 ChickenBro 服务..."

# 检查并杀死已存在的进程
pkill -f "node server/index.js" 2>/dev/null
pkill -f "vite.*5173" 2>/dev/null
sleep 1

# 启动后端
echo "启动后端服务 (端口 3001)..."
NODE_ENV=$NODE_ENV node server/index.js &
SERVER_PID=$!
echo "后端 PID: $SERVER_PID"

sleep 2

# 启动前端
echo "启动前端服务 (端口 5173)..."
npx vite --port 5173 &
VITE_PID=$!
echo "前端 PID: $VITE_PID"

# 保存 PID
echo "$SERVER_PID" > /tmp/chickenbro_server.pid
echo "$VITE_PID" > /tmp/chickenbro_vite.pid

sleep 3

echo ""
echo "=========================================="
echo "  ChickenBro 已启动！"
echo "=========================================="
echo ""
echo "  前端地址: http://localhost:5173/"
echo "  后端端口: 3001"
echo "  当前环境: $NODE_ENV"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "=========================================="
echo ""

# 等待子进程
trap "kill $SERVER_PID $VITE_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

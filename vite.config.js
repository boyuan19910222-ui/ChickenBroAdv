import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
      proxy:{
          '/socket.io': {
              target: 'ws://127.0.0.1:3001', // 真实 WS 服务地址
              ws: true,                     // 启用 websocket 代理
              changeOrigin: true,           // 修改源头
          },
        '/api': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
        },
          '/api/admin':{
              target: 'http://127.0.0.1:3001',
              changeOrigin: true,
          }
      }
  }
})

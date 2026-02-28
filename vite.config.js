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

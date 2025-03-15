import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        rewrite: (path) => {
          console.log(path)
          return path.replace(/^\/api/, '')
        },
        changeOrigin: true,
        target: "http://localhost:7005/",
      }
    },
    host: "0.0.0.0",
    port: 7006
  },
})

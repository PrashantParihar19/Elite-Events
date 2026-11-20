import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: { overlay: false },
    proxy: {
      '/api': {
        target: 'https://gp7nn2sf-5001.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
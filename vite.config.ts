import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // ← ✅ Tambahkan baris ini
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: false
  }
})

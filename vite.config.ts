import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Ini akan membuat server bisa diakses lewat IP LAN
    port: 5173,         // Ganti jika perlu, default-nya 5173
    open: false         // Tidak otomatis membuka browser saat server jalan
  }
})

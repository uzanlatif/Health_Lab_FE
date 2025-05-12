import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from any device on the local network
    port: 5173, // Ensure it uses the same port
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

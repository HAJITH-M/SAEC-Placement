import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Maps '@' to the 'src' directory
    },
  },
  server: {
    host: '0.0.0.0',  // Ensures the server listens on all network interfaces
    port: 5173,        // Explicitly sets the port
  },
})

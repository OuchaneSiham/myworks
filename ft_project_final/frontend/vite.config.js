// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ✅ Listen on all interfaces
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true  // ✅ For Docker
    },
    hmr: {
      clientPort: 8443,  // ✅ CRITICAL! Tell HMR to use nginx port
      protocol: 'wss'     // ✅ WebSocket Secure (because HTTPS)
    }
  }
})
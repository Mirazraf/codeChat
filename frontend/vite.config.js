import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Read backend port from file
const getBackendPort = () => {
  try {
    const portFile = path.resolve(__dirname, '../.server-port');
    if (fs.existsSync(portFile)) {
      const port = fs.readFileSync(portFile, 'utf-8').trim();
      console.log(`📡 Backend running on port: ${port}`);
      return port;
    }
  } catch (error) {
    console.log('⚠️ Could not read backend port, using default 5000');
  }
  return '5000';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${getBackendPort()}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://localhost:${getBackendPort()}`,
        changeOrigin: true,
        ws: true,
      }
    }
  }
})

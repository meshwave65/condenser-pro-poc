// /home/mesh/condenser-pro-poc/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5176,       // <-- Porta correta para este serviço

hmr: {
      host: 'condenser.meshwave.com.br',
      protocol: 'wss',
    },

    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: [
      'condenser.meshwave.com.br' // Ou qualquer que seja o domínio deste
    ]
  }
})


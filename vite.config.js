// Arquivo: /home/mesh/condenser-pro-poc/vite.config.js
// Versão: 1.1
// Data: 30/09/2025
// Descrição: Adiciona a configuração do servidor para fixar a porta e permitir o acesso via Cloudflare.

import { fileURLToPath, URL } from 'node:url' // Adicionado para compatibilidade de alias
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  // Adicionado para compatibilidade de alias (boa prática)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // --- [SEÇÃO ADICIONADA] ---
  // Configura o servidor de desenvolvimento do Vite.
  server: {
    // 1. Fixa a porta para este serviço, conforme nossa arquitetura.
    port: 5176,
    strictPort: true,

    // 2. Permite que requisições vindas do túnel do Cloudflare acessem este serviço.
    allowedHosts: [
      'condenser.meshwave.com.br',
      'condenser-pro.sofia.meshwave.com.br' // Adicionando também o outro hostname que definimos no config.yml
    ]
  }
})


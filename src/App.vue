<!--
Projeto: Condenser PRO POC
Versão: 1.0
Data: 30/09/2025
Arquivo: /home/mesh/condenser-pro-poc/src/App.vue
-->
<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

// --- [1] APONTA PARA O NOVO SERVIÇO E ENDPOINT ---
const API_BASE_URL = 'http://localhost:8000';
const CONDENSER_ENDPOINT = '/api/v1/condenser/run';

// --- Estado da Interface ---
const originalPrompt = ref('' );
const condensedPrompt = ref('');
const isLoading = ref(false);
const error = ref(null);
// --- [2] NOVO ESTADO PARA O MODO DE CONDENSAÇÃO ---
const condensationMode = ref('summary'); // 'summary' ou 'llm_optimization'

// --- Propriedades Computadas ---
const originalLength = computed(() => originalPrompt.value.length);
const condensedLength = computed(() => condensedPrompt.value.length);
const reductionPercentage = computed(() => {
  if (originalLength.value === 0 || condensedLength.value === 0) return 0;
  return ((1 - (condensedLength.value / originalLength.value)) * 100).toFixed(1);
});
const waterSaved = computed(() => {
    if (reductionPercentage.value > 0) return (562 * (reductionPercentage.value / 100)).toFixed(0);
    return 0;
});

// --- Funções ---
async function handleCondense() {
  if (!originalPrompt.value.trim()) {
    error.value = "Por favor, insira um texto para otimizar.";
    return;
  }
  isLoading.value = true;
  error.value = null;
  condensedPrompt.value = '';

  try {
    // --- [3] ENVIA O MODO SELECIONADO NO CORPO DA REQUISIÇÃO ---
    const requestBody = {
      text: originalPrompt.value,
      mode: condensationMode.value
    };
    const response = await axios.post(`${API_BASE_URL}${CONDENSER_ENDPOINT}`, requestBody);
    condensedPrompt.value = response.data.condensed_text;
  } catch (err) {
    console.error('Falha ao condensar texto:', err);
    if (err.response) {
      error.value = `Erro do servidor: ${err.response.data.detail || err.response.statusText}`;
    } else if (err.request) {
      error.value = "Não foi possível conectar ao servidor. O backend PRO está rodando?";
    } else {
      error.value = "Ocorreu um erro inesperado.";
    }
  } finally {
    isLoading.value = false;
  }
}

async function copyToClipboard() {
  if (!condensedPrompt.value) return;
  try {
    await navigator.clipboard.writeText(condensedPrompt.value);
    alert('Texto condensado copiado para a área de transferência!');
  } catch (err) {
    alert('Não foi possível copiar o texto.');
  }
}
</script>

<template>
  <div class="condenser-container">
    <header class="app-header">
      <img src="/logo_meshwave.svg" alt="MeshWave Logo" class="logo" />
      <!-- [4] TÍTULO ATUALIZADO -->
      <h1>Agente Condensador PRO</h1>
    </header>
    <main>
      <div class="input-section">
        <label for="original-prompt">Insira o texto a ser otimizado:</label>
        <textarea id="original-prompt" v-model="originalPrompt" rows="10" placeholder="Cole aqui o seu prompt, artigo, ou qualquer texto longo..."></textarea>
      </div>

      <!-- [5] NOVA SEÇÃO PARA SELEÇÃO DE MODO -->
      <div class="mode-selector">
        <label>Modo de Condensação:</label>
        <div class="radio-group">
          <input type="radio" id="mode-summary" value="summary" v-model="condensationMode">
          <label for="mode-summary">Resumo para Humanos</label>
          <input type="radio" id="mode-llm" value="llm_optimization" v-model="condensationMode">
          <label for="mode-llm">Otimização para LLM</label>
        </div>
      </div>

      <div class="actions">
        <button @click="handleCondense" :disabled="isLoading" class="condense-btn">
          {{ isLoading ? 'Processando...' : '[ Otimizar Texto ]' }}
        </button>
      </div>

      <div v-if="error" class="feedback error">{{ error }}</div>

      <div v-if="condensedPrompt || isLoading" class="output-section">
        <label for="condensed-prompt">Resultado Otimizado:</label>
        <div class="textarea-wrapper">
            <textarea id="condensed-prompt" :value="isLoading ? 'Aguarde...' : condensedPrompt" rows="8" readonly></textarea>
            <button @click="copyToClipboard" class="copy-btn" title="Copiar">📋</button>
        </div>
      </div>

      <footer v-if="condensedLength > 0" class="metrics">
        <div class="metric-card"><h3>Original</h3><p>{{ originalLength }}</p><span>caracteres</span></div>
        <div class="metric-card"><h3>Condensado</h3><p>{{ condensedLength }}</p><span>caracteres</span></div>
        <div class="metric-card reduction"><h3>Redução</h3><p>{{ reductionPercentage }}%</p><span>de economia</span></div>
        <div class="metric-card water"><h3>"Aquômetro"</h3><p>💧 {{ waterSaved }} ml</p><span>de água</span></div>
      </footer>
    </main>
  </div>
</template>

<style>
/* Estilos Gerais */
body { font-family: 'Segoe UI', sans-serif; background-color: #1e1e1e; color: #e0e0e0; margin: 0; padding: 2rem; }
.condenser-container { max-width: 900px; margin: auto; background-color: #2a2a2a; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow: hidden; }
.app-header { display: flex; align-items: center; padding: 1rem 2rem; background-color: #333; border-bottom: 1px solid #444; }
.logo { height: 40px; margin-right: 1.5rem; }
.app-header h1 { font-size: 1.5rem; margin: 0; font-weight: 300; }
main { padding: 2rem; }
textarea { width: 100%; background-color: #1e1e1e; border: 1px solid #444; border-radius: 6px; color: #e0e0e0; padding: 12px; font-size: 1rem; box-sizing: border-box; resize: vertical; }
textarea:focus { outline: none; border-color: #007acc; }
.input-section > label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #ccc; }
.actions { margin-top: 1rem; }
button { border: none; padding: 10px 18px; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; }
.condense-btn { width: 100%; padding: 15px; font-size: 1.2rem; font-weight: bold; background-color: #007acc; color: white; }
.condense-btn:hover:not(:disabled) { background-color: #005f9e; }
.condense-btn:disabled { background-color: #555; cursor: wait; }
.output-section { margin-top: 2rem; }
.textarea-wrapper { position: relative; }
.copy-btn { position: absolute; top: 10px; right: 10px; background: #444; color: #eee; border: 1px solid #555; }
.copy-btn:hover { background: #555; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-top: 2rem; text-align: center; }
.metric-card { background-color: #333; padding: 1rem; border-radius: 8px; }
.metric-card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #aaa; font-weight: 600; }
.metric-card p { margin: 0; font-size: 2rem; font-weight: bold; }
.metric-card.reduction p { color: #ffc107; }
.metric-card.water p { color: #28a745; }
.metric-card span { font-size: 0.8rem; color: #888; }
.feedback.error { margin-top: 1rem; padding: 1rem; border-radius: 4px; background-color: #682a2a; color: #ffc0c0; text-align: center; }

/* --- [6] ESTILOS PARA O NOVO SELETOR DE MODO --- */
.mode-selector {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #333;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mode-selector > label {
  font-weight: 600;
  color: #ccc;
  margin: 0;
}
.radio-group {
  display: flex;
  gap: 1rem;
}
.radio-group label {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-weight: normal; /* Sobrescreve o negrito do label geral */
  margin: 0; /* Remove margens extras */
}
.radio-group input[type="radio"] {
  display: none;
}
.radio-group input[type="radio"]:checked + label {
  background-color: #007acc;
  color: white;
}
</style>


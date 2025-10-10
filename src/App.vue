<!--
Projeto: Condenser PRO POC
Versão: 2.2
Data: 01/10/2025
Arquivo: /home/mesh/condenser-pro-poc/src/App.vue
-->
<script setup>
// O bloco <script> permanece exatamente o mesmo da versão 2.1
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const CONDENSER_ENDPOINT = '/api/v1/condenser/run';

const originalPrompt = ref('' );
const condensedPrompt = ref('');
const isLoading = ref(false);
const error = ref(null);
const condensationMode = ref('summary');

const WATER_SAVED_AT_100_PERCENT = 652;
const CARBON_SAVED_AT_100_PERCENT = 0.40;

const originalLength = computed(() => originalPrompt.value.length);
const condensedLength = computed(() => condensedPrompt.value.length);

const reductionPercentage = computed(() => {
  if (originalLength.value === 0 || condensedLength.value === 0) return 0;
  return ((1 - (condensedLength.value / originalLength.value)) * 100);
});

const waterSaved = computed(() => {
  if (reductionPercentage.value <= 0) return 0;
  return (WATER_SAVED_AT_100_PERCENT * (reductionPercentage.value / 100)).toFixed(0);
});

const carbonSaved = computed(() => {
  if (reductionPercentage.value <= 0) return 0;
  return (CARBON_SAVED_AT_100_PERCENT * (reductionPercentage.value / 100)).toFixed(2);
});

async function handleCondense() {
  if (!originalPrompt.value.trim()) {
    error.value = "Por favor, insira um texto para otimizar.";
    return;
  }
  isLoading.value = true;
  error.value = null;
  condensedPrompt.value = '';

  try {
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
      error.value = "Não foi possível conectar ao servidor. O backend está rodando?";
    } else {
      error.value = "Ocorreu um erro inesperado.";
    }
  } finally {
    isLoading.value = false;
  }
}

function clearInput() {
  originalPrompt.value = '';
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
      <h1>Agente Condensador PRO</h1>
    </header>
    <main>
      <!-- Seções de input, modo e actions permanecem as mesmas -->
      <div class="input-section">
        <label for="original-prompt">Insira o texto a ser otimizado:</label>
        <div class="textarea-wrapper">
          <textarea id="original-prompt" v-model="originalPrompt" rows="10" placeholder="Cole aqui o seu prompt, artigo, ou qualquer texto longo..."></textarea>
          <button v-if="originalPrompt" @click="clearInput" class="clear-btn" title="Limpar Texto">❌</button>
        </div>
      </div>

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
        <div class="metric-card reduction"><h3>Redução</h3><p>{{ reductionPercentage.toFixed(1) }}%</p><span>de tokens</span></div>
        
        <!-- [MUDANÇA] Card do MIA com texto de "Economia" -->
        <div class="metric-card mia-card">
          <h3>MIA</h3>
          <div class="mia-metrics">
            <div class="mia-metric-item">
              <p class="mia-value">💧 {{ waterSaved }} <span>ml</span></p>
              <span class="mia-sublabel">de água economizados</span>
            </div>
            <div class="mia-metric-item">
              <p class="mia-value">🍃 {{ carbonSaved }} <span>gCO₂eq</span></p>
              <span class="mia-sublabel">de carbono evitados</span>
            </div>
          </div>
          <span class="mia-label">Monitor de Impacto Ambiental</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<style>
/* Estilos anteriores permanecem os mesmos */
body { font-family: 'Segoe UI', sans-serif; background-color: #1e1e1e; color: #e0e0e0; margin: 0; padding: 2rem; }
.condenser-container { max-width: 1000px; margin: auto; background-color: #2a2a2a; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow: hidden; }
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
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 2rem; text-align: center; }
.metric-card { background-color: #333; padding: 1rem; border-radius: 8px; }
.metric-card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #aaa; font-weight: 600; text-transform: uppercase; }
.metric-card p { margin: 0; font-size: 2rem; font-weight: bold; }
.metric-card.reduction p { color: #ffc107; }
.metric-card span { font-size: 0.8rem; color: #888; }
.feedback.error { margin-top: 1rem; padding: 1rem; border-radius: 4px; background-color: #682a2a; color: #ffc0c0; text-align: center; }
.mode-selector { margin: 1.5rem 0; padding: 1rem; background-color: #333; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; }
.mode-selector > label { font-weight: 600; color: #ccc; margin: 0; }
.radio-group { display: flex; gap: 1rem; }
.radio-group label { cursor: pointer; padding: 8px 12px; border-radius: 4px; transition: background-color 0.2s; font-weight: normal; margin: 0; }
.radio-group input[type="radio"] { display: none; }
.radio-group input[type="radio"]:checked + label { background-color: #007acc; color: white; }
.clear-btn { position: absolute; top: 10px; right: 10px; background: #444; color: #eee; border: 1px solid #555; padding: 5px 10px; font-size: 0.9rem; }
.clear-btn:hover { background: #682a2a; color: white; }

/* --- [MUDANÇA] Estilos para o Card do MIA --- */
.mia-card {
  grid-column: span 2;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border: 1px solid #444;
}
.mia-card h3 { color: #00aaff; font-size: 1.1rem; }
.mia-metrics { display: flex; justify-content: space-around; align-items: center; margin: 0.5rem 0; }
.mia-metric-item { display: flex; flex-direction: column; align-items: center; } /* NOVO */
.mia-value { font-size: 1.8rem !important; font-weight: bold; margin-bottom: 0.25rem; } /* NOVO */
.mia-value span { font-size: 1rem !important; font-weight: normal; color: #aaa; margin-left: 0.5rem; }
p.mia-value:first-child { color: #28a745; }
p.mia-value:last-child { color: #8a2be2; }
.mia-sublabel { font-size: 0.8rem; color: #aaa; } /* NOVO */
.mia-label { font-size: 0.8rem; color: #888; text-transform: uppercase; margin-top: 1rem; }
</style>


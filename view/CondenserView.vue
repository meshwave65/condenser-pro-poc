<script setup>
import { ref, computed } from 'vue';
import axios from 'axios'; // Importa o axios

// --- Constantes da API ---
const API_BASE_URL = 'http://localhost:8000'; // URL do seu backend SOFIA
const CONDENSER_ENDPOINT = '/api/v1/condenser/run';

// --- Estado da Interface ---
const originalPrompt = ref('' );
const condensedPrompt = ref('');
const isLoading = ref(false);
const error = ref(null);

// --- Opções (ainda não funcionais, apenas visuais) ---
const enrichContext = ref(false);
const structureContext = ref(false);

// --- Constantes ---
const WATER_SAVED_PER_QUERY_ML = 562;

// --- Propriedades Computadas (Calculadas Automaticamente) ---
const originalLength = computed(() => originalPrompt.value.length);
const condensedLength = computed(() => condensedPrompt.value.length);

const reductionPercentage = computed(() => {
  if (originalLength.value === 0 || condensedLength.value === 0) {
    return 0;
  }
  return ((1 - (condensedLength.value / originalLength.value)) * 100).toFixed(1);
});

const waterSaved = computed(() => {
    if (reductionPercentage.value > 0) {
        return (WATER_SAVED_PER_QUERY_ML * (reductionPercentage.value / 100)).toFixed(0);
    }
    return 0;
});


// --- Funções ---

// [MODIFICADO] Faz a chamada real à API de condensação
async function handleCondense() {
  if (!originalPrompt.value.trim()) {
    error.value = "Por favor, insira um texto para condensar.";
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  condensedPrompt.value = ''; // Limpa o resultado anterior

  try {
    // Corpo da requisição
    const requestBody = {
      text: originalPrompt.value
    };

    // Faz a chamada POST para o backend usando axios
    const response = await axios.post(`${API_BASE_URL}${CONDENSER_ENDPOINT}`, requestBody);

    // Atualiza o estado com a resposta da API
    condensedPrompt.value = response.data.condensed_text;

  } catch (err) {
    // Trata os erros da chamada à API
    console.error('Falha ao condensar texto:', err);
    if (err.response) {
      // O servidor respondeu com um status de erro (4xx, 5xx)
      error.value = `Erro do servidor: ${err.response.data.detail || err.response.statusText}`;
    } else if (err.request) {
      // A requisição foi feita mas não houve resposta (ex: backend offline)
      error.value = "Não foi possível conectar ao servidor. O backend está rodando?";
    } else {
      // Algum outro erro ocorreu
      error.value = "Ocorreu um erro inesperado ao processar sua solicitação.";
    }
  } finally {
    // Garante que o estado de 'loading' seja desativado no final
    isLoading.value = false;
  }
}

// Copia o texto condensado para a área de transferência
async function copyToClipboard() {
  if (!condensedPrompt.value) return;
  try {
    await navigator.clipboard.writeText(condensedPrompt.value);
    alert('Texto condensado copiado para a área de transferência!');
  } catch (err) {
    console.error('Falha ao copiar texto: ', err);
    alert('Não foi possível copiar o texto.');
  }
}
</script>

<template>
  <!-- O TEMPLATE PERMANECE EXATAMENTE O MESMO -->
  <div class="condenser-container">
    <header class="app-header">
      <img src="/logo_meshwave.svg" alt="MeshWave Logo" class="logo" />
      <h1>Agente Condensador SOFIA</h1>
    </header>

    <main>
      <div class="input-section">
        <label for="original-prompt">Insira o texto a ser otimizado:</label>
        <textarea
          id="original-prompt"
          v-model="originalPrompt"
          rows="10"
          placeholder="Cole aqui o seu prompt, artigo, ou qualquer texto longo..."
        ></textarea>
      </div>

      <div class="options-bar">
        <button class="upload-btn" disabled title="Funcionalidade em desenvolvimento">
          <span class="icon">📁</span> Upload de Arquivo
        </button>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="enrichContext" /> Enriquecimento</label>
          <label><input type="checkbox" v-model="structureContext" /> Estruturação</label>
        </div>
      </div>

      <div class="actions">
        <button @click="handleCondense" :disabled="isLoading" class="condense-btn">
          {{ isLoading ? 'Condensando...' : '[ Condensar Prompt ]' }}
        </button>
      </div>

      <div v-if="error" class="feedback error">{{ error }}</div>

      <div v-if="condensedPrompt || isLoading" class="output-section">
        <label for="condensed-prompt">Resultado Otimizado:</label>
        <div class="textarea-wrapper">
            <textarea
              id="condensed-prompt"
              :value="isLoading ? 'Aguarde, o agente está processando...' : condensedPrompt"
              rows="8"
              readonly
            ></textarea>
            <button @click="copyToClipboard" class="copy-btn" title="Copiar Texto">
              <span class="icon">📋</span>
            </button>
        </div>
      </div>

      <footer v-if="condensedLength > 0" class="metrics">
        <div class="metric-card">
          <h3>Original</h3>
          <p>{{ originalLength }}</p>
          <span>caracteres</span>
        </div>
        <div class="metric-card">
          <h3>Condensado</h3>
          <p>{{ condensedLength }}</p>
          <span>caracteres</span>
        </div>
        <div class="metric-card reduction">
          <h3>Redução</h3>
          <p>{{ reductionPercentage }}%</p>
          <span>de economia</span>
        </div>
        <div class="metric-card water">
          <h3>"Aquômetro"</h3>
          <p>💧 {{ waterSaved }} ml</p>
          <span>de água economizados</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<style>
/* OS ESTILOS PERMANECEM EXATAMENTE OS MESMOS */
/* Estilos Gerais */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1e1e1e;
  color: #e0e0e0;
  margin: 0;
  padding: 2rem;
}

.condenser-container {
  max-width: 900px;
  margin: auto;
  background-color: #2a2a2a;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  overflow: hidden;
}

/* Cabeçalho */
.app-header {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  border-bottom: 1px solid #444;
}
.logo {
  height: 40px;
  margin-right: 1.5rem;
}
.app-header h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 300;
}

/* Conteúdo Principal */
main {
  padding: 2rem;
}

textarea {
  width: 100%;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  padding: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  resize: vertical;
}
textarea:focus {
  outline: none;
  border-color: #007acc;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #ccc;
}

/* Barra de Opções */
.options-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #333;
  border-radius: 6px;
}
.upload-btn {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}
.checkbox-group {
  display: flex;
  gap: 1.5rem;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  cursor: pointer;
}

/* Botões */
button {
  border: none;
  padding: 10px 18px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.condense-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #007acc;
  color: white;
}
.condense-btn:hover:not(:disabled) {
  background-color: #005f9e;
}
.condense-btn:disabled {
  background-color: #555;
  cursor: wait;
}

/* Seção de Output */
.output-section { margin-top: 2rem; }
.textarea-wrapper { position: relative; }
.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #444;
  color: #eee;
  border: 1px solid #555;
}
.copy-btn:hover { background: #555; }

/* Métricas */
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  text-align: center;
}
.metric-card {
  background-color: #333;
  padding: 1rem;
  border-radius: 8px;
}
.metric-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}
.metric-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}
.metric-card.reduction p { color: #ffc107; }
.metric-card.water p { color: #28a745; }
.metric-card span { font-size: 0.8rem; color: #888; }

.feedback.error {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #682a2a;
  color: #ffc0c0;
  text-align: center;
}
</style>


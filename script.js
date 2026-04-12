// =================== NAVEGAÇÃO ENTRE PÁGINAS ===================

let currentPage = 'inicio';

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  currentPage = page;
  window.scrollTo(0, 0);
}

// Abre modal de aviso antes de ir para denúncia
function openDenuncia() {
  document.getElementById('modal-aviso').classList.add('active');
}

// Abre denúncia com categoria pré-selecionada
function openDenunciaCategoria(categoria) {
  document.getElementById('modal-aviso').classList.add('active');
  // Guardar categoria para preencher no form
  window._categoriaPreSelecionada = categoria;
}

function closeModal() {
  document.getElementById('modal-aviso').classList.remove('active');
}

function proceedToDenuncia() {
  closeModal();
  showPage('denuncia');
  goToStep(1);

  // Preencher categoria se veio de card
  if (window._categoriaPreSelecionada) {
    const sel = document.getElementById('tipo-incidente');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.includes(window._categoriaPreSelecionada.split(' ')[0])) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
    window._categoriaPreSelecionada = null;
  }
}

// =================== STEPPER ===================

let currentStep = 1;
const totalSteps = 4;

const stepLabels = [
  null,
  'Próxima Etapa (Descrição) →',
  'Próxima Etapa (Arquivos) →',
  'Próxima Etapa (Revisão) →',
  'Enviar Denúncia Final'
];

function goToStep(n) {
  // Ocultar todos os forms
  for (let i = 1; i <= totalSteps; i++) {
    const f = document.getElementById('form-step-' + i);
    const t = document.getElementById('step-tab-' + i);
    if (f) f.classList.remove('active');
    if (t) {
      t.classList.remove('active', 'done');
      if (i < n) t.classList.add('done');
    }
  }

  // Ativar step atual
  const activeForm = document.getElementById('form-step-' + n);
  const activeTab = document.getElementById('step-tab-' + n);
  if (activeForm) activeForm.classList.add('active');
  if (activeTab) activeTab.classList.add('active');

  // Atualizar check icons nas tabs concluídas
  for (let i = 1; i <= totalSteps; i++) {
    const tab = document.getElementById('step-tab-' + i);
    const checkEl = tab ? tab.querySelector('.step-check') : null;
    if (checkEl) {
      if (i < n) {
        checkEl.innerHTML = '✔';
      } else {
        checkEl.innerHTML = i;
      }
    }
  }

  // Botão voltar
  const btnBack = document.getElementById('btn-back');
  if (btnBack) btnBack.style.visibility = n > 1 ? 'visible' : 'hidden';

  // Botão próximo
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.textContent = stepLabels[n];

  // Atualizar resumo na etapa 4
  if (n === 4) updateSummary();

  currentStep = n;
  window.scrollTo(0, 0);
}

function nextStep() {
  if (currentStep < totalSteps) {
    goToStep(currentStep + 1);
  } else {
    // Enviar denúncia
    enviarDenuncia();
  }
}

function prevStep() {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

function updateSummary() {
  const tipo = document.getElementById('tipo-incidente');
  const summaryTipo = document.getElementById('summary-tipo');
  if (tipo && summaryTipo) {
    summaryTipo.textContent = tipo.value || '—';
  }
}

// =================== ENVIAR DENÚNCIA ===================

function enviarDenuncia() {
  const revisao = document.getElementById('revisao-check');
  if (revisao && !revisao.checked) {
    alert('Por favor, confirme que revisou as informações marcando a caixa de verificação.');
    return;
  }
  document.getElementById('modal-sucesso').classList.add('active');
}

function fecharSucesso() {
  document.getElementById('modal-sucesso').classList.remove('active');
  showPage('inicio');
}

function irParaAcompanhar() {
  document.getElementById('modal-sucesso').classList.remove('active');
  showPage('acompanhar');
  // Preencher protocolo automaticamente
  const inp = document.getElementById('acomp-protocolo');
  if (inp) inp.value = '2026-ABC-123';
}

// =================== ACOMPANHAR ===================

function consultarDenuncia() {
  const protocolo = document.getElementById('acomp-protocolo').value.trim();
  const senha = document.getElementById('acomp-senha').value.trim();

  if (!protocolo) {
    alert('Por favor, informe o número do protocolo.');
    return;
  }
  if (!senha) {
    alert('Por favor, informe a senha de acesso.');
    return;
  }

  // Simular consulta — mostrar status
  document.getElementById('status-section').style.display = 'block';
  document.getElementById('status-section').scrollIntoView({ behavior: 'smooth' });
}

function encerrarSessao() {
  document.getElementById('status-section').style.display = 'none';
  document.getElementById('acomp-protocolo').value = '';
  document.getElementById('acomp-senha').value = '';
  window.scrollTo(0, 0);
}

function toggleSenha() {
  const inp = document.getElementById('acomp-senha');
  if (inp) {
    inp.type = inp.type === 'password' ? 'text' : 'password';
  }
}

// Consulta rápida da sidebar na homepage
function consultarSidebar() {
  const protocolo = document.getElementById('sidebar-protocolo').value.trim();
  const senha = document.getElementById('sidebar-senha').value.trim();

  if (!protocolo || !senha) {
    alert('Preencha o número de protocolo e a senha.');
    return;
  }

  // Redirecionar para página de acompanhamento
  showPage('acompanhar');
  document.getElementById('acomp-protocolo').value = protocolo;
  document.getElementById('acomp-senha').value = senha;
  setTimeout(() => consultarDenuncia(), 300);
}

// =================== ARQUIVOS ===================

let filesUploaded = [];

function handleFiles(event) {
  const newFiles = Array.from(event.target.files);
  const available = 10 - filesUploaded.length;
  const toAdd = newFiles.slice(0, available);

  if (newFiles.length > available) {
    alert(`Limite de 10 arquivos. Apenas ${available} arquivo(s) adicionado(s).`);
  }

  filesUploaded = [...filesUploaded, ...toAdd];
  renderFileList();
}

function renderFileList() {
  const tbody = document.getElementById('file-list');
  if (!tbody) return;

  tbody.innerHTML = '';
  filesUploaded.forEach((file, idx) => {
    const ext = file.name.split('.').pop().toUpperCase();
    const size = formatSize(file.size);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>📄 ${ext}</td>
      <td>${file.name}</td>
      <td>${size}</td>
      <td><button class="btn-remove" onclick="removeFile(${idx})">🗑 Remover</button></td>
    `;
    tbody.appendChild(row);
  });
}

function removeFile(idx) {
  filesUploaded.splice(idx, 1);
  renderFileList();
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + 'KB';
  return bytes + 'B';
}

// =================== TEXTAREA CHAR COUNT ===================

function updateCharCount() {
  const ta = document.getElementById('descricao-textarea');
  const counter = document.getElementById('char-count');
  if (ta && counter) {
    const remaining = 2500 - ta.value.length;
    counter.textContent = 'Caracteres restantes: ' + remaining;
    counter.style.color = remaining < 200 ? '#8b1a1a' : '';
  }
}

// =================== PESSOAS ENVOLVIDAS ===================

function adicionarPessoa() {
  const container = document.getElementById('pessoas-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'pessoa-row';
  row.innerHTML = `
    <div class="form-group">
      <input type="text" class="form-input" placeholder="Nome Completo (ou apelido)" />
    </div>
    <div class="form-group" style="max-width:220px">
      <select class="form-select">
        <option>Denunciado</option>
        <option>Vítima</option>
        <option>Outro</option>
      </select>
    </div>
    <button class="btn-remove" onclick="this.parentElement.remove()" style="margin-bottom:2px">🗑</button>
  `;
  container.appendChild(row);
}

// =================== UTILIDADES ===================

function copiarProtocolo() {
  navigator.clipboard.writeText('2026-ABC-123').then(() => {
    alert('Protocolo copiado: 2026-ABC-123');
  }).catch(() => {
    alert('Protocolo: 2026-ABC-123');
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});

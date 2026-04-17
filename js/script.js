// ============================================================
// ESTADO DA SESSÃO
// ============================================================
let sessionData = {
  protocolo: null,
  senhaHash: null,
  formData: {}
};

// Banco de denúncias simuladas para acompanhamento
// Ao enviar uma nova, é registrada aqui
const denunciasDB = {};

// ============================================================
// NAVEGAÇÃO
// ============================================================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  window.scrollTo(0, 0);
}

function openDenuncia() {
  document.getElementById('modal-aviso').classList.add('active');
}

function openDenunciaCategoria(categoria) {
  window._categoriaPreSelecionada = categoria;
  openDenuncia();
}

function proceedToDenuncia() {
  closeModal('modal-aviso');
  showPage('denuncia');
  goToStep(1);
  gerarProtocolo();
  if (window._categoriaPreSelecionada) {
    const sel = document.getElementById('f-tipo');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.startsWith(window._categoriaPreSelecionada.split(' ')[0])) {
          sel.selectedIndex = i; break;
        }
      }
    }
    window._categoriaPreSelecionada = null;
  }
}

// ============================================================
// MODAIS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Fechar modal clicando no overlay
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ============================================================
// FAQ ACCORDION
// ============================================================
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  // Fechar todos
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    el.classList.add('open');
  }
}

// ============================================================
// NOTÍCIAS
// ============================================================
const noticias = [
  {
    titulo: 'Alerta de Segurança — Região Central',
    corpo: `<h3>Alerta de Segurança</h3><p>A Secretaria de Segurança Pública informa que foram identificados focos de atividade criminosa na região central de São Paulo. Moradores e comerciantes devem redobrar a atenção e, em caso de situação de risco, ligar imediatamente para o 190.</p><p>A Polícia Militar reforçou o patrulhamento no perímetro compreendido entre a Avenida Paulista, Praça da República e Largo do Arouche. Denúncias podem ser feitas anonimamente pelo WebDenúncia.</p><p style="font-size:0.75rem; color:var(--light); margin-top:12px">Publicado em: 10/01/2026</p>`
  },
  {
    titulo: 'Nova Funcionalidade: Envio de Áudio',
    corpo: `<h3>Envio de Áudio como Evidência</h3><p>A partir desta atualização, o WebDenúncia aceita arquivos de áudio no formato MP3 como evidência. Esta funcionalidade permite que denunciantes enviem gravações de áudio que possam servir como prova nas investigações.</p><p>O arquivo de áudio pode ter até 100MB e deve ser enviado na Etapa 3 do formulário de denúncia. A privacidade do denunciante continua totalmente garantida.</p><p style="font-size:0.75rem; color:var(--light); margin-top:12px">Publicado em: 05/01/2026</p>`
  },
  {
    titulo: 'Operação Integrada — 12 Prisões',
    corpo: `<h3>Operação Integrada Resulta em 12 Prisões</h3><p>Uma operação conjunta entre a Polícia Civil, Polícia Militar e Ministério Público resultou em 12 prisões neste mês. A ação foi desencadeada a partir de denúncias recebidas pela plataforma WebDenúncia.</p><p>Os presos foram encaminhados para a Delegacia Central, onde foram autuados em flagrante. As investigações continuam em andamento para identificar outros envolvidos.</p><p>Este resultado demonstra a eficácia do sistema de denúncias anônimas no combate ao crime organizado.</p><p style="font-size:0.75rem; color:var(--light); margin-top:12px">Publicado em: 03/01/2026</p>`
  },
  {
    titulo: 'WebDenúncia Atinge 50.000 Denúncias',
    corpo: `<h3>Marco: 50.000 Denúncias Registradas</h3><p>O WebDenúncia atingiu a marca de 50.000 denúncias registradas desde o lançamento da plataforma. Este número demonstra a confiança dos cidadãos paulistas no sistema e a eficácia do anonimato garantido pela plataforma.</p><p>Das denúncias registradas, 72% foram encaminhadas às delegacias competentes e 31% já resultaram em investigações formais. O sistema continua em constante aprimoramento para melhorar a experiência do denunciante.</p><p style="font-size:0.75rem; color:var(--light); margin-top:12px">Publicado em: 01/01/2026</p>`
  }
];

function abrirNoticia(idx) {
  const n = noticias[idx];
  document.getElementById('noticia-titulo').textContent = n.titulo;
  document.getElementById('noticia-corpo').innerHTML = n.corpo;
  openModal('modal-noticia');
}

// ============================================================
// STEPPER — FAZER DENÚNCIA
// ============================================================
let currentStep = 1;
const totalSteps = 4;

const nextLabels = [
  null,
  'Proxima Etapa (Descricao)',
  'Proxima Etapa (Arquivos)',
  'Proxima Etapa (Revisao)',
  'Enviar Denuncia'
];

function goToStep(n) {
  for (let i = 1; i <= totalSteps; i++) {
    const f = document.getElementById('form-step-' + i);
    const t = document.getElementById('step-tab-' + i);
    if (f) f.classList.remove('active');
    if (t) {
      t.classList.remove('active', 'done');
      if (i < n) t.classList.add('done');
    }
  }
  const af = document.getElementById('form-step-' + n);
  const at = document.getElementById('step-tab-' + n);
  if (af) af.classList.add('active');
  if (at) at.classList.add('active');

  // Update check icons
  for (let i = 1; i <= totalSteps; i++) {
    const tab = document.getElementById('step-tab-' + i);
    const chk = tab ? tab.querySelector('.step-check') : null;
    if (chk) chk.innerHTML = i < n ? '&#10003;' : i;
  }

  document.getElementById('btn-back').style.visibility = n > 1 ? 'visible' : 'hidden';
  document.getElementById('btn-next').textContent = nextLabels[n];

  if (n === 4) populateSummary();

  currentStep = n;
  window.scrollTo(0, 0);
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) {
    goToStep(currentStep + 1);
  } else {
    enviarDenuncia();
  }
}

function prevStep() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

// ============================================================
// VALIDAÇÃO POR ETAPA
// ============================================================
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(e => e.classList.remove('error'));
}

function setError(fieldId, errId, msg) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.add('error');
  if (err) err.textContent = msg;
}

function validateStep(step) {
  clearErrors();
  let valid = true;

  if (step === 1) {
    const estado = document.getElementById('f-estado').value;
    const cidade = document.getElementById('f-cidade').value;
    const bairro = document.getElementById('f-bairro').value.trim();
    const logradouro = document.getElementById('f-logradouro').value.trim();

    if (!estado) { setError('f-estado', 'err-estado', 'Selecione o estado.'); valid = false; }
    if (!cidade) { setError('f-cidade', 'err-cidade', 'Selecione a cidade.'); valid = false; }
    if (!bairro) { setError('f-bairro', 'err-bairro', 'Informe o bairro.'); valid = false; }
    if (!logradouro) { setError('f-logradouro', 'err-logradouro', 'Informe o logradouro.'); valid = false; }
  }

  if (step === 2) {
    const tipo = document.getElementById('f-tipo').value;
    const data = document.getElementById('f-data').value;
    const descricao = document.getElementById('f-descricao').value.trim();

    if (!tipo) { setError('f-tipo', 'err-tipo', 'Selecione o tipo de incidente.'); valid = false; }
    if (!data) { setError('f-data', 'err-data', 'Informe a data aproximada do incidente.'); valid = false; }
    if (descricao.length < 30) {
      setError('f-descricao', 'err-descricao', 'Descreva o incidente com pelo menos 30 caracteres.');
      valid = false;
    }
  }

  // Etapa 3 é opcional (arquivos), passa sem validar

  if (step === 4) {
    const revisao = document.getElementById('revisao-check').checked;
    const senha = document.getElementById('f-senha').value;
    const senhaConf = document.getElementById('f-senha-conf').value;

    if (!revisao) {
      document.getElementById('err-revisao').textContent = 'Confirme que revisou as informações.';
      valid = false;
    }
    if (senha.length < 6) {
      setError('f-senha', 'err-senha', 'A senha deve ter pelo menos 6 caracteres.');
      valid = false;
    }
    if (senha !== senhaConf) {
      setError('f-senha-conf', 'err-senha-conf', 'As senhas não conferem.');
      valid = false;
    }
  }

  return valid;
}

// ============================================================
// SUMÁRIO ETAPA 4
// ============================================================
function populateSummary() {
  const cidade = document.getElementById('f-cidade');
  const cidadeText = cidade.options[cidade.selectedIndex] ? cidade.options[cidade.selectedIndex].text : '—';
  const bairro = document.getElementById('f-bairro').value.trim();
  const logradouro = document.getElementById('f-logradouro').value.trim();
  const tipo = document.getElementById('f-tipo').value || '—';
  const data = document.getElementById('f-data').value;
  const desc = document.getElementById('f-descricao').value.trim();

  document.getElementById('sum-local').textContent = `${bairro ? bairro + ', ' : ''}${cidadeText}` || '—';
  document.getElementById('sum-tipo').textContent = tipo;
  document.getElementById('sum-data').textContent = data ? formatDate(data) : '—';
  document.getElementById('sum-desc').textContent = desc.length > 60 ? desc.substring(0, 60) + '...' : (desc || '—');
  document.getElementById('sum-arquivos').textContent = filesUploaded.length > 0 ? filesUploaded.length + ' arquivo(s)' : 'Nenhum';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ============================================================
// PROTOCOLO
// ============================================================
function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const letras = randomLetras(3);
  const nums = Math.floor(100 + Math.random() * 900);
  const proto = `${ano}-${letras}-${nums}`;
  sessionData.protocolo = proto;
  const el = document.getElementById('protocolo-gerado');
  if (el) el.textContent = proto;
  return proto;
}

function randomLetras(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let r = '';
  for (let i = 0; i < n; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function copiarProtocolo() {
  const proto = sessionData.protocolo || document.getElementById('sucesso-protocolo-num')?.textContent;
  if (!proto || proto === '—') return;
  navigator.clipboard.writeText(proto).catch(() => {});
  const btn = event.target.closest('button');
  const orig = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Copiado!'; setTimeout(() => btn.textContent = orig, 1500); }
}

// ============================================================
// SENHA — FORÇA E TOGGLE
// ============================================================
function checkSenha() {
  const val = document.getElementById('f-senha').value;
  const strengthWrap = document.getElementById('senha-strength');
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  if (val.length === 0) { strengthWrap.style.display = 'none'; return; }
  strengthWrap.style.display = 'flex';

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '20%', color: '#c0392b', text: 'Muito fraca' },
    { pct: '40%', color: '#e67e22', text: 'Fraca' },
    { pct: '60%', color: '#f1c40f', text: 'Razoável' },
    { pct: '80%', color: '#27ae60', text: 'Boa' },
    { pct: '100%', color: '#1a7a2e', text: 'Muito boa' },
  ];
  const lv = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width = lv.pct;
  fill.style.background = lv.color;
  label.textContent = lv.text;
  label.style.color = lv.color;
}

function toggleSenhaCriar(fieldId) {
  const inp = document.getElementById(fieldId);
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toggleSenhaAcomp() {
  const inp = document.getElementById('acomp-senha');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ============================================================
// ANONIMATO — TOGGLE CONTATO
// ============================================================
function toggleContato() {
  const radios = document.querySelectorAll('input[name="anonimato"]');
  let val = 'total';
  radios.forEach(r => { if (r.checked) val = r.value; });
  document.getElementById('contato-fields').style.display = val === 'contato' ? 'block' : 'none';
}

// ============================================================
// ENVIAR DENÚNCIA
// ============================================================
function enviarDenuncia() {
  if (!validateStep(4)) return;

  const proto = sessionData.protocolo;
  const senha = document.getElementById('f-senha').value;
  const senhaHash = simpleHash(senha);

  // Salvar no DB simulado
  const cidade = document.getElementById('f-cidade');
  const cidadeText = cidade.options[cidade.selectedIndex] ? cidade.options[cidade.selectedIndex].text : '';
  const bairro = document.getElementById('f-bairro').value.trim();
  const tipo = document.getElementById('f-tipo').value;
  const data = document.getElementById('f-data').value;
  const descricao = document.getElementById('f-descricao').value.trim();

  denunciasDB[proto] = {
    senhaHash,
    cidade: cidadeText,
    bairro,
    tipo,
    data,
    descricao,
    arquivos: filesUploaded.length
  };

  sessionData.senhaHash = senhaHash;

  // Mostrar modal sucesso
  document.getElementById('sucesso-protocolo-num').textContent = proto;
  openModal('modal-sucesso');
}

function fecharSucesso() {
  closeModal('modal-sucesso');
  showPage('inicio');
  resetForm();
}

function irParaAcompanhar() {
  closeModal('modal-sucesso');
  showPage('acompanhar');
  const inp = document.getElementById('acomp-protocolo');
  if (inp) inp.value = sessionData.protocolo;
}

function resetForm() {
  currentStep = 1;
  filesUploaded = [];
  sessionData.protocolo = null;
  sessionData.senhaHash = null;
}

// ============================================================
// ACOMPANHAR — CONSULTA
// ============================================================
function consultarDenuncia() {
  const proto = document.getElementById('acomp-protocolo').value.trim().toUpperCase();
  const senha = document.getElementById('acomp-senha').value;
  let valid = true;

  document.getElementById('err-acomp-protocolo').textContent = '';
  document.getElementById('err-acomp-senha').textContent = '';
  document.getElementById('acomp-erro-geral').style.display = 'none';

  if (!proto) {
    document.getElementById('err-acomp-protocolo').textContent = 'Informe o número do protocolo.';
    document.getElementById('acomp-protocolo').classList.add('error');
    valid = false;
  }
  if (!senha) {
    document.getElementById('err-acomp-senha').textContent = 'Informe a senha.';
    document.getElementById('acomp-senha').classList.add('error');
    valid = false;
  }
  if (!valid) return;

  // Verificar no DB
  const denuncia = denunciasDB[proto];
  if (!denuncia) {
    mostrarErroGeral('Protocolo não encontrado. Verifique o número e tente novamente.');
    return;
  }
  if (simpleHash(senha) !== denuncia.senhaHash) {
    mostrarErroGeral('Senha incorreta. Verifique e tente novamente.');
    document.getElementById('acomp-senha').classList.add('error');
    return;
  }

  // Sucesso — mostrar status
  document.getElementById('acomp-protocolo').classList.remove('error');
  document.getElementById('acomp-senha').classList.remove('error');

  document.getElementById('status-protocol-info').textContent =
    `Protocolo: ${proto} | Registrada em: ${new Date().toLocaleDateString('pt-BR')} | Senha: ••••••`;

  document.getElementById('status-detalhes').innerHTML =
    `<strong>Categoria:</strong> ${denuncia.tipo || '—'}<br>
     <strong>Local:</strong> ${denuncia.bairro ? denuncia.bairro + ', ' : ''}${denuncia.cidade || '—'}<br>
     <strong>Data do incidente:</strong> ${denuncia.data ? formatDate(denuncia.data) : '—'}<br>
     <strong>Resumo:</strong> ${denuncia.descricao ? denuncia.descricao.substring(0, 80) + '...' : '—'}<br>
     <strong>Arquivos:</strong> ${denuncia.arquivos} arquivo(s)`;

  document.getElementById('status-section').style.display = 'block';
  document.getElementById('status-section').scrollIntoView({ behavior: 'smooth' });
}

function mostrarErroGeral(msg) {
  const el = document.getElementById('acomp-erro-geral');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = 'var(--danger)';
  el.style.fontSize = '0.82rem';
  el.style.fontWeight = '600';
}

function encerrarSessao() {
  document.getElementById('status-section').style.display = 'none';
  document.getElementById('acomp-protocolo').value = '';
  document.getElementById('acomp-senha').value = '';
  document.getElementById('acomp-erro-geral').style.display = 'none';
  window.scrollTo(0, 0);
}

function enviarComplemento() {
  const text = document.getElementById('complemento-text').value.trim();
  const ok = document.getElementById('complemento-ok');
  if (!text) {
    ok.textContent = 'Escreva o complemento antes de enviar.';
    ok.style.color = 'var(--danger)';
    ok.style.display = 'block';
    return;
  }
  document.getElementById('complemento-text').value = '';
  ok.textContent = 'Complemento enviado com sucesso.';
  ok.style.color = 'var(--success)';
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; }, 3000);
}

// ============================================================
// CONSULTAR DA SIDEBAR (Homepage)
// ============================================================
function consultarSidebar() {
  const proto = document.getElementById('sidebar-protocolo').value.trim();
  const senha = document.getElementById('sidebar-senha').value;
  const err = document.getElementById('sidebar-erro');
  err.style.display = 'none';

  if (!proto || !senha) {
    err.textContent = 'Preencha o protocolo e a senha.';
    err.style.display = 'block';
    return;
  }

  // Preencher campos da página de acompanhamento e navegar
  showPage('acompanhar');
  document.getElementById('acomp-protocolo').value = proto;
  document.getElementById('acomp-senha').value = senha;
  setTimeout(() => consultarDenuncia(), 100);
}

// ============================================================
// CIDADES (Etapa 1)
// ============================================================
const cidadesPorEstado = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'São Bernardo do Campo', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá', 'São José dos Campos'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Campos dos Goytacazes', 'Petrópolis'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
};

function popularCidades() {
  const estado = document.getElementById('f-estado').value;
  const select = document.getElementById('f-cidade');
  select.innerHTML = '<option value="">Selecione a cidade</option>';
  if (cidadesPorEstado[estado]) {
    cidadesPorEstado[estado].forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  }
}

// ============================================================
// ARQUIVOS (Etapa 3)
// ============================================================
let filesUploaded = [];

function handleFiles(event) {
  addFiles(Array.from(event.target.files));
}

function addFiles(newFiles) {
  const available = 10 - filesUploaded.length;
  if (available <= 0) { alert('Limite de 10 arquivos atingido.'); return; }
  const toAdd = newFiles.slice(0, available);
  if (newFiles.length > available) alert(`Apenas ${available} arquivo(s) adicionado(s). Limite de 10 arquivos.`);
  // Validar tamanho (100MB)
  toAdd.forEach(f => {
    if (f.size > 100 * 1024 * 1024) {
      alert(`"${f.name}" excede 100MB e não foi adicionado.`);
    } else {
      filesUploaded.push(f);
    }
  });
  renderFileList();
}

function renderFileList() {
  const tbody = document.getElementById('file-list');
  const wrap = document.getElementById('file-table-wrap');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (filesUploaded.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  filesUploaded.forEach((file, idx) => {
    const ext = file.name.split('.').pop().toUpperCase();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ext}</td>
      <td>${file.name}</td>
      <td>${formatSize(file.size)}</td>
      <td><button class="btn-remove" onclick="removeFile(${idx})">Remover</button></td>
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

// Drag and drop
function dragOver(event) {
  event.preventDefault();
  document.getElementById('upload-area').classList.add('drag-over');
}
function dragLeave(event) {
  document.getElementById('upload-area').classList.remove('drag-over');
}
function dropFiles(event) {
  event.preventDefault();
  document.getElementById('upload-area').classList.remove('drag-over');
  addFiles(Array.from(event.dataTransfer.files));
}

function handleFilesAcomp(event) {
  const files = Array.from(event.target.files);
  const div = document.getElementById('acomp-file-list');
  div.innerHTML = files.map(f => `<div style="padding:4px 0; border-bottom:1px solid var(--border)">${f.name} — ${formatSize(f.size)}</div>`).join('');
}

// ============================================================
// CHAR COUNT
// ============================================================
function updateCharCount() {
  const ta = document.getElementById('f-descricao');
  const counter = document.getElementById('char-count');
  if (!ta || !counter) return;
  const rem = 2500 - ta.value.length;
  counter.textContent = 'Caracteres restantes: ' + rem;
  counter.classList.toggle('warn', rem < 200);
}

// ============================================================
// PESSOAS ENVOLVIDAS
// ============================================================
function adicionarPessoa() {
  const container = document.getElementById('pessoas-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'pessoa-row';
  row.innerHTML = `
    <div class="form-group"><input type="text" class="form-input" placeholder="Nome completo ou apelido" /></div>
    <div class="form-group" style="max-width:200px">
      <select class="form-select">
        <option value="">Papel</option>
        <option>Denunciado</option>
        <option>Vítima</option>
        <option>Testemunha</option>
        <option>Outro</option>
      </select>
    </div>
    <button class="btn-remove" onclick="this.parentElement.remove()" style="margin-bottom:2px; padding:6px 10px">Remover</button>
  `;
  container.appendChild(row);
}

// ============================================================
// HASH SIMPLES (para simulação de senha)
// ============================================================
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Definir data máxima como hoje
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('f-data');
  if (dateField) dateField.max = today;

  goToStep(1);
});

// ============================================================
// MOBILE NAV DRAWER
// ============================================================
function toggleDrawer() {
  const drawer = document.getElementById('nav-drawer');
  drawer.classList.toggle('open');
}

function closeDrawer() {
  document.getElementById('nav-drawer').classList.remove('open');
}

// Close drawer when clicking outside
document.addEventListener('click', function(e) {
  const drawer = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('nav-hamburger');
  if (drawer && hamburger && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
    drawer.classList.remove('open');
  }
});

// Sync drawer active state with nav-links
const _origShowPage = showPage;
// Patch showPage to also update drawer links
(function() {
  const original = window.showPage;
  window.showPage = function(page) {
    original(page);
    document.querySelectorAll('.nav-drawer a').forEach(a => a.classList.remove('active'));
    const drawerLink = document.getElementById('drawer-' + page);
    if (drawerLink) drawerLink.classList.add('active');
    closeDrawer();
  };
})();

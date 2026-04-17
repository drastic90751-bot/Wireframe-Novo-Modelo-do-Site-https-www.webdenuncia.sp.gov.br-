// ============================================================
// ESTADO
// ============================================================
let sessionData = { protocolo: null, senhaHash: null };
const denunciasDB = {};
let fontLevel = 0; // -1, 0, 1, 2

// ============================================================
// ACESSIBILIDADE
// ============================================================
function adjustFont(delta) {
  fontLevel = delta;
  const scales = { '-1': 0.88, 0: 1, 1: 1.12, 2: 1.24 };
  document.documentElement.style.setProperty('--font-scale', scales[fontLevel] || 1);
  showToast('Tamanho da fonte ajustado.', 'success');
}

function toggleContrast() {
  document.body.classList.toggle('hc');
  const btn = document.getElementById('btn-hc');
  const active = document.body.classList.contains('hc');
  btn.classList.toggle('active', active);
  showToast(active ? 'Alto contraste ativado.' : 'Alto contraste desativado.', 'success');
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => a.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');

  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  const drawerEl = document.getElementById('drawer-' + page);
  if (drawerEl) drawerEl.classList.add('active');

  closeMenu();
  window.scrollTo(0, 0);
}

// Mobile menu
function toggleMenu() {
  const btn = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');
  const open = drawer.classList.toggle('open');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
}

function closeMenu() {
  document.getElementById('nav-hamburger').classList.remove('open');
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('nav-hamburger').setAttribute('aria-expanded', 'false');
}

// ============================================================
// MODAIS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
  // Trap focus
  const modal = document.getElementById(id);
  const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// ============================================================
// FAQ
// ============================================================
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) { answer.classList.add('open'); el.classList.add('open'); }
}

// ============================================================
// NOTÍCIAS
// ============================================================
const noticias = [
  {
    titulo: 'Alerta de Segurança — Região Central',
    corpo: `<h3>Alerta de Segurança</h3><p>A Secretaria de Segurança Pública identificou focos de atividade criminosa na região central de São Paulo. Moradores e comerciantes devem redobrar a atenção e, em caso de risco, ligar imediatamente para o 190.</p><p>A Polícia Militar reforçou o patrulhamento no perímetro compreendido entre a Avenida Paulista, Praça da República e Largo do Arouche. Denúncias podem ser feitas anonimamente pelo WebDenúncia.</p><p style="color:var(--light); font-size:0.68rem; margin-top:14px; font-family:var(--font-mono)">Publicado em: 10/01/2026</p>`
  },
  {
    titulo: 'Nova Funcionalidade: Envio de Áudio',
    corpo: `<h3>Envio de Áudio como Evidência</h3><p>A partir desta atualização, o WebDenúncia aceita arquivos MP3 como evidência. Esta funcionalidade permite o envio de gravações de áudio que podem servir como prova nas investigações.</p><p>O arquivo de áudio pode ter até 100MB e deve ser enviado na Etapa 3 do formulário. A privacidade do denunciante continua totalmente garantida.</p><p style="color:var(--light); font-size:0.68rem; margin-top:14px; font-family:var(--font-mono)">Publicado em: 05/01/2026</p>`
  },
  {
    titulo: 'Operação Integrada — 12 Prisões',
    corpo: `<h3>Operação Integrada Resulta em 12 Prisões</h3><p>Operação conjunta entre Polícia Civil, Polícia Militar e Ministério Público resultou em 12 prisões neste mês. A ação foi desencadeada a partir de denúncias recebidas pelo WebDenúncia.</p><p>Os presos foram autuados em flagrante. As investigações continuam em andamento para identificar outros envolvidos. Este resultado demonstra a eficácia do sistema de denúncias anônimas.</p><p style="color:var(--light); font-size:0.68rem; margin-top:14px; font-family:var(--font-mono)">Publicado em: 03/01/2026</p>`
  },
  {
    titulo: 'WebDenúncia Atinge 50.000 Denúncias',
    corpo: `<h3>Marco: 50.000 Denúncias Registradas</h3><p>O WebDenúncia atingiu 50.000 denúncias registradas desde o lançamento. Este número demonstra a confiança dos cidadãos paulistas no sistema e a eficácia do anonimato garantido pela plataforma.</p><p>Das denúncias registradas, 72% foram encaminhadas às delegacias e 31% resultaram em investigações formais. O sistema continua em aprimoramento.</p><p style="color:var(--light); font-size:0.68rem; margin-top:14px; font-family:var(--font-mono)">Publicado em: 01/01/2026</p>`
  }
];

function abrirNoticia(idx) {
  const n = noticias[idx];
  document.getElementById('noticia-titulo').textContent = n.titulo;
  document.getElementById('noticia-corpo').innerHTML = n.corpo;
  openModal('modal-noticia');
}

// ============================================================
// STEPPER
// ============================================================
let currentStep = 1;
const totalSteps = 4;
const stepPcts = [25, 50, 75, 100];
const nextLabels = [null, 'Proxima Etapa (Descricao)', 'Proxima Etapa (Arquivos)', 'Proxima Etapa (Revisao)', 'Enviar Denuncia'];

function goToStep(n) {
  for (let i = 1; i <= totalSteps; i++) {
    const f = document.getElementById('form-step-' + i);
    const t = document.getElementById('step-tab-' + i);
    if (f) f.classList.remove('active');
    if (t) {
      t.classList.remove('active', 'done');
      t.setAttribute('aria-selected', 'false');
      if (i < n) t.classList.add('done');
    }
  }

  const af = document.getElementById('form-step-' + n);
  const at = document.getElementById('step-tab-' + n);
  if (af) af.classList.add('active');
  if (at) { at.classList.add('active'); at.setAttribute('aria-selected', 'true'); }

  for (let i = 1; i <= totalSteps; i++) {
    const tab = document.getElementById('step-tab-' + i);
    const chk = tab ? tab.querySelector('.step-check') : null;
    if (chk) chk.textContent = i < n ? '✓' : i;
  }

  const pct = stepPcts[n - 1];
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-label').textContent = `Etapa ${n} de ${totalSteps}`;
  document.getElementById('progress-header').setAttribute('aria-valuenow', pct);

  document.getElementById('btn-back').style.visibility = n > 1 ? 'visible' : 'hidden';
  document.getElementById('btn-next').textContent = nextLabels[n];

  if (n === 4) populateSummary();

  currentStep = n;
  window.scrollTo(0, 0);
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) goToStep(currentStep + 1);
  else enviarDenuncia();
}

function prevStep() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

// ============================================================
// VALIDAÇÃO
// ============================================================
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-input.err, .form-select.err, .form-textarea.err').forEach(e => e.classList.remove('err'));
}

function setErr(fId, eId, msg) {
  const f = document.getElementById(fId);
  const e = document.getElementById(eId);
  if (f) f.classList.add('err');
  if (e) e.textContent = msg;
}

function validateStep(step) {
  clearErrors();
  let valid = true;

  if (step === 1) {
    if (!document.getElementById('f-estado').value) { setErr('f-estado', 'err-estado', 'Selecione o estado.'); valid = false; }
    if (!document.getElementById('f-cidade').value) { setErr('f-cidade', 'err-cidade', 'Selecione a cidade.'); valid = false; }
    if (!document.getElementById('f-bairro').value.trim()) { setErr('f-bairro', 'err-bairro', 'Informe o bairro.'); valid = false; }
    if (!document.getElementById('f-logradouro').value.trim()) { setErr('f-logradouro', 'err-logradouro', 'Informe o logradouro.'); valid = false; }
  }

  if (step === 2) {
    if (!document.getElementById('f-tipo').value) { setErr('f-tipo', 'err-tipo', 'Selecione o tipo de incidente.'); valid = false; }
    if (!document.getElementById('f-data').value) { setErr('f-data', 'err-data', 'Informe a data do incidente.'); valid = false; }
    if (document.getElementById('f-descricao').value.trim().length < 30) {
      setErr('f-descricao', 'err-descricao', 'Descreva com pelo menos 30 caracteres.');
      valid = false;
    }
  }

  // Etapa 3 é opcional

  if (step === 4) {
    if (!document.getElementById('revisao-check').checked) {
      document.getElementById('err-revisao').textContent = 'Confirme que revisou as informações.';
      valid = false;
    }
    const senha = document.getElementById('f-senha').value;
    const conf = document.getElementById('f-senha-conf').value;
    if (senha.length < 6) { setErr('f-senha', 'err-senha', 'Minimo 6 caracteres.'); valid = false; }
    if (senha !== conf) { setErr('f-senha-conf', 'err-senha-conf', 'As senhas nao conferem.'); valid = false; }
  }

  if (!valid) showToast('Corrija os campos destacados.', 'error');
  return valid;
}

// ============================================================
// SUMÁRIO ETAPA 4
// ============================================================
function populateSummary() {
  const cidade = document.getElementById('f-cidade');
  const cidadeText = cidade.options[cidade.selectedIndex] ? cidade.options[cidade.selectedIndex].text : '';
  const bairro = document.getElementById('f-bairro').value.trim();
  const tipo = document.getElementById('f-tipo').value || '—';
  const data = document.getElementById('f-data').value;
  const desc = document.getElementById('f-descricao').value.trim();

  document.getElementById('sum-local').textContent = [bairro, cidadeText].filter(Boolean).join(', ') || '—';
  document.getElementById('sum-tipo').textContent = tipo;
  document.getElementById('sum-data').textContent = data ? formatDate(data) : '—';
  document.getElementById('sum-desc').textContent = desc.length > 55 ? desc.substring(0, 55) + '...' : (desc || '—');
  document.getElementById('sum-arquivos').textContent = filesUploaded.length > 0 ? filesUploaded.length + ' arquivo(s)' : 'Nenhum';
}

function formatDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ============================================================
// PROTOCOLO
// ============================================================
function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let letras = '';
  for (let i = 0; i < 3; i++) letras += chars[Math.floor(Math.random() * chars.length)];
  const nums = Math.floor(100 + Math.random() * 900);
  const proto = `${ano}-${letras}-${nums}`;
  sessionData.protocolo = proto;
  const el = document.getElementById('protocolo-gerado');
  if (el) el.textContent = proto;
}

function copiarProtocolo() {
  const proto = sessionData.protocolo;
  if (!proto) return;
  navigator.clipboard.writeText(proto).catch(() => {});
  showToast('Protocolo copiado: ' + proto, 'success');
}

function copiarProtocoloSucesso() {
  const proto = document.getElementById('sucesso-protocolo-num').textContent;
  if (!proto || proto === '—') return;
  navigator.clipboard.writeText(proto).catch(() => {});
  showToast('Protocolo copiado: ' + proto, 'success');
}

// ============================================================
// SENHA
// ============================================================
function checkSenha() {
  const val = document.getElementById('f-senha').value;
  const wrap = document.getElementById('senha-strength');
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  if (!val) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w: '20%', c: '#c0392b', t: 'Muito fraca' },
    { w: '40%', c: '#e67e22', t: 'Fraca' },
    { w: '60%', c: '#d4ac0d', t: 'Razoavel' },
    { w: '80%', c: '#27ae60', t: 'Boa' },
    { w: '100%', c: '#1a7a2e', t: 'Muito boa' },
  ];
  const lv = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width = lv.w;
  fill.style.background = lv.c;
  label.textContent = lv.t;
  label.style.color = lv.c;
}

function toggleSenhaCriar(id) {
  const inp = document.getElementById(id);
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toggleSenhaAcomp() {
  const inp = document.getElementById('acomp-senha');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ============================================================
// ANONIMATO
// ============================================================
function toggleContato() {
  let val = 'total';
  document.querySelectorAll('input[name="anonimato"]').forEach(r => { if (r.checked) val = r.value; });
  document.getElementById('contato-fields').style.display = val === 'contato' ? 'block' : 'none';
}

// ============================================================
// ENVIAR DENÚNCIA
// ============================================================
function openDenuncia() {
  openModal('modal-aviso');
}

function openDenunciaCategoria(cat) {
  window._categoriaPreSelecionada = cat;
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

function enviarDenuncia() {
  if (!validateStep(4)) return;

  const btn = document.getElementById('btn-next');
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;

    const proto = sessionData.protocolo;
    const senha = document.getElementById('f-senha').value;

    const cidade = document.getElementById('f-cidade');
    const cidadeText = cidade.options[cidade.selectedIndex] ? cidade.options[cidade.selectedIndex].text : '';

    denunciasDB[proto] = {
      senhaHash: simpleHash(senha),
      cidade: cidadeText,
      bairro: document.getElementById('f-bairro').value.trim(),
      tipo: document.getElementById('f-tipo').value,
      data: document.getElementById('f-data').value,
      descricao: document.getElementById('f-descricao').value.trim(),
      arquivos: filesUploaded.length
    };

    document.getElementById('sucesso-protocolo-num').textContent = proto;
    openModal('modal-sucesso');
  }, 800);
}

function fecharSucesso() {
  closeModal('modal-sucesso');
  showPage('inicio');
  filesUploaded = [];
  sessionData = { protocolo: null, senhaHash: null };
}

function irParaAcompanhar() {
  closeModal('modal-sucesso');
  showPage('acompanhar');
  const inp = document.getElementById('acomp-protocolo');
  if (inp) inp.value = sessionData.protocolo;
}

// ============================================================
// ACOMPANHAR
// ============================================================
function consultarDenuncia() {
  const btn = document.getElementById('btn-consultar');
  const proto = document.getElementById('acomp-protocolo').value.trim().toUpperCase();
  const senha = document.getElementById('acomp-senha').value;
  const emptyState = document.getElementById('empty-state');

  document.getElementById('err-acomp-protocolo').textContent = '';
  document.getElementById('err-acomp-senha').textContent = '';
  document.getElementById('acomp-erro-geral').style.display = 'none';
  emptyState.classList.remove('active');

  let valid = true;
  if (!proto) {
    document.getElementById('err-acomp-protocolo').textContent = 'Informe o protocolo.';
    document.getElementById('acomp-protocolo').classList.add('err');
    valid = false;
  }
  if (!senha) {
    document.getElementById('err-acomp-senha').textContent = 'Informe a senha.';
    document.getElementById('acomp-senha').classList.add('err');
    valid = false;
  }
  if (!valid) return;

  // Loading
  btn.textContent = 'Consultando...';
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Consultar Agora';
    btn.classList.remove('loading');
    btn.disabled = false;

    const denuncia = denunciasDB[proto];

    if (!denuncia) {
      // Empty state
      document.getElementById('empty-state-title').textContent = 'Protocolo não encontrado';
      document.getElementById('empty-state-msg').textContent = 'O protocolo "' + proto + '" não foi encontrado. Verifique o número e tente novamente. O protocolo é gerado ao final do formulário de denúncia.';
      emptyState.classList.add('active');
      showToast('Protocolo não encontrado.', 'error');
      return;
    }

    if (simpleHash(senha) !== denuncia.senhaHash) {
      document.getElementById('empty-state-title').textContent = 'Senha incorreta';
      document.getElementById('empty-state-msg').textContent = 'A senha informada não corresponde ao protocolo "' + proto + '". Verifique e tente novamente.';
      emptyState.classList.add('active');
      document.getElementById('acomp-senha').classList.add('err');
      showToast('Senha incorreta.', 'error');
      return;
    }

    // Sucesso
    document.getElementById('acomp-protocolo').classList.remove('err');
    document.getElementById('acomp-senha').classList.remove('err');

    document.getElementById('status-protocol-info').textContent =
      `Protocolo: ${proto}  |  Registrada em: ${new Date().toLocaleDateString('pt-BR')}  |  Acesso: ••••••`;

    document.getElementById('status-detalhes').innerHTML =
      `<strong>Categoria:</strong> ${denuncia.tipo || '—'}<br>
       <strong>Local:</strong> ${[denuncia.bairro, denuncia.cidade].filter(Boolean).join(', ') || '—'}<br>
       <strong>Data:</strong> ${denuncia.data ? formatDate(denuncia.data) : '—'}<br>
       <strong>Resumo:</strong> ${denuncia.descricao ? denuncia.descricao.substring(0, 80) + '...' : '—'}<br>
       <strong>Arquivos:</strong> ${denuncia.arquivos} arquivo(s)`;

    document.getElementById('status-section').style.display = 'block';
    document.getElementById('status-section').scrollIntoView({ behavior: 'smooth' });
    showToast('Denúncia encontrada.', 'success');
  }, 900);
}

function encerrarSessao() {
  document.getElementById('status-section').style.display = 'none';
  document.getElementById('acomp-protocolo').value = '';
  document.getElementById('acomp-senha').value = '';
  document.getElementById('empty-state').classList.remove('active');
  window.scrollTo(0, 0);
  showToast('Sessão encerrada.', '');
}

function enviarComplemento() {
  const text = document.getElementById('complemento-text').value.trim();
  if (!text) { showToast('Escreva o complemento antes de enviar.', 'error'); return; }
  document.getElementById('complemento-text').value = '';
  showToast('Complemento enviado com sucesso.', 'success');
}

// Sidebar consulta rápida
function consultarSidebar() {
  const proto = document.getElementById('sidebar-protocolo').value.trim();
  const senha = document.getElementById('sidebar-senha').value;
  const err = document.getElementById('sidebar-erro');

  err.textContent = '';
  if (!proto || !senha) {
    err.textContent = 'Preencha o protocolo e a senha.';
    return;
  }

  showPage('acompanhar');
  document.getElementById('acomp-protocolo').value = proto;
  document.getElementById('acomp-senha').value = senha;
  setTimeout(() => consultarDenuncia(), 150);
}

// ============================================================
// CIDADES
// ============================================================
const cidadesPorEstado = {
  SP: ['São Paulo','Campinas','Santos','Guarulhos','São Bernardo do Campo','Ribeirão Preto','Osasco','Sorocaba','Mauá','São José dos Campos','Piracicaba','Bauru'],
  RJ: ['Rio de Janeiro','Niterói','Duque de Caxias','Nova Iguaçu','Campos dos Goytacazes','Petrópolis','Volta Redonda'],
  MG: ['Belo Horizonte','Uberlândia','Contagem','Juiz de Fora','Betim','Montes Claros','Uberaba'],
};

function popularCidades() {
  const estado = document.getElementById('f-estado').value;
  const sel = document.getElementById('f-cidade');
  sel.innerHTML = '<option value="">Selecione a cidade</option>';
  (cidadesPorEstado[estado] || []).forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
}

// ============================================================
// ARQUIVOS
// ============================================================
let filesUploaded = [];

function handleFiles(e) { addFiles(Array.from(e.target.files)); }

function addFiles(files) {
  const avail = 10 - filesUploaded.length;
  if (avail <= 0) { showToast('Limite de 10 arquivos atingido.', 'error'); return; }
  const toAdd = files.slice(0, avail);
  if (files.length > avail) showToast(`Apenas ${avail} arquivo(s) adicionado(s). Limite de 10.`, 'warn');
  toAdd.forEach(f => {
    if (f.size > 100 * 1024 * 1024) {
      showToast(`"${f.name}" excede 100MB.`, 'error');
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
  if (!filesUploaded.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  filesUploaded.forEach((f, i) => {
    const ext = f.name.split('.').pop().toUpperCase();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ext}</td><td>${f.name}</td><td>${fmtSize(f.size)}</td><td><button class="btn-remove" onclick="removeFile(${i})" type="button">Remover</button></td>`;
    tbody.appendChild(tr);
  });
}

function removeFile(i) {
  const name = filesUploaded[i].name;
  filesUploaded.splice(i, 1);
  renderFileList();
  showToast(`"${name}" removido.`, '');
}

function fmtSize(b) {
  if (b >= 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + 'MB';
  if (b >= 1024) return (b / 1024).toFixed(0) + 'KB';
  return b + 'B';
}

function dragOver(e) { e.preventDefault(); document.getElementById('upload-area').classList.add('drag-over'); }
function dragLeave() { document.getElementById('upload-area').classList.remove('drag-over'); }
function dropFiles(e) { e.preventDefault(); document.getElementById('upload-area').classList.remove('drag-over'); addFiles(Array.from(e.dataTransfer.files)); }

function handleFilesAcomp(e) {
  const files = Array.from(e.target.files);
  const div = document.getElementById('acomp-file-list');
  div.innerHTML = files.map(f => `<div style="padding:4px 0; border-bottom:1px solid var(--border)">${f.name} — ${fmtSize(f.size)}</div>`).join('');
  showToast(`${files.length} arquivo(s) selecionado(s).`, 'success');
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
// PESSOAS
// ============================================================
function adicionarPessoa() {
  const c = document.getElementById('pessoas-container');
  const row = document.createElement('div');
  row.className = 'pessoa-row';
  row.innerHTML = `
    <div class="form-group"><input type="text" class="form-input" placeholder="Nome completo ou apelido" aria-label="Nome da pessoa" /></div>
    <div class="form-group" style="max-width:180px">
      <select class="form-select" aria-label="Papel">
        <option value="">Papel</option>
        <option>Denunciado</option><option>Vítima</option><option>Testemunha</option><option>Outro</option>
      </select>
    </div>
    <button class="btn-remove" onclick="this.parentElement.remove(); showToast('Pessoa removida.', '')" type="button">Remover</button>
  `;
  c.appendChild(row);
}

// ============================================================
// HASH
// ============================================================
function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; }
  return h.toString(36);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const df = document.getElementById('f-data');
  if (df) df.max = today;

  goToStep(1);

  // Keyboard nav for FAQ
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); } });
  });
});

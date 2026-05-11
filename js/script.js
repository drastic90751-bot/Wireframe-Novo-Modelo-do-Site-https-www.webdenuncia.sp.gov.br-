let sessionData = {
  protocolo: null,
  senhaHash: null,
  formData: {}
};
const denunciasDB = {};
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
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    el.classList.add('open');
  }
}
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

  if (step === 4) {
    const revisao = document.getElementById('revisao-check').checked;
    const senha = document.getElementById('f-senha').value;
    const senhaConf = document.getElementById('f-senha-conf').value;

    if (!revisao) {
      // Marca automaticamente e scrolla até lá com destaque visual
      const cb = document.getElementById('revisao-check');
      const label = cb?.closest('label') || cb?.parentElement;
      cb.checked = true;
      cb.dispatchEvent(new Event('change'));
      // Scroll suave até o checkbox
      if (label) {
        label.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pisca o label para chamar atenção
        label.style.transition = 'background 0.2s';
        label.style.background = 'rgba(59,130,246,0.18)';
        label.style.borderRadius = '4px';
        setTimeout(() => { label.style.background = ''; }, 1200);
      }
      // Não bloqueia — só garantiu que foi marcado
    }
    if (senha.length < 8) {
      setError('f-senha', 'err-senha', 'A senha deve ter pelo menos 8 caracteres.');
      valid = false;
    }
    if (senha !== senhaConf) {
      setError('f-senha-conf', 'err-senha-conf', 'As senhas não conferem.');
      valid = false;
    }
  }

  return valid;
}
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
function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const letras = randomLetras(3);
  const nums = Math.floor(100 + Math.random() * 900);
  const proto = `${ano}-${letras}-${nums}`;
  sessionData.protocolo = proto;
  // Persiste para sobreviver à navegação entre páginas
  try { localStorage.setItem('wdProtocolo', proto); } catch(e) {}
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
function checkSenha() {
  const val = document.getElementById('f-senha').value;
  const strengthWrap = document.getElementById('senha-strength');
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  if (val.length === 0) { strengthWrap.style.display = 'none'; return; }
  strengthWrap.style.display = 'flex';

  // Score simples — não premia tamanho absurdo, premia variedade
  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '25%', color: '#dc2626', text: 'Fraca' },
    { pct: '50%', color: '#ea580c', text: 'Razoável' },
    { pct: '75%', color: '#ca8a04', text: 'Boa' },
    { pct: '100%', color: '#16a34a', text: 'Forte ✓' },
  ];
  const lv = levels[Math.min(score - 1, 3)] || levels[0];
  fill.style.width = lv.pct;
  fill.style.background = lv.color;
  fill.style.transition = 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s ease';
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
function toggleContato() {
  const radios = document.querySelectorAll('input[name="anonimato"]');
  let val = 'total';
  radios.forEach(r => { if (r.checked) val = r.value; });
  document.getElementById('contato-fields').style.display = val === 'contato' ? 'block' : 'none';
}
function enviarDenuncia() {
  if (!validateStep(4)) return;

  const proto = sessionData.protocolo;
  const senha = document.getElementById('f-senha').value;
  const senhaHash = simpleHash(senha);
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
  try { localStorage.setItem('wdSenhaHash', senhaHash); } catch(e) {}
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
  try { localStorage.removeItem('wdProtocolo'); localStorage.removeItem('wdSenhaHash'); } catch(e) {}
}
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
  document.getElementById('acomp-protocolo').classList.remove('error');
  document.getElementById('acomp-senha').classList.remove('error');

  // Preenche o novo cabeçalho do status-card
  document.getElementById('status-protocol-info').textContent = proto;
  const metaEl = document.getElementById('status-proto-meta');
  if (metaEl) metaEl.textContent = `Registrada em: ${new Date().toLocaleDateString('pt-BR')} · Senha: ••••••`;

  document.getElementById('status-detalhes').innerHTML =
    `<strong>Categoria:</strong> ${denuncia.tipo || '—'}<br>
     <strong>Local:</strong> ${denuncia.bairro ? denuncia.bairro + ', ' : ''}${denuncia.cidade || '—'}<br>
     <strong>Data do incidente:</strong> ${denuncia.data ? formatDate(denuncia.data) : '—'}<br>
     <strong>Resumo:</strong> ${denuncia.descricao ? denuncia.descricao.substring(0, 80) + '...' : '—'}<br>
     <strong>Arquivos:</strong> ${denuncia.arquivos} arquivo(s)`;

  document.getElementById('status-section').classList.remove('status-section-hidden');
  document.getElementById('status-section').classList.add('status-section-visible');
  document.getElementById('status-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Dispara a animação sequencial do dashboard — sem delay, começa imediatamente
  animarDashboard();
}

/* -------------------------------------------------------
   Animação sequencial do Progress Track
   Cada etapa aparece com fade+slide, depois o ícone faz
   pop-in e a linha de progresso avança até a etapa atual.
   ------------------------------------------------------- */
function animarDashboard() {
  const etapaAtual = 4; // 1=Registrada 2=Em Análise 3=Encaminhada 4=Investigação 5=Concluída
  const totalEtapas = 5;

  // Reset sem esconder — steps ficam visíveis em estado neutro
  for (let i = 1; i <= totalEtapas; i++) {
    const el = document.getElementById('track-' + i);
    if (!el) continue;
    el.classList.remove('done', 'current', 'pending', 'loading');
    el.classList.add('track-visible');
  }
  const linha = document.getElementById('track-progress-line');
  if (linha) {
    linha.style.transition = 'none';
    linha.style.width = '0%';
  }

  // Pequena pausa inicial — como se estivesse "buscando dados"
  const pausaInicial = 600;

  for (let i = 1; i <= totalEtapas; i++) {
    (function(idx) {
      // Cada step demora 700ms a mais que o anterior (lento e satisfatório)
      const delay = pausaInicial + (idx - 1) * 700;

      setTimeout(() => {
        const el = document.getElementById('track-' + idx);
        if (!el) return;

        if (idx < etapaAtual) {
          el.classList.add('done');
        } else if (idx === etapaAtual) {
          el.classList.add('current');
        } else {
          el.classList.add('pending');
        }

        // Barra verde avança junto — com transição longa e suave
        if (idx <= etapaAtual && linha) {
          linha.style.transition = 'width 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
          const segmentos = totalEtapas - 1;
          const pct = idx < etapaAtual
            ? ((idx - 1) / segmentos) * 100
            : ((etapaAtual - 1.5) / segmentos) * 100;
          linha.style.width = pct + '%';
        }
      }, delay);
    })(i);
  }
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
  document.getElementById('status-section').classList.remove('status-section-visible');
  document.getElementById('status-section').classList.add('status-section-hidden');
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
  showPage('acompanhar');
  document.getElementById('acomp-protocolo').value = proto;
  document.getElementById('acomp-senha').value = senha;
  setTimeout(() => consultarDenuncia(), 100);
}
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
let filesUploaded = [];

function handleFiles(event) {
  addFiles(Array.from(event.target.files));
}

function addFiles(newFiles) {
  const available = 10 - filesUploaded.length;
  if (available <= 0) { alert('Limite de 10 arquivos atingido.'); return; }
  const toAdd = newFiles.slice(0, available);
  if (newFiles.length > available) alert(`Apenas ${available} arquivo(s) adicionado(s). Limite de 10 arquivos.`);
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
function updateCharCount() {
  const ta = document.getElementById('f-descricao');
  const counter = document.getElementById('char-count');
  if (!ta || !counter) return;
  const rem = 2500 - ta.value.length;
  counter.textContent = 'Caracteres restantes: ' + rem;
  counter.classList.toggle('warn', rem < 200);
}
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
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('wdTheme', newTheme);
  updateDarkModeBtn(newTheme);
}

function updateDarkModeBtn(theme) {
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  const label = document.getElementById('dark-mode-label');
  if (theme === 'dark') {
    sun.style.display = 'block';
    moon.style.display = 'none';
    if (label) label.textContent = 'Claro';
  } else {
    sun.style.display = 'none';
    moon.style.display = 'block';
    if (label) label.textContent = 'Escuro';
  }
}
function closeTutorial() {
  closeModal('modal-tutorial');
}

function closeTutorialAndDenuncia() {
  closeModal('modal-tutorial');
  openDenuncia();
}

function salvarPreferenciaTutorial() {
  const checked = document.getElementById('tutorial-nao-mostrar').checked;
  if (checked) {
    sessionStorage.setItem('wdTutorialSeen', '1');
  } else {
    sessionStorage.removeItem('wdTutorialSeen');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('wdTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateDarkModeBtn(savedTheme);

  // Limpa flag antiga que pode ter ficado presa — tutorial sempre aparece
  // (o "não mostrar mais" só funciona dentro da mesma sessão de navegação)
  const tutorialSeen = sessionStorage.getItem('wdTutorialSeen');
  if (!tutorialSeen) {
    setTimeout(() => openModal('modal-tutorial'), 400);
  }
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('f-data');
  if (dateField) {
    const todayDate = new Date();
    dateField.max = todayDate.toISOString().split('T')[0];
    // Minimum: 5 years back (reasonable for incident reports)
    const minDate = new Date(todayDate);
    minDate.setFullYear(minDate.getFullYear() - 5);
    dateField.min = minDate.toISOString().split('T')[0];
    // Prevent typing future dates via keyboard too
    dateField.addEventListener('change', function() {
      const val = new Date(this.value);
      const max = new Date(this.max);
      const min = new Date(this.min);
      if (val > max) this.value = this.max;
      if (val < min) this.value = this.min;
    });
  }

  // Restaura protocolo da sessão anterior (persiste ao navegar entre páginas)
  try {
    const savedProto = localStorage.getItem('wdProtocolo');
    const savedHash  = localStorage.getItem('wdSenhaHash');
    if (savedProto) {
      sessionData.protocolo = savedProto;
      sessionData.senhaHash = savedHash;
      // Preenche o campo de protocolo na aba Acompanhar automaticamente
      const inp = document.getElementById('acomp-protocolo');
      if (inp) inp.value = savedProto;
    }
  } catch(e) {}

  goToStep(1);
});
function announce(msg, type = 'polite') {
  const el = document.getElementById(type === 'alert' ? 'live-alert' : 'live-announcer');
  if (el) {
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = msg; });
  }
}
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('active');
  setTimeout(() => {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }, 50);
  document.body.style.overflow = 'hidden';
  modal._opener = document.activeElement;
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (modal._opener) {
    modal._opener.focus();
    modal._opener = null;
  }
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      document.body.style.overflow = '';
      if (activeModal._opener) activeModal._opener.focus();
    }
    return;
  }
  if (e.key !== 'Tab') return;
  const activeModal = document.querySelector('.modal-overlay.active');
  if (!activeModal) return;
  const focusable = Array.from(activeModal.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.closest('[style*="display:none"]') && !el.closest('[hidden]'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { last.focus(); e.preventDefault(); }
  } else {
    if (document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
});
const origToggleMobileMenu = window.toggleMobileMenu;
window.toggleMobileMenu = function() {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const isOpen = menu.classList.contains('open');
  if (typeof origToggleMobileMenu === 'function') origToggleMobileMenu();
  else {
    const newOpen = !isOpen;
    menu.classList.toggle('open', newOpen);
    btn.classList.toggle('open', newOpen);
  }
  const opened = menu.classList.contains('open');
  if (btn) btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  announce(opened ? 'Menu aberto' : 'Menu fechado');
};
const origToggleDarkMode2 = window.toggleDarkMode;
window.toggleDarkMode = function() {
  if (typeof origToggleDarkMode2 === 'function') origToggleDarkMode2();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btns = [document.getElementById('btn-dark-mode'), document.getElementById('btn-dark-mode-mobile')];
  btns.forEach(btn => { if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false'); });
  announce(isDark ? 'Modo escuro ativado' : 'Modo claro ativado');
};
const origGoToStep = window.goToStep;
window.goToStep = function(n) {
  if (typeof origGoToStep === 'function') origGoToStep(n);
  const stepNames = ['', 'Local do Incidente', 'Descrição do Incidente', 'Arquivos e Evidências', 'Revisão e Envio'];
  announce(`Etapa ${n} de 4: ${stepNames[n]}`);
  for (let i = 1; i <= 4; i++) {
    const tab = document.getElementById('step-tab-' + i);
    if (tab) tab.setAttribute('aria-selected', i === n ? 'true' : 'false');
  }
  const activeForm = document.getElementById('form-step-' + n);
  if (activeForm) {
    const heading = activeForm.querySelector('h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }
};
const origSetError = window.setError;
window.setError = function(fieldId, errId, msg) {
  if (typeof origSetError === 'function') origSetError(fieldId, errId, msg);
  if (msg) announce(msg, 'alert');
};
const origValidateStep = window.validateStep;
window.validateStep = function(step) {
  document.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  const result = origValidateStep ? origValidateStep(step) : true;
  document.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error').forEach(el => {
    el.setAttribute('aria-invalid', 'true');
  });
  if (!result) {
    const erros = document.querySelectorAll('.field-error:not(:empty)').length;
    announce(`${erros} erro${erros > 1 ? 's' : ''} encontrado${erros > 1 ? 's' : ''}. Verifique os campos marcados.`, 'alert');
  }
  return result;
};
const origHandleFiles = window.handleFiles;
window.handleFiles = function(event) {
  if (typeof origHandleFiles === 'function') origHandleFiles(event);
  const count = event.target.files.length;
  announce(`${count} arquivo${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}.`);
};
const origEnviarComplemento = window.enviarComplemento;
window.enviarComplemento = function() {
  if (typeof origEnviarComplemento === 'function') origEnviarComplemento();
  const ok = document.getElementById('complemento-ok');
  if (ok && ok.textContent) announce(ok.textContent);
};
const origToggleFaq = window.toggleFaq;
window.toggleFaq = function(el) {
  if (typeof origToggleFaq === 'function') origToggleFaq(el);
  const answer = el.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  el.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (answer) answer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
};
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-q').forEach(q => {
    if (q.tagName !== 'BUTTON') return;
    q.setAttribute('aria-expanded', 'false');
    const answer = q.nextElementSibling;
    if (answer) answer.setAttribute('aria-hidden', 'true');
  });
  const savedTheme = localStorage.getItem('wdTheme') || 'light';
  const isDark = savedTheme === 'dark';
  const btns = [document.getElementById('btn-dark-mode'), document.getElementById('btn-dark-mode-mobile')];
  btns.forEach(btn => { if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false'); });
});

/* =============================================================
   HEURÍSTICAS DE NIELSEN + LIMIAR DE DOHERTY + LEI DE FITTS
   Implementação prática em JavaScript
   ============================================================= */

/* --- NIELSEN H1: Visibilidade do Status + DOHERTY: resposta < 400ms ---
   Atualiza a barra de progresso do stepper conforme avança as etapas */
function atualizarProgressoStepper(step) {
  // Progresso visual: etapa 1 = 25%, 2 = 50%, 3 = 75%, 4 = 100%
  const pct = (step / 4) * 100;
  document.documentElement.style.setProperty('--stepper-progress', pct + '%');
}

/* Intercepta goToStep para atualizar progresso */
const _origGoToStepHeuristica = window.goToStep;
window.goToStep = function(n) {
  _origGoToStepHeuristica && _origGoToStepHeuristica(n);
  atualizarProgressoStepper(n);
};

/* --- DOHERTY: Loading state no botão "Próxima Etapa" / "Enviar" ---
   Feedback visual imediato ao clicar — elimina a percepção de lag */
const _origNextStep = window.nextStep;
window.nextStep = function() {
  const btn = document.getElementById('btn-next');
  if (!btn) { _origNextStep && _origNextStep(); return; }

  // Adiciona shimmer imediatamente (< 16ms)
  btn.classList.add('loading');
  btn.disabled = true;

  // Simula o custo de processamento (validação + navegação)
  setTimeout(() => {
    _origNextStep && _origNextStep();
    btn.classList.remove('loading');
    btn.disabled = false;
  }, 200); // 200ms — dentro do limiar de Doherty (< 400ms)
};

/* --- NIELSEN H5: Prevenção de Erros + H9: Diagnóstico ---
   Validação inline em tempo real com debounce de 400ms (limiar de Doherty)
   O usuário recebe feedback antes de tentar avançar a etapa */

let _debounceTimers = {};

function validarCampoInline(fieldId, errId, validFn) {
  clearTimeout(_debounceTimers[fieldId]);
  // DOHERTY: aguarda 400ms de inatividade antes de validar
  _debounceTimers[fieldId] = setTimeout(() => {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (!field || !err) return;

    const result = validFn(field.value);
    if (result.valid) {
      field.classList.remove('error');
      field.classList.add('valid');
      err.textContent = '';
    } else {
      field.classList.remove('valid');
      // Só mostra erro inline se o campo já foi tocado (evita ansiedade prematura)
      if (field.dataset.touched === 'true') {
        field.classList.add('error');
        err.textContent = result.msg;
      }
    }
  }, 400);
}

// Marca campo como "tocado" ao sair (blur) — NIELSEN H5
function marcarTocado(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.dataset.touched = 'true';
}

document.addEventListener('DOMContentLoaded', function() {
  // Progresso inicial
  atualizarProgressoStepper(1);

  // Bairro — validação inline
  const bairro = document.getElementById('f-bairro');
  if (bairro) {
    bairro.addEventListener('blur',  () => marcarTocado('f-bairro'));
    bairro.addEventListener('input', () => validarCampoInline('f-bairro', 'err-bairro', v => ({
      valid: v.trim().length >= 2,
      msg: v.trim().length === 0 ? 'Informe o bairro.' : 'Bairro muito curto.'
    })));
  }

  // Logradouro — validação inline
  const logradouro = document.getElementById('f-logradouro');
  if (logradouro) {
    logradouro.addEventListener('blur',  () => marcarTocado('f-logradouro'));
    logradouro.addEventListener('input', () => validarCampoInline('f-logradouro', 'err-logradouro', v => ({
      valid: v.trim().length >= 3,
      msg: v.trim().length === 0 ? 'Informe o logradouro.' : 'Logradouro muito curto.'
    })));
  }

  // Estado — validação inline ao change
  const estado = document.getElementById('f-estado');
  if (estado) {
    estado.addEventListener('change', () => {
      estado.dataset.touched = 'true';
      validarCampoInline('f-estado', 'err-estado', v => ({
        valid: v !== '',
        msg: 'Selecione o estado.'
      }));
    });
  }

  // Cidade — validação inline ao change
  const cidade = document.getElementById('f-cidade');
  if (cidade) {
    cidade.addEventListener('change', () => {
      cidade.dataset.touched = 'true';
      validarCampoInline('f-cidade', 'err-cidade', v => ({
        valid: v !== '',
        msg: 'Selecione a cidade.'
      }));
    });
  }

  // Descrição — validação inline com contador (Etapa 2)
  const descricao = document.getElementById('f-descricao');
  if (descricao) {
    descricao.addEventListener('blur',  () => marcarTocado('f-descricao'));
    descricao.addEventListener('input', () => validarCampoInline('f-descricao', 'err-descricao', v => ({
      valid: v.trim().length >= 30,
      msg: v.trim().length === 0
        ? 'Descreva o incidente.'
        : `Ainda faltam ${30 - v.trim().length} caracteres.`
    })));
  }

  // Senha — validação inline
  const senha = document.getElementById('f-senha');
  if (senha) {
    senha.addEventListener('blur',  () => marcarTocado('f-senha'));
    senha.addEventListener('input', () => validarCampoInline('f-senha', 'err-senha', v => ({
      valid: v.length >= 6,
      msg: `Senha precisa de ${6 - v.length} caractere(s) a mais.`
    })));
  }

  // Confirmar senha — validação inline
  const senhaConf = document.getElementById('f-senha-conf');
  if (senhaConf) {
    senhaConf.addEventListener('blur',  () => marcarTocado('f-senha-conf'));
    senhaConf.addEventListener('input', () => {
      const s = document.getElementById('f-senha');
      validarCampoInline('f-senha-conf', 'err-senha-conf', v => ({
        valid: v === (s ? s.value : ''),
        msg: 'As senhas não conferem.'
      }));
    });
  }

  /* --- NIELSEN H3: Controle e Liberdade do Usuário ---
     Alerta ao tentar sair acidentalmente do formulário com dados preenchidos */
  window.addEventListener('beforeunload', function(e) {
    const page = document.getElementById('page-denuncia');
    if (!page || !page.classList.contains('active')) return;
    const bairroVal = document.getElementById('f-bairro')?.value.trim();
    const descVal   = document.getElementById('f-descricao')?.value.trim();
    if (bairroVal || descVal) {
      e.preventDefault();
      e.returnValue = ''; // Mostra diálogo nativo do browser
    }
  });
});


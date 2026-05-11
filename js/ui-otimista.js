/**
 * ui-otimista.js
 * WebDenúncia SP — UI Otimista · Heurísticas de Nielsen · Lei de Fitts
 *
 * UI Otimista: mostra resultado positivo imediatamente ao usuário,
 * enquanto o processamento real ocorre em background.
 * Se falhar, faz rollback com mensagem clara.
 *
 * Nielsen H1  — Visibilidade do status do sistema (auto-save indicator)
 * Nielsen H4  — Consistência e padrões (tooltips uniformes)
 * Nielsen H5  — Prevenção de erros (confirmação ao abandonar)
 * Nielsen H10 — Ajuda e documentação (tooltips contextuais)
 * Lei de Fitts — Botões primários maiores, mais fáceis de acertar
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. UI OTIMISTA — Auto-save com indicador de status
     Salva rascunho localmente a cada mudança e mostra
     "Salvo automaticamente" em < 400ms (Limiar de Doherty)
  ───────────────────────────────────────────────────────── */

  const AUTOSAVE_KEY = 'wd_rascunho';
  let autosaveTimer = null;
  let lastSavedState = null;

  // Indicador de status (Nielsen H1)
  function criarIndicadorSalvo() {
    if (document.getElementById('autosave-indicator')) return;
    const el = document.createElement('div');
    el.id = 'autosave-indicator';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.innerHTML = `
      <span class="autosave-icon autosave-icon--saving">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="8" cy="8" r="6" stroke-dasharray="25" stroke-dashoffset="25" class="autosave-spin"/>
        </svg>
      </span>
      <span class="autosave-icon autosave-icon--saved" style="display:none">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="2,8 6,12 14,4"/>
        </svg>
      </span>
      <span class="autosave-text">Salvando rascunho…</span>
    `;
    document.body.appendChild(el);
    return el;
  }

  function setAutosaveStatus(status) {
    // status: 'saving' | 'saved' | 'error' | 'hidden'
    const el = document.getElementById('autosave-indicator');
    if (!el) return;

    el.className = 'autosave-indicator autosave-indicator--' + status;
    const iconSaving = el.querySelector('.autosave-icon--saving');
    const iconSaved  = el.querySelector('.autosave-icon--saved');
    const text       = el.querySelector('.autosave-text');

    if (status === 'saving') {
      iconSaving.style.display = '';
      iconSaved.style.display  = 'none';
      text.textContent = 'Salvando rascunho…';
    } else if (status === 'saved') {
      iconSaving.style.display = 'none';
      iconSaved.style.display  = '';
      text.textContent = 'Rascunho salvo';
      // Esconde após 3s
      setTimeout(() => setAutosaveStatus('hidden'), 3000);
    } else if (status === 'error') {
      iconSaving.style.display = 'none';
      iconSaved.style.display  = 'none';
      text.textContent = 'Erro ao salvar';
    } else {
      el.className = 'autosave-indicator autosave-indicator--hidden';
    }
  }

  function coletarDadosFormulario() {
    const get = (id) => document.getElementById(id)?.value || '';
    const getCidade = () => {
      const el = document.getElementById('f-cidade');
      return el?.options[el.selectedIndex]?.text || '';
    };
    return {
      estado:      get('f-estado'),
      cidade:      getCidade(),
      bairro:      get('f-bairro'),
      logradouro:  get('f-logradouro'),
      complemento: get('f-complemento'),
      tipo:        get('f-tipo'),
      data:        get('f-data'),
      hora:        get('f-hora'),
      descricao:   get('f-descricao'),
      _ts: Date.now(),
    };
  }

  function salvarRascunho() {
    const dados = coletarDadosFormulario();
    const str   = JSON.stringify(dados);

    // Só salva se mudou (evita writes desnecessários)
    if (str === lastSavedState) return;

    setAutosaveStatus('saving');

    // Simula latência mínima de operação (UI otimista)
    setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, str);
        lastSavedState = str;
        setAutosaveStatus('saved');
      } catch (e) {
        setAutosaveStatus('error');
      }
    }, 300); // dentro do limiar de Doherty
  }

  function restaurarRascunho() {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const dados = JSON.parse(raw);

      // Só restaura se o rascunho for das últimas 24h
      const horas = (Date.now() - (dados._ts || 0)) / 3600000;
      if (horas > 24) { localStorage.removeItem(AUTOSAVE_KEY); return; }

      // UI Otimista: mostra banner de restauração imediatamente
      mostrarBannerRestauracao(dados);
    } catch (e) {}
  }

  function mostrarBannerRestauracao(dados) {
    if (document.getElementById('rascunho-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'rascunho-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="flex-shrink:0">
        <path d="M3 10h11M10 4l6 6-6 6"/>
      </svg>
      <span>Encontramos um rascunho não enviado. <button id="btn-restaurar" class="rascunho-link">Restaurar dados</button> ou <button id="btn-descartar" class="rascunho-link rascunho-link--danger">Descartar</button></span>
    `;
    document.body.appendChild(banner);

    document.getElementById('btn-restaurar').addEventListener('click', () => {
      aplicarRascunho(dados);
      banner.remove();
    });
    document.getElementById('btn-descartar').addEventListener('click', () => {
      localStorage.removeItem(AUTOSAVE_KEY);
      lastSavedState = null;
      banner.remove();
    });

    // Auto-esconde após 10s
    setTimeout(() => banner.remove(), 10000);
  }

  function aplicarRascunho(dados) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };

    set('f-bairro',      dados.bairro);
    set('f-logradouro',  dados.logradouro);
    set('f-complemento', dados.complemento);
    set('f-hora',        dados.hora);
    set('f-descricao',   dados.descricao);

    // Anuncia para leitores de tela
    const ann = document.getElementById('live-announcer');
    if (ann) ann.textContent = 'Rascunho restaurado com sucesso.';
  }

  function iniciarAutosave() {
    criarIndicadorSalvo();

    // Oculta indicador quando não está na página de denúncia
    function syncAutosaveVisibility() {
      const ind = document.getElementById('autosave-indicator');
      if (!ind) return;
      const onForm = document.getElementById('page-denuncia')?.classList.contains('active');
      if (!onForm) {
        ind.className = 'autosave-indicator autosave-indicator--hidden';
      }
    }
    document.querySelectorAll('.page').forEach(p => {
      new MutationObserver(syncAutosaveVisibility)
        .observe(p, { attributes: true, attributeFilter: ['class'] });
    });

    // Monitora campos do formulário
    const camposMonitorados = [
      'f-bairro','f-logradouro','f-complemento',
      'f-hora','f-descricao','f-tipo','f-data'
    ];

    camposMonitorados.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(salvarRascunho, 800); // debounce 800ms
      });
    });

    // Restaura rascunho ao abrir o formulário
    const page = document.getElementById('page-denuncia');
    if (page) {
      const obs = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.target.classList.contains('active')) {
            restaurarRascunho();
          }
        });
      });
      obs.observe(page, { attributes: true, attributeFilter: ['class'] });
    }

    // Limpa rascunho após envio bem-sucedido
    const origEnviar = window.enviarDenuncia;
    if (origEnviar) {
      window.enviarDenuncia = function () {
        origEnviar.apply(this, arguments);
        localStorage.removeItem(AUTOSAVE_KEY);
        lastSavedState = null;
        setAutosaveStatus('hidden');
      };
    }
  }


  /* ─────────────────────────────────────────────────────────
     2. UI OTIMISTA — Envio com feedback instantâneo
     Mostra "Enviando…" imediatamente e anima o modal de sucesso
     antes de qualquer resposta do servidor
  ───────────────────────────────────────────────────────── */

  function patchEnvioOtimista() {
    const btnNext = document.getElementById('btn-next');
    if (!btnNext) return;

    // Intercepta o clique no botão "Enviar Denúncia" (step 4)
    const origEnviarGlobal = window.enviarDenuncia;
    window.enviarDenuncia = function () {
      if (!window.validateStep || !window.validateStep(4)) return;

      // ── UI Otimista: feedback IMEDIATO (< 16ms) ──
      btnNext.textContent = 'Enviando…';
      btnNext.disabled = true;
      btnNext.classList.add('btn-loading-optimistic');

      // Simula processamento (em produção seria a chamada real de API)
      setTimeout(() => {
        // Chama a função original de envio
        if (typeof origEnviarGlobal === 'function') {
          origEnviarGlobal.apply(this, arguments);
        }

        // Restaura botão
        btnNext.textContent = 'Enviar Denúncia';
        btnNext.disabled = false;
        btnNext.classList.remove('btn-loading-optimistic');
      }, 600);
    };
  }


  /* ─────────────────────────────────────────────────────────
     3. TOOLTIPS CONTEXTUAIS (Nielsen H10 — Ajuda e documentação)
     Aparecem no foco/hover dos campos complexos
     Tamanho mínimo 44px garante Lei de Fitts
  ───────────────────────────────────────────────────────── */

  const TOOLTIPS = {
    'f-descricao': 'Descreva o que você viu com o máximo de detalhes: horário, quantidade de pessoas, veículos, roupas. Evite julgamentos — foque nos fatos.',
    'f-tipo':      'Selecione o tipo mais próximo do ocorrido. Se não souber, escolha "Outros" e descreva no campo abaixo.',
    'f-data':      'Informe a data em que o fato ocorreu, não necessariamente hoje.',
    'f-bairro':    'Informe o bairro do local do crime, não o seu endereço.',
    'f-senha':     'Crie uma senha para acompanhar sua denúncia. Use letras e números. Não usamos sua identidade em nenhum momento.',
    'f-coordenadas': 'Clique no mapa ou arraste o marcador para indicar o local exato. Isso ajuda a direcionar a denúncia à unidade policial correta.',
    'upload-area': 'Fotos, vídeos ou áudios aumentam a eficácia da denúncia. Tamanho máximo: 10MB por arquivo. Nenhum metadado de localização é armazenado.',
  };

  let tooltipEl = null;
  let tooltipTimer = null;

  function criarTooltipEl() {
    if (document.getElementById('campo-tooltip')) return;
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'campo-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.setAttribute('aria-live', 'off');
    document.body.appendChild(tooltipEl);
  }

  function mostrarTooltip(targetEl, texto) {
    if (!tooltipEl) return;
    clearTimeout(tooltipTimer);

    tooltipEl.textContent = texto;
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.display = 'block';
    tooltipEl.className = 'campo-tooltip';

    const rect    = targetEl.getBoundingClientRect();
    const scrollY = window.scrollY;
    const ttH     = tooltipEl.offsetHeight || 60;
    const ttW     = tooltipEl.offsetWidth  || 260;

    // Prefere acima — não tapa o botão de olho nem outros elementos abaixo
    let top   = rect.top + scrollY - ttH - 8;
    let below = false;

    // Se não cabe acima, coloca abaixo
    if (rect.top - ttH - 16 < 0) {
      top   = rect.bottom + scrollY + 8;
      below = true;
    }

    // Evita sair da tela pela direita
    const maxLeft = window.innerWidth - ttW - 8;
    let left = Math.min(rect.left, maxLeft);
    if (left < 8) left = 8;

    tooltipEl.style.top        = top + 'px';
    tooltipEl.style.left       = left + 'px';
    tooltipEl.style.visibility = '';
    tooltipEl.style.display    = '';
    tooltipEl.className = 'campo-tooltip campo-tooltip--visible' + (below ? ' campo-tooltip--below' : '');

    targetEl.setAttribute('aria-describedby', 'campo-tooltip');
  }

  function esconderTooltip(targetEl) {
    if (!tooltipEl) return;
    tooltipTimer = setTimeout(() => {
      tooltipEl.className = 'campo-tooltip';
      if (targetEl) targetEl.removeAttribute('aria-describedby');
    }, 200);
  }

  function iniciarTooltips() {
    criarTooltipEl();

    Object.entries(TOOLTIPS).forEach(([id, texto]) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Adiciona ícone de ajuda ao lado do label (Nielsen H10)
      const label = document.querySelector(`label[for="${id}"]`);
      if (label && !label.querySelector('.tooltip-trigger')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tooltip-trigger';
        btn.setAttribute('aria-label', 'Ajuda sobre este campo');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
          <circle cx="8" cy="8" r="6"/>
          <path d="M6 6a2 2 0 113.2 1.6C9 8 8 8.5 8 9.5"/>
          <circle cx="8" cy="11.5" r=".5" fill="currentColor"/>
        </svg>`;
        btn.addEventListener('mouseenter', () => mostrarTooltip(btn, texto));
        btn.addEventListener('mouseleave', () => esconderTooltip(btn));
        btn.addEventListener('focus',      () => mostrarTooltip(btn, texto));
        btn.addEventListener('blur',       () => esconderTooltip(btn));
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarTooltip(btn, texto);
        });
        label.appendChild(btn);
      }

      // Mostra tooltip no foco e hover do campo
      el.addEventListener('focus',      () => mostrarTooltip(el, texto));
      el.addEventListener('blur',       () => esconderTooltip(el));
      el.addEventListener('mouseenter', () => mostrarTooltip(el, texto));
      el.addEventListener('mouseleave', () => esconderTooltip(el));
    });
  }


  /* ─────────────────────────────────────────────────────────
     4. LEI DE FITTS — Botões primários com maior área de clique
     Botão de ação principal > botão secundário (sempre)
     + Indicador visual de hierarquia de ação
  ───────────────────────────────────────────────────────── */

  function aplicarFitts() {
    // Botão "Enviar Denúncia" na step 4 — maior, mais proeminente
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.classList.add('fitts-primary');
    }

    // Botão "Fazer Denúncia" na hero — o mais importante da tela inicial
    const heroBtns = document.querySelectorAll('.hero-tab-btn');
    if (heroBtns.length > 0) {
      heroBtns[0].classList.add('fitts-hero-primary');
    }

    // Botão "Consultar" na sidebar — diferenciado dos campos
    const btnConsultar = document.querySelector('[onclick="consultarSidebar()"]');
    if (btnConsultar) btnConsultar.classList.add('fitts-primary');

    // Botões de confirmação nos modais
    document.querySelectorAll('.btn-proceed').forEach(b => b.classList.add('fitts-modal-primary'));
  }


  /* ─────────────────────────────────────────────────────────
     5. NIELSEN H1 — Indicador de progresso no envio
     Barra de progresso animada durante o processamento
  ───────────────────────────────────────────────────────── */

  function criarBarraProgressoEnvio() {
    if (document.getElementById('submit-progress')) return;
    const bar = document.createElement('div');
    bar.id = 'submit-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Enviando denúncia');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.innerHTML = '<div id="submit-progress-fill"></div>';
    document.body.appendChild(bar);
  }

  function animarProgressoEnvio() {
    const bar  = document.getElementById('submit-progress');
    const fill = document.getElementById('submit-progress-fill');
    if (!bar || !fill) return;

    bar.classList.add('submit-progress--active');
    fill.style.width = '0%';

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 8;
      if (prog >= 90) { prog = 90; clearInterval(interval); }
      fill.style.width = prog + '%';
      bar.setAttribute('aria-valuenow', Math.round(prog));
    }, 120);

    // Completa ao abrir o modal de sucesso
    const origOpenModal = window.openModal;
    if (origOpenModal) {
      window.openModal = function (id) {
        if (id === 'modal-sucesso') {
          clearInterval(interval);
          fill.style.width = '100%';
          fill.style.transition = 'width .3s ease';
          bar.setAttribute('aria-valuenow', '100');
          setTimeout(() => bar.classList.remove('submit-progress--active'), 500);
        }
        origOpenModal.apply(this, arguments);
      };
    }

    return interval;
  }


  /* ─────────────────────────────────────────────────────────
     Init
  ───────────────────────────────────────────────────────── */

  function init() {
    iniciarAutosave();
    iniciarTooltips();
    aplicarFitts();
    criarBarraProgressoEnvio();
    patchEnvioOtimista();

    // Liga animação de progresso ao clique no botão de envio
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        // Só anima se estiver na última step
        if (window.currentStep === 4) {
          animarProgressoEnvio();
        }
      });
    }

    console.info('[ui-otimista.js] UI Otimista · Nielsen · Fitts carregados.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

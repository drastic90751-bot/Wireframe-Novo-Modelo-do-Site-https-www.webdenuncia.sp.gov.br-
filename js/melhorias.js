/**
 * melhorias.js
 * WebDenúncia SP — Empty States · WCAG · Handoff · CRAP
 */

(function () {
  'use strict';

  /* ── Empty State Templates ─────────────────────────────── */

  const EMPTY_STATES = {
    files: {
      icon: `<svg class="empty-state__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="8" y="6" width="32" height="36" rx="4"/>
        <path d="M16 16h16M16 22h16M16 28h10"/>
        <circle cx="36" cy="36" r="8" fill="var(--empty-bg)" stroke="var(--empty-icon-color)"/>
        <line x1="33" y1="36" x2="39" y2="36"/><line x1="36" y1="33" x2="36" y2="39"/>
      </svg>`,
      title: 'Nenhum arquivo anexado',
      desc: 'Arraste imagens, vídeos ou documentos para esta área, ou clique para selecionar arquivos do seu dispositivo.',
      action: null,
    },
    consulta: {
      icon: `<svg class="empty-state__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="22" cy="22" r="14"/>
        <line x1="32" y1="32" x2="42" y2="42"/>
        <line x1="16" y1="22" x2="28" y2="22"/><line x1="22" y1="16" x2="22" y2="28"/>
      </svg>`,
      title: 'Informe seu protocolo',
      desc: 'Digite o número de protocolo e a senha criados no momento da denúncia para acompanhar o andamento.',
      action: null,
    },
    consultaNotFound: {
      icon: `<svg class="empty-state__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="22" cy="22" r="14"/>
        <line x1="32" y1="32" x2="42" y2="42"/>
        <line x1="16" y1="22" x2="28" y2="22"/>
      </svg>`,
      title: 'Protocolo não encontrado',
      desc: 'Verifique se o número e a senha estão corretos. Se o problema persistir, entre em contato pelo 181.',
      action: null,
    },
    news: {
      icon: `<svg class="empty-state__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="10" width="36" height="28" rx="3"/>
        <line x1="14" y1="18" x2="34" y2="18"/>
        <line x1="14" y1="24" x2="34" y2="24"/>
        <line x1="14" y1="30" x2="24" y2="30"/>
      </svg>`,
      title: 'Sem notícias no momento',
      desc: 'Novas notícias e alertas serão exibidos aqui assim que estiverem disponíveis.',
      action: null,
    },
    offline: {
      icon: `<svg class="empty-state__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 6L42 42"/>
        <path d="M8 14C5 17 3 21 3 24" opacity=".4"/>
        <path d="M14 8a28 28 0 0128 28" opacity=".4"/>
        <path d="M24 32a4 4 0 014 4H20a4 4 0 014-4z" fill="currentColor" opacity=".6"/>
      </svg>`,
      title: 'Você está offline',
      desc: 'Sua denúncia será salva localmente e enviada automaticamente quando a conexão for restaurada.',
      action: null,
    },
  };

  function createEmptyState(key, extraClass = '') {
    const es = EMPTY_STATES[key];
    if (!es) return null;
    const div = document.createElement('div');
    div.className = `empty-state empty-state--${key} ${extraClass}`.trim();
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.innerHTML = `
      ${es.icon}
      <p class="empty-state__title">${es.title}</p>
      <p class="empty-state__desc">${es.desc}</p>
      ${es.action ? `<div class="empty-state__action">${es.action}</div>` : ''}
    `;
    return div;
  }

  /* ── Inject empty state into file table ────────────────── */
  function initFileEmptyState() {
    const wrap = document.getElementById('file-table-wrap');
    if (!wrap) return;

    const es = createEmptyState('files', 'empty-state-files');
    if (!es) return;

    // Insere antes da tabela
    const parent = wrap.parentElement;
    parent.insertBefore(es, wrap);

    // Observa quando a tabela tem itens
    const tbody = document.getElementById('file-list');
    if (!tbody) return;

    const observer = new MutationObserver(() => {
      const hasFiles = tbody.children.length > 0;
      es.style.display = hasFiles ? 'none' : 'flex';
      wrap.style.display = hasFiles ? 'block' : 'none';
    });
    observer.observe(tbody, { childList: true });

    // Estado inicial
    es.style.display = 'flex';
  }

  /* ── Inject empty state into consulta section ──────────── */
  function initConsultaEmptyState() {
    const statusSection = document.getElementById('status-section');
    if (!statusSection) return;

    const es = createEmptyState('consulta', 'empty-state-consulta');
    if (!es) return;

    // Insere após o formulário de consulta
    statusSection.parentElement.insertBefore(es, statusSection);

    // Mostra empty state quando status-section está oculta
    const observer = new MutationObserver(() => {
      const hidden = statusSection.classList.contains('status-section-hidden');
      es.style.display = hidden ? 'flex' : 'none';
    });
    observer.observe(statusSection, { attributes: true, attributeFilter: ['class'] });

    es.style.display = 'flex';
  }

  /* ── WCAG: Announce route changes ──────────────────────── */
  function announcePageChange(pageName) {
    const announcer = document.getElementById('live-announcer');
    if (announcer) {
      announcer.textContent = '';
      requestAnimationFrame(() => {
        announcer.textContent = `Navegou para: ${pageName}`;
      });
    }
  }

  /* ── WCAG: Add aria-required to required inputs ─────────── */
  function markRequiredFields() {
    // Campos obrigatórios do formulário
    const requiredIds = [
      'f-estado','f-cidade','f-tipo','f-descricao','f-senha','f-senha-conf'
    ];
    requiredIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('aria-required', 'true');
        // Adiciona asterisco no label correspondente
        const label = document.querySelector(`label[for="${id}"]`);
        if (label && !label.querySelector('.required-indicator')) {
          const star = document.createElement('span');
          star.className = 'required-indicator';
          star.setAttribute('aria-hidden', 'true');
          star.textContent = ' *';
          label.appendChild(star);
        }
      }
    });
  }

  /* ── WCAG: Trap focus in modals ─────────────────────────── */
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initModalFocusTrap() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      trapFocus(modal);
    });

    // Intercepta abertura de modal para mover foco
    const origOpen = window.openModal;
    if (origOpen) {
      window.openModal = function (id) {
        origOpen(id);
        const modal = document.getElementById(id);
        if (modal) {
          const firstBtn = modal.querySelector('button, [tabindex="0"]');
          if (firstBtn) setTimeout(() => firstBtn.focus(), 50);
        }
      };
    }
  }

  /* ── WCAG: Escape fecha modais ──────────────────────────── */
  function initEscapeClose() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay.open, .modal-overlay[style*="flex"]');
        if (openModal) {
          const closeBtn = openModal.querySelector('.btn-x');
          if (closeBtn) closeBtn.click();
        }
      }
    });
  }

  /* ── WCAG: Error summary ────────────────────────────────── */
  function buildErrorSummary(errors) {
    const existing = document.getElementById('error-summary');
    if (existing) existing.remove();
    if (!errors.length) return;

    const summary = document.createElement('div');
    summary.id = 'error-summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    summary.style.cssText = `
      background: var(--danger-bg);
      border: 2px solid var(--danger);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    `;
    summary.innerHTML = `
      <strong style="color:var(--danger);font-size:var(--text-sm)">
        ⚠ ${errors.length} campo(s) precisam de atenção:
      </strong>
      <ul style="margin:8px 0 0;padding-left:20px;font-size:var(--text-sm)">
        ${errors.map(e => `<li><a href="#${e.id}" style="color:var(--danger)">${e.label}</a></li>`).join('')}
      </ul>
    `;
    return summary;
  }

  /* ── CRAP: Repetição — adiciona data-token nos elementos ── */
  function initHandoffTokens() {
    // Apenas ativo se URL tiver ?handoff=true
    if (!location.search.includes('handoff=true')) return;

    document.body.classList.add('handoff-mode');

    const tokenMap = {
      '.form-section':   'space-5 / radius-md / shadow-sm',
      '.category-card':  'radius-md / text-sm / space-3',
      '.btn-primary':    'bg:dark / text-white / weight-700',
      '.btn-next':       'bg:dark / text-white / weight-700',
      '.field-error':    'text-xs / color:danger',
      'label':           'text-sm / weight-600 / color:mid',
      'h2':              'text-2xl / weight-800 / border-accent',
      'h3':              'text-xl / weight-700',
    };

    Object.entries(tokenMap).forEach(([selector, token]) => {
      document.querySelectorAll(selector).forEach(el => {
        el.setAttribute('data-token', token);
      });
    });

    // Adiciona painel de tokens no canto
    const panel = document.createElement('div');
    panel.style.cssText = `
      position:fixed; bottom:16px; right:16px; z-index:99999;
      background:#111; color:#7dd3fc; font:600 11px/1.6 monospace;
      padding:12px 16px; border-radius:8px;
      max-width:260px; box-shadow:0 4px 16px rgba(0,0,0,.4);
    `;
    panel.innerHTML = `
      <div style="color:#fff;font-size:13px;margin-bottom:8px">🎨 Handoff Mode</div>
      <div>Passe o mouse sobre qualquer elemento para ver os tokens.</div>
      <div style="margin-top:8px;color:#86efac">?handoff=true ativo</div>
    `;
    document.body.appendChild(panel);
  }

  /* ── WCAG: Announce form step changes ──────────────────── */
  function patchStepNavigation() {
    const origNext = window.nextStep;
    const origPrev = window.prevStep;

    if (origNext) {
      window.nextStep = function () {
        origNext();
        const activeStep = document.querySelector('.step-tab.active');
        if (activeStep) {
          const stepNum = activeStep.getAttribute('data-step') || '';
          announcePageChange(`Etapa ${stepNum}`);
        }
      };
    }
    if (origPrev) {
      window.prevStep = function () {
        origPrev();
        const activeStep = document.querySelector('.step-tab.active');
        if (activeStep) {
          const stepNum = activeStep.getAttribute('data-step') || '';
          announcePageChange(`Etapa ${stepNum} — retornou`);
        }
      };
    }
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    markRequiredFields();
    initFileEmptyState();
    initConsultaEmptyState();
    initModalFocusTrap();
    initEscapeClose();
    initHandoffTokens();
    patchStepNavigation();

    // Expõe buildErrorSummary globalmente para uso em script.js
    window.buildErrorSummary = buildErrorSummary;

    console.info('[melhorias.js] Melhorias carregadas: Empty States · WCAG · Handoff · CRAP');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

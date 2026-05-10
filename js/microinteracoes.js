/**
 * WebDenúncia — Patch de Microinterações
 * Adicione ao final do <body>, após script.js:
 * <script src="microinteracoes.js"></script>
 *
 * Não modifica o script.js original.
 * Intercepta e enriquece as funções existentes.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     UTILIDADES
  ───────────────────────────────────────────── */
  function raf(fn) { requestAnimationFrame(fn); }

  /** Adiciona a classe, remove depois de ms milissegundos */
  function pulseClass(el, cls, ms) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms || 600);
  }

  /* ─────────────────────────────────────────────
     1. MODAIS — adiciona .active / .closing ao overlay
        O style.css original usa display:flex/.block para
        mostrar/ocultar. Adicionamos as classes de transição
        em cima do comportamento existente.
  ───────────────────────────────────────────── */
  function patchModais() {
    const origOpen  = window.openModal;
    const origClose = window.closeModal;

    window.openModal = function (id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;

      // Chama original (que faz display:flex)
      if (typeof origOpen === 'function') origOpen(id);

      // Força reflow para a transição funcionar
      overlay.classList.remove('closing');
      raf(() => raf(() => overlay.classList.add('active')));
    };

    window.closeModal = function (id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;

      overlay.classList.add('closing');
      overlay.classList.remove('active');

      // Remove closing e deixa o original esconder após a animação
      const dur = 200;
      setTimeout(() => {
        overlay.classList.remove('closing');
        if (typeof origClose === 'function') origClose(id);
      }, dur);
    };

    // Patches para modais com funções próprias
    const specialClosers = [
      { fn: 'closeTutorial',           id: 'modal-tutorial'  },
      { fn: 'closeTutorialAndDenuncia',id: 'modal-tutorial'  },
      { fn: 'fecharSucesso',           id: 'modal-sucesso'   },
      { fn: 'irParaAcompanhar',        id: 'modal-sucesso'   },
    ];

    specialClosers.forEach(({ fn, id }) => {
      const orig = window[fn];
      window[fn] = function (...args) {
        const overlay = document.getElementById(id);
        if (overlay) {
          overlay.classList.add('closing');
          overlay.classList.remove('active');
          setTimeout(() => {
            overlay.classList.remove('closing');
            if (typeof orig === 'function') orig.apply(this, args);
          }, 200);
        } else {
          if (typeof orig === 'function') orig.apply(this, args);
        }
      };
    });

    // openDenuncia abre modal-aviso — patch
    const origOpenDenuncia = window.openDenuncia;
    window.openDenuncia = function (...args) {
      if (typeof origOpenDenuncia === 'function') origOpenDenuncia.apply(this, args);
      raf(() => {
        ['modal-aviso', 'modal-tutorial'].forEach(id => {
          const el = document.getElementById(id);
          if (el && el.style.display !== 'none' && !el.classList.contains('active')) {
            raf(() => el.classList.add('active'));
          }
        });
      });
    };

    // proceedToDenuncia fecha modal-aviso
    const origProceed = window.proceedToDenuncia;
    window.proceedToDenuncia = function (...args) {
      window.closeModal('modal-aviso');
      setTimeout(() => {
        if (typeof origProceed === 'function') origProceed.apply(this, args);
      }, 200);
    };
  }

  /* ─────────────────────────────────────────────
     2. STEPPER — transição entre etapas
        Sobrescreve a troca de .active no step-form
        para animar entrada/saída.
  ───────────────────────────────────────────── */
  function patchStepper() {
    let currentStepIndex = 1;

    function animateStep(fromIdx, toIdx) {
      const fromEl = document.getElementById('form-step-' + fromIdx);
      const toEl   = document.getElementById('form-step-' + toIdx);
      if (!fromEl || !toEl) return;

      const goingForward = toIdx > fromIdx;

      // Prepara o "para onde vai"
      toEl.style.display = 'block';
      toEl.classList.remove('active', 'exiting', 'entering-back');
      toEl.style.transform = goingForward ? 'translateX(20px)' : 'translateX(-20px)';
      toEl.style.opacity   = '0';

      // Sai o atual
      fromEl.classList.add('exiting');
      fromEl.classList.remove('active');

      raf(() => raf(() => {
        // Entra o novo
        toEl.style.transform = '';
        toEl.style.opacity   = '';
        toEl.classList.add('active');

        // Remove o anterior
        setTimeout(() => {
          fromEl.style.display = 'none';
          fromEl.classList.remove('exiting');
        }, 240);
      }));
    }

    // Intercepta nextStep / prevStep
    const origNext = window.nextStep;
    const origPrev = window.prevStep;

    window.nextStep = function (...args) {
      const prev = currentStepIndex;
      if (typeof origNext === 'function') origNext.apply(this, args);
      // Descobre nova etapa ativa
      const newActive = _getActiveStepIndex();
      if (newActive !== prev) {
        animateStep(prev, newActive);
        currentStepIndex = newActive;
      }
    };

    window.prevStep = function (...args) {
      const prev = currentStepIndex;
      if (typeof origPrev === 'function') origPrev.apply(this, args);
      const newActive = _getActiveStepIndex();
      if (newActive !== prev) {
        animateStep(prev, newActive);
        currentStepIndex = newActive;
      }
    };

    function _getActiveStepIndex() {
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById('form-step-' + i);
        if (el && el.classList.contains('active')) return i;
      }
      return currentStepIndex;
    }
  }

  /* ─────────────────────────────────────────────
     3. FAQ ACCORDION — animação suave
        Substitui o toggleFaq original para usar
        max-height em vez de display.
  ───────────────────────────────────────────── */
  function patchFaq() {
    window.toggleFaq = function (btn) {
      const item    = btn.closest('.faq-item');
      const answer  = item.querySelector('.faq-a');
      const isOpen  = answer.classList.contains('open');

      // Fecha todos
      document.querySelectorAll('.faq-a.open').forEach(a => {
        a.classList.remove('open');
        a.style.display = '';
        const q = a.previousElementSibling;
        if (q) q.setAttribute('aria-expanded', 'false');
        a.setAttribute('aria-hidden', 'true');
      });

      // Abre este (se estava fechado)
      if (!isOpen) {
        answer.style.display = 'block'; // garante visível para max-height
        raf(() => answer.classList.add('open'));
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    };
  }

  /* ─────────────────────────────────────────────
     4. BOTÕES DE COPY — feedback visual
  ───────────────────────────────────────────── */
  function patchCopy() {
    const origCopy = window.copiarProtocolo;
    window.copiarProtocolo = function (...args) {
      if (typeof origCopy === 'function') origCopy.apply(this, args);

      // Flash nos botões de copiar
      document.querySelectorAll('.btn-copy-text, .btn-copy-icon').forEach(btn => {
        pulseClass(btn, 'copied', 500);
      });
    };
  }

  /* ─────────────────────────────────────────────
     5. INPUTS — shake ao erro
        Observa os .field-error e agita o campo pai
        quando o texto muda para não-vazio.
  ───────────────────────────────────────────── */
  function patchErrorShake() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'childList' || m.type === 'characterData') {
          const errEl = m.target.nodeType === 3
            ? m.target.parentElement
            : m.target;
          if (!errEl || !errEl.classList.contains('field-error')) return;
          if (errEl.textContent.trim()) {
            const group = errEl.closest('.form-group');
            const input = group && (group.querySelector('.form-input') ||
                                    group.querySelector('.form-select') ||
                                    group.querySelector('.form-textarea'));
            if (input) pulseClass(input, 'error-shake', 500);
          }
        }
      });
    });

    document.querySelectorAll('.field-error').forEach(el => {
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ─────────────────────────────────────────────
     6. PAGE TRANSITIONS
        Adiciona .active na página visível.
  ───────────────────────────────────────────── */
  function patchPageTransitions() {
    // Inicializa página ativa
    raf(() => {
      document.querySelectorAll('.page.active').forEach(p => {
        // Já tem a classe; faz a transição aparecer
        p.style.opacity = '0';
        p.style.transform = 'translateY(12px)';
        raf(() => {
          p.style.transition = 'opacity 300ms ease, transform 300ms ease';
          p.style.opacity    = '';
          p.style.transform  = '';
        });
      });
    });

    const origShowPage = window.showPage;
    window.showPage = function (page, ...rest) {
      if (typeof origShowPage === 'function') origShowPage.call(this, page, ...rest);
      // Anima a nova página ativa
      raf(() => {
        document.querySelectorAll('.page.active').forEach(p => {
          p.style.opacity   = '0';
          p.style.transform = 'translateY(12px)';
          raf(() => {
            p.style.transition = 'opacity 300ms ease, transform 300ms ease';
            p.style.opacity    = '';
            p.style.transform  = '';
          });
        });
      });
    };
  }

  /* ─────────────────────────────────────────────
     7. DRAG-OVER visual na área de upload
  ───────────────────────────────────────────── */
  function patchUpload() {
    const area = document.getElementById('upload-area');
    if (!area) return;

    area.addEventListener('dragenter', () => area.classList.add('drag-over'));
    area.addEventListener('dragleave', e => {
      if (!area.contains(e.relatedTarget)) area.classList.remove('drag-over');
    });
    area.addEventListener('drop', () => area.classList.remove('drag-over'));
  }

  /* ─────────────────────────────────────────────
     INICIALIZAÇÃO
  ───────────────────────────────────────────── */
  function init() {
    patchModais();
    patchStepper();
    patchFaq();
    patchCopy();
    patchErrorShake();
    patchPageTransitions();
    patchUpload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

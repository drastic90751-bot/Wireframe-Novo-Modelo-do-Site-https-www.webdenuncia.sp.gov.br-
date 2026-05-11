

(function () {
  'use strict';


  function raf(fn) { requestAnimationFrame(fn); }


  function pulseClass(el, cls, ms) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms || 600);
  }


  function patchModais() {
    const origOpen  = window.openModal;
    const origClose = window.closeModal;

    window.openModal = function (id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      if (typeof origOpen === 'function') origOpen(id);
      overlay.classList.remove('closing');
      raf(() => raf(() => overlay.classList.add('active')));
    };

    window.closeModal = function (id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;

      overlay.classList.add('closing');
      overlay.classList.remove('active');
      const dur = 200;
      setTimeout(() => {
        overlay.classList.remove('closing');
        if (typeof origClose === 'function') origClose(id);
      }, dur);
    };
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
    const origProceed = window.proceedToDenuncia;
    window.proceedToDenuncia = function (...args) {
      window.closeModal('modal-aviso');
      setTimeout(() => {
        if (typeof origProceed === 'function') origProceed.apply(this, args);
      }, 200);
    };
  }


  function patchStepper() {
    let currentStepIndex = 1;

    function animateStep(fromIdx, toIdx) {
      const fromEl = document.getElementById('form-step-' + fromIdx);
      const toEl   = document.getElementById('form-step-' + toIdx);
      if (!fromEl || !toEl) return;

      const goingForward = toIdx > fromIdx;
      toEl.style.display = 'block';
      toEl.classList.remove('active', 'exiting', 'entering-back');
      toEl.style.transform = goingForward ? 'translateX(20px)' : 'translateX(-20px)';
      toEl.style.opacity   = '0';
      fromEl.classList.add('exiting');
      fromEl.classList.remove('active');

      raf(() => raf(() => {
        toEl.style.transform = '';
        toEl.style.opacity   = '';
        toEl.classList.add('active');
        setTimeout(() => {
          fromEl.style.display = 'none';
          fromEl.classList.remove('exiting');
        }, 240);
      }));
    }
    const origNext = window.nextStep;
    const origPrev = window.prevStep;

    window.nextStep = function (...args) {
      const prev = currentStepIndex;
      if (typeof origNext === 'function') origNext.apply(this, args);
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


  function patchFaq() {
    window.toggleFaq = function (btn) {
      const item    = btn.closest('.faq-item');
      const answer  = item.querySelector('.faq-a');
      const isOpen  = answer.classList.contains('open');
      document.querySelectorAll('.faq-a.open').forEach(a => {
        a.classList.remove('open');
        a.style.display = '';
        const q = a.previousElementSibling;
        if (q) q.setAttribute('aria-expanded', 'false');
        a.setAttribute('aria-hidden', 'true');
      });
      if (!isOpen) {
        answer.style.display = 'block'; // garante visível para max-height
        raf(() => answer.classList.add('open'));
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    };
  }


  function patchCopy() {
    const origCopy = window.copiarProtocolo;
    window.copiarProtocolo = function (...args) {
      if (typeof origCopy === 'function') origCopy.apply(this, args);
      document.querySelectorAll('.btn-copy-text, .btn-copy-icon').forEach(btn => {
        pulseClass(btn, 'copied', 500);
      });
    };
  }


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


  function patchPageTransitions() {
    raf(() => {
      document.querySelectorAll('.page.active').forEach(p => {
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


  function patchUpload() {
    const area = document.getElementById('upload-area');
    if (!area) return;

    area.addEventListener('dragenter', () => area.classList.add('drag-over'));
    area.addEventListener('dragleave', e => {
      if (!area.contains(e.relatedTarget)) area.classList.remove('drag-over');
    });
    area.addEventListener('drop', () => area.classList.remove('drag-over'));
  }


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

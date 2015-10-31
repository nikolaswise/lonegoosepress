var dom = require('dom')

function modal (domNode) {
  var wrapper = document.querySelector('.wrapper');
  var toggles = dom.findElements('.js-modal-toggle', domNode);
  var modals = dom.findElements('.js-modal', domNode);
  var lastOn;

  function fenceModal (e) {
    if ( !dom.closest('js-modal', e.target)) {
      modals.forEach(function (modal) {
        if (dom.hasClass(modal, 'is-active')) {
          modal.focus();
        }
      });
    }
  }

  function escapeCloseModal (e) {
    if (e.keyCode === 27) {
      modals.forEach(function (modal) {
        dom.removeClass(modal, 'is-active');
        modal.removeAttribute('tabindex');
      });
      lastOn.focus();
      dom.removeEvent(document, 'keyup', escapeCloseModal);
      dom.removeEvent(document, 'focusin', fenceModal);
    }
  }

  function bindModalToggle (e) {
    dom.preventDefault(e);
    var toggle = e.target;
    var modal;
    var modalId = toggle.getAttribute('data-modal');
    if (modalId) {
      modal = document.querySelector('.js-modal[data-modal="' + modalId + '"]');
    } else {
      modal = dom.closest('js-modal', toggle);
    }

    var isOpen = dom.hasClass(modal, 'is-active');
    dom.toggleActive(modals, modal);

    if (isOpen) {
      dom.removeEvent(document, 'keyup', escapeCloseModal);
      dom.removeEvent(document, 'focusin', fenceModal);
      lastOn.focus();
      modal.removeAttribute('tabindex');
    } else {
      dom.addEvent(document, 'keyup', escapeCloseModal);
      dom.addEvent(document, 'focusin', fenceModal);
      lastOn = toggle;
      modal.setAttribute('tabindex', 0);
      modal.focus();
    }
  }

  toggles.forEach(function (toggle) {
    dom.addEvent(toggle, dom.click(), bindModalToggle);
  });

  modals.forEach(function (modal) {
    dom.addEvent(modal, dom.click(), function (e) {
      if (dom.eventTarget(e) === modal) {
        dom.toggleActive(modals, modal);
        dom.removeEvent(document, 'keyup', escapeCloseModal);
      }
    });
  });
};

module.exports = modal

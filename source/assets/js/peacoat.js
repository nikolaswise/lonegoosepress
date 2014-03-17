/*
┌─────────────────────────────────────────────────┐
│ Peacoat.js v1.0.0                               │
├─────────────────────────────────────────────────┤
│ Short Fork off Tailcoat.js v1.0.0               │
├─────────────────────────────────────────────────┤
│ arcgis.github.io/tailcoat                       │
├─────────────────────────────────────────────────┤
│ Free to use under the Apache 2.0 License.       │
│ http://www.apache.org/licenses/LICENSE-2.0      │
└─────────────────────────────────────────────────┘
*/

(function Peacoat () {
var T = {
  version: '1.0.0'
};

// ┌───────────────┐
// │ DOM utilities │
// └───────────────┘

var dom = T.utils = {};

// ┌──────────────────────┐
// │ DOM event management │
// └──────────────────────┘

// detect touch device
dom.isTouch = function () {
  if (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0)) {
    return true;
  }
  return false;
};

// returns standard interaction event based on touch support
dom.event = function () {
  return dom.isTouch() ? 'touchstart' : 'click';
};

// add a callback function to an event on an element
dom.addEvent = function (el, event, fn) {
  if (el.addEventListener) {
    return el.addEventListener(event, fn, false);
  }
  if (el.attachEvent) {
    return el.attachEvent('on' + event, fn);
  }
};

dom.removeEvent = function (el, event, fn) {
  if (el.removeEventListener) {
    return el.removeEventListener(event, fn, false);
  }
  if (el.detachEvent) {
    return el.detachEvent('on' + event,  fn);
  }
};

// get the target element of an event
dom.eventTarget = function (event) {
  if (!event.target) {
    return event.srcElement;
  }
  if (event.target) {
    return event.target;
  }
};

// prevent default behavior of an event
dom.preventDefault = function (event) {
  if (event.preventDefault) {
    return event.preventDefault();
  }
  if (event.returnValue) {
    event.returnValue = false;
  }
};

// stop and event from bubbling up the DOM tree
dom.stopPropagation = function (event) {
  event = event || window.event;
  if (event.stopPropagation) {
    return event.stopPropagation();
  }
  if (event.cancelBubble) {
    event.cancelBubble = true;
  }
};

// ┌────────────────────┐
// │ class manipulation │
// └────────────────────┘

// check if an element has a specific class
dom.hasClass = function (elem, className) {
  var exp = new RegExp(' ' + className + ' ');
  if (exp.test(' ' + elem.className + ' ')) {
    return true;
  }

  return false;
};

// add one or more classes to an element
dom.addClass = function (elem, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    if (!dom.hasClass(elem, classes[i])) {
      elem.className += ' ' + classes[i];
    }
  }
};

// remove one or more classes from an element
dom.removeClass = function (elem, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';

    if (dom.hasClass(elem, classes[i])) {
      while (newClass.indexOf(' ' + classes[i] + ' ') >= 0) {
        newClass = newClass.replace(' ' + classes[i] + ' ', ' ');
      }

      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  }
};

// ┌───────────────┐
// │ DOM traversal │
// └───────────────┘

// returns closest element up the DOM tree matching a given class
dom.closest = function (className, context) {
  var result, current;
  for (current = context; current; current = current.parentNode) {
    if (current.nodeType === 1 && dom.hasClass(current, className)) {
      result = current;
      break;
    }
  }
  return current;
};

dom.getAttr = function(el, attr) {
  if (el.getAttribute) {
    return el.getAttribute(attr);
  }

  var result;
  var attrs = el.attributes;

  for (var i = 0; i < attrs.length; i++) {
    if (attrs[i].nodeName === attr) {
      result = attrs[i].nodeValue;
    }
  }

  return result;
};

// ┌──────┐
// │ misc │
// └──────┘

// return the index of an object in an array with optional offset
dom.indexOf = function (obj, arr, offset) {
  var i = offset || 0;

  if (arr.indexOf) {
    return arr.indexOf(obj, i);
  }

  for (i; i < arr.length; i++) {
    if (arr[i] === obj) {
      return i;
    }
  }

  return -1;
};

dom.makeArray = function (object) {
  var array = [];
  for (var i = 0; i < object.length; i++) {
    array.push(object[i]);
  }
  return array;
};

dom.isIE8 = function () {
  var html = document.getElementsByTagName('html')[0];
  if (dom.hasClass(html, 'ie8')){
    return true;
  } else {
    return false;
  }
};

// ┌───────────────┐
// │ JS Components │
// └───────────────┘

// ┌───────────┐
// │ ACCORDION │
// └───────────┘
// Collapsible accordion list

T.accordion = function () {
  var accordions = document.querySelectorAll('.accordion');

  if (accordions.length > 0) {
    for (var i = 0; i < accordions.length; i++) {
      var children = accordions[i].children;

      for (var j = 0; j < children.length; j++) {
        dom.addEvent(children[j], dom.event(), toggleAccordion);
      }
    }
  }
};

function toggleAccordion (event) {
  var parent = dom.closest('accordion-section', event.target);

  var children = dom.closest('accordion', parent).children;

  for (var i = 0; i < children.length; i++){
    dom.removeClass(children[i], 'active');
  }

  dom.addClass(parent, 'active');
}

// ┌────────┐
// │ DRAWER │
// └────────┘
// Toggleable menu drawer

T.drawer = function () {

  var drawer  = document.querySelector('.drawer');
  var buttons = dom.makeArray(document.querySelectorAll('.drawer-toggle'));

  if (buttons.length === 0) {
    return;
  }

  dom.addEvent(drawer, dom.event(), function(event) {
    var html = document.querySelector('html');
    var isDrawer = dom.hasClass(dom.eventTarget(event), 'drawer');

    if (isDrawer) {
      dom.preventDefault(event);
      dom.stopPropagation(event);

      dom.removeClass(drawer, 'active-left active-right active-top');
      dom.removeClass(html, 'scroll-lock');

      setTimeout(function(){
        drawer.style.display = 'none';
      }, 250);
    }
  });

  for (var i = 0; i < buttons.length; i++) {
    bindDrawerToggle(buttons[i], drawer);
  }
};

function bindDrawerToggle (el, drawer) {

  dom.addEvent(el, dom.event(), function(event) {
    var direction = dom.getAttr(el, 'data-direction');
    var html = document.querySelector('html');

    dom.stopPropagation(event);
    dom.preventDefault(event);

    drawer.style.display = 'block';

    setTimeout(function(){
      dom.addClass(drawer, direction);
      dom.addClass(html, 'scroll-lock');
    }, 0);
  });
}

// ┌───────┐
// │ MODAL │
// └───────┘
// dismissable modal dialog box

T.modal = function () {
  var buttons = document.querySelectorAll('.modal-show');

  if (buttons.length > 0) {
    for (var i = 0; i < buttons.length; i++) {
      bindModalShow(buttons[i]);
    }

    bindModalDismiss();
  }
};

function bindModalShow (button) {
  var modal;
  var modalId = dom.getAttr(button, 'data-modal');
  var modals = document.querySelectorAll('.modal');

  for (var i = 0; i < modals.length; i++) {
    if (dom.getAttr(modals[i], 'data-modal') === modalId) {
      modal = modals[i];
      break;
    }
  }

  if (modal !== null && typeof modal !== 'undefined') {
    dom.addEvent(button, dom.event(), function(event) {
      var overlay = document.querySelector('.modal-overlay');
      var html = document.querySelector('html');

      dom.stopPropagation(event);
      dom.preventDefault(event);

      dom.addClass(html, 'scroll-lock');
      dom.addClass(overlay, 'visible');
      dom.addClass(modal, 'visible');

      if ((modal.offsetHeight + 50) < document.documentElement.clientHeight) {
        modal.style.marginTop = (modal.offsetHeight / -2) + 'px';
        dom.addClass(modal, 'vertically-centered');
      }
    });
  }
}

function bindModalDismiss () {
  var buttons = document.querySelectorAll('.modal-dismiss');
  var overlay = document.querySelector('.modal-overlay');

  if (buttons.length > 0) {
    // bind close modal to every modal-dismiss button
    for (var i = 0; i < buttons.length; i++) {
      dom.addEvent(buttons[i], dom.event(), closeModal);
    }
  }

  dom.addEvent(overlay, dom.event(), closeModal);
}

function closeModal (event) {

  var hasOverlay = dom.hasClass(dom.eventTarget(event), 'modal-overlay');
  var hasDismiss = dom.hasClass(dom.eventTarget(event), 'modal-dismiss');

  if (!hasOverlay && !hasDismiss) {
    return;
  }

  var modals = document.querySelectorAll('.modal');
  var overlay = document.querySelector('.modal-overlay');
  var html = document.querySelector('html');

  dom.stopPropagation(event);
  dom.preventDefault(event);

  for (var j = 0; j < modals.length; j++) {
    dom.removeClass(modals[j], 'visible');
  }

  dom.removeClass(html, 'scroll-lock');
  dom.removeClass(overlay, 'visible');
}

// ┌─────────────────┐
// │ Expose Peacoat  │
// └─────────────────┘
// implementation borrowed from Leaflet

function expose () {
  var oldT = window.T;

  T.noConflict = function () {
    window.T = oldT;
    return this;
  };

  window.T = T;
}

// define Peacoat for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = T;
}

// define Peacoat as an AMD module
else if (typeof define === 'function' && define.amd) {
  define(T);
}

// define Peacoat as a global T variable, saving the original T to restore later if needed
else {
  expose();
}

})();

T.drawer();

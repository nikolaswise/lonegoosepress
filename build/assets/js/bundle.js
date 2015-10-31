(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// ┌────────────┐
// │ Cart Stuff │
// └────────────┘

var cart = function (options) {
  var name = options.name
  var emptyModel = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  }

  var set = function (model) {
    window.sessionStorage.setItem(name, JSON.stringify(model))
  }

  set(emptyModel)

  return {
    set: set,

    get: function () {
      var model = JSON.parse(window.sessionStorage.getItem(name))
      model.itemCount = 0
      model.subtotal = 0
      model.items.forEach(function (item){
        model.subtotal += (item.price * item.num)
        model.itemCount += item.num
      })
      model.total = model.subtotal + model.shipping
      return model
    },

    clear: function () {
      cart.set(emptyModel)
    },

    getItemIds: function () {
      var model = cart.get()
      return model.items.map( function (item){
        return item.id
      })
    },

    addItem: function (id, num, price) {
      var model = cart.get()
      var item = {
        id: id,
        price: price,
        num: num
      }
      if (!cart.hasItem(id)) {
        model.items.push(item)
      } else {
        var i = cart.getItemIds().indexOf(id)
        model.items[i].num += num
      }
      cart.set(model)
    },

    hasItem: function (id) {
      var model = cart.get()
      var itemIds = cart.getItemIds()
      return itemIds.indexOf(id) > -1
    },

    incrementItem: function(id, num) {
      var model = cart.get()
      var i = cart.getItemIds().indexOf(id)
      model.items[i].num += num
      cart.set(model)
    },

    setItemCount: function(id, num) {
      var model = cart.get()
      var i = cart.getItemIds().indexOf(id)
      model.items[i].num = num
      cart.set(model)
    },

    submit: function (cb) {
      var model = cart.get()
      console.log('do something salesy with this', model)
      cb(model)
    }
  }
}

module.exports = cart
},{}],2:[function(require,module,exports){
var dom = {
  version: 'v1.0.0',
  click: click,
  addEvent: addEvent,
  removeEvent: removeEvent,
  eventTarget: eventTarget,
  preventDefault: preventDefault,
  stopPropagation: stopPropagation,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  closest: closest,
  removeActive: removeActive,
  toggleActive: toggleActive,
  findElements: findElements,
  nodeListToArray: nodeListToArray,
  throttle: throttle
};

// ┌──────────────────────┐
// │ DOM Event Management │
// └──────────────────────┘

// returns standard interaction event, later will add touch support
function click () {
  return 'click';
}

// add a callback function to an event on a DOM node
function addEvent (domNode, e, fn) {
  if (domNode.addEventListener) {
    return domNode.addEventListener(e, fn, false);
  } else if (domNode.attachEvent) {
    return domNode.attachEvent('on' + e, fn);
  }
}

// remove a specific function binding from a DOM node event
function removeEvent (domNode, e, fn) {
  if (domNode.removeEventListener) {
    return domNode.removeEventListener(e, fn, false);
  } else if (domNode.detachEvent) {
    return domNode.detachEvent('on' + e,  fn);
  }
}

// get the target element of an event
function eventTarget (e) {
  return e.target || e.srcElement;
}

// prevent default behavior of an event
function preventDefault (e) {
  if (e.preventDefault) {
    return e.preventDefault();
  } else if (e.returnValue) {
    e.returnValue = false;
  }
}

// stop and event from bubbling up the DOM tree
function stopPropagation (e) {
  e = e || window.event;
  if (e.stopPropagation) {
    return e.stopPropagation();
  }
  if (e.cancelBubble) {
    e.cancelBubble = true;
  }
}

// return a funciton that will only execute
// once it is NOT called for delay milliseconds
function throttle(fn, time, context) {
  var lock, args, wrapperFn, later;

  later = function () {
    // reset lock and call if queued
    lock = false;
    if (args) {
      wrapperFn.apply(context, args);
      args = false;
    }
  };

  wrapperFn = function () {
    if (lock) {
      // called too soon, queue to call later
      args = arguments;
    } else {
      // call and lock until later
      fn.apply(context, arguments);
      setTimeout(later, time);
      lock = true;
    }
  };

  return wrapperFn;
}

// ┌────────────────────┐
// │ Class Manipulation │
// └────────────────────┘

// check if an element has a specific class
function hasClass (domNode, className) {
  var elementClass = ' ' + domNode.className + ' ';
  return elementClass.indexOf(' ' + className + ' ') !== -1;
}

// add one or more classes to an element
function addClass (domNode, classes) {
  classes.split(' ').forEach(function (c) {
    if (!hasClass(domNode, c)) {
      domNode.className += ' ' + c;
    }
  });
}

// remove one or more classes from an element
function removeClass (domNode, classes) {
  var elementClass = ' ' + domNode.className + ' ';
  classes.split(' ').forEach(function (c) {
    elementClass = elementClass.replace(' ' + c + ' ', ' ');
  });
  domNode.className = elementClass.trim();
}

// if domNode has the class, remove it, else add it
function toggleClass (domNode, className) {
  if (hasClass(domNode, className)) {
    removeClass(domNode, className);
  } else {
    addClass(domNode, className);
  }
}

// ┌────────────────┐
// │ DOM Management │
// └────────────────┘

function findElements (query, domNode) {
  var context = domNode || document;
  var elements = context.querySelectorAll(query);
  return nodeListToArray(elements);
}

// returns closest element up the DOM tree matching a given class
function closest (className, context) {
  var result, current;
  for (current = context; current; current = current.parentNode) {
    if (current.nodeType === 1 && hasClass(current, className)) {
      result = current;
      break;
    }
  }
  return current;
}

// remove 'is-active' class from every element in an array
function removeActive (array) {
  if (typeof array == 'object') {
    array = nodeListToArray(array);
  }
  array.forEach(function (item) {
    removeClass(item, 'is-active');
  });
}

// remove 'is-active' from array, add to element
function toggleActive (array, el) {
  var isActive = hasClass(el, 'is-active')
  if (isActive) {
    removeClass(el, 'is-active')
  } else {
    removeActive(array)
    addClass(el, 'is-active')
  }
}


// turn a domNodeList into an array
function nodeListToArray (domNodeList) {
  return Array.prototype.slice.call(domNodeList);
}

module.exports = dom

},{}],3:[function(require,module,exports){
"use strict";

var dom = require("dom");
var Cart = require("cart");

var expandingNav = require("./navigation");
var modal = require("./modal");

var cart = Cart("lgpCart");

// ┌─────────────────────┐
// │ Cart Implementation │
// └─────────────────────┘
cart.count = function () {
  var cartCounter = document.querySelector(".js-cart-counter");
  var myCart = cart.get();
  cartCounter.innerHTML = myCart.itemCount;
};

window.cart = cart;

expandingNav();
modal();
cart.count();

},{"./modal":4,"./navigation":5,"cart":1,"dom":2}],4:[function(require,module,exports){
"use strict";

var dom = require("dom");

function modal(domNode) {
  var wrapper = document.querySelector(".wrapper");
  var toggles = dom.findElements(".js-modal-toggle", domNode);
  var modals = dom.findElements(".js-modal", domNode);
  var lastOn;

  function fenceModal(e) {
    if (!dom.closest("js-modal", e.target)) {
      modals.forEach(function (modal) {
        if (dom.hasClass(modal, "is-active")) {
          modal.focus();
        }
      });
    }
  }

  function escapeCloseModal(e) {
    if (e.keyCode === 27) {
      modals.forEach(function (modal) {
        dom.removeClass(modal, "is-active");
        modal.removeAttribute("tabindex");
      });
      lastOn.focus();
      dom.removeEvent(document, "keyup", escapeCloseModal);
      dom.removeEvent(document, "focusin", fenceModal);
    }
  }

  function bindModalToggle(e) {
    dom.preventDefault(e);
    var toggle = e.target;
    var modal;
    var modalId = toggle.getAttribute("data-modal");
    if (modalId) {
      modal = document.querySelector(".js-modal[data-modal=\"" + modalId + "\"]");
    } else {
      modal = dom.closest("js-modal", toggle);
    }

    var isOpen = dom.hasClass(modal, "is-active");
    dom.toggleActive(modals, modal);

    if (isOpen) {
      dom.removeEvent(document, "keyup", escapeCloseModal);
      dom.removeEvent(document, "focusin", fenceModal);
      lastOn.focus();
      modal.removeAttribute("tabindex");
    } else {
      dom.addEvent(document, "keyup", escapeCloseModal);
      dom.addEvent(document, "focusin", fenceModal);
      lastOn = toggle;
      modal.setAttribute("tabindex", 0);
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
        dom.removeEvent(document, "keyup", escapeCloseModal);
      }
    });
  });
};

module.exports = modal;

},{"dom":2}],5:[function(require,module,exports){
"use strict";

var dom = require("dom");

// ┌────────────┐
// │ Navigation │
// └────────────┘
function expandingNav(domNode) {
  var toggles = dom.findElements(".js-expanding-toggle", domNode);
  var sections = document.querySelectorAll(".js-expanding");

  toggles.forEach(function (toggle) {
    dom.addEvent(toggle, dom.click(), function (e) {
      dom.preventDefault(e);

      var sectionId = toggle.getAttribute("data-expanding");
      var section = document.querySelector(".js-expanding[data-expanding=\"" + sectionId + "\"]");
      var isOpen = dom.hasClass(section, "is-active");
      var shouldClose = dom.hasClass(section, "is-active");

      dom.toggleActive(sections, section);

      if (isOpen && shouldClose) {
        dom.removeClass(section, "is-active");
      } else {
        dom.addClass(section, "is-active");
      }
    });
  });
}

module.exports = expandingNav;

},{"dom":2}]},{},[3])
//# sourceMappingURL=bundle.js.map

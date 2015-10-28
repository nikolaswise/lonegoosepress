(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function click() {
  return "click";
}

// add a callback function to an event on a DOM node
function addEvent(domNode, e, fn) {
  if (domNode.addEventListener) {
    return domNode.addEventListener(e, fn, false);
  } else if (domNode.attachEvent) {
    return domNode.attachEvent("on" + e, fn);
  }
}

// remove a specific function binding from a DOM node event
function removeEvent(domNode, e, fn) {
  if (domNode.removeEventListener) {
    return domNode.removeEventListener(e, fn, false);
  } else if (domNode.detachEvent) {
    return domNode.detachEvent("on" + e, fn);
  }
}

// get the target element of an event
function eventTarget(e) {
  return e.target || e.srcElement;
}

// prevent default behavior of an event
function preventDefault(e) {
  if (e.preventDefault) {
    return e.preventDefault();
  } else if (e.returnValue) {
    e.returnValue = false;
  }
}

// turn a domNodeList into an array
function nodeListToArray(domNodeList) {
  return Array.prototype.slice.call(domNodeList);
}

// ┌────────────────────┐
// │ Class Manipulation │
// └────────────────────┘

// check if an element has a specific class
function hasClass(domNode, className) {
  var elementClass = " " + domNode.className + " ";
  return elementClass.indexOf(" " + className + " ") !== -1;
}

// add one or more classes to an element
function addClass(domNode, classes) {
  classes.split(" ").forEach(function (c) {
    if (!hasClass(domNode, c)) {
      domNode.className += " " + c;
    }
  });
}

// remove one or more classes from an element
function removeClass(domNode, classes) {
  var elementClass = " " + domNode.className + " ";
  classes.split(" ").forEach(function (c) {
    elementClass = elementClass.replace(" " + c + " ", " ");
  });
  domNode.className = elementClass.trim();
}

// if domNode has the class, remove it, else add it
function toggleClass(domNode, className) {
  if (hasClass(domNode, className)) {
    removeClass(domNode, className);
  } else {
    addClass(domNode, className);
  }
}

function findElements(query, domNode) {
  var context = domNode || document;
  var elements = context.querySelectorAll(query);
  return nodeListToArray(elements);
}

// remove 'is-active' class from every element in an array
function removeActive(array) {
  if (typeof array == "object") {
    array = nodeListToArray(array);
  }
  array.forEach(function (item) {
    removeClass(item, "is-active");
  });
}

// remove 'is-active' from array, add to element
function toggleActive(array, el) {
  var isActive = hasClass(el, "is-active");
  if (isActive) {
    removeClass(el, "is-active");
  } else {
    removeActive(array);
    addClass(el, "is-active");
  }
}

// ┌────────────┐
// │ Navigation │
// └────────────┘
function expandingNav(domNode) {
  var toggles = findElements(".js-expanding-toggle", domNode);
  var sections = document.querySelectorAll(".js-expanding");

  toggles.forEach(function (toggle) {
    addEvent(toggle, click(), function (e) {
      preventDefault(e);

      var sectionId = toggle.getAttribute("data-expanding");
      var section = document.querySelector(".js-expanding[data-expanding=\"" + sectionId + "\"]");
      var isOpen = hasClass(section, "is-active");
      var shouldClose = hasClass(section, "is-active");

      toggleActive(sections, section);

      if (isOpen && shouldClose) {
        removeClass(section, "is-active");
      } else {
        addClass(section, "is-active");
      }
    });
  });
}

function modal(domNode) {
  var wrapper = document.querySelector(".wrapper");
  var toggles = findElements(".js-modal-toggle", domNode);
  var modals = findElements(".js-modal", domNode);
  var lastOn;

  function fenceModal(e) {
    if (!closest("js-modal", e.target)) {
      modals.forEach(function (modal) {
        if (hasClass(modal, "is-active")) {
          modal.focus();
        }
      });
    }
  }

  function escapeCloseModal(e) {
    if (e.keyCode === 27) {
      modals.forEach(function (modal) {
        removeClass(modal, "is-active");
        modal.removeAttribute("tabindex");
      });
      lastOn.focus();
      removeEvent(document, "keyup", escapeCloseModal);
      removeEvent(document, "focusin", fenceModal);
    }
  }

  function bindModalToggle(e) {
    preventDefault(e);
    var toggle = e.target;
    var modal;
    var modalId = toggle.getAttribute("data-modal");
    if (modalId) {
      modal = document.querySelector(".js-modal[data-modal=\"" + modalId + "\"]");
    } else {
      modal = closest("js-modal", toggle);
    }

    var isOpen = hasClass(modal, "is-active");
    toggleActive(modals, modal);

    if (isOpen) {
      removeEvent(document, "keyup", escapeCloseModal);
      removeEvent(document, "focusin", fenceModal);
      lastOn.focus();
      modal.removeAttribute("tabindex");
    } else {
      addEvent(document, "keyup", escapeCloseModal);
      addEvent(document, "focusin", fenceModal);
      lastOn = toggle;
      modal.setAttribute("tabindex", 0);
      modal.focus();
    }
  }

  toggles.forEach(function (toggle) {
    addEvent(toggle, click(), bindModalToggle);
  });

  modals.forEach(function (modal) {
    addEvent(modal, click(), function (e) {
      if (eventTarget(e) === modal) {
        toggleActive(modals, modal);
        removeEvent(document, "keyup", escapeCloseModal);
      }
    });
  });
};

// ┌────────────┐
// │ Cart Stuff │
// └────────────┘
var cart = {
  clear: function clear() {
    var model = {
      items: [],
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      total: 0 };
    cart.set(model);
  },
  get: function get() {
    var cart = JSON.parse(window.sessionStorage.getItem("lgp-cart"));
    if (!cart) {
      cart.clear();
    }
    cart.itemCount = 0;

    cart.items.forEach(function (item) {
      cart.subtotal += item.price * item.num;
      cart.itemCount += item.num;
    });
    // 5 dollars per item on a flat 5
    cart.shipping = cart.items.length * 5 + 5;
    cart.total = cart.subtotal + cart.shipping;
    return cart;
  },
  set: function set(cart) {
    window.sessionStorage.setItem("lgp-cart", JSON.stringify(cart));
  },
  getItemIds: function getItemIds() {
    var model = cart.get();
    return model.items.map(function (item) {
      return item.id;
    });
  },
  addItem: function addItem(id, num, price) {
    var model = cart.get();
    var item = {
      id: id,
      price: price,
      num: num
    };
    if (!cart.hasItem(id)) {
      console.log("new thingy");
      model.items.push(item);
    } else {
      console.log("allready in there");
      cart.incrementItem(id, num);
    }
    cart.set(model);
  },
  hasItem: function hasItem(id) {
    var model = cart.get();
    var itemIds = cart.getItemIds();
    return itemIds.indexOf(id) > -1;
  },
  incrementItem: function incrementItem(id, num) {
    var model = cart.get();
    var i = cart.getItemIds().indexOf(id);
    model.items[i].num += num;
    cart.set(model);
  },
  setItemCount: function setItemCount(id, num) {
    var model = cart.get();
    var i = cart.getItemIds().indexOf(id);
    model.items[i].num = num;
    cart.set(model);
  },
  submit: function submit() {
    var model = cart.get();
    console.log("do something salesy with this", model);
  }
};

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

},{}]},{},[1])
//# sourceMappingURL=bundle.js.map

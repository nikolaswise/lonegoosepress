(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function Calcite () {

var calcite = {
  version: '0.0.9'
};

// ┌───────────────┐
// │ DOM Utilities │
// └───────────────┘

calcite.dom = {};

// ┌──────────────────────┐
// │ DOM Event Management │
// └──────────────────────┘

// returns standard interaction event, later will add touch support
calcite.dom.event = function () {
  return 'click';
};

// add a callback function to an event on a DOM node
calcite.dom.addEvent = function (domNode, event, fn) {
  if (domNode.addEventListener) {
    return domNode.addEventListener(event, fn, false);
  }
  if (domNode.attachEvent) {
    return domNode.attachEvent('on' + event, fn);
  }
};

// remove a specific function binding from a DOM node event
calcite.dom.removeEvent = function (domNode, event, fn) {
  if (domNode.removeEventListener) {
    return domNode.removeEventListener(event, fn, false);
  }
  if (domNode.detachEvent) {
    return domNode.detachEvent('on' + event,  fn);
  }
};

// get the target element of an event
calcite.dom.eventTarget = function (event) {
  if (!event.target) {
    return event.srcElement;
  }
  if (event.target) {
    return event.target;
  }
};

// prevent default behavior of an event
calcite.dom.preventDefault = function (event) {
  if (event.preventDefault) {
    return event.preventDefault();
  }
  if (event.returnValue) {
    event.returnValue = false;
  }
};

// stop and event from bubbling up the DOM tree
calcite.dom.stopPropagation = function (event) {
  event = event || window.event;
  if (event.stopPropagation) {
    return event.stopPropagation();
  }
  if (event.cancelBubble) {
    event.cancelBubble = true;
  }
};

// ┌────────────────────┐
// │ Class Manipulation │
// └────────────────────┘

// check if an element has a specific class
calcite.dom.hasClass = function (domNode, className) {
  var exp = new RegExp(' ' + className + ' ');
  if (exp.test(' ' + domNode.className + ' ')) {
    return true;
  }

  return false;
};

// add one or more classes to an element
calcite.dom.addClass = function (domNode, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    if (!calcite.dom.hasClass(domNode, classes[i])) {
      domNode.className += ' ' + classes[i];
    }
  }
};

// remove one or more classes from an element
calcite.dom.removeClass = function (domNode, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    var newClass = ' ' + domNode.className.replace( /[\t\r\n]/g, ' ') + ' ';

    if (calcite.dom.hasClass(domNode, classes[i])) {
      while (newClass.indexOf(' ' + classes[i] + ' ') >= 0) {
        newClass = newClass.replace(' ' + classes[i] + ' ', ' ');
      }

      domNode.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  }
};

// ┌───────────────┐
// │ DOM Traversal │
// └───────────────┘

// returns closest element up the DOM tree matching a given class
calcite.dom.closest = function (className, context) {
  var result, current;
  for (current = context; current; current = current.parentNode) {
    if (current.nodeType === 1 && calcite.dom.hasClass(current, className)) {
      result = current;
      break;
    }
  }
  return current;
};

// get an attribute for an element
calcite.dom.getAttr = function(domNode, attr) {
  if (domNode.getAttribute) {
    return domNode.getAttribute(attr);
  }

  var result;
  var attrs = domNode.attributes;

  for (var i = 0; i < attrs.length; i++) {
    if (attrs[i].nodeName === attr) {
      result = attrs[i].nodeValue;
    }
  }

  return result;
};

// ┌───────────────────┐
// │ Object Conversion │
// └───────────────────┘

// turn a domNodeList into an array
calcite.dom.nodeListToArray = function (domNodeList) {
  var array = [];
  for (var i = 0; i < domNodeList.length; i++) {
    array.push(domNodeList[i]);
  }
  return array;
};

// ┌────────────────────┐
// │ Array Manipulation │
// └────────────────────┘

calcite.arr = {};

// return the index of an object in an array with optional offset
calcite.arr.indexOf = function (obj, arr, offset) {
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

// ┌───────────────────────────┐
// │ Browser Feature Detection │
// └───────────────────────────┘
// detect features like touch, ie, etc.

calcite.browser = {};

// detect touch, could be improved for more coverage
calcite.browser.isTouch = function () {
  if (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0)) {
    return true;
  }
  return false;
};

// ┌─────────────┐
// │ JS Patterns │
// └─────────────┘
// javascript logic for ui patterns

function findElements (className) {
  var elements = document.querySelectorAll(className);
  if (elements.length) {
    return calcite.dom.nodeListToArray(elements);
  } else {
    return false;
  }
}

// remove 'is-active' class from every element in an array
function removeActive (array) {
  if (typeof array == 'object') {
    array = calcite.dom.nodeListToArray(array);
  }
  array.forEach(function (item) {
    calcite.dom.removeClass(item, 'is-active');
  });
}

// remove 'is-active' from array, add to element
function toggleActive (array, el) {
  var isActive = calcite.dom.hasClass(el, 'is-active');
  if (isActive) {
    calcite.dom.removeClass(el, 'is-active');
  } else {
    removeActive(array);
    calcite.dom.addClass(el, 'is-active');
  }
}

// ┌───────────┐
// │ Accordion │
// └───────────┘
// collapsible accordion list

calcite.accordion = function () {
  var accordions = findElements('.js-accordion');

  if (!accordions) {
    return;
  }

  for (var i = 0; i < accordions.length; i++) {
    var children = accordions[i].children;
    for (var j = 0; j < children.length; j++) {
      calcite.dom.addEvent(children[j], calcite.dom.event(), toggleAccordion);
    }
  }

  function toggleAccordion (event) {
    var parent = calcite.dom.closest('accordion-section', calcite.dom.eventTarget(event));
    if (calcite.dom.hasClass(parent, 'is-active')) {
      calcite.dom.removeClass(parent, 'is-active');
    } else {
      calcite.dom.addClass(parent, 'is-active');
    }
  }

};

// ┌──────────┐
// │ Carousel │
// └──────────┘
// show carousel with any number of slides

calcite.carousel = function () {

  var carousels = findElements('.js-carousel');

  if (!carousels) {
    return;
  }

  for (var i = 0; i < carousels.length; i++) {

    var carousel = carousels[i];
    var wrapper = carousel.querySelectorAll('.carousel-slides')[0];
    var slides = carousel.querySelectorAll('.carousel-slide');
    var toggles = calcite.dom.nodeListToArray(carousel.querySelectorAll('.js-carousel-link'));

    wrapper.style.width = slides.length * 100 + '%';

    calcite.dom.addClass(slides[0], 'is-active');
    calcite.dom.addClass(carousel, 'is-first-slide');

    for (var k = 0; k < slides.length; k++) {
      slides[k].style.width = 100 / slides.length + '%';
    }

    for (var j = 0; j < toggles.length; j++) {
      calcite.dom.addEvent(toggles[j], calcite.dom.event(), toggleSlide);
    }

  }

  function toggleSlide (e) {
    calcite.dom.preventDefault(e);
    var link = calcite.dom.eventTarget(e);
    var index = calcite.dom.getAttr(link, 'data-slide');
    var carousel = calcite.dom.closest('carousel', link);
    var current = carousel.querySelectorAll('.carousel-slide.is-active')[0];
    var slides = carousel.querySelectorAll('.carousel-slide');
    var wrapper = carousel.querySelectorAll('.carousel-slides')[0];

    if (index == 'prev') {
      index = calcite.arr.indexOf(current, slides);
      if (index === 0) { index = 1; }
    } else if (index == 'next') {
      index = calcite.arr.indexOf(current, slides) + 2;
      if (index > slides.length) { index = slides.length; }
    }

    calcite.dom.removeClass(carousel, 'is-first-slide is-last-slide');

    if (index == slides.length) { calcite.dom.addClass(carousel, 'is-last-slide'); }
    if (index == 1) { calcite.dom.addClass(carousel, 'is-first-slide'); }

    removeActive(slides);
    calcite.dom.addClass(slides[index - 1], 'is-active');
    var offset = (index - 1)/slides.length * -100 + '%';
    wrapper.style.transform= 'translate3d(' + offset + ',0,0)';
  }

};

// ┌──────────┐
// │ Dropdown │
// └──────────┘
// show and hide dropdown menus

calcite.dropdown = function () {

  var toggles = findElements('.js-dropdown-toggle');
  var dropdowns = findElements('.js-dropdown');

  if (!dropdowns) {
    return;
  }

  function closeAllDropdowns () {
    for (var i = 0; i < dropdowns.length; i++) {
      calcite.dom.removeClass(dropdowns[i], 'is-active');
    }
  }

  function toggleDropdown (dropdown) {
    var isActive = calcite.dom.hasClass(dropdown, 'is-active');
    if (isActive) {
      calcite.dom.removeClass(dropdown, 'is-active');
    } else {
      calcite.dom.stopPropagation();
      closeAllDropdowns();
      calcite.dom.addClass(dropdown, 'is-active');
      calcite.dom.addEvent(document.body, calcite.dom.event(), function(event) {
        closeAllDropdowns();
      });
    }
  }

  function bindDropdown (toggle) {
    calcite.dom.addEvent(toggle, calcite.dom.event(), function(event) {
      calcite.dom.preventDefault(event);
      var dropdown = calcite.dom.closest('js-dropdown', toggle);
      toggleDropdown(dropdown);
    });
  }

  for (var i = 0; i < toggles.length; i++) {
    bindDropdown(toggles[i]);
  }
};

// ┌────────┐
// │ Drawer │
// └────────┘
// show and hide drawers
calcite.drawer = function () {

  var toggles = findElements('.js-drawer-toggle');
  var drawers = findElements('.js-drawer');

  if (!drawers) {
    return;
  }

  function bindToggle (toggle) {
    calcite.dom.addEvent(toggle, calcite.dom.event(), function(event) {
      calcite.dom.preventDefault(event);
      var target = calcite.dom.getAttr(toggle, 'data-drawer');
      for (var i = 0; i < drawers.length; i++) {
        var drawer = drawers[i];
        var isTarget = calcite.dom.getAttr(drawers[i], 'data-drawer');
        if (target == isTarget) {
         toggleActive(drawers, drawer);
        }
      }
    });
  }

  function bindDrawer (drawer) {
    calcite.dom.addEvent(drawer, calcite.dom.event(), function(event) {
      toggleActive(drawers, drawer);
    });
  }

  for (var i = 0; i < toggles.length; i++) {
    bindToggle(toggles[i]);
  }
  for (var j = 0; j < drawers.length; j++) {
    bindDrawer(drawers[j]);
  }
};

// ┌───────────────┐
// │ Expanding Nav │
// └───────────────┘
// show and hide exanding nav located under topnav
calcite.expandingNav = function () {
  var toggles = findElements('.js-expanding-toggle');
  var expanders = findElements('.js-expanding');

  if (!expanders) {
    return;
  }

  function bindToggle (toggle) {
    calcite.dom.addEvent(toggle, calcite.dom.event(), function(event) {
      calcite.dom.preventDefault(event);

      var sectionName = calcite.dom.getAttr(toggle, 'data-expanding-nav');
      var sections = document.querySelectorAll('.js-expanding-nav');
      var section = document.querySelectorAll('.js-expanding-nav[data-expanding-nav="' + sectionName + '"]')[0];
      var expander = calcite.dom.closest('js-expanding', section);
      var isOpen = calcite.dom.hasClass(expander, 'is-active');
      var shouldClose = calcite.dom.hasClass(section, 'is-active');

      if (isOpen) {
        if (shouldClose) {
          calcite.dom.removeClass(expander, 'is-active');
        }
        toggleActive(sections, section);
      } else {
        toggleActive(sections, section);
        calcite.dom.addClass(expander, 'is-active');
      }

    });
  }

  for (var i = 0; i < toggles.length; i++) {
    bindToggle(toggles[i]);
  }
};

// ┌───────┐
// │ Modal │
// └───────┘
// show and hide modal dialogues

calcite.modal = function () {

  var toggles = findElements('.js-modal-toggle');
  var modals = findElements('.js-modal');

  if (!modals) {
    return;
  }

  function bindToggle (toggle) {
    calcite.dom.addEvent(toggle, calcite.dom.event(), function(event) {
      calcite.dom.preventDefault(event);
      var target = calcite.dom.getAttr(toggle, 'data-modal');
      for (var i = 0; i < modals.length; i++) {
        var modal = modals[i];
        var isTarget = calcite.dom.getAttr(modals[i], 'data-modal');
        if (target == isTarget) {
         toggleActive(modals, modal);
        }
      }
    });
  }

  function bindModal (modal) {
    calcite.dom.addEvent(modal, calcite.dom.event(), function(event) {
      calcite.dom.preventDefault(event);
      toggleActive(modals, modal);
    });
  }

  for (var i = 0; i < toggles.length; i++) {
    bindToggle(toggles[i]);
  }
  for (var j = 0; j < modals.length; j++) {
    bindModal(modals[j]);
  }
};


// ┌──────┐
// │ Tabs │
// └──────┘
// tabbed content pane

calcite.tabs = function () {
  var tabs = findElements('.js-tab');
  var tabGroups = findElements('.js-tab-group');

  if (!tabs) {
    return;
  }

  // set max width for each tab
  for (var j = 0; j < tabGroups.length; j++) {
    var tabsInGroup = tabGroups[j].querySelectorAll('.js-tab');
    var percent = 100 / tabsInGroup.length;
    for (var k = 0; k < tabsInGroup.length; k++){
      tabsInGroup[k].style.maxWidth = percent + '%';
    }
  }

  function switchTab (event) {
    calcite.dom.preventDefault(event);

    var tab = calcite.dom.closest('js-tab', calcite.dom.eventTarget(event));
    var tabGroup = calcite.dom.closest('js-tab-group', tab);
    var tabs = tabGroup.querySelectorAll('.js-tab');
    var contents = tabGroup.querySelectorAll('.js-tab-section');
    var index = calcite.arr.indexOf(tab, tabs);

    removeActive(tabs);
    removeActive(contents);

    calcite.dom.addClass(tab, 'is-active');
    calcite.dom.addClass(contents[index], 'is-active');
  }

  // attach the switchTab event to all tabs
  for (var i = 0; i < tabs.length; i++) {
    calcite.dom.addEvent(tabs[i], calcite.dom.event(), switchTab);
  }

};

// ┌────────┐
// │ Sticky │
// └────────┘
// sticks things to the window

calcite.sticky = function () {
  var elements = findElements('.js-sticky');

  if (!elements) {
    return;
  }

  var stickies = [];

  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var top = el.offsetTop;
    if (el.dataset.top) {
      top = top - parseInt(el.dataset.top, 0);
    }
    stickies.push({
      active: false,
      top: top,
      shim: el.cloneNode('deep'),
      element: el
    });
  }

  function handleScroll(item, offset) {
    var elem = item.element;
    var parent = elem.parentNode;
    var distance = item.top - offset;

    if (distance < 1 && !item.active) {
      item.shim.style.visiblity = 'hidden';
      parent.insertBefore(item.shim, elem);
      calcite.dom.addClass(elem, 'is-sticky');
      item.active = true;
      elem.style.top = elem.dataset.top + 'px';
    } else if (item.active && offset < item.top){
      parent.removeChild(item.shim);
      calcite.dom.removeClass(elem, 'is-sticky');
      elem.style.top = null;
      item.active = false;
    }
  }

  calcite.dom.addEvent(window, 'scroll', function() {
    var offset = window.pageYOffset;
    for (var i = 0; i < stickies.length; i++) {
      handleScroll(stickies[i], offset);
    }
  });

};

// ┌────────────────────┐
// │ Initialize Calcite │
// └────────────────────┘
// start up Calcite and attach all the patterns
// optionally pass an array of patterns you'd like to watch

calcite.init = function (patterns) {
  if (patterns) {
    for (var i = 0; i < patterns.length; i++) {
      calcite[patterns[i]]();
    }
  } else {
    calcite.modal();
    calcite.dropdown();
    calcite.drawer();
    calcite.expandingNav();
    calcite.tabs();
    calcite.accordion();
    calcite.carousel();
    calcite.sticky();
  }

  // add a touch class to the body
  if ( calcite.browser.isTouch() ) {
    calcite.dom.addClass(document.body, 'calcite-touch');
  }
};

// ┌───────────────────┐
// │ Expose Calcite.js │
// └───────────────────┘
// implementation borrowed from Leaflet

// define calcite as a global variable, saving the original to restore later if needed
function expose () {
  var oldCalcite = window.calcite;

  calcite.noConflict = function () {
    window.calcite = oldCalcite;
    return this;
  };

  window.calcite = calcite;
}

// no NPM/AMD for now because it just causes issues
// @TODO: bust them into AMD & NPM distros

// // define Calcite for CommonJS module pattern loaders (NPM, Browserify)
// if (typeof module === 'object' && typeof module.exports === 'object') {
//   module.exports = calcite;
// }

// // define Calcite as an AMD module
// else if (typeof define === 'function' && define.amd) {
//   define(calcite);
// }

expose();

})();

},{}],2:[function(require,module,exports){
(function(global){

  function TinyStore (name, optionalStore) {
    this.session = {};
    this.store = typeof optionalStore !== 'undefined' ? optionalStore : localStorage;
    this.name = name || 'TinyStore';
    this.enabled = isEnabled(this.store);

    if (this.enabled) {
      try {
        this.session = JSON.parse(this.store[this.name]) || {};
      } catch (e) {}
    }
  }

  TinyStore.prototype.save = function () {
    if (this.enabled) {
      this.store[this.name] = JSON.stringify(this.session);
    }
    return this.session;
  };

  TinyStore.prototype.set = function (key, value) {
    this.session[key] = value;
    this.save();
    return this.session[key];
  };

  TinyStore.prototype.get = function (key) {
    return this.session[key];
  };

  TinyStore.prototype.remove = function (key) {
    var value = this.session[key];
    delete this.session[key];
    this.save();
    return value;
  };

  TinyStore.prototype.clear = function () {
    this.session = {};
    if (this.enabled) {
      delete this.store[this.name];
    }
  };

  function isEnabled (store) {
    // definitely invalid:
    // * null
    // * undefined
    // * NaN
    // * empty string ("")
    // * 0
    // * false
    if (!store) { return false; }

    var storeType = typeof store;
    var isLocalOrSession = typeof store.getItem === 'function' && typeof store.setItem === 'function';
    var isObjectOrFunction = storeType === 'object' || storeType === 'function';

    // store is valid iff it is either
    // (a) localStorage or sessionStorage
    // (b) a regular object or function
    if (isLocalOrSession || isObjectOrFunction) { return true; }

    // catchall for outliers (string, positive number, true boolean, xml)
    return false;
  }

  global.TinyStore = TinyStore;

})(this);

},{}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var TS = _interopRequire(require("tinystore"));

// ┌──────┐
// │ Cart │
// └──────┘
// handle the finest of shopping experiences
function TinyCart() {
  var _this = this;

  var _ref = arguments[0] === undefined ? {} : arguments[0];

  var _ref$cartName = _ref.cartName;
  var cartName = _ref$cartName === undefined ? "TinyCart" : _ref$cartName;
  var _ref$currency = _ref.currency;
  var currency = _ref$currency === undefined ? "$" : _ref$currency;
  var _ref$taxRate = _ref.taxRate;
  var taxRate = _ref$taxRate === undefined ? 0 : _ref$taxRate;
  var _ref$tax = _ref.tax;
  var tax = _ref$tax === undefined ? 0 : _ref$tax;
  var _ref$baseShipping = _ref.baseShipping;
  var baseShipping = _ref$baseShipping === undefined ? 0 : _ref$baseShipping;
  var _ref$shipping = _ref.shipping;
  var shipping = _ref$shipping === undefined ? 0 : _ref$shipping;
  var _ref$shipTotal = _ref.shipTotal;
  var shipTotal = _ref$shipTotal === undefined ? 0 : _ref$shipTotal;
  var _ref$subtotal = _ref.subtotal;
  var subtotal = _ref$subtotal === undefined ? 0 : _ref$subtotal;
  var _ref$total = _ref.total;
  var total = _ref$total === undefined ? 0 : _ref$total;
  var _ref$items = _ref.items;
  var items = _ref$items === undefined ? [] : _ref$items;

  var ts = new TS.TinyStore(cartName);

  if (!ts.get("currency")) {
    ts.set("currency", currency);
  }
  if (!ts.get("taxRate")) {
    ts.set("taxRate", taxRate);
  }
  if (!ts.get("tax")) {
    ts.set("tax", tax);
  }
  if (!ts.get("baseShipping")) {
    ts.set("baseShipping", baseShipping);
  }
  if (!ts.get("shipping")) {
    ts.set("shipping", shipping);
  }
  if (!ts.get("subtotal")) {
    ts.set("subtotal", subtotal);
  }
  if (!ts.get("total")) {
    ts.set("total", total);
  }
  if (!ts.get("items")) {
    ts.set("items", items);
  }

  // Returns the Cart object and specific cart object values
  this.getCart = function () {
    return ts.session;
  };

  this.calculateCart = function () {
    var numItems = 0;
    var subtotal = 0;
    var tax = 0;
    var total = 0;
    var shipTotal = 0;
    var items = ts.get("items");
    var baseShipping = ts.get("baseShipping");
    var taxRate = ts.get("taxRate");
    var shipping = ts.get("shipping");

    items.forEach(function (i) {
      numItems = numItems + i.quantity;
      subtotal = i.price * i.quantity + subtotal;
    });

    tax = taxRate * subtotal;
    shipTotal = shipping * numItems + baseShipping;
    total = shipTotal + subtotal + tax;

    ts.set("tax", tax);
    ts.set("subtotal", subtotal);
    ts.set("shipTotal", shipTotal);
    ts.set("total", total);
  };

  this.addItem = function (title, id, price, quantity) {
    var hasItem = false;
    var itemId = undefined;

    if (ts.get("items").length) {
      ts.get("items").forEach(function (i) {
        if (i.id == id) {
          hasItem = true;
          itemId = id;
        }
      });
    }

    if (!hasItem) {
      ts.get("items").push({
        title: title,
        id: id,
        price: price,
        quantity: quantity
      });
    } else {
      ts.get("items").forEach(function (i) {
        if (i.id == id) {
          i.quantity = i.quantity + quantity;
        }
      });
    }

    _this.calculateCart();
    return _this;
  };

  // item helpers
  this.hasItems = function () {
    ts.get("items").length ? true : false;
  };

  this.isItem = function (i, id) {
    // console.log(ts.get('items')[i].id, id)
    ts.get("items")[i].id == id ? true : false;
  };

  this.getItem = function (id) {
    if (_this.hasItems()) {
      console.log("No items in cart: ", ts.session);
      return _this;
    }
    for (var i = 0; i < ts.get("items").length; i++) {
      if (_this.isItem(i, id)) {
        return ts.get("items")[i];
      }
    }
  };

  this.removeItem = function (id) {
    var items = ts.get("items");
    if (_this.hasItems()) {
      console.log("No items in cart: ", ts.session);
      return _this;
    }
    for (var i = 0; i < items.length; i++) {
      if (ts.get("items")[i].id == id) {
        if (items[i].quantity == 1) {
          items.splice(i, 1);
        } else {
          items[i].quantity = items[i].quantity - 1;
        }
        _this.calculateCart();
        return _this;
      }
    }
  };

  this.emptyCart = function () {
    ts.set("items", []);
    return _this;
  };

  this.clearCart = function () {
    ts.clear();
    return _this;
  };
}

module.exports = TinyCart;

},{"tinystore":2}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var calcite = _interopRequire(require("calcite-web"));

var TinyCart = _interopRequire(require("./cart.js"));

// var cart = Cart

window.cart = new TinyCart({
  cartName: "lonegoosepressCart",
  currency: "$",
  baseShipping: 10,
  shipping: 4
});

window.calcite.init();

},{"./cart.js":3,"calcite-web":1}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FsY2l0ZS13ZWIvbGliL2pzL2NhbGNpdGUtd2ViLmpzIiwibm9kZV9tb2R1bGVzL3RpbnlzdG9yZS90aW55c3RvcmUuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2NhcnQuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7SUN4RU8sRUFBRSwyQkFBTSxXQUFXOzs7Ozs7QUFNMUIsU0FBUyxRQUFRLEdBV1Q7OzswQ0FBSixFQUFFOzsyQkFWSixRQUFRO01BQVIsUUFBUSxpQ0FBRyxVQUFVOzJCQUNyQixRQUFRO01BQVIsUUFBUSxpQ0FBRyxHQUFHOzBCQUNkLE9BQU87TUFBUCxPQUFPLGdDQUFHLENBQUk7c0JBQ2QsR0FBRztNQUFILEdBQUcsNEJBQUcsQ0FBSTsrQkFDVixZQUFZO01BQVosWUFBWSxxQ0FBRyxDQUFJOzJCQUNuQixRQUFRO01BQVIsUUFBUSxpQ0FBRyxDQUFJOzRCQUNmLFNBQVM7TUFBVCxTQUFTLGtDQUFHLENBQUk7MkJBQ2hCLFFBQVE7TUFBUixRQUFRLGlDQUFHLENBQUk7d0JBQ2YsS0FBSztNQUFMLEtBQUssOEJBQUcsQ0FBSTt3QkFDWixLQUFLO01BQUwsS0FBSyw4QkFBRyxFQUFFOztBQUVWLE1BQUksRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUFDO0FBQ3ZELE1BQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQUMsTUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FBQztBQUNwRCxNQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUFDLE1BQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0dBQUM7QUFDeEMsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQTtHQUFDO0FBQ25FLE1BQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQUMsTUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FBQztBQUN2RCxNQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUFDLE1BQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQUM7QUFDdkQsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUFDO0FBQzlDLE1BQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQUMsTUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUE7R0FBQzs7O0FBRzlDLE1BQUksQ0FBQyxPQUFPLEdBQUcsWUFBTTtBQUFFLFdBQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQTtHQUFFLENBQUE7O0FBRTFDLE1BQUksQ0FBQyxhQUFhLEdBQUcsWUFBTTtBQUN6QixRQUFJLFFBQVEsR0FBTyxDQUFDLENBQUE7QUFDcEIsUUFBSSxRQUFRLEdBQU8sQ0FBQyxDQUFBO0FBQ3BCLFFBQUksR0FBRyxHQUFZLENBQUMsQ0FBQTtBQUNwQixRQUFJLEtBQUssR0FBVSxDQUFDLENBQUE7QUFDcEIsUUFBSSxTQUFTLEdBQU0sQ0FBQyxDQUFBO0FBQ3BCLFFBQUksS0FBSyxHQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEMsUUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN6QyxRQUFJLE9BQU8sR0FBUSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLFFBQUksUUFBUSxHQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXJDLFNBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDakIsY0FBUSxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFBO0FBQ2hDLGNBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0tBQzNDLENBQUMsQ0FBQTs7QUFFRixPQUFHLEdBQUssT0FBTyxHQUFHLFFBQVEsQ0FBQTtBQUMxQixhQUFTLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxZQUFZLENBQUE7QUFDOUMsU0FBSyxHQUFHLFNBQVMsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFBOztBQUVsQyxNQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNsQixNQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUM1QixNQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM5QixNQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUN2QixDQUFBOztBQUVELE1BQUksQ0FBQyxPQUFPLEdBQUcsVUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUs7QUFDN0MsUUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQ25CLFFBQUksTUFBTSxZQUFBLENBQUE7O0FBRVYsUUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUMxQixRQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUMzQixZQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO0FBQ2QsaUJBQU8sR0FBRyxJQUFJLENBQUE7QUFDZCxnQkFBTSxHQUFHLEVBQUUsQ0FBQTtTQUNaO09BQ0YsQ0FBQyxDQUFBO0tBQ0g7O0FBRUQsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFFBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ25CLGFBQUssRUFBRSxLQUFLO0FBQ1osVUFBRSxFQUFFLEVBQUU7QUFDTixhQUFLLEVBQUUsS0FBSztBQUNaLGdCQUFRLEVBQUUsUUFBUTtPQUNuQixDQUFDLENBQUE7S0FDSCxNQUFNO0FBQ0wsUUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDM0IsWUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtBQUNkLFdBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7U0FDbkM7T0FDRixDQUFDLENBQUE7S0FDSDs7QUFFRCxVQUFLLGFBQWEsRUFBRSxDQUFBO0FBQ3BCLGlCQUFXO0dBQ1osQ0FBQTs7O0FBR0QsTUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFNO0FBQ3BCLE1BQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7R0FDdEMsQ0FBQTs7QUFFRCxNQUFJLENBQUMsTUFBTSxHQUFHLFVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBSzs7QUFFdkIsTUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7R0FDM0MsQ0FBQTs7QUFFRCxNQUFJLENBQUMsT0FBTyxHQUFHLFVBQUMsRUFBRSxFQUFLO0FBQ3JCLFFBQUksTUFBSyxRQUFRLEVBQUUsRUFBRTtBQUNuQixhQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM3QyxtQkFBVztLQUNaO0FBQ0QsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQy9DLFVBQUksTUFBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ3RCLGVBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUMxQjtLQUNGO0dBQ0YsQ0FBQTs7QUFFRCxNQUFJLENBQUMsVUFBVSxHQUFHLFVBQUMsRUFBRSxFQUFLO0FBQ3hCLFFBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDM0IsUUFBSSxNQUFLLFFBQVEsRUFBRSxFQUFFO0FBQ25CLGFBQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzdDLG1CQUFXO0tBQ1o7QUFDRCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQyxVQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtBQUMvQixZQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQzFCLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLE1BQU07QUFDTCxlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUUsQ0FBQyxDQUFBO1NBQ3pDO0FBQ0QsY0FBSyxhQUFhLEVBQUUsQ0FBQTtBQUNwQixxQkFBVztPQUNaO0tBQ0Y7R0FDRixDQUFBOztBQUVELE1BQUksQ0FBQyxTQUFTLEdBQUcsWUFBTTtBQUNyQixNQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNuQixpQkFBVztHQUNaLENBQUE7O0FBRUQsTUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFNO0FBQ3JCLE1BQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNWLGlCQUFXO0dBQ1osQ0FBQTtDQUVGOztpQkFFYyxRQUFROzs7Ozs7O0lDL0loQixPQUFPLDJCQUFNLGFBQWE7O0lBQzFCLFFBQVEsMkJBQU0sV0FBVzs7OztBQUloQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDO0FBQ3pCLFVBQVEsRUFBRSxvQkFBb0I7QUFDOUIsVUFBUSxFQUFFLEdBQUc7QUFDYixjQUFZLEVBQUUsRUFBSztBQUNuQixVQUFRLEVBQUUsQ0FBSTtDQUNmLENBQUMsQ0FBQTs7QUFFRixNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiBDYWxjaXRlICgpIHtcblxudmFyIGNhbGNpdGUgPSB7XG4gIHZlcnNpb246ICcwLjAuOSdcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERPTSBVdGlsaXRpZXMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuY2FsY2l0ZS5kb20gPSB7fTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIEV2ZW50IE1hbmFnZW1lbnQg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gcmV0dXJucyBzdGFuZGFyZCBpbnRlcmFjdGlvbiBldmVudCwgbGF0ZXIgd2lsbCBhZGQgdG91Y2ggc3VwcG9ydFxuY2FsY2l0ZS5kb20uZXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnY2xpY2snO1xufTtcblxuLy8gYWRkIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYW4gZXZlbnQgb24gYSBET00gbm9kZVxuY2FsY2l0ZS5kb20uYWRkRXZlbnQgPSBmdW5jdGlvbiAoZG9tTm9kZSwgZXZlbnQsIGZuKSB7XG4gIGlmIChkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICB9XG4gIGlmIChkb21Ob2RlLmF0dGFjaEV2ZW50KSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBmbik7XG4gIH1cbn07XG5cbi8vIHJlbW92ZSBhIHNwZWNpZmljIGZ1bmN0aW9uIGJpbmRpbmcgZnJvbSBhIERPTSBub2RlIGV2ZW50XG5jYWxjaXRlLmRvbS5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChkb21Ob2RlLCBldmVudCwgZm4pIHtcbiAgaWYgKGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIHJldHVybiBkb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gIH1cbiAgaWYgKGRvbU5vZGUuZGV0YWNoRXZlbnQpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsICBmbik7XG4gIH1cbn07XG5cbi8vIGdldCB0aGUgdGFyZ2V0IGVsZW1lbnQgb2YgYW4gZXZlbnRcbmNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmICghZXZlbnQudGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnNyY0VsZW1lbnQ7XG4gIH1cbiAgaWYgKGV2ZW50LnRhcmdldCkge1xuICAgIHJldHVybiBldmVudC50YXJnZXQ7XG4gIH1cbn07XG5cbi8vIHByZXZlbnQgZGVmYXVsdCBiZWhhdmlvciBvZiBhbiBldmVudFxuY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgaWYgKGV2ZW50LnJldHVyblZhbHVlKSB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgfVxufTtcblxuLy8gc3RvcCBhbmQgZXZlbnQgZnJvbSBidWJibGluZyB1cCB0aGUgRE9NIHRyZWVcbmNhbGNpdGUuZG9tLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICBldmVudCA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcbiAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIHJldHVybiBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBpZiAoZXZlbnQuY2FuY2VsQnViYmxlKSB7XG4gICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2xhc3MgTWFuaXB1bGF0aW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbi8vIGNoZWNrIGlmIGFuIGVsZW1lbnQgaGFzIGEgc3BlY2lmaWMgY2xhc3NcbmNhbGNpdGUuZG9tLmhhc0NsYXNzID0gZnVuY3Rpb24gKGRvbU5vZGUsIGNsYXNzTmFtZSkge1xuICB2YXIgZXhwID0gbmV3IFJlZ0V4cCgnICcgKyBjbGFzc05hbWUgKyAnICcpO1xuICBpZiAoZXhwLnRlc3QoJyAnICsgZG9tTm9kZS5jbGFzc05hbWUgKyAnICcpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBhZGQgb25lIG9yIG1vcmUgY2xhc3NlcyB0byBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBjbGFzc2VzKSB7XG4gIGNsYXNzZXMgPSBjbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFjYWxjaXRlLmRvbS5oYXNDbGFzcyhkb21Ob2RlLCBjbGFzc2VzW2ldKSkge1xuICAgICAgZG9tTm9kZS5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3Nlc1tpXTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHJlbW92ZSBvbmUgb3IgbW9yZSBjbGFzc2VzIGZyb20gYW4gZWxlbWVudFxuY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoZG9tTm9kZSwgY2xhc3Nlcykge1xuICBjbGFzc2VzID0gY2xhc3Nlcy5zcGxpdCgnICcpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBuZXdDbGFzcyA9ICcgJyArIGRvbU5vZGUuY2xhc3NOYW1lLnJlcGxhY2UoIC9bXFx0XFxyXFxuXS9nLCAnICcpICsgJyAnO1xuXG4gICAgaWYgKGNhbGNpdGUuZG9tLmhhc0NsYXNzKGRvbU5vZGUsIGNsYXNzZXNbaV0pKSB7XG4gICAgICB3aGlsZSAobmV3Q2xhc3MuaW5kZXhPZignICcgKyBjbGFzc2VzW2ldICsgJyAnKSA+PSAwKSB7XG4gICAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgnICcgKyBjbGFzc2VzW2ldICsgJyAnLCAnICcpO1xuICAgICAgfVxuXG4gICAgICBkb21Ob2RlLmNsYXNzTmFtZSA9IG5ld0NsYXNzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERPTSBUcmF2ZXJzYWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gcmV0dXJucyBjbG9zZXN0IGVsZW1lbnQgdXAgdGhlIERPTSB0cmVlIG1hdGNoaW5nIGEgZ2l2ZW4gY2xhc3NcbmNhbGNpdGUuZG9tLmNsb3Nlc3QgPSBmdW5jdGlvbiAoY2xhc3NOYW1lLCBjb250ZXh0KSB7XG4gIHZhciByZXN1bHQsIGN1cnJlbnQ7XG4gIGZvciAoY3VycmVudCA9IGNvbnRleHQ7IGN1cnJlbnQ7IGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudE5vZGUpIHtcbiAgICBpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gMSAmJiBjYWxjaXRlLmRvbS5oYXNDbGFzcyhjdXJyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXJyZW50O1xufTtcblxuLy8gZ2V0IGFuIGF0dHJpYnV0ZSBmb3IgYW4gZWxlbWVudFxuY2FsY2l0ZS5kb20uZ2V0QXR0ciA9IGZ1bmN0aW9uKGRvbU5vZGUsIGF0dHIpIHtcbiAgaWYgKGRvbU5vZGUuZ2V0QXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICB9XG5cbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGF0dHJzID0gZG9tTm9kZS5hdHRyaWJ1dGVzO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXR0cnNbaV0ubm9kZU5hbWUgPT09IGF0dHIpIHtcbiAgICAgIHJlc3VsdCA9IGF0dHJzW2ldLm5vZGVWYWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgT2JqZWN0IENvbnZlcnNpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gdHVybiBhIGRvbU5vZGVMaXN0IGludG8gYW4gYXJyYXlcbmNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheSA9IGZ1bmN0aW9uIChkb21Ob2RlTGlzdCkge1xuICB2YXIgYXJyYXkgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb21Ob2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5LnB1c2goZG9tTm9kZUxpc3RbaV0pO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEFycmF5IE1hbmlwdWxhdGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG5jYWxjaXRlLmFyciA9IHt9O1xuXG4vLyByZXR1cm4gdGhlIGluZGV4IG9mIGFuIG9iamVjdCBpbiBhbiBhcnJheSB3aXRoIG9wdGlvbmFsIG9mZnNldFxuY2FsY2l0ZS5hcnIuaW5kZXhPZiA9IGZ1bmN0aW9uIChvYmosIGFyciwgb2Zmc2V0KSB7XG4gIHZhciBpID0gb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKGFyci5pbmRleE9mKSB7XG4gICAgcmV0dXJuIGFyci5pbmRleE9mKG9iaiwgaSk7XG4gIH1cblxuICBmb3IgKGk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEJyb3dzZXIgRmVhdHVyZSBEZXRlY3Rpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGRldGVjdCBmZWF0dXJlcyBsaWtlIHRvdWNoLCBpZSwgZXRjLlxuXG5jYWxjaXRlLmJyb3dzZXIgPSB7fTtcblxuLy8gZGV0ZWN0IHRvdWNoLCBjb3VsZCBiZSBpbXByb3ZlZCBmb3IgbW9yZSBjb3ZlcmFnZVxuY2FsY2l0ZS5icm93c2VyLmlzVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG4gIGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEpTIFBhdHRlcm5zIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBqYXZhc2NyaXB0IGxvZ2ljIGZvciB1aSBwYXR0ZXJuc1xuXG5mdW5jdGlvbiBmaW5kRWxlbWVudHMgKGNsYXNzTmFtZSkge1xuICB2YXIgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGNsYXNzTmFtZSk7XG4gIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5KGVsZW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gcmVtb3ZlICdpcy1hY3RpdmUnIGNsYXNzIGZyb20gZXZlcnkgZWxlbWVudCBpbiBhbiBhcnJheVxuZnVuY3Rpb24gcmVtb3ZlQWN0aXZlIChhcnJheSkge1xuICBpZiAodHlwZW9mIGFycmF5ID09ICdvYmplY3QnKSB7XG4gICAgYXJyYXkgPSBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoYXJyYXkpO1xuICB9XG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnaXMtYWN0aXZlJyk7XG4gIH0pO1xufVxuXG4vLyByZW1vdmUgJ2lzLWFjdGl2ZScgZnJvbSBhcnJheSwgYWRkIHRvIGVsZW1lbnRcbmZ1bmN0aW9uIHRvZ2dsZUFjdGl2ZSAoYXJyYXksIGVsKSB7XG4gIHZhciBpc0FjdGl2ZSA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIGlmIChpc0FjdGl2ZSkge1xuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIH0gZWxzZSB7XG4gICAgcmVtb3ZlQWN0aXZlKGFycmF5KTtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhlbCwgJ2lzLWFjdGl2ZScpO1xuICB9XG59XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEFjY29yZGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gY29sbGFwc2libGUgYWNjb3JkaW9uIGxpc3RcblxuY2FsY2l0ZS5hY2NvcmRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY2NvcmRpb25zID0gZmluZEVsZW1lbnRzKCcuanMtYWNjb3JkaW9uJyk7XG5cbiAgaWYgKCFhY2NvcmRpb25zKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY2NvcmRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gYWNjb3JkaW9uc1tpXS5jaGlsZHJlbjtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChjaGlsZHJlbltqXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgdG9nZ2xlQWNjb3JkaW9uKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVBY2NvcmRpb24gKGV2ZW50KSB7XG4gICAgdmFyIHBhcmVudCA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2FjY29yZGlvbi1zZWN0aW9uJywgY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZXZlbnQpKTtcbiAgICBpZiAoY2FsY2l0ZS5kb20uaGFzQ2xhc3MocGFyZW50LCAnaXMtYWN0aXZlJykpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKHBhcmVudCwgJ2lzLWFjdGl2ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhwYXJlbnQsICdpcy1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2Fyb3VzZWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgY2Fyb3VzZWwgd2l0aCBhbnkgbnVtYmVyIG9mIHNsaWRlc1xuXG5jYWxjaXRlLmNhcm91c2VsID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjYXJvdXNlbHMgPSBmaW5kRWxlbWVudHMoJy5qcy1jYXJvdXNlbCcpO1xuXG4gIGlmICghY2Fyb3VzZWxzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXJvdXNlbHMubGVuZ3RoOyBpKyspIHtcblxuICAgIHZhciBjYXJvdXNlbCA9IGNhcm91c2Vsc1tpXTtcbiAgICB2YXIgd3JhcHBlciA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZXMnKVswXTtcbiAgICB2YXIgc2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlJyk7XG4gICAgdmFyIHRvZ2dsZXMgPSBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhcm91c2VsLWxpbmsnKSk7XG5cbiAgICB3cmFwcGVyLnN0eWxlLndpZHRoID0gc2xpZGVzLmxlbmd0aCAqIDEwMCArICclJztcblxuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHNsaWRlc1swXSwgJ2lzLWFjdGl2ZScpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUnKTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgc2xpZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICBzbGlkZXNba10uc3R5bGUud2lkdGggPSAxMDAgLyBzbGlkZXMubGVuZ3RoICsgJyUnO1xuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdG9nZ2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlc1tqXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgdG9nZ2xlU2xpZGUpO1xuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlU2xpZGUgKGUpIHtcbiAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChlKTtcbiAgICB2YXIgbGluayA9IGNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0KGUpO1xuICAgIHZhciBpbmRleCA9IGNhbGNpdGUuZG9tLmdldEF0dHIobGluaywgJ2RhdGEtc2xpZGUnKTtcbiAgICB2YXIgY2Fyb3VzZWwgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdjYXJvdXNlbCcsIGxpbmspO1xuICAgIHZhciBjdXJyZW50ID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlLmlzLWFjdGl2ZScpWzBdO1xuICAgIHZhciBzbGlkZXMgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUnKTtcbiAgICB2YXIgd3JhcHBlciA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZXMnKVswXTtcblxuICAgIGlmIChpbmRleCA9PSAncHJldicpIHtcbiAgICAgIGluZGV4ID0gY2FsY2l0ZS5hcnIuaW5kZXhPZihjdXJyZW50LCBzbGlkZXMpO1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7IGluZGV4ID0gMTsgfVxuICAgIH0gZWxzZSBpZiAoaW5kZXggPT0gJ25leHQnKSB7XG4gICAgICBpbmRleCA9IGNhbGNpdGUuYXJyLmluZGV4T2YoY3VycmVudCwgc2xpZGVzKSArIDI7XG4gICAgICBpZiAoaW5kZXggPiBzbGlkZXMubGVuZ3RoKSB7IGluZGV4ID0gc2xpZGVzLmxlbmd0aDsgfVxuICAgIH1cblxuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUgaXMtbGFzdC1zbGlkZScpO1xuXG4gICAgaWYgKGluZGV4ID09IHNsaWRlcy5sZW5ndGgpIHsgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY2Fyb3VzZWwsICdpcy1sYXN0LXNsaWRlJyk7IH1cbiAgICBpZiAoaW5kZXggPT0gMSkgeyBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjYXJvdXNlbCwgJ2lzLWZpcnN0LXNsaWRlJyk7IH1cblxuICAgIHJlbW92ZUFjdGl2ZShzbGlkZXMpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHNsaWRlc1tpbmRleCAtIDFdLCAnaXMtYWN0aXZlJyk7XG4gICAgdmFyIG9mZnNldCA9IChpbmRleCAtIDEpL3NsaWRlcy5sZW5ndGggKiAtMTAwICsgJyUnO1xuICAgIHdyYXBwZXIuc3R5bGUudHJhbnNmb3JtPSAndHJhbnNsYXRlM2QoJyArIG9mZnNldCArICcsMCwwKSc7XG4gIH1cblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRHJvcGRvd24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgZHJvcGRvd24gbWVudXNcblxuY2FsY2l0ZS5kcm9wZG93biA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWRyb3Bkb3duLXRvZ2dsZScpO1xuICB2YXIgZHJvcGRvd25zID0gZmluZEVsZW1lbnRzKCcuanMtZHJvcGRvd24nKTtcblxuICBpZiAoIWRyb3Bkb3ducykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlQWxsRHJvcGRvd25zICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyb3Bkb3ducy5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZHJvcGRvd25zW2ldLCAnaXMtYWN0aXZlJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlRHJvcGRvd24gKGRyb3Bkb3duKSB7XG4gICAgdmFyIGlzQWN0aXZlID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGRyb3Bkb3duLCAnaXMtYWN0aXZlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGNpdGUuZG9tLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgY2xvc2VBbGxEcm9wZG93bnMoKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGRyb3Bkb3duLCAnaXMtYWN0aXZlJyk7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChkb2N1bWVudC5ib2R5LCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbG9zZUFsbERyb3Bkb3ducygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmluZERyb3Bkb3duICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy1kcm9wZG93bicsIHRvZ2dsZSk7XG4gICAgICB0b2dnbGVEcm9wZG93bihkcm9wZG93bik7XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kRHJvcGRvd24odG9nZ2xlc1tpXSk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERyYXdlciDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBkcmF3ZXJzXG5jYWxjaXRlLmRyYXdlciA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWRyYXdlci10b2dnbGUnKTtcbiAgdmFyIGRyYXdlcnMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcmF3ZXInKTtcblxuICBpZiAoIWRyYXdlcnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLWRyYXdlcicpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkcmF3ZXIgPSBkcmF3ZXJzW2ldO1xuICAgICAgICB2YXIgaXNUYXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKGRyYXdlcnNbaV0sICdkYXRhLWRyYXdlcicpO1xuICAgICAgICBpZiAodGFyZ2V0ID09IGlzVGFyZ2V0KSB7XG4gICAgICAgICB0b2dnbGVBY3RpdmUoZHJhd2VycywgZHJhd2VyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZERyYXdlciAoZHJhd2VyKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQoZHJhd2VyLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdG9nZ2xlQWN0aXZlKGRyYXdlcnMsIGRyYXdlcik7XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kVG9nZ2xlKHRvZ2dsZXNbaV0pO1xuICB9XG4gIGZvciAodmFyIGogPSAwOyBqIDwgZHJhd2Vycy5sZW5ndGg7IGorKykge1xuICAgIGJpbmREcmF3ZXIoZHJhd2Vyc1tqXSk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEV4cGFuZGluZyBOYXYg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgZXhhbmRpbmcgbmF2IGxvY2F0ZWQgdW5kZXIgdG9wbmF2XG5jYWxjaXRlLmV4cGFuZGluZ05hdiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1leHBhbmRpbmctdG9nZ2xlJyk7XG4gIHZhciBleHBhbmRlcnMgPSBmaW5kRWxlbWVudHMoJy5qcy1leHBhbmRpbmcnKTtcblxuICBpZiAoIWV4cGFuZGVycykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcblxuICAgICAgdmFyIHNlY3Rpb25OYW1lID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLWV4cGFuZGluZy1uYXYnKTtcbiAgICAgIHZhciBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1leHBhbmRpbmctbmF2Jyk7XG4gICAgICB2YXIgc2VjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1leHBhbmRpbmctbmF2W2RhdGEtZXhwYW5kaW5nLW5hdj1cIicgKyBzZWN0aW9uTmFtZSArICdcIl0nKVswXTtcbiAgICAgIHZhciBleHBhbmRlciA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLWV4cGFuZGluZycsIHNlY3Rpb24pO1xuICAgICAgdmFyIGlzT3BlbiA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKGV4cGFuZGVyLCAnaXMtYWN0aXZlJyk7XG4gICAgICB2YXIgc2hvdWxkQ2xvc2UgPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhzZWN0aW9uLCAnaXMtYWN0aXZlJyk7XG5cbiAgICAgIGlmIChpc09wZW4pIHtcbiAgICAgICAgaWYgKHNob3VsZENsb3NlKSB7XG4gICAgICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2dnbGVBY3RpdmUoc2VjdGlvbnMsIHNlY3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9nZ2xlQWN0aXZlKHNlY3Rpb25zLCBzZWN0aW9uKTtcbiAgICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZFRvZ2dsZSh0b2dnbGVzW2ldKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgTW9kYWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgbW9kYWwgZGlhbG9ndWVzXG5cbmNhbGNpdGUubW9kYWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1tb2RhbC10b2dnbGUnKTtcbiAgdmFyIG1vZGFscyA9IGZpbmRFbGVtZW50cygnLmpzLW1vZGFsJyk7XG5cbiAgaWYgKCFtb2RhbHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLW1vZGFsJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbW9kYWwgPSBtb2RhbHNbaV07XG4gICAgICAgIHZhciBpc1RhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIobW9kYWxzW2ldLCAnZGF0YS1tb2RhbCcpO1xuICAgICAgICBpZiAodGFyZ2V0ID09IGlzVGFyZ2V0KSB7XG4gICAgICAgICB0b2dnbGVBY3RpdmUobW9kYWxzLCBtb2RhbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRNb2RhbCAobW9kYWwpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChtb2RhbCwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHRvZ2dsZUFjdGl2ZShtb2RhbHMsIG1vZGFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmRUb2dnbGUodG9nZ2xlc1tpXSk7XG4gIH1cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBtb2RhbHMubGVuZ3RoOyBqKyspIHtcbiAgICBiaW5kTW9kYWwobW9kYWxzW2pdKTtcbiAgfVxufTtcblxuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBUYWJzIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyB0YWJiZWQgY29udGVudCBwYW5lXG5cbmNhbGNpdGUudGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhYnMgPSBmaW5kRWxlbWVudHMoJy5qcy10YWInKTtcbiAgdmFyIHRhYkdyb3VwcyA9IGZpbmRFbGVtZW50cygnLmpzLXRhYi1ncm91cCcpO1xuXG4gIGlmICghdGFicykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHNldCBtYXggd2lkdGggZm9yIGVhY2ggdGFiXG4gIGZvciAodmFyIGogPSAwOyBqIDwgdGFiR3JvdXBzLmxlbmd0aDsgaisrKSB7XG4gICAgdmFyIHRhYnNJbkdyb3VwID0gdGFiR3JvdXBzW2pdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWInKTtcbiAgICB2YXIgcGVyY2VudCA9IDEwMCAvIHRhYnNJbkdyb3VwLmxlbmd0aDtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IHRhYnNJbkdyb3VwLmxlbmd0aDsgaysrKXtcbiAgICAgIHRhYnNJbkdyb3VwW2tdLnN0eWxlLm1heFdpZHRoID0gcGVyY2VudCArICclJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzd2l0Y2hUYWIgKGV2ZW50KSB7XG4gICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuXG4gICAgdmFyIHRhYiA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLXRhYicsIGNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0KGV2ZW50KSk7XG4gICAgdmFyIHRhYkdyb3VwID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtdGFiLWdyb3VwJywgdGFiKTtcbiAgICB2YXIgdGFicyA9IHRhYkdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWInKTtcbiAgICB2YXIgY29udGVudHMgPSB0YWJHcm91cC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtdGFiLXNlY3Rpb24nKTtcbiAgICB2YXIgaW5kZXggPSBjYWxjaXRlLmFyci5pbmRleE9mKHRhYiwgdGFicyk7XG5cbiAgICByZW1vdmVBY3RpdmUodGFicyk7XG4gICAgcmVtb3ZlQWN0aXZlKGNvbnRlbnRzKTtcblxuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHRhYiwgJ2lzLWFjdGl2ZScpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGNvbnRlbnRzW2luZGV4XSwgJ2lzLWFjdGl2ZScpO1xuICB9XG5cbiAgLy8gYXR0YWNoIHRoZSBzd2l0Y2hUYWIgZXZlbnQgdG8gYWxsIHRhYnNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodGFic1tpXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgc3dpdGNoVGFiKTtcbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBTdGlja3kg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHN0aWNrcyB0aGluZ3MgdG8gdGhlIHdpbmRvd1xuXG5jYWxjaXRlLnN0aWNreSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVsZW1lbnRzID0gZmluZEVsZW1lbnRzKCcuanMtc3RpY2t5Jyk7XG5cbiAgaWYgKCFlbGVtZW50cykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzdGlja2llcyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWwgPSBlbGVtZW50c1tpXTtcbiAgICB2YXIgdG9wID0gZWwub2Zmc2V0VG9wO1xuICAgIGlmIChlbC5kYXRhc2V0LnRvcCkge1xuICAgICAgdG9wID0gdG9wIC0gcGFyc2VJbnQoZWwuZGF0YXNldC50b3AsIDApO1xuICAgIH1cbiAgICBzdGlja2llcy5wdXNoKHtcbiAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICB0b3A6IHRvcCxcbiAgICAgIHNoaW06IGVsLmNsb25lTm9kZSgnZGVlcCcpLFxuICAgICAgZWxlbWVudDogZWxcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNjcm9sbChpdGVtLCBvZmZzZXQpIHtcbiAgICB2YXIgZWxlbSA9IGl0ZW0uZWxlbWVudDtcbiAgICB2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIHZhciBkaXN0YW5jZSA9IGl0ZW0udG9wIC0gb2Zmc2V0O1xuXG4gICAgaWYgKGRpc3RhbmNlIDwgMSAmJiAhaXRlbS5hY3RpdmUpIHtcbiAgICAgIGl0ZW0uc2hpbS5zdHlsZS52aXNpYmxpdHkgPSAnaGlkZGVuJztcbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaXRlbS5zaGltLCBlbGVtKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGVsZW0sICdpcy1zdGlja3knKTtcbiAgICAgIGl0ZW0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGVsZW0uc3R5bGUudG9wID0gZWxlbS5kYXRhc2V0LnRvcCArICdweCc7XG4gICAgfSBlbHNlIGlmIChpdGVtLmFjdGl2ZSAmJiBvZmZzZXQgPCBpdGVtLnRvcCl7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbS5zaGltKTtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGVsZW0sICdpcy1zdGlja3knKTtcbiAgICAgIGVsZW0uc3R5bGUudG9wID0gbnVsbDtcbiAgICAgIGl0ZW0uYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgY2FsY2l0ZS5kb20uYWRkRXZlbnQod2luZG93LCAnc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0aWNraWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYW5kbGVTY3JvbGwoc3RpY2tpZXNbaV0sIG9mZnNldCk7XG4gICAgfVxuICB9KTtcblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgSW5pdGlhbGl6ZSBDYWxjaXRlIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzdGFydCB1cCBDYWxjaXRlIGFuZCBhdHRhY2ggYWxsIHRoZSBwYXR0ZXJuc1xuLy8gb3B0aW9uYWxseSBwYXNzIGFuIGFycmF5IG9mIHBhdHRlcm5zIHlvdSdkIGxpa2UgdG8gd2F0Y2hcblxuY2FsY2l0ZS5pbml0ID0gZnVuY3Rpb24gKHBhdHRlcm5zKSB7XG4gIGlmIChwYXR0ZXJucykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0dGVybnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNhbGNpdGVbcGF0dGVybnNbaV1dKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNhbGNpdGUubW9kYWwoKTtcbiAgICBjYWxjaXRlLmRyb3Bkb3duKCk7XG4gICAgY2FsY2l0ZS5kcmF3ZXIoKTtcbiAgICBjYWxjaXRlLmV4cGFuZGluZ05hdigpO1xuICAgIGNhbGNpdGUudGFicygpO1xuICAgIGNhbGNpdGUuYWNjb3JkaW9uKCk7XG4gICAgY2FsY2l0ZS5jYXJvdXNlbCgpO1xuICAgIGNhbGNpdGUuc3RpY2t5KCk7XG4gIH1cblxuICAvLyBhZGQgYSB0b3VjaCBjbGFzcyB0byB0aGUgYm9keVxuICBpZiAoIGNhbGNpdGUuYnJvd3Nlci5pc1RvdWNoKCkgKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ2NhbGNpdGUtdG91Y2gnKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRXhwb3NlIENhbGNpdGUuanMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGltcGxlbWVudGF0aW9uIGJvcnJvd2VkIGZyb20gTGVhZmxldFxuXG4vLyBkZWZpbmUgY2FsY2l0ZSBhcyBhIGdsb2JhbCB2YXJpYWJsZSwgc2F2aW5nIHRoZSBvcmlnaW5hbCB0byByZXN0b3JlIGxhdGVyIGlmIG5lZWRlZFxuZnVuY3Rpb24gZXhwb3NlICgpIHtcbiAgdmFyIG9sZENhbGNpdGUgPSB3aW5kb3cuY2FsY2l0ZTtcblxuICBjYWxjaXRlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmNhbGNpdGUgPSBvbGRDYWxjaXRlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHdpbmRvdy5jYWxjaXRlID0gY2FsY2l0ZTtcbn1cblxuLy8gbm8gTlBNL0FNRCBmb3Igbm93IGJlY2F1c2UgaXQganVzdCBjYXVzZXMgaXNzdWVzXG4vLyBAVE9ETzogYnVzdCB0aGVtIGludG8gQU1EICYgTlBNIGRpc3Ryb3NcblxuLy8gLy8gZGVmaW5lIENhbGNpdGUgZm9yIENvbW1vbkpTIG1vZHVsZSBwYXR0ZXJuIGxvYWRlcnMgKE5QTSwgQnJvd3NlcmlmeSlcbi8vIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4vLyAgIG1vZHVsZS5leHBvcnRzID0gY2FsY2l0ZTtcbi8vIH1cblxuLy8gLy8gZGVmaW5lIENhbGNpdGUgYXMgYW4gQU1EIG1vZHVsZVxuLy8gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4vLyAgIGRlZmluZShjYWxjaXRlKTtcbi8vIH1cblxuZXhwb3NlKCk7XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oZ2xvYmFsKXtcblxuICBmdW5jdGlvbiBUaW55U3RvcmUgKG5hbWUsIG9wdGlvbmFsU3RvcmUpIHtcbiAgICB0aGlzLnNlc3Npb24gPSB7fTtcbiAgICB0aGlzLnN0b3JlID0gdHlwZW9mIG9wdGlvbmFsU3RvcmUgIT09ICd1bmRlZmluZWQnID8gb3B0aW9uYWxTdG9yZSA6IGxvY2FsU3RvcmFnZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8ICdUaW55U3RvcmUnO1xuICAgIHRoaXMuZW5hYmxlZCA9IGlzRW5hYmxlZCh0aGlzLnN0b3JlKTtcblxuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IEpTT04ucGFyc2UodGhpcy5zdG9yZVt0aGlzLm5hbWVdKSB8fCB7fTtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc3RvcmVbdGhpcy5uYW1lXSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuc2Vzc2lvbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlc3Npb247XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuc2Vzc2lvbltrZXldID0gdmFsdWU7XG4gICAgdGhpcy5zYXZlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbltrZXldO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25ba2V5XTtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnNlc3Npb25ba2V5XTtcbiAgICBkZWxldGUgdGhpcy5zZXNzaW9uW2tleV07XG4gICAgdGhpcy5zYXZlKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgZGVsZXRlIHRoaXMuc3RvcmVbdGhpcy5uYW1lXTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNFbmFibGVkIChzdG9yZSkge1xuICAgIC8vIGRlZmluaXRlbHkgaW52YWxpZDpcbiAgICAvLyAqIG51bGxcbiAgICAvLyAqIHVuZGVmaW5lZFxuICAgIC8vICogTmFOXG4gICAgLy8gKiBlbXB0eSBzdHJpbmcgKFwiXCIpXG4gICAgLy8gKiAwXG4gICAgLy8gKiBmYWxzZVxuICAgIGlmICghc3RvcmUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICB2YXIgc3RvcmVUeXBlID0gdHlwZW9mIHN0b3JlO1xuICAgIHZhciBpc0xvY2FsT3JTZXNzaW9uID0gdHlwZW9mIHN0b3JlLmdldEl0ZW0gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHN0b3JlLnNldEl0ZW0gPT09ICdmdW5jdGlvbic7XG4gICAgdmFyIGlzT2JqZWN0T3JGdW5jdGlvbiA9IHN0b3JlVHlwZSA9PT0gJ29iamVjdCcgfHwgc3RvcmVUeXBlID09PSAnZnVuY3Rpb24nO1xuXG4gICAgLy8gc3RvcmUgaXMgdmFsaWQgaWZmIGl0IGlzIGVpdGhlclxuICAgIC8vIChhKSBsb2NhbFN0b3JhZ2Ugb3Igc2Vzc2lvblN0b3JhZ2VcbiAgICAvLyAoYikgYSByZWd1bGFyIG9iamVjdCBvciBmdW5jdGlvblxuICAgIGlmIChpc0xvY2FsT3JTZXNzaW9uIHx8IGlzT2JqZWN0T3JGdW5jdGlvbikgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gICAgLy8gY2F0Y2hhbGwgZm9yIG91dGxpZXJzIChzdHJpbmcsIHBvc2l0aXZlIG51bWJlciwgdHJ1ZSBib29sZWFuLCB4bWwpXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2xvYmFsLlRpbnlTdG9yZSA9IFRpbnlTdG9yZTtcblxufSkodGhpcyk7XG4iLCJpbXBvcnQgVFMgZnJvbSAndGlueXN0b3JlJ1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBDYXJ0IOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBoYW5kbGUgdGhlIGZpbmVzdCBvZiBzaG9wcGluZyBleHBlcmllbmNlc1xuZnVuY3Rpb24gVGlueUNhcnQoe1xuICBjYXJ0TmFtZSA9ICdUaW55Q2FydCcsXG4gIGN1cnJlbmN5ID0gJyQnLFxuICB0YXhSYXRlID0gMC4wMCxcbiAgdGF4ID0gMC4wMCxcbiAgYmFzZVNoaXBwaW5nID0gMC4wMCxcbiAgc2hpcHBpbmcgPSAwLjAwLFxuICBzaGlwVG90YWwgPSAwLjAwLFxuICBzdWJ0b3RhbCA9IDAuMDAsXG4gIHRvdGFsID0gMC4wMCxcbiAgaXRlbXMgPSBbXVxufSA9IHt9KSB7XG4gIHZhciB0cyA9IG5ldyBUUy5UaW55U3RvcmUoY2FydE5hbWUpXG5cbiAgaWYgKCF0cy5nZXQoJ2N1cnJlbmN5JykpIHt0cy5zZXQoJ2N1cnJlbmN5JywgY3VycmVuY3kpfVxuICBpZiAoIXRzLmdldCgndGF4UmF0ZScpKSB7dHMuc2V0KCd0YXhSYXRlJywgdGF4UmF0ZSl9XG4gIGlmICghdHMuZ2V0KCd0YXgnKSkge3RzLnNldCgndGF4JywgdGF4KX1cbiAgaWYgKCF0cy5nZXQoJ2Jhc2VTaGlwcGluZycpKSB7dHMuc2V0KCdiYXNlU2hpcHBpbmcnLCBiYXNlU2hpcHBpbmcpfVxuICBpZiAoIXRzLmdldCgnc2hpcHBpbmcnKSkge3RzLnNldCgnc2hpcHBpbmcnLCBzaGlwcGluZyl9XG4gIGlmICghdHMuZ2V0KCdzdWJ0b3RhbCcpKSB7dHMuc2V0KCdzdWJ0b3RhbCcsIHN1YnRvdGFsKX1cbiAgaWYgKCF0cy5nZXQoJ3RvdGFsJykpIHt0cy5zZXQoJ3RvdGFsJywgdG90YWwpfVxuICBpZiAoIXRzLmdldCgnaXRlbXMnKSkge3RzLnNldCgnaXRlbXMnLCBpdGVtcyl9XG5cbiAgLy8gUmV0dXJucyB0aGUgQ2FydCBvYmplY3QgYW5kIHNwZWNpZmljIGNhcnQgb2JqZWN0IHZhbHVlc1xuICB0aGlzLmdldENhcnQgPSAoKSA9PiB7IHJldHVybiB0cy5zZXNzaW9uIH1cblxuICB0aGlzLmNhbGN1bGF0ZUNhcnQgPSAoKSA9PiB7XG4gICAgbGV0IG51bUl0ZW1zICAgICA9IDBcbiAgICBsZXQgc3VidG90YWwgICAgID0gMFxuICAgIGxldCB0YXggICAgICAgICAgPSAwXG4gICAgbGV0IHRvdGFsICAgICAgICA9IDBcbiAgICBsZXQgc2hpcFRvdGFsICAgID0gMFxuICAgIGxldCBpdGVtcyAgICAgICAgPSB0cy5nZXQoJ2l0ZW1zJylcbiAgICBsZXQgYmFzZVNoaXBwaW5nID0gdHMuZ2V0KCdiYXNlU2hpcHBpbmcnKVxuICAgIGxldCB0YXhSYXRlICAgICAgPSB0cy5nZXQoJ3RheFJhdGUnKVxuICAgIGxldCBzaGlwcGluZyAgICAgPSB0cy5nZXQoJ3NoaXBwaW5nJylcblxuICAgIGl0ZW1zLmZvckVhY2goaSA9PiB7XG4gICAgICBudW1JdGVtcyA9IG51bUl0ZW1zICsgaS5xdWFudGl0eVxuICAgICAgc3VidG90YWwgPSBpLnByaWNlICogaS5xdWFudGl0eSArIHN1YnRvdGFsXG4gICAgfSlcblxuICAgIHRheCAgID0gdGF4UmF0ZSAqIHN1YnRvdGFsXG4gICAgc2hpcFRvdGFsID0gc2hpcHBpbmcgKiBudW1JdGVtcyArIGJhc2VTaGlwcGluZ1xuICAgIHRvdGFsID0gc2hpcFRvdGFsICsgc3VidG90YWwgKyB0YXhcblxuICAgIHRzLnNldCgndGF4JywgdGF4KVxuICAgIHRzLnNldCgnc3VidG90YWwnLCBzdWJ0b3RhbClcbiAgICB0cy5zZXQoJ3NoaXBUb3RhbCcsIHNoaXBUb3RhbClcbiAgICB0cy5zZXQoJ3RvdGFsJywgdG90YWwpXG4gIH1cblxuICB0aGlzLmFkZEl0ZW0gPSAodGl0bGUsIGlkLCBwcmljZSwgcXVhbnRpdHkpID0+IHtcbiAgICBsZXQgaGFzSXRlbSA9IGZhbHNlXG4gICAgbGV0IGl0ZW1JZFxuXG4gICAgaWYgKHRzLmdldCgnaXRlbXMnKS5sZW5ndGgpIHtcbiAgICAgIHRzLmdldCgnaXRlbXMnKS5mb3JFYWNoKGkgPT4ge1xuICAgICAgICBpZiAoaS5pZCA9PSBpZCkge1xuICAgICAgICAgIGhhc0l0ZW0gPSB0cnVlXG4gICAgICAgICAgaXRlbUlkID0gaWRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoIWhhc0l0ZW0pIHtcbiAgICAgIHRzLmdldCgnaXRlbXMnKS5wdXNoKHtcbiAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICBpZDogaWQsXG4gICAgICAgIHByaWNlOiBwcmljZSxcbiAgICAgICAgcXVhbnRpdHk6IHF1YW50aXR5XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykuZm9yRWFjaChpID0+IHtcbiAgICAgICAgaWYgKGkuaWQgPT0gaWQpIHtcbiAgICAgICAgICBpLnF1YW50aXR5ID0gaS5xdWFudGl0eSArIHF1YW50aXR5XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5jYWxjdWxhdGVDYXJ0KClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gaXRlbSBoZWxwZXJzXG4gIHRoaXMuaGFzSXRlbXMgPSAoKSA9PiB7XG4gICAgdHMuZ2V0KCdpdGVtcycpLmxlbmd0aCA/IHRydWUgOiBmYWxzZVxuICB9XG5cbiAgdGhpcy5pc0l0ZW0gPSAoaSwgaWQpID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZyh0cy5nZXQoJ2l0ZW1zJylbaV0uaWQsIGlkKVxuICAgIHRzLmdldCgnaXRlbXMnKVtpXS5pZCA9PSBpZCA/IHRydWUgOiBmYWxzZVxuICB9XG5cbiAgdGhpcy5nZXRJdGVtID0gKGlkKSA9PiB7XG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRzLmdldCgnaXRlbXMnKS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuaXNJdGVtKGksIGlkKSkge1xuICAgICAgICByZXR1cm4gdHMuZ2V0KCdpdGVtcycpW2ldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZW1vdmVJdGVtID0gKGlkKSA9PiB7XG4gICAgbGV0IGl0ZW1zID0gdHMuZ2V0KCdpdGVtcycpXG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkKSB7XG4gICAgICAgIGlmIChpdGVtc1tpXS5xdWFudGl0eSA9PSAxKSB7XG4gICAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1zW2ldLnF1YW50aXR5ID0gaXRlbXNbaV0ucXVhbnRpdHkgLTFcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZW1wdHlDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLnNldCgnaXRlbXMnLCBbXSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdGhpcy5jbGVhckNhcnQgPSAoKSA9PiB7XG4gICAgdHMuY2xlYXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUaW55Q2FydCIsImltcG9ydCBjYWxjaXRlIGZyb20gJ2NhbGNpdGUtd2ViJ1xuaW1wb3J0IFRpbnlDYXJ0IGZyb20gJy4vY2FydC5qcydcblxuLy8gdmFyIGNhcnQgPSBDYXJ0XG5cbndpbmRvdy5jYXJ0ID0gbmV3IFRpbnlDYXJ0KHtcbiAgY2FydE5hbWU6ICdsb25lZ29vc2VwcmVzc0NhcnQnLFxuICBjdXJyZW5jeTogJyQnLFxuICBiYXNlU2hpcHBpbmc6IDEwLjAwLFxuICBzaGlwcGluZzogNC4wMFxufSlcblxud2luZG93LmNhbGNpdGUuaW5pdCgpIl19

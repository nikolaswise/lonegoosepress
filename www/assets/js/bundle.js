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
    shipTotal = !items.length ? 0 : shipping * numItems + baseShipping;
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

  this.removeItem = function (id, num) {
    var items = ts.get("items");
    num = typeof num !== "undefined" ? num : 1;
    if (_this.hasItems()) {
      console.log("No items in cart: ", ts.session);
      return _this;
    }
    for (var i = 0; i < items.length; i++) {
      if (ts.get("items")[i].id == id) {
        if (items[i].quantity == 1) {
          items.splice(i, 1);
        } else {
          items[i].quantity = items[i].quantity - num;
        }
        _this.calculateCart();
        return _this;
      }
    }
  };

  this.destroyItem = function (id) {
    var items = ts.get("items");
    if (_this.hasItems()) {
      console.log("No items in cart: ", ts.session);
      return _this;
    }
    for (var i = 0; i < items.length; i++) {
      if (ts.get("items")[i].id == id) {
        items.splice(i, 1);
        _this.calculateCart();
        return _this;
      }
    }
  };

  this.emptyCart = function () {
    ts.set("items", []);
    _this.calculateCart();
    return _this;
  };

  this.destroyCart = function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FsY2l0ZS13ZWIvbGliL2pzL2NhbGNpdGUtd2ViLmpzIiwibm9kZV9tb2R1bGVzL3RpbnlzdG9yZS90aW55c3RvcmUuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2NhcnQuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFD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O0FBQ25CLFVBQUssYUFBYSxFQUFFLENBQUE7QUFDcEIsaUJBQVc7R0FDWixDQUFBOztBQUVELE1BQUksQ0FBQyxXQUFXLEdBQUcsWUFBTTtBQUN2QixNQUFFLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDVixpQkFBVztHQUNaLENBQUE7Q0FFRjs7aUJBRWMsUUFBUTs7Ozs7OztJQ2hLaEIsT0FBTywyQkFBTSxhQUFhOztJQUMxQixRQUFRLDJCQUFNLFdBQVc7Ozs7QUFJaEMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQztBQUN6QixVQUFRLEVBQUUsb0JBQW9CO0FBQzlCLFVBQVEsRUFBRSxHQUFHO0FBQ2IsY0FBWSxFQUFFLEVBQUs7QUFDbkIsVUFBUSxFQUFFLENBQUk7Q0FDZixDQUFDLENBQUE7O0FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gQ2FsY2l0ZSAoKSB7XG5cbnZhciBjYWxjaXRlID0ge1xuICB2ZXJzaW9uOiAnMC4wLjknXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBET00gVXRpbGl0aWVzIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbmNhbGNpdGUuZG9tID0ge307XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERPTSBFdmVudCBNYW5hZ2VtZW50IOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbi8vIHJldHVybnMgc3RhbmRhcmQgaW50ZXJhY3Rpb24gZXZlbnQsIGxhdGVyIHdpbGwgYWRkIHRvdWNoIHN1cHBvcnRcbmNhbGNpdGUuZG9tLmV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJ2NsaWNrJztcbn07XG5cbi8vIGFkZCBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGFuIGV2ZW50IG9uIGEgRE9NIG5vZGVcbmNhbGNpdGUuZG9tLmFkZEV2ZW50ID0gZnVuY3Rpb24gKGRvbU5vZGUsIGV2ZW50LCBmbikge1xuICBpZiAoZG9tTm9kZS5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgfVxuICBpZiAoZG9tTm9kZS5hdHRhY2hFdmVudCkge1xuICAgIHJldHVybiBkb21Ob2RlLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgZm4pO1xuICB9XG59O1xuXG4vLyByZW1vdmUgYSBzcGVjaWZpYyBmdW5jdGlvbiBiaW5kaW5nIGZyb20gYSBET00gbm9kZSBldmVudFxuY2FsY2l0ZS5kb20ucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiAoZG9tTm9kZSwgZXZlbnQsIGZuKSB7XG4gIGlmIChkb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICB9XG4gIGlmIChkb21Ob2RlLmRldGFjaEV2ZW50KSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCAgZm4pO1xuICB9XG59O1xuXG4vLyBnZXQgdGhlIHRhcmdldCBlbGVtZW50IG9mIGFuIGV2ZW50XG5jYWxjaXRlLmRvbS5ldmVudFRhcmdldCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIWV2ZW50LnRhcmdldCkge1xuICAgIHJldHVybiBldmVudC5zcmNFbGVtZW50O1xuICB9XG4gIGlmIChldmVudC50YXJnZXQpIHtcbiAgICByZXR1cm4gZXZlbnQudGFyZ2V0O1xuICB9XG59O1xuXG4vLyBwcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3Igb2YgYW4gZXZlbnRcbmNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgIHJldHVybiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGlmIChldmVudC5yZXR1cm5WYWx1ZSkge1xuICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gIH1cbn07XG5cbi8vIHN0b3AgYW5kIGV2ZW50IGZyb20gYnViYmxpbmcgdXAgdGhlIERPTSB0cmVlXG5jYWxjaXRlLmRvbS5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQ7XG4gIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICByZXR1cm4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgaWYgKGV2ZW50LmNhbmNlbEJ1YmJsZSkge1xuICAgIGV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIENsYXNzIE1hbmlwdWxhdGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyBjaGVjayBpZiBhbiBlbGVtZW50IGhhcyBhIHNwZWNpZmljIGNsYXNzXG5jYWxjaXRlLmRvbS5oYXNDbGFzcyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBjbGFzc05hbWUpIHtcbiAgdmFyIGV4cCA9IG5ldyBSZWdFeHAoJyAnICsgY2xhc3NOYW1lICsgJyAnKTtcbiAgaWYgKGV4cC50ZXN0KCcgJyArIGRvbU5vZGUuY2xhc3NOYW1lICsgJyAnKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy8gYWRkIG9uZSBvciBtb3JlIGNsYXNzZXMgdG8gYW4gZWxlbWVudFxuY2FsY2l0ZS5kb20uYWRkQ2xhc3MgPSBmdW5jdGlvbiAoZG9tTm9kZSwgY2xhc3Nlcykge1xuICBjbGFzc2VzID0gY2xhc3Nlcy5zcGxpdCgnICcpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZG9tTm9kZSwgY2xhc3Nlc1tpXSkpIHtcbiAgICAgIGRvbU5vZGUuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzZXNbaV07XG4gICAgfVxuICB9XG59O1xuXG4vLyByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIGFuIGVsZW1lbnRcbmNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGRvbU5vZGUsIGNsYXNzZXMpIHtcbiAgY2xhc3NlcyA9IGNsYXNzZXMuc3BsaXQoJyAnKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbmV3Q2xhc3MgPSAnICcgKyBkb21Ob2RlLmNsYXNzTmFtZS5yZXBsYWNlKCAvW1xcdFxcclxcbl0vZywgJyAnKSArICcgJztcblxuICAgIGlmIChjYWxjaXRlLmRvbS5oYXNDbGFzcyhkb21Ob2RlLCBjbGFzc2VzW2ldKSkge1xuICAgICAgd2hpbGUgKG5ld0NsYXNzLmluZGV4T2YoJyAnICsgY2xhc3Nlc1tpXSArICcgJykgPj0gMCkge1xuICAgICAgICBuZXdDbGFzcyA9IG5ld0NsYXNzLnJlcGxhY2UoJyAnICsgY2xhc3Nlc1tpXSArICcgJywgJyAnKTtcbiAgICAgIH1cblxuICAgICAgZG9tTm9kZS5jbGFzc05hbWUgPSBuZXdDbGFzcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgfVxuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBET00gVHJhdmVyc2FsIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbi8vIHJldHVybnMgY2xvc2VzdCBlbGVtZW50IHVwIHRoZSBET00gdHJlZSBtYXRjaGluZyBhIGdpdmVuIGNsYXNzXG5jYWxjaXRlLmRvbS5jbG9zZXN0ID0gZnVuY3Rpb24gKGNsYXNzTmFtZSwgY29udGV4dCkge1xuICB2YXIgcmVzdWx0LCBjdXJyZW50O1xuICBmb3IgKGN1cnJlbnQgPSBjb250ZXh0OyBjdXJyZW50OyBjdXJyZW50ID0gY3VycmVudC5wYXJlbnROb2RlKSB7XG4gICAgaWYgKGN1cnJlbnQubm9kZVR5cGUgPT09IDEgJiYgY2FsY2l0ZS5kb20uaGFzQ2xhc3MoY3VycmVudCwgY2xhc3NOYW1lKSkge1xuICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY3VycmVudDtcbn07XG5cbi8vIGdldCBhbiBhdHRyaWJ1dGUgZm9yIGFuIGVsZW1lbnRcbmNhbGNpdGUuZG9tLmdldEF0dHIgPSBmdW5jdGlvbihkb21Ob2RlLCBhdHRyKSB7XG4gIGlmIChkb21Ob2RlLmdldEF0dHJpYnV0ZSkge1xuICAgIHJldHVybiBkb21Ob2RlLmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgfVxuXG4gIHZhciByZXN1bHQ7XG4gIHZhciBhdHRycyA9IGRvbU5vZGUuYXR0cmlidXRlcztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGF0dHJzW2ldLm5vZGVOYW1lID09PSBhdHRyKSB7XG4gICAgICByZXN1bHQgPSBhdHRyc1tpXS5ub2RlVmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIE9iamVjdCBDb252ZXJzaW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbi8vIHR1cm4gYSBkb21Ob2RlTGlzdCBpbnRvIGFuIGFycmF5XG5jYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkgPSBmdW5jdGlvbiAoZG9tTm9kZUxpc3QpIHtcbiAgdmFyIGFycmF5ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZG9tTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheS5wdXNoKGRvbU5vZGVMaXN0W2ldKTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBBcnJheSBNYW5pcHVsYXRpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuY2FsY2l0ZS5hcnIgPSB7fTtcblxuLy8gcmV0dXJuIHRoZSBpbmRleCBvZiBhbiBvYmplY3QgaW4gYW4gYXJyYXkgd2l0aCBvcHRpb25hbCBvZmZzZXRcbmNhbGNpdGUuYXJyLmluZGV4T2YgPSBmdW5jdGlvbiAob2JqLCBhcnIsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuXG4gIGlmIChhcnIuaW5kZXhPZikge1xuICAgIHJldHVybiBhcnIuaW5kZXhPZihvYmosIGkpO1xuICB9XG5cbiAgZm9yIChpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBCcm93c2VyIEZlYXR1cmUgRGV0ZWN0aW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBkZXRlY3QgZmVhdHVyZXMgbGlrZSB0b3VjaCwgaWUsIGV0Yy5cblxuY2FsY2l0ZS5icm93c2VyID0ge307XG5cbi8vIGRldGVjdCB0b3VjaCwgY291bGQgYmUgaW1wcm92ZWQgZm9yIG1vcmUgY292ZXJhZ2VcbmNhbGNpdGUuYnJvd3Nlci5pc1RvdWNoID0gZnVuY3Rpb24gKCkge1xuICBpZiAoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykgfHwgKG5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzID4gMCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBKUyBQYXR0ZXJucyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gamF2YXNjcmlwdCBsb2dpYyBmb3IgdWkgcGF0dGVybnNcblxuZnVuY3Rpb24gZmluZEVsZW1lbnRzIChjbGFzc05hbWUpIHtcbiAgdmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChjbGFzc05hbWUpO1xuICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheShlbGVtZW50cyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8vIHJlbW92ZSAnaXMtYWN0aXZlJyBjbGFzcyBmcm9tIGV2ZXJ5IGVsZW1lbnQgaW4gYW4gYXJyYXlcbmZ1bmN0aW9uIHJlbW92ZUFjdGl2ZSAoYXJyYXkpIHtcbiAgaWYgKHR5cGVvZiBhcnJheSA9PSAnb2JqZWN0Jykge1xuICAgIGFycmF5ID0gY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5KGFycmF5KTtcbiAgfVxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoaXRlbSwgJ2lzLWFjdGl2ZScpO1xuICB9KTtcbn1cblxuLy8gcmVtb3ZlICdpcy1hY3RpdmUnIGZyb20gYXJyYXksIGFkZCB0byBlbGVtZW50XG5mdW5jdGlvbiB0b2dnbGVBY3RpdmUgKGFycmF5LCBlbCkge1xuICB2YXIgaXNBY3RpdmUgPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhlbCwgJ2lzLWFjdGl2ZScpO1xuICBpZiAoaXNBY3RpdmUpIHtcbiAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhlbCwgJ2lzLWFjdGl2ZScpO1xuICB9IGVsc2Uge1xuICAgIHJlbW92ZUFjdGl2ZShhcnJheSk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZWwsICdpcy1hY3RpdmUnKTtcbiAgfVxufVxuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBBY2NvcmRpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGNvbGxhcHNpYmxlIGFjY29yZGlvbiBsaXN0XG5cbmNhbGNpdGUuYWNjb3JkaW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYWNjb3JkaW9ucyA9IGZpbmRFbGVtZW50cygnLmpzLWFjY29yZGlvbicpO1xuXG4gIGlmICghYWNjb3JkaW9ucykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWNjb3JkaW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjaGlsZHJlbiA9IGFjY29yZGlvbnNbaV0uY2hpbGRyZW47XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQoY2hpbGRyZW5bal0sIGNhbGNpdGUuZG9tLmV2ZW50KCksIHRvZ2dsZUFjY29yZGlvbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlQWNjb3JkaW9uIChldmVudCkge1xuICAgIHZhciBwYXJlbnQgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdhY2NvcmRpb24tc2VjdGlvbicsIGNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0KGV2ZW50KSk7XG4gICAgaWYgKGNhbGNpdGUuZG9tLmhhc0NsYXNzKHBhcmVudCwgJ2lzLWFjdGl2ZScpKSB7XG4gICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhwYXJlbnQsICdpcy1hY3RpdmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MocGFyZW50LCAnaXMtYWN0aXZlJyk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIENhcm91c2VsIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGNhcm91c2VsIHdpdGggYW55IG51bWJlciBvZiBzbGlkZXNcblxuY2FsY2l0ZS5jYXJvdXNlbCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgY2Fyb3VzZWxzID0gZmluZEVsZW1lbnRzKCcuanMtY2Fyb3VzZWwnKTtcblxuICBpZiAoIWNhcm91c2Vscykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2Fyb3VzZWxzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICB2YXIgY2Fyb3VzZWwgPSBjYXJvdXNlbHNbaV07XG4gICAgdmFyIHdyYXBwZXIgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGVzJylbMF07XG4gICAgdmFyIHNsaWRlcyA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZScpO1xuICAgIHZhciB0b2dnbGVzID0gY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5KGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jYXJvdXNlbC1saW5rJykpO1xuXG4gICAgd3JhcHBlci5zdHlsZS53aWR0aCA9IHNsaWRlcy5sZW5ndGggKiAxMDAgKyAnJSc7XG5cbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhzbGlkZXNbMF0sICdpcy1hY3RpdmUnKTtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjYXJvdXNlbCwgJ2lzLWZpcnN0LXNsaWRlJyk7XG5cbiAgICBmb3IgKHZhciBrID0gMDsgayA8IHNsaWRlcy5sZW5ndGg7IGsrKykge1xuICAgICAgc2xpZGVzW2tdLnN0eWxlLndpZHRoID0gMTAwIC8gc2xpZGVzLmxlbmd0aCArICclJztcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRvZ2dsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZXNbal0sIGNhbGNpdGUuZG9tLmV2ZW50KCksIHRvZ2dsZVNsaWRlKTtcbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZVNsaWRlIChlKSB7XG4gICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZSk7XG4gICAgdmFyIGxpbmsgPSBjYWxjaXRlLmRvbS5ldmVudFRhcmdldChlKTtcbiAgICB2YXIgaW5kZXggPSBjYWxjaXRlLmRvbS5nZXRBdHRyKGxpbmssICdkYXRhLXNsaWRlJyk7XG4gICAgdmFyIGNhcm91c2VsID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnY2Fyb3VzZWwnLCBsaW5rKTtcbiAgICB2YXIgY3VycmVudCA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZS5pcy1hY3RpdmUnKVswXTtcbiAgICB2YXIgc2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlJyk7XG4gICAgdmFyIHdyYXBwZXIgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGVzJylbMF07XG5cbiAgICBpZiAoaW5kZXggPT0gJ3ByZXYnKSB7XG4gICAgICBpbmRleCA9IGNhbGNpdGUuYXJyLmluZGV4T2YoY3VycmVudCwgc2xpZGVzKTtcbiAgICAgIGlmIChpbmRleCA9PT0gMCkgeyBpbmRleCA9IDE7IH1cbiAgICB9IGVsc2UgaWYgKGluZGV4ID09ICduZXh0Jykge1xuICAgICAgaW5kZXggPSBjYWxjaXRlLmFyci5pbmRleE9mKGN1cnJlbnQsIHNsaWRlcykgKyAyO1xuICAgICAgaWYgKGluZGV4ID4gc2xpZGVzLmxlbmd0aCkgeyBpbmRleCA9IHNsaWRlcy5sZW5ndGg7IH1cbiAgICB9XG5cbiAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhjYXJvdXNlbCwgJ2lzLWZpcnN0LXNsaWRlIGlzLWxhc3Qtc2xpZGUnKTtcblxuICAgIGlmIChpbmRleCA9PSBzbGlkZXMubGVuZ3RoKSB7IGNhbGNpdGUuZG9tLmFkZENsYXNzKGNhcm91c2VsLCAnaXMtbGFzdC1zbGlkZScpOyB9XG4gICAgaWYgKGluZGV4ID09IDEpIHsgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY2Fyb3VzZWwsICdpcy1maXJzdC1zbGlkZScpOyB9XG5cbiAgICByZW1vdmVBY3RpdmUoc2xpZGVzKTtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhzbGlkZXNbaW5kZXggLSAxXSwgJ2lzLWFjdGl2ZScpO1xuICAgIHZhciBvZmZzZXQgPSAoaW5kZXggLSAxKS9zbGlkZXMubGVuZ3RoICogLTEwMCArICclJztcbiAgICB3cmFwcGVyLnN0eWxlLnRyYW5zZm9ybT0gJ3RyYW5zbGF0ZTNkKCcgKyBvZmZzZXQgKyAnLDAsMCknO1xuICB9XG5cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERyb3Bkb3duIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGFuZCBoaWRlIGRyb3Bkb3duIG1lbnVzXG5cbmNhbGNpdGUuZHJvcGRvd24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcm9wZG93bi10b2dnbGUnKTtcbiAgdmFyIGRyb3Bkb3ducyA9IGZpbmRFbGVtZW50cygnLmpzLWRyb3Bkb3duJyk7XG5cbiAgaWYgKCFkcm9wZG93bnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZUFsbERyb3Bkb3ducyAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcm9wZG93bnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGRyb3Bkb3duc1tpXSwgJ2lzLWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZURyb3Bkb3duIChkcm9wZG93bikge1xuICAgIHZhciBpc0FjdGl2ZSA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKGRyb3Bkb3duLCAnaXMtYWN0aXZlJyk7XG4gICAgaWYgKGlzQWN0aXZlKSB7XG4gICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhkcm9wZG93biwgJ2lzLWFjdGl2ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxjaXRlLmRvbS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGNsb3NlQWxsRHJvcGRvd25zKCk7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhkcm9wZG93biwgJ2lzLWFjdGl2ZScpO1xuICAgICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQoZG9jdW1lbnQuYm9keSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgY2xvc2VBbGxEcm9wZG93bnMoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmREcm9wZG93biAodG9nZ2xlKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtZHJvcGRvd24nLCB0b2dnbGUpO1xuICAgICAgdG9nZ2xlRHJvcGRvd24oZHJvcGRvd24pO1xuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZERyb3Bkb3duKHRvZ2dsZXNbaV0pO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBEcmF3ZXIg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgZHJhd2Vyc1xuY2FsY2l0ZS5kcmF3ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcmF3ZXItdG9nZ2xlJyk7XG4gIHZhciBkcmF3ZXJzID0gZmluZEVsZW1lbnRzKCcuanMtZHJhd2VyJyk7XG5cbiAgaWYgKCFkcmF3ZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZFRvZ2dsZSAodG9nZ2xlKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgdmFyIHRhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIodG9nZ2xlLCAnZGF0YS1kcmF3ZXInKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJhd2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZHJhd2VyID0gZHJhd2Vyc1tpXTtcbiAgICAgICAgdmFyIGlzVGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cihkcmF3ZXJzW2ldLCAnZGF0YS1kcmF3ZXInKTtcbiAgICAgICAgaWYgKHRhcmdldCA9PSBpc1RhcmdldCkge1xuICAgICAgICAgdG9nZ2xlQWN0aXZlKGRyYXdlcnMsIGRyYXdlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmREcmF3ZXIgKGRyYXdlcikge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KGRyYXdlciwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRvZ2dsZUFjdGl2ZShkcmF3ZXJzLCBkcmF3ZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZFRvZ2dsZSh0b2dnbGVzW2ldKTtcbiAgfVxuICBmb3IgKHZhciBqID0gMDsgaiA8IGRyYXdlcnMubGVuZ3RoOyBqKyspIHtcbiAgICBiaW5kRHJhd2VyKGRyYXdlcnNbal0pO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBFeHBhbmRpbmcgTmF2IOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGFuZCBoaWRlIGV4YW5kaW5nIG5hdiBsb2NhdGVkIHVuZGVyIHRvcG5hdlxuY2FsY2l0ZS5leHBhbmRpbmdOYXYgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtZXhwYW5kaW5nLXRvZ2dsZScpO1xuICB2YXIgZXhwYW5kZXJzID0gZmluZEVsZW1lbnRzKCcuanMtZXhwYW5kaW5nJyk7XG5cbiAgaWYgKCFleHBhbmRlcnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG5cbiAgICAgIHZhciBzZWN0aW9uTmFtZSA9IGNhbGNpdGUuZG9tLmdldEF0dHIodG9nZ2xlLCAnZGF0YS1leHBhbmRpbmctbmF2Jyk7XG4gICAgICB2YXIgc2VjdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZXhwYW5kaW5nLW5hdicpO1xuICAgICAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZXhwYW5kaW5nLW5hdltkYXRhLWV4cGFuZGluZy1uYXY9XCInICsgc2VjdGlvbk5hbWUgKyAnXCJdJylbMF07XG4gICAgICB2YXIgZXhwYW5kZXIgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy1leHBhbmRpbmcnLCBzZWN0aW9uKTtcbiAgICAgIHZhciBpc09wZW4gPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhleHBhbmRlciwgJ2lzLWFjdGl2ZScpO1xuICAgICAgdmFyIHNob3VsZENsb3NlID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3Moc2VjdGlvbiwgJ2lzLWFjdGl2ZScpO1xuXG4gICAgICBpZiAoaXNPcGVuKSB7XG4gICAgICAgIGlmIChzaG91bGRDbG9zZSkge1xuICAgICAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGV4cGFuZGVyLCAnaXMtYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9nZ2xlQWN0aXZlKHNlY3Rpb25zLCBzZWN0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvZ2dsZUFjdGl2ZShzZWN0aW9ucywgc2VjdGlvbik7XG4gICAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGV4cGFuZGVyLCAnaXMtYWN0aXZlJyk7XG4gICAgICB9XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmRUb2dnbGUodG9nZ2xlc1tpXSk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIE1vZGFsIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGFuZCBoaWRlIG1vZGFsIGRpYWxvZ3Vlc1xuXG5jYWxjaXRlLm1vZGFsID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtbW9kYWwtdG9nZ2xlJyk7XG4gIHZhciBtb2RhbHMgPSBmaW5kRWxlbWVudHMoJy5qcy1tb2RhbCcpO1xuXG4gIGlmICghbW9kYWxzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZFRvZ2dsZSAodG9nZ2xlKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgdmFyIHRhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIodG9nZ2xlLCAnZGF0YS1tb2RhbCcpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RhbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG1vZGFsID0gbW9kYWxzW2ldO1xuICAgICAgICB2YXIgaXNUYXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKG1vZGFsc1tpXSwgJ2RhdGEtbW9kYWwnKTtcbiAgICAgICAgaWYgKHRhcmdldCA9PSBpc1RhcmdldCkge1xuICAgICAgICAgdG9nZ2xlQWN0aXZlKG1vZGFscywgbW9kYWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kTW9kYWwgKG1vZGFsKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQobW9kYWwsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB0b2dnbGVBY3RpdmUobW9kYWxzLCBtb2RhbCk7XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kVG9nZ2xlKHRvZ2dsZXNbaV0pO1xuICB9XG4gIGZvciAodmFyIGogPSAwOyBqIDwgbW9kYWxzLmxlbmd0aDsgaisrKSB7XG4gICAgYmluZE1vZGFsKG1vZGFsc1tqXSk7XG4gIH1cbn07XG5cblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgVGFicyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gdGFiYmVkIGNvbnRlbnQgcGFuZVxuXG5jYWxjaXRlLnRhYnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0YWJzID0gZmluZEVsZW1lbnRzKCcuanMtdGFiJyk7XG4gIHZhciB0YWJHcm91cHMgPSBmaW5kRWxlbWVudHMoJy5qcy10YWItZ3JvdXAnKTtcblxuICBpZiAoIXRhYnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBzZXQgbWF4IHdpZHRoIGZvciBlYWNoIHRhYlxuICBmb3IgKHZhciBqID0gMDsgaiA8IHRhYkdyb3Vwcy5sZW5ndGg7IGorKykge1xuICAgIHZhciB0YWJzSW5Hcm91cCA9IHRhYkdyb3Vwc1tqXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtdGFiJyk7XG4gICAgdmFyIHBlcmNlbnQgPSAxMDAgLyB0YWJzSW5Hcm91cC5sZW5ndGg7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCB0YWJzSW5Hcm91cC5sZW5ndGg7IGsrKyl7XG4gICAgICB0YWJzSW5Hcm91cFtrXS5zdHlsZS5tYXhXaWR0aCA9IHBlcmNlbnQgKyAnJSc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoVGFiIChldmVudCkge1xuICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcblxuICAgIHZhciB0YWIgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy10YWInLCBjYWxjaXRlLmRvbS5ldmVudFRhcmdldChldmVudCkpO1xuICAgIHZhciB0YWJHcm91cCA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLXRhYi1ncm91cCcsIHRhYik7XG4gICAgdmFyIHRhYnMgPSB0YWJHcm91cC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtdGFiJyk7XG4gICAgdmFyIGNvbnRlbnRzID0gdGFiR3JvdXAucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRhYi1zZWN0aW9uJyk7XG4gICAgdmFyIGluZGV4ID0gY2FsY2l0ZS5hcnIuaW5kZXhPZih0YWIsIHRhYnMpO1xuXG4gICAgcmVtb3ZlQWN0aXZlKHRhYnMpO1xuICAgIHJlbW92ZUFjdGl2ZShjb250ZW50cyk7XG5cbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyh0YWIsICdpcy1hY3RpdmUnKTtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjb250ZW50c1tpbmRleF0sICdpcy1hY3RpdmUnKTtcbiAgfVxuXG4gIC8vIGF0dGFjaCB0aGUgc3dpdGNoVGFiIGV2ZW50IHRvIGFsbCB0YWJzXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGFicy5sZW5ndGg7IGkrKykge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRhYnNbaV0sIGNhbGNpdGUuZG9tLmV2ZW50KCksIHN3aXRjaFRhYik7XG4gIH1cblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgU3RpY2t5IOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzdGlja3MgdGhpbmdzIHRvIHRoZSB3aW5kb3dcblxuY2FsY2l0ZS5zdGlja3kgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbGVtZW50cyA9IGZpbmRFbGVtZW50cygnLmpzLXN0aWNreScpO1xuXG4gIGlmICghZWxlbWVudHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3RpY2tpZXMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gZWxlbWVudHNbaV07XG4gICAgdmFyIHRvcCA9IGVsLm9mZnNldFRvcDtcbiAgICBpZiAoZWwuZGF0YXNldC50b3ApIHtcbiAgICAgIHRvcCA9IHRvcCAtIHBhcnNlSW50KGVsLmRhdGFzZXQudG9wLCAwKTtcbiAgICB9XG4gICAgc3RpY2tpZXMucHVzaCh7XG4gICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgdG9wOiB0b3AsXG4gICAgICBzaGltOiBlbC5jbG9uZU5vZGUoJ2RlZXAnKSxcbiAgICAgIGVsZW1lbnQ6IGVsXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoaXRlbSwgb2Zmc2V0KSB7XG4gICAgdmFyIGVsZW0gPSBpdGVtLmVsZW1lbnQ7XG4gICAgdmFyIHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICB2YXIgZGlzdGFuY2UgPSBpdGVtLnRvcCAtIG9mZnNldDtcblxuICAgIGlmIChkaXN0YW5jZSA8IDEgJiYgIWl0ZW0uYWN0aXZlKSB7XG4gICAgICBpdGVtLnNoaW0uc3R5bGUudmlzaWJsaXR5ID0gJ2hpZGRlbic7XG4gICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGl0ZW0uc2hpbSwgZWxlbSk7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhlbGVtLCAnaXMtc3RpY2t5Jyk7XG4gICAgICBpdGVtLmFjdGl2ZSA9IHRydWU7XG4gICAgICBlbGVtLnN0eWxlLnRvcCA9IGVsZW0uZGF0YXNldC50b3AgKyAncHgnO1xuICAgIH0gZWxzZSBpZiAoaXRlbS5hY3RpdmUgJiYgb2Zmc2V0IDwgaXRlbS50b3Ape1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0uc2hpbSk7XG4gICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhlbGVtLCAnaXMtc3RpY2t5Jyk7XG4gICAgICBlbGVtLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgICBpdGVtLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGlja2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgaGFuZGxlU2Nyb2xsKHN0aWNraWVzW2ldLCBvZmZzZXQpO1xuICAgIH1cbiAgfSk7XG5cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEluaXRpYWxpemUgQ2FsY2l0ZSDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc3RhcnQgdXAgQ2FsY2l0ZSBhbmQgYXR0YWNoIGFsbCB0aGUgcGF0dGVybnNcbi8vIG9wdGlvbmFsbHkgcGFzcyBhbiBhcnJheSBvZiBwYXR0ZXJucyB5b3UnZCBsaWtlIHRvIHdhdGNoXG5cbmNhbGNpdGUuaW5pdCA9IGZ1bmN0aW9uIChwYXR0ZXJucykge1xuICBpZiAocGF0dGVybnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdHRlcm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxjaXRlW3BhdHRlcm5zW2ldXSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYWxjaXRlLm1vZGFsKCk7XG4gICAgY2FsY2l0ZS5kcm9wZG93bigpO1xuICAgIGNhbGNpdGUuZHJhd2VyKCk7XG4gICAgY2FsY2l0ZS5leHBhbmRpbmdOYXYoKTtcbiAgICBjYWxjaXRlLnRhYnMoKTtcbiAgICBjYWxjaXRlLmFjY29yZGlvbigpO1xuICAgIGNhbGNpdGUuY2Fyb3VzZWwoKTtcbiAgICBjYWxjaXRlLnN0aWNreSgpO1xuICB9XG5cbiAgLy8gYWRkIGEgdG91Y2ggY2xhc3MgdG8gdGhlIGJvZHlcbiAgaWYgKCBjYWxjaXRlLmJyb3dzZXIuaXNUb3VjaCgpICkge1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGRvY3VtZW50LmJvZHksICdjYWxjaXRlLXRvdWNoJyk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEV4cG9zZSBDYWxjaXRlLmpzIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBpbXBsZW1lbnRhdGlvbiBib3Jyb3dlZCBmcm9tIExlYWZsZXRcblxuLy8gZGVmaW5lIGNhbGNpdGUgYXMgYSBnbG9iYWwgdmFyaWFibGUsIHNhdmluZyB0aGUgb3JpZ2luYWwgdG8gcmVzdG9yZSBsYXRlciBpZiBuZWVkZWRcbmZ1bmN0aW9uIGV4cG9zZSAoKSB7XG4gIHZhciBvbGRDYWxjaXRlID0gd2luZG93LmNhbGNpdGU7XG5cbiAgY2FsY2l0ZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5jYWxjaXRlID0gb2xkQ2FsY2l0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuY2FsY2l0ZSA9IGNhbGNpdGU7XG59XG5cbi8vIG5vIE5QTS9BTUQgZm9yIG5vdyBiZWNhdXNlIGl0IGp1c3QgY2F1c2VzIGlzc3Vlc1xuLy8gQFRPRE86IGJ1c3QgdGhlbSBpbnRvIEFNRCAmIE5QTSBkaXN0cm9zXG5cbi8vIC8vIGRlZmluZSBDYWxjaXRlIGZvciBDb21tb25KUyBtb2R1bGUgcGF0dGVybiBsb2FkZXJzIChOUE0sIEJyb3dzZXJpZnkpXG4vLyBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuLy8gICBtb2R1bGUuZXhwb3J0cyA9IGNhbGNpdGU7XG4vLyB9XG5cbi8vIC8vIGRlZmluZSBDYWxjaXRlIGFzIGFuIEFNRCBtb2R1bGVcbi8vIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuLy8gICBkZWZpbmUoY2FsY2l0ZSk7XG4vLyB9XG5cbmV4cG9zZSgpO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKGdsb2JhbCl7XG5cbiAgZnVuY3Rpb24gVGlueVN0b3JlIChuYW1lLCBvcHRpb25hbFN0b3JlKSB7XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgdGhpcy5zdG9yZSA9IHR5cGVvZiBvcHRpb25hbFN0b3JlICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbmFsU3RvcmUgOiBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnVGlueVN0b3JlJztcbiAgICB0aGlzLmVuYWJsZWQgPSBpc0VuYWJsZWQodGhpcy5zdG9yZSk7XG5cbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNlc3Npb24gPSBKU09OLnBhcnNlKHRoaXMuc3RvcmVbdGhpcy5uYW1lXSkgfHwge307XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLnN0b3JlW3RoaXMubmFtZV0gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnNlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLnNlc3Npb25ba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25ba2V5XTtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uW2tleV07XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5zZXNzaW9uW2tleV07XG4gICAgZGVsZXRlIHRoaXMuc2Vzc2lvbltrZXldO1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW3RoaXMubmFtZV07XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRW5hYmxlZCAoc3RvcmUpIHtcbiAgICAvLyBkZWZpbml0ZWx5IGludmFsaWQ6XG4gICAgLy8gKiBudWxsXG4gICAgLy8gKiB1bmRlZmluZWRcbiAgICAvLyAqIE5hTlxuICAgIC8vICogZW1wdHkgc3RyaW5nIChcIlwiKVxuICAgIC8vICogMFxuICAgIC8vICogZmFsc2VcbiAgICBpZiAoIXN0b3JlKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdmFyIHN0b3JlVHlwZSA9IHR5cGVvZiBzdG9yZTtcbiAgICB2YXIgaXNMb2NhbE9yU2Vzc2lvbiA9IHR5cGVvZiBzdG9yZS5nZXRJdGVtID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBzdG9yZS5zZXRJdGVtID09PSAnZnVuY3Rpb24nO1xuICAgIHZhciBpc09iamVjdE9yRnVuY3Rpb24gPSBzdG9yZVR5cGUgPT09ICdvYmplY3QnIHx8IHN0b3JlVHlwZSA9PT0gJ2Z1bmN0aW9uJztcblxuICAgIC8vIHN0b3JlIGlzIHZhbGlkIGlmZiBpdCBpcyBlaXRoZXJcbiAgICAvLyAoYSkgbG9jYWxTdG9yYWdlIG9yIHNlc3Npb25TdG9yYWdlXG4gICAgLy8gKGIpIGEgcmVndWxhciBvYmplY3Qgb3IgZnVuY3Rpb25cbiAgICBpZiAoaXNMb2NhbE9yU2Vzc2lvbiB8fCBpc09iamVjdE9yRnVuY3Rpb24pIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIC8vIGNhdGNoYWxsIGZvciBvdXRsaWVycyAoc3RyaW5nLCBwb3NpdGl2ZSBudW1iZXIsIHRydWUgYm9vbGVhbiwgeG1sKVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdsb2JhbC5UaW55U3RvcmUgPSBUaW55U3RvcmU7XG5cbn0pKHRoaXMpO1xuIiwiaW1wb3J0IFRTIGZyb20gJ3RpbnlzdG9yZSdcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2FydCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gaGFuZGxlIHRoZSBmaW5lc3Qgb2Ygc2hvcHBpbmcgZXhwZXJpZW5jZXNcbmZ1bmN0aW9uIFRpbnlDYXJ0KHtcbiAgY2FydE5hbWUgPSAnVGlueUNhcnQnLFxuICBjdXJyZW5jeSA9ICckJyxcbiAgdGF4UmF0ZSA9IDAuMDAsXG4gIHRheCA9IDAuMDAsXG4gIGJhc2VTaGlwcGluZyA9IDAuMDAsXG4gIHNoaXBwaW5nID0gMC4wMCxcbiAgc2hpcFRvdGFsID0gMC4wMCxcbiAgc3VidG90YWwgPSAwLjAwLFxuICB0b3RhbCA9IDAuMDAsXG4gIGl0ZW1zID0gW11cbn0gPSB7fSkge1xuICB2YXIgdHMgPSBuZXcgVFMuVGlueVN0b3JlKGNhcnROYW1lKVxuXG4gIGlmICghdHMuZ2V0KCdjdXJyZW5jeScpKSB7dHMuc2V0KCdjdXJyZW5jeScsIGN1cnJlbmN5KX1cbiAgaWYgKCF0cy5nZXQoJ3RheFJhdGUnKSkge3RzLnNldCgndGF4UmF0ZScsIHRheFJhdGUpfVxuICBpZiAoIXRzLmdldCgndGF4JykpIHt0cy5zZXQoJ3RheCcsIHRheCl9XG4gIGlmICghdHMuZ2V0KCdiYXNlU2hpcHBpbmcnKSkge3RzLnNldCgnYmFzZVNoaXBwaW5nJywgYmFzZVNoaXBwaW5nKX1cbiAgaWYgKCF0cy5nZXQoJ3NoaXBwaW5nJykpIHt0cy5zZXQoJ3NoaXBwaW5nJywgc2hpcHBpbmcpfVxuICBpZiAoIXRzLmdldCgnc3VidG90YWwnKSkge3RzLnNldCgnc3VidG90YWwnLCBzdWJ0b3RhbCl9XG4gIGlmICghdHMuZ2V0KCd0b3RhbCcpKSB7dHMuc2V0KCd0b3RhbCcsIHRvdGFsKX1cbiAgaWYgKCF0cy5nZXQoJ2l0ZW1zJykpIHt0cy5zZXQoJ2l0ZW1zJywgaXRlbXMpfVxuXG4gIC8vIFJldHVybnMgdGhlIENhcnQgb2JqZWN0IGFuZCBzcGVjaWZpYyBjYXJ0IG9iamVjdCB2YWx1ZXNcbiAgdGhpcy5nZXRDYXJ0ID0gKCkgPT4geyByZXR1cm4gdHMuc2Vzc2lvbiB9XG5cbiAgdGhpcy5jYWxjdWxhdGVDYXJ0ID0gKCkgPT4ge1xuICAgIGxldCBudW1JdGVtcyAgICAgPSAwXG4gICAgbGV0IHN1YnRvdGFsICAgICA9IDBcbiAgICBsZXQgdGF4ICAgICAgICAgID0gMFxuICAgIGxldCB0b3RhbCAgICAgICAgPSAwXG4gICAgbGV0IHNoaXBUb3RhbCAgICA9IDBcbiAgICBsZXQgaXRlbXMgICAgICAgID0gdHMuZ2V0KCdpdGVtcycpXG4gICAgbGV0IGJhc2VTaGlwcGluZyA9IHRzLmdldCgnYmFzZVNoaXBwaW5nJylcbiAgICBsZXQgdGF4UmF0ZSAgICAgID0gdHMuZ2V0KCd0YXhSYXRlJylcbiAgICBsZXQgc2hpcHBpbmcgICAgID0gdHMuZ2V0KCdzaGlwcGluZycpXG5cbiAgICBpdGVtcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgbnVtSXRlbXMgPSBudW1JdGVtcyArIGkucXVhbnRpdHlcbiAgICAgIHN1YnRvdGFsID0gaS5wcmljZSAqIGkucXVhbnRpdHkgKyBzdWJ0b3RhbFxuICAgIH0pXG5cbiAgICB0YXggPSB0YXhSYXRlICogc3VidG90YWxcbiAgICBzaGlwVG90YWwgPSAhaXRlbXMubGVuZ3RoID8gMCA6IHNoaXBwaW5nICogbnVtSXRlbXMgKyBiYXNlU2hpcHBpbmdcbiAgICB0b3RhbCA9IHNoaXBUb3RhbCArIHN1YnRvdGFsICsgdGF4XG5cbiAgICB0cy5zZXQoJ3RheCcsIHRheClcbiAgICB0cy5zZXQoJ3N1YnRvdGFsJywgc3VidG90YWwpXG4gICAgdHMuc2V0KCdzaGlwVG90YWwnLCBzaGlwVG90YWwpXG4gICAgdHMuc2V0KCd0b3RhbCcsIHRvdGFsKVxuICB9XG5cbiAgdGhpcy5hZGRJdGVtID0gKHRpdGxlLCBpZCwgcHJpY2UsIHF1YW50aXR5KSA9PiB7XG4gICAgbGV0IGhhc0l0ZW0gPSBmYWxzZVxuICAgIGxldCBpdGVtSWRcblxuICAgIGlmICh0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykuZm9yRWFjaChpID0+IHtcbiAgICAgICAgaWYgKGkuaWQgPT0gaWQpIHtcbiAgICAgICAgICBoYXNJdGVtID0gdHJ1ZVxuICAgICAgICAgIGl0ZW1JZCA9IGlkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKCFoYXNJdGVtKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICBwcmljZTogcHJpY2UsXG4gICAgICAgIHF1YW50aXR5OiBxdWFudGl0eVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdHMuZ2V0KCdpdGVtcycpLmZvckVhY2goaSA9PiB7XG4gICAgICAgIGlmIChpLmlkID09IGlkKSB7XG4gICAgICAgICAgaS5xdWFudGl0eSA9IGkucXVhbnRpdHkgKyBxdWFudGl0eVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuY2FsY3VsYXRlQ2FydCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIGl0ZW0gaGVscGVyc1xuICB0aGlzLmhhc0l0ZW1zID0gKCkgPT4ge1xuICAgIHRzLmdldCgnaXRlbXMnKS5sZW5ndGggPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuaXNJdGVtID0gKGksIGlkKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2codHMuZ2V0KCdpdGVtcycpW2ldLmlkLCBpZClcbiAgICB0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQgPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuZ2V0SXRlbSA9IChpZCkgPT4ge1xuICAgIGlmICh0aGlzLmhhc0l0ZW1zKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdObyBpdGVtcyBpbiBjYXJ0OiAnLCB0cy5zZXNzaW9uKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmlzSXRlbShpLCBpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRzLmdldCgnaXRlbXMnKVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVtb3ZlSXRlbSA9IChpZCwgbnVtICkgPT4ge1xuICAgIGxldCBpdGVtcyA9IHRzLmdldCgnaXRlbXMnKVxuICAgIG51bSA9IHR5cGVvZiBudW0gIT09ICd1bmRlZmluZWQnID8gIG51bSA6IDE7XG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkKSB7XG4gICAgICAgIGlmIChpdGVtc1tpXS5xdWFudGl0eSA9PSAxKSB7XG4gICAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1zW2ldLnF1YW50aXR5ID0gaXRlbXNbaV0ucXVhbnRpdHkgLSBudW1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZGVzdHJveUl0ZW0gPSAoaWQpID0+IHtcbiAgICBsZXQgaXRlbXMgPSB0cy5nZXQoJ2l0ZW1zJylcbiAgICBpZiAodGhpcy5oYXNJdGVtcygpKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gaXRlbXMgaW4gY2FydDogJywgdHMuc2Vzc2lvbilcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQpIHtcbiAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZW1wdHlDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLnNldCgnaXRlbXMnLCBbXSlcbiAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB0aGlzLmRlc3Ryb3lDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLmNsZWFyKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGlueUNhcnQiLCJpbXBvcnQgY2FsY2l0ZSBmcm9tICdjYWxjaXRlLXdlYidcbmltcG9ydCBUaW55Q2FydCBmcm9tICcuL2NhcnQuanMnXG5cbi8vIHZhciBjYXJ0ID0gQ2FydFxuXG53aW5kb3cuY2FydCA9IG5ldyBUaW55Q2FydCh7XG4gIGNhcnROYW1lOiAnbG9uZWdvb3NlcHJlc3NDYXJ0JyxcbiAgY3VycmVuY3k6ICckJyxcbiAgYmFzZVNoaXBwaW5nOiAxMC4wMCxcbiAgc2hpcHBpbmc6IDQuMDBcbn0pXG5cbndpbmRvdy5jYWxjaXRlLmluaXQoKSJdfQ==

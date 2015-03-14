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

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

/**
* Create a new array like object of dom elements
*/
function Query() {
  var _this = this;

  this.each = function (fn) {
    _this.forEach(fn);
    return _this;
  };
  /**
  * Add a class to selected elements
  * @param {String} className The class name to add
  */
  this.addClass = function (className) {
    return _this.each(function (e) {
      return e.classList.add(className);
    });
  };
  /**
  * Remove a class from selected elements
  * @param {String} className The class name to remove
  */
  this.removeClass = function (className) {
    return _this.each(function (e) {
      return e.classList.remove(className);
    });
  };
  /**
  * Toggle a class from selected elements
  * @param {String} className The class name to toggle
  */
  this.toggleClass = function (className) {
    return _this.each(function (e) {
      return e.classList.toggle(className);
    });
  };
  /**
  * Attach an event listener with a callback to the selected elements
  * @param {String} event Name of event, eg. "click", "mouseover", etc...
  * @param {Function} callback The function to call when the event is triggered
  */
  this.on = function (event, fn) {
    return _this.each(function (e) {
      return e.addEventListener(event, fn, false);
    });
  };
}

Query.prototype = Array.prototype;

var $ = function (selector) {
  var collection = new Query();
  collection.push.apply(collection, _toConsumableArray(document.querySelectorAll(selector)));
  return collection;
};

module.exports = $;

},{}],4:[function(require,module,exports){
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

},{"tinystore":2}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var calcite = _interopRequire(require("calcite-web"));

var $ = _interopRequire(require("./$.js"));

var TinyCart = _interopRequire(require("./cart.js"));

// var cart = Cart

window.cart = new TinyCart({
  cartName: "lonegoosepressCart",
  currency: "$",
  baseShipping: 10,
  shipping: 4
});

var summary = cart.getCart();

var shipping = document.getElementsByClassName("tinycart-shipping")[0];
if (shipping) {
  shipping.innerHTML = summary.shipTotal;
}

var subtotal = document.getElementsByClassName("tinycart-subtotal")[0];
if (subtotal) {
  subtotal.innerHTML = summary.subtotal;
}

var total = document.getElementsByClassName("tinycart-total")[0];
if (total) {
  total.innerHTML = summary.total;
}

var itemDiv = document.getElementsByClassName("tinycart-items")[0];
if (itemDiv) {
  var items = cart.getCart().items;
  items.forEach(function (item) {
    itemDiv.innerHTML = itemDiv.innerHTML + "<div class=\"column-24 first-column line-item\">" + "<div class=\"column-1 text-right pre-3\">" + "<span class=\"remove-item\"> <a href=\"#\"> x </a> </span>" + "</div>" + "<div class=\"column-9\">" + "<span>" + item.title + "</span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<span> <a href=\"#\"> - </a> </span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<span>" + item.quantity + "</span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<span> <a href=\"#\"> + </a> </span>" + "</div>" + "<div class=\"column-2 pre-1\">" + "<span>$</span>" + "<span class=\"right\">" + item.price + "</span>" + "</div>" + "<div class=\"column-2 pre-1\">" + "<span>$</span>" + "<span class=\"right\">" + item.quantity * item.price + "</span>" + "</div>" + "</div>";
  });
}

var handler = StripeCheckout.configure({
  key: "pk_test_6pRNASCoBOKtIshFeQd4XMUh",
  image: "https://stripe.com/img/documentation/checkout/marketplace.png",
  token: function token(token, args) {}
});

document.getElementById("tinycart-checkout").addEventListener("click", function (e) {
  var order = cart.getCart();
  handler.open({
    name: "lone goose press",
    description: "$" + order.total,
    amount: order.total * 100,
    shippingAddress: true,
    billingAddress: true });
  e.preventDefault();
});

window.calcite.init();

// Use the token to create the charge with a server-side script.
// You can access the token ID with `token.id`
// args will contain all the billing and shipping info.
// The billing info is automatically attached to the token and card.

},{"./$.js":3,"./cart.js":4,"calcite-web":1}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FsY2l0ZS13ZWIvbGliL2pzL2NhbGNpdGUtd2ViLmpzIiwibm9kZV9tb2R1bGVzL3RpbnlzdG9yZS90aW55c3RvcmUuanMiLCJzb3VyY2UvYXNzZXRzL2pzLyQuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2NhcnQuanMiLCJzb3VyY2UvYXNzZXRzL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNyRUEsU0FBUyxLQUFLLEdBQUc7OztBQUNmLE1BQUksQ0FBQyxJQUFJLEdBQUcsVUFBQyxFQUFFLEVBQUs7QUFDbEIsVUFBSyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDaEIsaUJBQVc7R0FDWixDQUFBOzs7OztBQUtELE1BQUksQ0FBQyxRQUFRLEdBQUcsVUFBQSxTQUFTO1dBQUksTUFBSyxJQUFJLENBQUMsVUFBQSxDQUFDO2FBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0tBQUEsQ0FBQztHQUFBLENBQUE7Ozs7O0FBS3ZFLE1BQUksQ0FBQyxXQUFXLEdBQUcsVUFBQSxTQUFTO1dBQUksTUFBSyxJQUFJLENBQUMsVUFBQSxDQUFDO2FBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0tBQUEsQ0FBQztHQUFBLENBQUE7Ozs7O0FBSzdFLE1BQUksQ0FBQyxXQUFXLEdBQUcsVUFBQSxTQUFTO1dBQUksTUFBSyxJQUFJLENBQUMsVUFBQSxDQUFDO2FBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0tBQUEsQ0FBQztHQUFBLENBQUE7Ozs7OztBQU03RSxNQUFJLENBQUMsRUFBRSxHQUFHLFVBQUMsS0FBSyxFQUFFLEVBQUU7V0FBSyxNQUFLLElBQUksQ0FBQyxVQUFBLENBQUM7YUFBSSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUM7S0FBQSxDQUFDO0dBQUEsQ0FBQTtDQUM5RTs7QUFFRCxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUE7O0FBRWpDLElBQUksQ0FBQyxHQUFHLFVBQUEsUUFBUSxFQUFJO0FBQ2xCLE1BQUksVUFBVSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDN0IsWUFBVSxDQUFDLElBQUksTUFBQSxDQUFmLFVBQVUscUJBQVMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUE7QUFDdkQsU0FBTyxVQUFVLENBQUM7Q0FDbkIsQ0FBQTs7aUJBRWMsQ0FBQzs7Ozs7OztJQ3ZDVCxFQUFFLDJCQUFNLFdBQVc7Ozs7OztBQU0xQixTQUFTLFFBQVEsR0FXVDs7OzBDQUFKLEVBQUU7OzJCQVZKLFFBQVE7TUFBUixRQUFRLGlDQUFHLFVBQVU7MkJBQ3JCLFFBQVE7TUFBUixRQUFRLGlDQUFHLEdBQUc7MEJBQ2QsT0FBTztNQUFQLE9BQU8sZ0NBQUcsQ0FBSTtzQkFDZCxHQUFHO01BQUgsR0FBRyw0QkFBRyxDQUFJOytCQUNWLFlBQVk7TUFBWixZQUFZLHFDQUFHLENBQUk7MkJBQ25CLFFBQVE7TUFBUixRQUFRLGlDQUFHLENBQUk7NEJBQ2YsU0FBUztNQUFULFNBQVMsa0NBQUcsQ0FBSTsyQkFDaEIsUUFBUTtNQUFSLFFBQVEsaUNBQUcsQ0FBSTt3QkFDZixLQUFLO01BQUwsS0FBSyw4QkFBRyxDQUFJO3dCQUNaLEtBQUs7TUFBTCxLQUFLLDhCQUFHLEVBQUU7O0FBRVYsTUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUVuQyxNQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUFDLE1BQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQUM7QUFDdkQsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUFDO0FBQ3BELE1BQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQUMsTUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7R0FBQztBQUN4QyxNQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtBQUFDLE1BQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFBO0dBQUM7QUFDbkUsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUFDO0FBQ3ZELE1BQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQUMsTUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FBQztBQUN2RCxNQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUFDLE1BQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQUM7QUFDOUMsTUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFBQyxNQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUFDOzs7QUFHOUMsTUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFNO0FBQUUsV0FBTyxFQUFFLENBQUMsT0FBTyxDQUFBO0dBQUUsQ0FBQTs7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LG1CQUFtQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQy9FLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUMxQixTQUFPLENBQUMsSUFBSSxDQUFDO0FBQ1QsUUFBSSxFQUFFLGtCQUFrQjtBQUN4QixlQUFXLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLO0FBQzlCLFVBQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUc7QUFDekIsbUJBQWUsRUFBRSxJQUFJO0FBQ3JCLGtCQUFjLEVBQUUsSUFBSSxFQUN2QixDQUFDLENBQUM7QUFDSCxHQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Q0FDdEIsQ0FBQyxDQUFDOztBQUdILE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIENhbGNpdGUgKCkge1xuXG52YXIgY2FsY2l0ZSA9IHtcbiAgdmVyc2lvbjogJzAuMC45J1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIFV0aWxpdGllcyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG5jYWxjaXRlLmRvbSA9IHt9O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBET00gRXZlbnQgTWFuYWdlbWVudCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyByZXR1cm5zIHN0YW5kYXJkIGludGVyYWN0aW9uIGV2ZW50LCBsYXRlciB3aWxsIGFkZCB0b3VjaCBzdXBwb3J0XG5jYWxjaXRlLmRvbS5ldmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICdjbGljayc7XG59O1xuXG4vLyBhZGQgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBhbiBldmVudCBvbiBhIERPTSBub2RlXG5jYWxjaXRlLmRvbS5hZGRFdmVudCA9IGZ1bmN0aW9uIChkb21Ob2RlLCBldmVudCwgZm4pIHtcbiAgaWYgKGRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHJldHVybiBkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gIH1cbiAgaWYgKGRvbU5vZGUuYXR0YWNoRXZlbnQpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgfVxufTtcblxuLy8gcmVtb3ZlIGEgc3BlY2lmaWMgZnVuY3Rpb24gYmluZGluZyBmcm9tIGEgRE9NIG5vZGUgZXZlbnRcbmNhbGNpdGUuZG9tLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gKGRvbU5vZGUsIGV2ZW50LCBmbikge1xuICBpZiAoZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgcmV0dXJuIGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgfVxuICBpZiAoZG9tTm9kZS5kZXRhY2hFdmVudCkge1xuICAgIHJldHVybiBkb21Ob2RlLmRldGFjaEV2ZW50KCdvbicgKyBldmVudCwgIGZuKTtcbiAgfVxufTtcblxuLy8gZ2V0IHRoZSB0YXJnZXQgZWxlbWVudCBvZiBhbiBldmVudFxuY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQpIHtcbiAgICByZXR1cm4gZXZlbnQuc3JjRWxlbWVudDtcbiAgfVxuICBpZiAoZXZlbnQudGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldDtcbiAgfVxufTtcblxuLy8gcHJldmVudCBkZWZhdWx0IGJlaGF2aW9yIG9mIGFuIGV2ZW50XG5jYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICByZXR1cm4gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBpZiAoZXZlbnQucmV0dXJuVmFsdWUpIHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICB9XG59O1xuXG4vLyBzdG9wIGFuZCBldmVudCBmcm9tIGJ1YmJsaW5nIHVwIHRoZSBET00gdHJlZVxuY2FsY2l0ZS5kb20uc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xuICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgcmV0dXJuIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGlmIChldmVudC5jYW5jZWxCdWJibGUpIHtcbiAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBDbGFzcyBNYW5pcHVsYXRpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gY2hlY2sgaWYgYW4gZWxlbWVudCBoYXMgYSBzcGVjaWZpYyBjbGFzc1xuY2FsY2l0ZS5kb20uaGFzQ2xhc3MgPSBmdW5jdGlvbiAoZG9tTm9kZSwgY2xhc3NOYW1lKSB7XG4gIHZhciBleHAgPSBuZXcgUmVnRXhwKCcgJyArIGNsYXNzTmFtZSArICcgJyk7XG4gIGlmIChleHAudGVzdCgnICcgKyBkb21Ob2RlLmNsYXNzTmFtZSArICcgJykpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIGFkZCBvbmUgb3IgbW9yZSBjbGFzc2VzIHRvIGFuIGVsZW1lbnRcbmNhbGNpdGUuZG9tLmFkZENsYXNzID0gZnVuY3Rpb24gKGRvbU5vZGUsIGNsYXNzZXMpIHtcbiAgY2xhc3NlcyA9IGNsYXNzZXMuc3BsaXQoJyAnKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIWNhbGNpdGUuZG9tLmhhc0NsYXNzKGRvbU5vZGUsIGNsYXNzZXNbaV0pKSB7XG4gICAgICBkb21Ob2RlLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc2VzW2ldO1xuICAgIH1cbiAgfVxufTtcblxuLy8gcmVtb3ZlIG9uZSBvciBtb3JlIGNsYXNzZXMgZnJvbSBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBjbGFzc2VzKSB7XG4gIGNsYXNzZXMgPSBjbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG5ld0NsYXNzID0gJyAnICsgZG9tTm9kZS5jbGFzc05hbWUucmVwbGFjZSggL1tcXHRcXHJcXG5dL2csICcgJykgKyAnICc7XG5cbiAgICBpZiAoY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZG9tTm9kZSwgY2xhc3Nlc1tpXSkpIHtcbiAgICAgIHdoaWxlIChuZXdDbGFzcy5pbmRleE9mKCcgJyArIGNsYXNzZXNbaV0gKyAnICcpID49IDApIHtcbiAgICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKCcgJyArIGNsYXNzZXNbaV0gKyAnICcsICcgJyk7XG4gICAgICB9XG5cbiAgICAgIGRvbU5vZGUuY2xhc3NOYW1lID0gbmV3Q2xhc3MucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgIH1cbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIFRyYXZlcnNhbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyByZXR1cm5zIGNsb3Nlc3QgZWxlbWVudCB1cCB0aGUgRE9NIHRyZWUgbWF0Y2hpbmcgYSBnaXZlbiBjbGFzc1xuY2FsY2l0ZS5kb20uY2xvc2VzdCA9IGZ1bmN0aW9uIChjbGFzc05hbWUsIGNvbnRleHQpIHtcbiAgdmFyIHJlc3VsdCwgY3VycmVudDtcbiAgZm9yIChjdXJyZW50ID0gY29udGV4dDsgY3VycmVudDsgY3VycmVudCA9IGN1cnJlbnQucGFyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSAxICYmIGNhbGNpdGUuZG9tLmhhc0NsYXNzKGN1cnJlbnQsIGNsYXNzTmFtZSkpIHtcbiAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnQ7XG59O1xuXG4vLyBnZXQgYW4gYXR0cmlidXRlIGZvciBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5nZXRBdHRyID0gZnVuY3Rpb24oZG9tTm9kZSwgYXR0cikge1xuICBpZiAoZG9tTm9kZS5nZXRBdHRyaWJ1dGUpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gIH1cblxuICB2YXIgcmVzdWx0O1xuICB2YXIgYXR0cnMgPSBkb21Ob2RlLmF0dHJpYnV0ZXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhdHRyc1tpXS5ub2RlTmFtZSA9PT0gYXR0cikge1xuICAgICAgcmVzdWx0ID0gYXR0cnNbaV0ubm9kZVZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBPYmplY3QgQ29udmVyc2lvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyB0dXJuIGEgZG9tTm9kZUxpc3QgaW50byBhbiBhcnJheVxuY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5ID0gZnVuY3Rpb24gKGRvbU5vZGVMaXN0KSB7XG4gIHZhciBhcnJheSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRvbU5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXkucHVzaChkb21Ob2RlTGlzdFtpXSk7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQXJyYXkgTWFuaXB1bGF0aW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbmNhbGNpdGUuYXJyID0ge307XG5cbi8vIHJldHVybiB0aGUgaW5kZXggb2YgYW4gb2JqZWN0IGluIGFuIGFycmF5IHdpdGggb3B0aW9uYWwgb2Zmc2V0XG5jYWxjaXRlLmFyci5pbmRleE9mID0gZnVuY3Rpb24gKG9iaiwgYXJyLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBvZmZzZXQgfHwgMDtcblxuICBpZiAoYXJyLmluZGV4T2YpIHtcbiAgICByZXR1cm4gYXJyLmluZGV4T2Yob2JqLCBpKTtcbiAgfVxuXG4gIGZvciAoaTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQnJvd3NlciBGZWF0dXJlIERldGVjdGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gZGV0ZWN0IGZlYXR1cmVzIGxpa2UgdG91Y2gsIGllLCBldGMuXG5cbmNhbGNpdGUuYnJvd3NlciA9IHt9O1xuXG4vLyBkZXRlY3QgdG91Y2gsIGNvdWxkIGJlIGltcHJvdmVkIGZvciBtb3JlIGNvdmVyYWdlXG5jYWxjaXRlLmJyb3dzZXIuaXNUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgSlMgUGF0dGVybnMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGphdmFzY3JpcHQgbG9naWMgZm9yIHVpIHBhdHRlcm5zXG5cbmZ1bmN0aW9uIGZpbmRFbGVtZW50cyAoY2xhc3NOYW1lKSB7XG4gIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2xhc3NOYW1lKTtcbiAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoZWxlbWVudHMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vLyByZW1vdmUgJ2lzLWFjdGl2ZScgY2xhc3MgZnJvbSBldmVyeSBlbGVtZW50IGluIGFuIGFycmF5XG5mdW5jdGlvbiByZW1vdmVBY3RpdmUgKGFycmF5KSB7XG4gIGlmICh0eXBlb2YgYXJyYXkgPT0gJ29iamVjdCcpIHtcbiAgICBhcnJheSA9IGNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheShhcnJheSk7XG4gIH1cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGl0ZW0sICdpcy1hY3RpdmUnKTtcbiAgfSk7XG59XG5cbi8vIHJlbW92ZSAnaXMtYWN0aXZlJyBmcm9tIGFycmF5LCBhZGQgdG8gZWxlbWVudFxuZnVuY3Rpb24gdG9nZ2xlQWN0aXZlIChhcnJheSwgZWwpIHtcbiAgdmFyIGlzQWN0aXZlID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZWwsICdpcy1hY3RpdmUnKTtcbiAgaWYgKGlzQWN0aXZlKSB7XG4gICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZWwsICdpcy1hY3RpdmUnKTtcbiAgfSBlbHNlIHtcbiAgICByZW1vdmVBY3RpdmUoYXJyYXkpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIH1cbn1cblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQWNjb3JkaW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBjb2xsYXBzaWJsZSBhY2NvcmRpb24gbGlzdFxuXG5jYWxjaXRlLmFjY29yZGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjY29yZGlvbnMgPSBmaW5kRWxlbWVudHMoJy5qcy1hY2NvcmRpb24nKTtcblxuICBpZiAoIWFjY29yZGlvbnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFjY29yZGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBhY2NvcmRpb25zW2ldLmNoaWxkcmVuO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KGNoaWxkcmVuW2pdLCBjYWxjaXRlLmRvbS5ldmVudCgpLCB0b2dnbGVBY2NvcmRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZUFjY29yZGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgcGFyZW50ID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnYWNjb3JkaW9uLXNlY3Rpb24nLCBjYWxjaXRlLmRvbS5ldmVudFRhcmdldChldmVudCkpO1xuICAgIGlmIChjYWxjaXRlLmRvbS5oYXNDbGFzcyhwYXJlbnQsICdpcy1hY3RpdmUnKSkge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MocGFyZW50LCAnaXMtYWN0aXZlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHBhcmVudCwgJ2lzLWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBDYXJvdXNlbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBjYXJvdXNlbCB3aXRoIGFueSBudW1iZXIgb2Ygc2xpZGVzXG5cbmNhbGNpdGUuY2Fyb3VzZWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGNhcm91c2VscyA9IGZpbmRFbGVtZW50cygnLmpzLWNhcm91c2VsJyk7XG5cbiAgaWYgKCFjYXJvdXNlbHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcm91c2Vscy5sZW5ndGg7IGkrKykge1xuXG4gICAgdmFyIGNhcm91c2VsID0gY2Fyb3VzZWxzW2ldO1xuICAgIHZhciB3cmFwcGVyID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlcycpWzBdO1xuICAgIHZhciBzbGlkZXMgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUnKTtcbiAgICB2YXIgdG9nZ2xlcyA9IGNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheShjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2Fyb3VzZWwtbGluaycpKTtcblxuICAgIHdyYXBwZXIuc3R5bGUud2lkdGggPSBzbGlkZXMubGVuZ3RoICogMTAwICsgJyUnO1xuXG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3Moc2xpZGVzWzBdLCAnaXMtYWN0aXZlJyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY2Fyb3VzZWwsICdpcy1maXJzdC1zbGlkZScpO1xuXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBzbGlkZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgIHNsaWRlc1trXS5zdHlsZS53aWR0aCA9IDEwMCAvIHNsaWRlcy5sZW5ndGggKyAnJSc7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0b2dnbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGVzW2pdLCBjYWxjaXRlLmRvbS5ldmVudCgpLCB0b2dnbGVTbGlkZSk7XG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVTbGlkZSAoZSkge1xuICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGUpO1xuICAgIHZhciBsaW5rID0gY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZSk7XG4gICAgdmFyIGluZGV4ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cihsaW5rLCAnZGF0YS1zbGlkZScpO1xuICAgIHZhciBjYXJvdXNlbCA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2Nhcm91c2VsJywgbGluayk7XG4gICAgdmFyIGN1cnJlbnQgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUuaXMtYWN0aXZlJylbMF07XG4gICAgdmFyIHNsaWRlcyA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZScpO1xuICAgIHZhciB3cmFwcGVyID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlcycpWzBdO1xuXG4gICAgaWYgKGluZGV4ID09ICdwcmV2Jykge1xuICAgICAgaW5kZXggPSBjYWxjaXRlLmFyci5pbmRleE9mKGN1cnJlbnQsIHNsaWRlcyk7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHsgaW5kZXggPSAxOyB9XG4gICAgfSBlbHNlIGlmIChpbmRleCA9PSAnbmV4dCcpIHtcbiAgICAgIGluZGV4ID0gY2FsY2l0ZS5hcnIuaW5kZXhPZihjdXJyZW50LCBzbGlkZXMpICsgMjtcbiAgICAgIGlmIChpbmRleCA+IHNsaWRlcy5sZW5ndGgpIHsgaW5kZXggPSBzbGlkZXMubGVuZ3RoOyB9XG4gICAgfVxuXG4gICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoY2Fyb3VzZWwsICdpcy1maXJzdC1zbGlkZSBpcy1sYXN0LXNsaWRlJyk7XG5cbiAgICBpZiAoaW5kZXggPT0gc2xpZGVzLmxlbmd0aCkgeyBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjYXJvdXNlbCwgJ2lzLWxhc3Qtc2xpZGUnKTsgfVxuICAgIGlmIChpbmRleCA9PSAxKSB7IGNhbGNpdGUuZG9tLmFkZENsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUnKTsgfVxuXG4gICAgcmVtb3ZlQWN0aXZlKHNsaWRlcyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3Moc2xpZGVzW2luZGV4IC0gMV0sICdpcy1hY3RpdmUnKTtcbiAgICB2YXIgb2Zmc2V0ID0gKGluZGV4IC0gMSkvc2xpZGVzLmxlbmd0aCAqIC0xMDAgKyAnJSc7XG4gICAgd3JhcHBlci5zdHlsZS50cmFuc2Zvcm09ICd0cmFuc2xhdGUzZCgnICsgb2Zmc2V0ICsgJywwLDApJztcbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBEcm9wZG93biDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBkcm9wZG93biBtZW51c1xuXG5jYWxjaXRlLmRyb3Bkb3duID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtZHJvcGRvd24tdG9nZ2xlJyk7XG4gIHZhciBkcm9wZG93bnMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcm9wZG93bicpO1xuXG4gIGlmICghZHJvcGRvd25zKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VBbGxEcm9wZG93bnMgKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJvcGRvd25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhkcm9wZG93bnNbaV0sICdpcy1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVEcm9wZG93biAoZHJvcGRvd24pIHtcbiAgICB2YXIgaXNBY3RpdmUgPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhkcm9wZG93biwgJ2lzLWFjdGl2ZScpO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsY2l0ZS5kb20uc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBjbG9zZUFsbERyb3Bkb3ducygpO1xuICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KGRvY3VtZW50LmJvZHksIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsb3NlQWxsRHJvcGRvd25zKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRHJvcGRvd24gKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciBkcm9wZG93biA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLWRyb3Bkb3duJywgdG9nZ2xlKTtcbiAgICAgIHRvZ2dsZURyb3Bkb3duKGRyb3Bkb3duKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmREcm9wZG93bih0b2dnbGVzW2ldKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRHJhd2VyIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGFuZCBoaWRlIGRyYXdlcnNcbmNhbGNpdGUuZHJhd2VyID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtZHJhd2VyLXRvZ2dsZScpO1xuICB2YXIgZHJhd2VycyA9IGZpbmRFbGVtZW50cygnLmpzLWRyYXdlcicpO1xuXG4gIGlmICghZHJhd2Vycykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciB0YXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtZHJhd2VyJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRyYXdlciA9IGRyYXdlcnNbaV07XG4gICAgICAgIHZhciBpc1RhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIoZHJhd2Vyc1tpXSwgJ2RhdGEtZHJhd2VyJyk7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gaXNUYXJnZXQpIHtcbiAgICAgICAgIHRvZ2dsZUFjdGl2ZShkcmF3ZXJzLCBkcmF3ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRHJhd2VyIChkcmF3ZXIpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChkcmF3ZXIsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0b2dnbGVBY3RpdmUoZHJhd2VycywgZHJhd2VyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmRUb2dnbGUodG9nZ2xlc1tpXSk7XG4gIH1cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBkcmF3ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgYmluZERyYXdlcihkcmF3ZXJzW2pdKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRXhwYW5kaW5nIE5hdiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBleGFuZGluZyBuYXYgbG9jYXRlZCB1bmRlciB0b3BuYXZcbmNhbGNpdGUuZXhwYW5kaW5nTmF2ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWV4cGFuZGluZy10b2dnbGUnKTtcbiAgdmFyIGV4cGFuZGVycyA9IGZpbmRFbGVtZW50cygnLmpzLWV4cGFuZGluZycpO1xuXG4gIGlmICghZXhwYW5kZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZFRvZ2dsZSAodG9nZ2xlKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuXG4gICAgICB2YXIgc2VjdGlvbk5hbWUgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtZXhwYW5kaW5nLW5hdicpO1xuICAgICAgdmFyIHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWV4cGFuZGluZy1uYXYnKTtcbiAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWV4cGFuZGluZy1uYXZbZGF0YS1leHBhbmRpbmctbmF2PVwiJyArIHNlY3Rpb25OYW1lICsgJ1wiXScpWzBdO1xuICAgICAgdmFyIGV4cGFuZGVyID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtZXhwYW5kaW5nJywgc2VjdGlvbik7XG4gICAgICB2YXIgaXNPcGVuID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgIHZhciBzaG91bGRDbG9zZSA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKHNlY3Rpb24sICdpcy1hY3RpdmUnKTtcblxuICAgICAgaWYgKGlzT3Blbikge1xuICAgICAgICBpZiAoc2hvdWxkQ2xvc2UpIHtcbiAgICAgICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhleHBhbmRlciwgJ2lzLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHRvZ2dsZUFjdGl2ZShzZWN0aW9ucywgc2VjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2dnbGVBY3RpdmUoc2VjdGlvbnMsIHNlY3Rpb24pO1xuICAgICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhleHBhbmRlciwgJ2lzLWFjdGl2ZScpO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kVG9nZ2xlKHRvZ2dsZXNbaV0pO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBNb2RhbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBtb2RhbCBkaWFsb2d1ZXNcblxuY2FsY2l0ZS5tb2RhbCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLW1vZGFsLXRvZ2dsZScpO1xuICB2YXIgbW9kYWxzID0gZmluZEVsZW1lbnRzKCcuanMtbW9kYWwnKTtcblxuICBpZiAoIW1vZGFscykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciB0YXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtbW9kYWwnKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBtb2RhbCA9IG1vZGFsc1tpXTtcbiAgICAgICAgdmFyIGlzVGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cihtb2RhbHNbaV0sICdkYXRhLW1vZGFsJyk7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gaXNUYXJnZXQpIHtcbiAgICAgICAgIHRvZ2dsZUFjdGl2ZShtb2RhbHMsIG1vZGFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZE1vZGFsIChtb2RhbCkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KG1vZGFsLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgdG9nZ2xlQWN0aXZlKG1vZGFscywgbW9kYWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZFRvZ2dsZSh0b2dnbGVzW2ldKTtcbiAgfVxuICBmb3IgKHZhciBqID0gMDsgaiA8IG1vZGFscy5sZW5ndGg7IGorKykge1xuICAgIGJpbmRNb2RhbChtb2RhbHNbal0pO1xuICB9XG59O1xuXG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIFRhYnMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilJhcbi8vIHRhYmJlZCBjb250ZW50IHBhbmVcblxuY2FsY2l0ZS50YWJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGFicyA9IGZpbmRFbGVtZW50cygnLmpzLXRhYicpO1xuICB2YXIgdGFiR3JvdXBzID0gZmluZEVsZW1lbnRzKCcuanMtdGFiLWdyb3VwJyk7XG5cbiAgaWYgKCF0YWJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gc2V0IG1heCB3aWR0aCBmb3IgZWFjaCB0YWJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCB0YWJHcm91cHMubGVuZ3RoOyBqKyspIHtcbiAgICB2YXIgdGFic0luR3JvdXAgPSB0YWJHcm91cHNbal0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRhYicpO1xuICAgIHZhciBwZXJjZW50ID0gMTAwIC8gdGFic0luR3JvdXAubGVuZ3RoO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGFic0luR3JvdXAubGVuZ3RoOyBrKyspe1xuICAgICAgdGFic0luR3JvdXBba10uc3R5bGUubWF4V2lkdGggPSBwZXJjZW50ICsgJyUnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN3aXRjaFRhYiAoZXZlbnQpIHtcbiAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG5cbiAgICB2YXIgdGFiID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtdGFiJywgY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZXZlbnQpKTtcbiAgICB2YXIgdGFiR3JvdXAgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy10YWItZ3JvdXAnLCB0YWIpO1xuICAgIHZhciB0YWJzID0gdGFiR3JvdXAucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRhYicpO1xuICAgIHZhciBjb250ZW50cyA9IHRhYkdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWItc2VjdGlvbicpO1xuICAgIHZhciBpbmRleCA9IGNhbGNpdGUuYXJyLmluZGV4T2YodGFiLCB0YWJzKTtcblxuICAgIHJlbW92ZUFjdGl2ZSh0YWJzKTtcbiAgICByZW1vdmVBY3RpdmUoY29udGVudHMpO1xuXG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3ModGFiLCAnaXMtYWN0aXZlJyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY29udGVudHNbaW5kZXhdLCAnaXMtYWN0aXZlJyk7XG4gIH1cblxuICAvLyBhdHRhY2ggdGhlIHN3aXRjaFRhYiBldmVudCB0byBhbGwgdGFic1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0YWJzW2ldLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBzd2l0Y2hUYWIpO1xuICB9XG5cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIFN0aWNreSDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc3RpY2tzIHRoaW5ncyB0byB0aGUgd2luZG93XG5cbmNhbGNpdGUuc3RpY2t5ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZWxlbWVudHMgPSBmaW5kRWxlbWVudHMoJy5qcy1zdGlja3knKTtcblxuICBpZiAoIWVsZW1lbnRzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHN0aWNraWVzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIHZhciB0b3AgPSBlbC5vZmZzZXRUb3A7XG4gICAgaWYgKGVsLmRhdGFzZXQudG9wKSB7XG4gICAgICB0b3AgPSB0b3AgLSBwYXJzZUludChlbC5kYXRhc2V0LnRvcCwgMCk7XG4gICAgfVxuICAgIHN0aWNraWVzLnB1c2goe1xuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgIHRvcDogdG9wLFxuICAgICAgc2hpbTogZWwuY2xvbmVOb2RlKCdkZWVwJyksXG4gICAgICBlbGVtZW50OiBlbFxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGl0ZW0sIG9mZnNldCkge1xuICAgIHZhciBlbGVtID0gaXRlbS5lbGVtZW50O1xuICAgIHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgdmFyIGRpc3RhbmNlID0gaXRlbS50b3AgLSBvZmZzZXQ7XG5cbiAgICBpZiAoZGlzdGFuY2UgPCAxICYmICFpdGVtLmFjdGl2ZSkge1xuICAgICAgaXRlbS5zaGltLnN0eWxlLnZpc2libGl0eSA9ICdoaWRkZW4nO1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpdGVtLnNoaW0sIGVsZW0pO1xuICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZWxlbSwgJ2lzLXN0aWNreScpO1xuICAgICAgaXRlbS5hY3RpdmUgPSB0cnVlO1xuICAgICAgZWxlbS5zdHlsZS50b3AgPSBlbGVtLmRhdGFzZXQudG9wICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKGl0ZW0uYWN0aXZlICYmIG9mZnNldCA8IGl0ZW0udG9wKXtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtLnNoaW0pO1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZWxlbSwgJ2lzLXN0aWNreScpO1xuICAgICAgZWxlbS5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgaXRlbS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjYWxjaXRlLmRvbS5hZGRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RpY2tpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhbmRsZVNjcm9sbChzdGlja2llc1tpXSwgb2Zmc2V0KTtcbiAgICB9XG4gIH0pO1xuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBJbml0aWFsaXplIENhbGNpdGUg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHN0YXJ0IHVwIENhbGNpdGUgYW5kIGF0dGFjaCBhbGwgdGhlIHBhdHRlcm5zXG4vLyBvcHRpb25hbGx5IHBhc3MgYW4gYXJyYXkgb2YgcGF0dGVybnMgeW91J2QgbGlrZSB0byB3YXRjaFxuXG5jYWxjaXRlLmluaXQgPSBmdW5jdGlvbiAocGF0dGVybnMpIHtcbiAgaWYgKHBhdHRlcm5zKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXR0ZXJucy5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsY2l0ZVtwYXR0ZXJuc1tpXV0oKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2FsY2l0ZS5tb2RhbCgpO1xuICAgIGNhbGNpdGUuZHJvcGRvd24oKTtcbiAgICBjYWxjaXRlLmRyYXdlcigpO1xuICAgIGNhbGNpdGUuZXhwYW5kaW5nTmF2KCk7XG4gICAgY2FsY2l0ZS50YWJzKCk7XG4gICAgY2FsY2l0ZS5hY2NvcmRpb24oKTtcbiAgICBjYWxjaXRlLmNhcm91c2VsKCk7XG4gICAgY2FsY2l0ZS5zdGlja3koKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRvdWNoIGNsYXNzIHRvIHRoZSBib2R5XG4gIGlmICggY2FsY2l0ZS5icm93c2VyLmlzVG91Y2goKSApIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAnY2FsY2l0ZS10b3VjaCcpO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBFeHBvc2UgQ2FsY2l0ZS5qcyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gaW1wbGVtZW50YXRpb24gYm9ycm93ZWQgZnJvbSBMZWFmbGV0XG5cbi8vIGRlZmluZSBjYWxjaXRlIGFzIGEgZ2xvYmFsIHZhcmlhYmxlLCBzYXZpbmcgdGhlIG9yaWdpbmFsIHRvIHJlc3RvcmUgbGF0ZXIgaWYgbmVlZGVkXG5mdW5jdGlvbiBleHBvc2UgKCkge1xuICB2YXIgb2xkQ2FsY2l0ZSA9IHdpbmRvdy5jYWxjaXRlO1xuXG4gIGNhbGNpdGUubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuY2FsY2l0ZSA9IG9sZENhbGNpdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgd2luZG93LmNhbGNpdGUgPSBjYWxjaXRlO1xufVxuXG4vLyBubyBOUE0vQU1EIGZvciBub3cgYmVjYXVzZSBpdCBqdXN0IGNhdXNlcyBpc3N1ZXNcbi8vIEBUT0RPOiBidXN0IHRoZW0gaW50byBBTUQgJiBOUE0gZGlzdHJvc1xuXG4vLyAvLyBkZWZpbmUgQ2FsY2l0ZSBmb3IgQ29tbW9uSlMgbW9kdWxlIHBhdHRlcm4gbG9hZGVycyAoTlBNLCBCcm93c2VyaWZ5KVxuLy8gaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbi8vICAgbW9kdWxlLmV4cG9ydHMgPSBjYWxjaXRlO1xuLy8gfVxuXG4vLyAvLyBkZWZpbmUgQ2FsY2l0ZSBhcyBhbiBBTUQgbW9kdWxlXG4vLyBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbi8vICAgZGVmaW5lKGNhbGNpdGUpO1xuLy8gfVxuXG5leHBvc2UoKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbihnbG9iYWwpe1xuXG4gIGZ1bmN0aW9uIFRpbnlTdG9yZSAobmFtZSwgb3B0aW9uYWxTdG9yZSkge1xuICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xuICAgIHRoaXMuc3RvcmUgPSB0eXBlb2Ygb3B0aW9uYWxTdG9yZSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25hbFN0b3JlIDogbG9jYWxTdG9yYWdlO1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgJ1RpbnlTdG9yZSc7XG4gICAgdGhpcy5lbmFibGVkID0gaXNFbmFibGVkKHRoaXMuc3RvcmUpO1xuXG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JlW3RoaXMubmFtZV0pIHx8IHt9O1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cblxuICBUaW55U3RvcmUucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy5zdG9yZVt0aGlzLm5hbWVdID0gSlNPTi5zdHJpbmdpZnkodGhpcy5zZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbjtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5zZXNzaW9uW2tleV0gPSB2YWx1ZTtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uW2tleV07XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbltrZXldO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc2Vzc2lvbltrZXldO1xuICAgIGRlbGV0ZSB0aGlzLnNlc3Npb25ba2V5XTtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNlc3Npb24gPSB7fTtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICBkZWxldGUgdGhpcy5zdG9yZVt0aGlzLm5hbWVdO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBpc0VuYWJsZWQgKHN0b3JlKSB7XG4gICAgLy8gZGVmaW5pdGVseSBpbnZhbGlkOlxuICAgIC8vICogbnVsbFxuICAgIC8vICogdW5kZWZpbmVkXG4gICAgLy8gKiBOYU5cbiAgICAvLyAqIGVtcHR5IHN0cmluZyAoXCJcIilcbiAgICAvLyAqIDBcbiAgICAvLyAqIGZhbHNlXG4gICAgaWYgKCFzdG9yZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHZhciBzdG9yZVR5cGUgPSB0eXBlb2Ygc3RvcmU7XG4gICAgdmFyIGlzTG9jYWxPclNlc3Npb24gPSB0eXBlb2Ygc3RvcmUuZ2V0SXRlbSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygc3RvcmUuc2V0SXRlbSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB2YXIgaXNPYmplY3RPckZ1bmN0aW9uID0gc3RvcmVUeXBlID09PSAnb2JqZWN0JyB8fCBzdG9yZVR5cGUgPT09ICdmdW5jdGlvbic7XG5cbiAgICAvLyBzdG9yZSBpcyB2YWxpZCBpZmYgaXQgaXMgZWl0aGVyXG4gICAgLy8gKGEpIGxvY2FsU3RvcmFnZSBvciBzZXNzaW9uU3RvcmFnZVxuICAgIC8vIChiKSBhIHJlZ3VsYXIgb2JqZWN0IG9yIGZ1bmN0aW9uXG4gICAgaWYgKGlzTG9jYWxPclNlc3Npb24gfHwgaXNPYmplY3RPckZ1bmN0aW9uKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgICAvLyBjYXRjaGFsbCBmb3Igb3V0bGllcnMgKHN0cmluZywgcG9zaXRpdmUgbnVtYmVyLCB0cnVlIGJvb2xlYW4sIHhtbClcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnbG9iYWwuVGlueVN0b3JlID0gVGlueVN0b3JlO1xuXG59KSh0aGlzKTtcbiIsIi8qKlxuKiBDcmVhdGUgYSBuZXcgYXJyYXkgbGlrZSBvYmplY3Qgb2YgZG9tIGVsZW1lbnRzXG4qL1xuZnVuY3Rpb24gUXVlcnkoKSB7XG4gIHRoaXMuZWFjaCA9IChmbikgPT4ge1xuICAgIHRoaXMuZm9yRWFjaChmbilcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIC8qKlxuICAqIEFkZCBhIGNsYXNzIHRvIHNlbGVjdGVkIGVsZW1lbnRzXG4gICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBUaGUgY2xhc3MgbmFtZSB0byBhZGRcbiAgKi9cbiAgdGhpcy5hZGRDbGFzcyA9IGNsYXNzTmFtZSA9PiB0aGlzLmVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKSlcbiAgLyoqXG4gICogUmVtb3ZlIGEgY2xhc3MgZnJvbSBzZWxlY3RlZCBlbGVtZW50c1xuICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgVGhlIGNsYXNzIG5hbWUgdG8gcmVtb3ZlXG4gICovXG4gIHRoaXMucmVtb3ZlQ2xhc3MgPSBjbGFzc05hbWUgPT4gdGhpcy5lYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSkpXG4gIC8qKlxuICAqIFRvZ2dsZSBhIGNsYXNzIGZyb20gc2VsZWN0ZWQgZWxlbWVudHNcbiAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIFRoZSBjbGFzcyBuYW1lIHRvIHRvZ2dsZVxuICAqL1xuICB0aGlzLnRvZ2dsZUNsYXNzID0gY2xhc3NOYW1lID0+IHRoaXMuZWFjaChlID0+IGUuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUpKVxuICAvKipcbiAgKiBBdHRhY2ggYW4gZXZlbnQgbGlzdGVuZXIgd2l0aCBhIGNhbGxiYWNrIHRvIHRoZSBzZWxlY3RlZCBlbGVtZW50c1xuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIGV2ZW50LCBlZy4gXCJjbGlja1wiLCBcIm1vdXNlb3ZlclwiLCBldGMuLi5cbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWRcbiAgKi9cbiAgdGhpcy5vbiA9IChldmVudCwgZm4pID0+IHRoaXMuZWFjaChlID0+IGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKSlcbn1cblxuUXVlcnkucHJvdG90eXBlID0gQXJyYXkucHJvdG90eXBlXG5cbmxldCAkID0gc2VsZWN0b3IgPT4ge1xuICB2YXIgY29sbGVjdGlvbiA9IG5ldyBRdWVyeSgpO1xuICBjb2xsZWN0aW9uLnB1c2goLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpXG4gIHJldHVybiBjb2xsZWN0aW9uO1xufVxuXG5leHBvcnQgZGVmYXVsdCAkIiwiaW1wb3J0IFRTIGZyb20gJ3RpbnlzdG9yZSdcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2FydCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gaGFuZGxlIHRoZSBmaW5lc3Qgb2Ygc2hvcHBpbmcgZXhwZXJpZW5jZXNcbmZ1bmN0aW9uIFRpbnlDYXJ0KHtcbiAgY2FydE5hbWUgPSAnVGlueUNhcnQnLFxuICBjdXJyZW5jeSA9ICckJyxcbiAgdGF4UmF0ZSA9IDAuMDAsXG4gIHRheCA9IDAuMDAsXG4gIGJhc2VTaGlwcGluZyA9IDAuMDAsXG4gIHNoaXBwaW5nID0gMC4wMCxcbiAgc2hpcFRvdGFsID0gMC4wMCxcbiAgc3VidG90YWwgPSAwLjAwLFxuICB0b3RhbCA9IDAuMDAsXG4gIGl0ZW1zID0gW11cbn0gPSB7fSkge1xuICB2YXIgdHMgPSBuZXcgVFMuVGlueVN0b3JlKGNhcnROYW1lKVxuXG4gIGlmICghdHMuZ2V0KCdjdXJyZW5jeScpKSB7dHMuc2V0KCdjdXJyZW5jeScsIGN1cnJlbmN5KX1cbiAgaWYgKCF0cy5nZXQoJ3RheFJhdGUnKSkge3RzLnNldCgndGF4UmF0ZScsIHRheFJhdGUpfVxuICBpZiAoIXRzLmdldCgndGF4JykpIHt0cy5zZXQoJ3RheCcsIHRheCl9XG4gIGlmICghdHMuZ2V0KCdiYXNlU2hpcHBpbmcnKSkge3RzLnNldCgnYmFzZVNoaXBwaW5nJywgYmFzZVNoaXBwaW5nKX1cbiAgaWYgKCF0cy5nZXQoJ3NoaXBwaW5nJykpIHt0cy5zZXQoJ3NoaXBwaW5nJywgc2hpcHBpbmcpfVxuICBpZiAoIXRzLmdldCgnc3VidG90YWwnKSkge3RzLnNldCgnc3VidG90YWwnLCBzdWJ0b3RhbCl9XG4gIGlmICghdHMuZ2V0KCd0b3RhbCcpKSB7dHMuc2V0KCd0b3RhbCcsIHRvdGFsKX1cbiAgaWYgKCF0cy5nZXQoJ2l0ZW1zJykpIHt0cy5zZXQoJ2l0ZW1zJywgaXRlbXMpfVxuXG4gIC8vIFJldHVybnMgdGhlIENhcnQgb2JqZWN0IGFuZCBzcGVjaWZpYyBjYXJ0IG9iamVjdCB2YWx1ZXNcbiAgdGhpcy5nZXRDYXJ0ID0gKCkgPT4geyByZXR1cm4gdHMuc2Vzc2lvbiB9XG5cbiAgdGhpcy5jYWxjdWxhdGVDYXJ0ID0gKCkgPT4ge1xuICAgIGxldCBudW1JdGVtcyAgICAgPSAwXG4gICAgbGV0IHN1YnRvdGFsICAgICA9IDBcbiAgICBsZXQgdGF4ICAgICAgICAgID0gMFxuICAgIGxldCB0b3RhbCAgICAgICAgPSAwXG4gICAgbGV0IHNoaXBUb3RhbCAgICA9IDBcbiAgICBsZXQgaXRlbXMgICAgICAgID0gdHMuZ2V0KCdpdGVtcycpXG4gICAgbGV0IGJhc2VTaGlwcGluZyA9IHRzLmdldCgnYmFzZVNoaXBwaW5nJylcbiAgICBsZXQgdGF4UmF0ZSAgICAgID0gdHMuZ2V0KCd0YXhSYXRlJylcbiAgICBsZXQgc2hpcHBpbmcgICAgID0gdHMuZ2V0KCdzaGlwcGluZycpXG5cbiAgICBpdGVtcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgbnVtSXRlbXMgPSBudW1JdGVtcyArIGkucXVhbnRpdHlcbiAgICAgIHN1YnRvdGFsID0gaS5wcmljZSAqIGkucXVhbnRpdHkgKyBzdWJ0b3RhbFxuICAgIH0pXG5cbiAgICB0YXggPSB0YXhSYXRlICogc3VidG90YWxcbiAgICBzaGlwVG90YWwgPSAhaXRlbXMubGVuZ3RoID8gMCA6IHNoaXBwaW5nICogbnVtSXRlbXMgKyBiYXNlU2hpcHBpbmdcbiAgICB0b3RhbCA9IHNoaXBUb3RhbCArIHN1YnRvdGFsICsgdGF4XG5cbiAgICB0cy5zZXQoJ3RheCcsIHRheClcbiAgICB0cy5zZXQoJ3N1YnRvdGFsJywgc3VidG90YWwpXG4gICAgdHMuc2V0KCdzaGlwVG90YWwnLCBzaGlwVG90YWwpXG4gICAgdHMuc2V0KCd0b3RhbCcsIHRvdGFsKVxuICB9XG5cbiAgdGhpcy5hZGRJdGVtID0gKHRpdGxlLCBpZCwgcHJpY2UsIHF1YW50aXR5KSA9PiB7XG4gICAgbGV0IGhhc0l0ZW0gPSBmYWxzZVxuICAgIGxldCBpdGVtSWRcblxuICAgIGlmICh0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykuZm9yRWFjaChpID0+IHtcbiAgICAgICAgaWYgKGkuaWQgPT0gaWQpIHtcbiAgICAgICAgICBoYXNJdGVtID0gdHJ1ZVxuICAgICAgICAgIGl0ZW1JZCA9IGlkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKCFoYXNJdGVtKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICBwcmljZTogcHJpY2UsXG4gICAgICAgIHF1YW50aXR5OiBxdWFudGl0eVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdHMuZ2V0KCdpdGVtcycpLmZvckVhY2goaSA9PiB7XG4gICAgICAgIGlmIChpLmlkID09IGlkKSB7XG4gICAgICAgICAgaS5xdWFudGl0eSA9IGkucXVhbnRpdHkgKyBxdWFudGl0eVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuY2FsY3VsYXRlQ2FydCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIGl0ZW0gaGVscGVyc1xuICB0aGlzLmhhc0l0ZW1zID0gKCkgPT4ge1xuICAgIHRzLmdldCgnaXRlbXMnKS5sZW5ndGggPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuaXNJdGVtID0gKGksIGlkKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2codHMuZ2V0KCdpdGVtcycpW2ldLmlkLCBpZClcbiAgICB0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQgPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuZ2V0SXRlbSA9IChpZCkgPT4ge1xuICAgIGlmICh0aGlzLmhhc0l0ZW1zKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdObyBpdGVtcyBpbiBjYXJ0OiAnLCB0cy5zZXNzaW9uKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmlzSXRlbShpLCBpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRzLmdldCgnaXRlbXMnKVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVtb3ZlSXRlbSA9IChpZCwgbnVtICkgPT4ge1xuICAgIGxldCBpdGVtcyA9IHRzLmdldCgnaXRlbXMnKVxuICAgIG51bSA9IHR5cGVvZiBudW0gIT09ICd1bmRlZmluZWQnID8gIG51bSA6IDE7XG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkKSB7XG4gICAgICAgIGlmIChpdGVtc1tpXS5xdWFudGl0eSA9PSAxKSB7XG4gICAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1zW2ldLnF1YW50aXR5ID0gaXRlbXNbaV0ucXVhbnRpdHkgLSBudW1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZGVzdHJveUl0ZW0gPSAoaWQpID0+IHtcbiAgICBsZXQgaXRlbXMgPSB0cy5nZXQoJ2l0ZW1zJylcbiAgICBpZiAodGhpcy5oYXNJdGVtcygpKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gaXRlbXMgaW4gY2FydDogJywgdHMuc2Vzc2lvbilcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQpIHtcbiAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZW1wdHlDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLnNldCgnaXRlbXMnLCBbXSlcbiAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB0aGlzLmRlc3Ryb3lDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLmNsZWFyKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGlueUNhcnQiLCJpbXBvcnQgY2FsY2l0ZSBmcm9tICdjYWxjaXRlLXdlYidcbmltcG9ydCAkIGZyb20gJy4vJC5qcydcbmltcG9ydCBUaW55Q2FydCBmcm9tICcuL2NhcnQuanMnXG5cbi8vIHZhciBjYXJ0ID0gQ2FydFxuXG53aW5kb3cuY2FydCA9IG5ldyBUaW55Q2FydCh7XG4gIGNhcnROYW1lOiAnbG9uZWdvb3NlcHJlc3NDYXJ0JyxcbiAgY3VycmVuY3k6ICckJyxcbiAgYmFzZVNoaXBwaW5nOiAxMC4wMCxcbiAgc2hpcHBpbmc6IDQuMDBcbn0pXG5cbnZhciBzdW1tYXJ5ID0gY2FydC5nZXRDYXJ0KClcblxudmFyIHNoaXBwaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LXNoaXBwaW5nXCIpWzBdO1xuaWYgKHNoaXBwaW5nKSB7IHNoaXBwaW5nLmlubmVySFRNTCA9IHN1bW1hcnkuc2hpcFRvdGFsIH1cblxudmFyIHN1YnRvdGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LXN1YnRvdGFsXCIpWzBdO1xuaWYgKHN1YnRvdGFsKSB7c3VidG90YWwuaW5uZXJIVE1MID0gc3VtbWFyeS5zdWJ0b3RhbH1cblxudmFyIHRvdGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LXRvdGFsXCIpWzBdO1xuaWYgKHRvdGFsKSB7dG90YWwuaW5uZXJIVE1MID0gc3VtbWFyeS50b3RhbH1cblxudmFyIGl0ZW1EaXY9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0aW55Y2FydC1pdGVtc1wiKVswXTtcbmlmIChpdGVtRGl2KSB7XG4gIGxldCBpdGVtcyA9IGNhcnQuZ2V0Q2FydCgpLml0ZW1zXG4gIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgaXRlbURpdi5pbm5lckhUTUwgPSBpdGVtRGl2LmlubmVySFRNTFxuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMjQgZmlyc3QtY29sdW1uIGxpbmUtaXRlbVwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LXJpZ2h0IHByZS0zXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInJlbW92ZS1pdGVtXCI+IDxhIGhyZWY9XCIjXCI+IHggPC9hPiA8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi05XCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4nICsgaXRlbS50aXRsZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4gPGEgaHJlZj1cIiNcIj4gLSA8L2E+IDwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTEgdGV4dC1jZW50ZXJcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuPicgKyBpdGVtLnF1YW50aXR5ICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTEgdGV4dC1jZW50ZXJcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuPiA8YSBocmVmPVwiI1wiPiArIDwvYT4gPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMiBwcmUtMVwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JDwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwicmlnaHRcIj4nICsgaXRlbS5wcmljZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0yIHByZS0xXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4kPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJyaWdodFwiPicgKyBpdGVtLnF1YW50aXR5ICogaXRlbS5wcmljZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgfSlcbn1cblxudmFyIGhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgIGtleTogJ3BrX3Rlc3RfNnBSTkFTQ29CT0t0SXNoRmVRZDRYTVVoJyxcbiAgICBpbWFnZTogJ2h0dHBzOi8vc3RyaXBlLmNvbS9pbWcvZG9jdW1lbnRhdGlvbi9jaGVja291dC9tYXJrZXRwbGFjZS5wbmcnLFxuICAgIHRva2VuOiBmdW5jdGlvbih0b2tlbiwgYXJncykge1xuICAgICAgLy8gVXNlIHRoZSB0b2tlbiB0byBjcmVhdGUgdGhlIGNoYXJnZSB3aXRoIGEgc2VydmVyLXNpZGUgc2NyaXB0LlxuICAgICAgLy8gWW91IGNhbiBhY2Nlc3MgdGhlIHRva2VuIElEIHdpdGggYHRva2VuLmlkYFxuICAgICAgLy8gYXJncyB3aWxsIGNvbnRhaW4gYWxsIHRoZSBiaWxsaW5nIGFuZCBzaGlwcGluZyBpbmZvLlxuICAgICAgLy8gVGhlIGJpbGxpbmcgaW5mbyBpcyBhdXRvbWF0aWNhbGx5IGF0dGFjaGVkIHRvIHRoZSB0b2tlbiBhbmQgY2FyZC5cbiAgICB9XG4gIH0pO1xuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlueWNhcnQtY2hlY2tvdXQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBsZXQgb3JkZXIgPSBjYXJ0LmdldENhcnQoKVxuICAgIGhhbmRsZXIub3Blbih7XG4gICAgICAgIG5hbWU6ICdsb25lIGdvb3NlIHByZXNzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICckJyArIG9yZGVyLnRvdGFsLFxuICAgICAgICBhbW91bnQ6IG9yZGVyLnRvdGFsICogMTAwLFxuICAgICAgICBzaGlwcGluZ0FkZHJlc3M6IHRydWUsXG4gICAgICAgIGJpbGxpbmdBZGRyZXNzOiB0cnVlLFxuICAgIH0pO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG5cbndpbmRvdy5jYWxjaXRlLmluaXQoKVxuXG5cblxuIl19

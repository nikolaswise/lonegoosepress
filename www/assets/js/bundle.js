(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;if (typeof window !== "undefined") {  window.ampersand = window.ampersand || {};  window.ampersand["ampersand-events"] = window.ampersand["ampersand-events"] || [];  window.ampersand["ampersand-events"].push("1.0.1");}
var runOnce = require('amp-once');
var uniqueId = require('amp-unique-id');
var keys = require('amp-keys');
var isEmpty = require('amp-is-empty');
var each = require('amp-each');
var bind = require('amp-bind');
var extend = require('amp-extend');
var slice = Array.prototype.slice;
var eventSplitter = /\s+/;


var Events = {
    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = runOnce(function() {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = void 0;
            return this;
        }
        names = name ? [name] : keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;
        var remove = !name && !callback;
        if (!callback && typeof name === 'object') callback = this;
        if (obj) (listeningTo = {})[obj._listenId] = obj;
        for (var id in listeningTo) {
            obj = listeningTo[id];
            obj.off(name, callback, this);
            if (remove || isEmpty(obj._events)) delete this._listeningTo[id];
        }
        return this;
    },

    // extend an object with event capabilities if passed
    // or just return a new one.
    createEmitter: function (obj) {
        return extend(obj || {}, Events);
    }
};


// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy.
var triggerEvents = function(events, args) {
    var ev;
    var i = -1;
    var l = events.length;
    var a1 = args[0];
    var a2 = args[1];
    var a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
};

var listenMethods = {
    listenTo: 'on', 
    listenToOnce: 'once'
};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback, run) {
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var id = obj._listenId || (obj._listenId = uniqueId('l'));
        listeningTo[id] = obj;
        if (!callback && typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
    };
});

Events.listenToAndRun = function (obj, name, callback) {
    Events.listenTo.apply(this, arguments);
    if (!callback && typeof name === 'object') callback = this;
    callback.apply(this);
    return this;
};

module.exports = Events;

},{"amp-bind":2,"amp-each":5,"amp-extend":7,"amp-is-empty":9,"amp-keys":15,"amp-once":21,"amp-unique-id":22}],2:[function(require,module,exports){
var isFunction = require('amp-is-function');
var isObject = require('amp-is-object');
var nativeBind = Function.prototype.bind;
var slice = Array.prototype.slice;
var Ctor = function () {};


module.exports = function bind(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        Ctor.prototype = func.prototype;
        var self = new Ctor();
        Ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (isObject(result)) return result;
        return self;
    };
    return bound;
};

},{"amp-is-function":3,"amp-is-object":4}],3:[function(require,module,exports){
var toString = Object.prototype.toString;
var func = function isFunction(obj) {
    return toString.call(obj) === '[object Function]';
};

// Optimize `isFunction` if appropriate. Work around an IE 11 bug.
if (typeof /./ !== 'function') {
    func = function isFunction(obj) {
      return typeof obj == 'function' || false;
    };
}

module.exports = func;

},{}],4:[function(require,module,exports){
module.exports = function isObject(obj) {
    var type = typeof obj;
    return !!obj && (type === 'function' || type === 'object');
};

},{}],5:[function(require,module,exports){
var objKeys = require('amp-keys');
var createCallback = require('amp-create-callback');


module.exports = function each(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
        for (i = 0; i < length; i++) {
            iteratee(obj[i], i, obj);
        }
    } else {
        var keys = objKeys(obj);
        for (i = 0, length = keys.length; i < length; i++) {
            iteratee(obj[keys[i]], keys[i], obj);
        }
    }
    return obj;
};

},{"amp-create-callback":6,"amp-keys":15}],6:[function(require,module,exports){
module.exports = function createCallback(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount) {
    case 1: 
        return function(value) {
            return func.call(context, value);
        };
    case 2: 
        return function(value, other) {
            return func.call(context, value, other);
        };
    case 3: 
        return function(value, index, collection) {
            return func.call(context, value, index, collection);
        };
    case 4: 
        return function(accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection);
        };
    }
    return function() {
        return func.apply(context, arguments);
    };
};

},{}],7:[function(require,module,exports){
var isObject = require('amp-is-object');


module.exports = function(obj) {
    if (!isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

},{"amp-is-object":8}],8:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],9:[function(require,module,exports){
var isArray = require('amp-is-array');
var isString = require('amp-is-string');
var isArguments = require('amp-is-arguments');
var isNumber = require('amp-is-number');
var isNan = require('amp-is-nan');
var keys = require('amp-keys');


module.exports = function isEmpty(obj) {
    if (obj == null) return true;
    if (isArray(obj) || isString(obj) || isArguments(obj)) return obj.length === 0;
    if (isNumber(obj)) return obj === 0 || isNan(obj);
    if (keys(obj).length !== 0) return false;
    return true;
};

},{"amp-is-arguments":10,"amp-is-array":11,"amp-is-nan":12,"amp-is-number":13,"amp-is-string":14,"amp-keys":15}],10:[function(require,module,exports){
var toString = Object.prototype.toString;
var hasOwn = Object.prototype.hasOwnProperty;
var isArgs = function isArgs(obj) {
    return toString.call(obj) === '[object Arguments]';
};

// for IE <9
if (!isArgs(arguments)) {
    isArgs = function (obj) {
        return obj && hasOwn.call(obj, 'callee');
    };
}

module.exports = isArgs;

},{}],11:[function(require,module,exports){
var toString = Object.prototype.toString;
var nativeIsArray = Array.isArray;


module.exports = nativeIsArray || function isArray(obj) {
    return toString.call(obj) === '[object Array]';
};

},{}],12:[function(require,module,exports){
var isNumber = require('amp-is-number');


module.exports = function isNaN(obj) {
    return isNumber(obj) && obj !== +obj;
};

},{"amp-is-number":13}],13:[function(require,module,exports){
var toString = Object.prototype.toString;


module.exports = function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
};

},{}],14:[function(require,module,exports){
var toString = Object.prototype.toString;


module.exports = function isString(obj) {
    return toString.call(obj) === '[object String]';
};

},{}],15:[function(require,module,exports){
var has = require('amp-has');
var indexOf = require('amp-index-of');
var isObject = require('amp-is-object');
var nativeKeys = Object.keys;
var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];


module.exports = function keys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) {
        return nativeKeys(obj);
    }
    var result = [];
    for (var key in obj) if (has(obj, key)) result.push(key);
    // IE < 9
    if (hasEnumBug) {
        var nonEnumIdx = nonEnumerableProps.length;
        while (nonEnumIdx--) {
            var prop = nonEnumerableProps[nonEnumIdx];
            if (has(obj, prop) && indexOf(result, prop) === -1) result.push(prop);
        }
    }
    return result;
};

},{"amp-has":16,"amp-index-of":17,"amp-is-object":19}],16:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;


module.exports = function has(obj, key) {
    return obj != null && hasOwn.call(obj, key);
};

},{}],17:[function(require,module,exports){
var isNumber = require('amp-is-number');


module.exports = function indexOf(arr, item, from) {
    var i = 0;
    var l = arr && arr.length;
    if (isNumber(from)) {
        i = from < 0 ? Math.max(0, l + from) : from;
    }
    for (; i < l; i++) {
        if (arr[i] === item) return i;
    }
    return -1;
};

},{"amp-is-number":18}],18:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],19:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],20:[function(require,module,exports){
module.exports = function limitCalls(fn, times) {
    var memo;
    return function() {
        if (times-- > 0) {
            memo = fn.apply(this, arguments);
        } else {
            fn = null;
        }
        return memo;
    };
};

},{}],21:[function(require,module,exports){
var limitCalls = require('amp-limit-calls');


module.exports = function once(fn) {
    return limitCalls(fn, 1);
};

},{"amp-limit-calls":20}],22:[function(require,module,exports){
(function (global){
/*global window, global*/
var theGlobal = (typeof window !== 'undefined') ? window : global;
if (!theGlobal.__ampIdCounter) {
    theGlobal.__ampIdCounter = 0;
}


module.exports = function uniqueId(prefix) {
    var id = ++theGlobal.__ampIdCounter + '';
    return prefix ? prefix + id : id;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
(function () {

  var diffcount;

  var ADD_ATTRIBUTE = 0,
    MODIFY_ATTRIBUTE = 1,
    REMOVE_ATTRIBUTE = 2,
    MODIFY_TEXT_ELEMENT = 3,
    RELOCATE_GROUP = 4,
    REMOVE_ELEMENT = 5,
    ADD_ELEMENT = 6,
    REMOVE_TEXT_ELEMENT = 7,
    ADD_TEXT_ELEMENT = 8,
    REPLACE_ELEMENT = 9,
    MODIFY_VALUE = 10,
    MODIFY_CHECKED = 11,
    MODIFY_SELECTED = 12,
    MODIFY_DATA = 13,
    ACTION = 14,
    ROUTE = 15,
    OLD_VALUE = 16,
    NEW_VALUE = 17,
    ELEMENT = 18,
    GROUP = 19,
    FROM = 20,
    TO = 21,
    NAME = 22,
    VALUE = 23,
    TEXT = 24,
    ATTRIBUTES = 25,
    NODE_NAME = 26,
    COMMENT = 27,
    CHILD_NODES = 28,
    CHECKED = 29,
    SELECTED = 30;

  var Diff = function (options) {
    var diff = this;
    Object.keys(options).forEach(function (option) {
      diff[option] = options[option];
    });
  }
  Diff.prototype = {
    toString: function () {
      return JSON.stringify(this);
    }
  };

  var SubsetMapping = function SubsetMapping(a, b) {
    this["old"] = a;
    this["new"] = b;
  };

  SubsetMapping.prototype = {
    contains: function contains(subset) {
      if (subset.length < this.length) {
        return subset["new"] >= this["new"] && subset["new"] < this["new"] + this.length;
      }
      return false;
    },
    toString: function toString() {
      return this.length + " element subset, first mapping: old " + this["old"] + " → new " + this["new"];
    }
  };

  var roughlyEqual = function roughlyEqual(e1, e2, preventRecursion) {
    if (!e1 || !e2) return false;
    if (e1.nodeType !== e2.nodeType) return false;
    if (e1.nodeType === 3) {
      if (e2.nodeType !== 3) return false;
      // Note that we initially don't care what the text content of a node is,
      // the mere fact that it's the same tag and "has text" means it's roughly
      // equal, and then we can find out the true text difference later.
      return preventRecursion ? true : e1.data === e2.data;
    }
    if (e1.nodeName !== e2.nodeName) return false;
    if (e1.childNodes.length !== e2.childNodes.length) return false;
    var thesame = true;
    for (var i = e1.childNodes.length - 1; i >= 0; i--) {
      if (preventRecursion) {
        thesame = thesame && (e1.childNodes[i].nodeName === e2.childNodes[i].nodeName);
      } else {
        // note: we only allow one level of recursion at any depth. If 'preventRecursion'
        //       was not set, we must explicitly force it to true for child iterations.
        thesame = thesame && roughlyEqual(e1.childNodes[i], e2.childNodes[i], true);
      }
    }
    return thesame;
  };


  var cleanCloneNode = function (node) {
    // Clone a node with contents and add values manually,
    // to avoid https://bugzilla.mozilla.org/show_bug.cgi?id=230307
    var clonedNode = node.cloneNode(true),
      textareas, clonedTextareas, options, clonedOptions, i;

    if (node.nodeType != 8 && node.nodeType != 3) {

      textareas = node.querySelectorAll('textarea');
      clonedTextareas = clonedNode.querySelectorAll('textarea');
      for (i = 0; i < textareas.length; i++) {
        if (clonedTextareas[i].value !== textareas[i].value) {
          clonedTextareas[i].value = textareas[i].value;
        }
      }
      if (node.value && (node.value !== clonedNode.value)) {
        clonedNode.value = node.value;
      }
      options = node.querySelectorAll('option');
      clonedOptions = clonedNode.querySelectorAll('option');
      for (i = 0; i < options.length; i++) {
        if (options[i].selected && !(clonedOptions[i].selected)) {
          clonedOptions[i].selected = true;
        } else if (!(options[i].selected) && clonedOptions[i].selected) {
          clonedOptions[i].selected = false;
        }
      }      
      if (node.selected && !(clonedNode.selected)) {
        clonedNode.selected = true;
      } else if (!(node.selected) && clonedNode.selected) {
        clonedNode.selected = false;
      }
    }
    return clonedNode;
  };

  var nodeToObj = function (node) {
    var objNode = {}, i;

    if (node.nodeType === 3) {
      objNode[TEXT] = node.data;
    } else if (node.nodeType === 8) {
      objNode[COMMENT] = node.data;
    } else {
      objNode[NODE_NAME] = node.nodeName;
      if (node.attributes && node.attributes.length > 0) {
        objNode[ATTRIBUTES] = [];
        for (i = 0; i < node.attributes.length; i++) {
          objNode[ATTRIBUTES].push([node.attributes[i].name, node.attributes[i].value]);
        }
      }
      if (node.childNodes && node.childNodes.length > 0) {
        objNode[CHILD_NODES] = [];
        for (i = 0; i < node.childNodes.length; i++) {
          objNode[CHILD_NODES].push(nodeToObj(node.childNodes[i]));
        }
      }
      if (node.value) {
        objNode[VALUE] = node.value;
      }
      if (node.checked) {
        objNode[CHECKED] = node.checked;
      }
      if (node.selected) {
        objNode[SELECTED] = node.selected;
      }
    }
    return objNode;
  };

  var objToNode = function (objNode, insideSvg) {
    var node, i;
    if (objNode.hasOwnProperty(TEXT)) {
      node = document.createTextNode(objNode[TEXT]);
    } else if (objNode.hasOwnProperty(COMMENT)) {
      node = document.createComment(objNode[COMMENT]);
    } else {
      if (objNode[NODE_NAME] === 'svg' || insideSvg) {
        node = document.createElementNS('http://www.w3.org/2000/svg', objNode[NODE_NAME]);
        insideSvg = true;
      } else {
        node = document.createElement(objNode[NODE_NAME]);
      }
      if (objNode[ATTRIBUTES]) {
        for (i = 0; i < objNode[ATTRIBUTES].length; i++) {
          node.setAttribute(objNode[ATTRIBUTES][i][0], objNode[ATTRIBUTES][i][1]);
        }
      }
      if (objNode[CHILD_NODES]) {
        for (i = 0; i < objNode[CHILD_NODES].length; i++) {
          node.appendChild(objToNode(objNode[CHILD_NODES][i], insideSvg));
        }
      }
      if (objNode[VALUE]) {
        node.value = objNode[VALUE];
      }
      if (objNode[CHECKED]) {
        node.checked = objNode[CHECKED];
      }
      if (objNode[SELECTED]) {
        node.selected = objNode[SELECTED];
      }
    }
    return node;
  };



  /**
   * based on https://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Longest_common_substring#JavaScript
   */
  var findCommonSubsets = function (c1, c2, marked1, marked2) {
    var lcsSize = 0,
      index = [],
      len1 = c1.length,
      len2 = c2.length;
    // set up the matching table
    var matches = [],
      a, i, j;
    for (a = 0; a < len1 + 1; a++) {
      matches[a] = [];
    }
    // fill the matches with distance values
    for (i = 0; i < len1; i++) {
      for (j = 0; j < len2; j++) {
        if (!marked1[i] && !marked2[j] && roughlyEqual(c1[i], c2[j])) {
          matches[i + 1][j + 1] = (matches[i][j] ? matches[i][j] + 1 : 1);
          if (matches[i + 1][j + 1] > lcsSize) {
            lcsSize = matches[i + 1][j + 1];
            index = [i + 1, j + 1];
          }
        } else {
          matches[i + 1][j + 1] = 0;
        }
      }
    }
    if (lcsSize === 0) {
      return false;
    }
    var origin = [index[0] - lcsSize, index[1] - lcsSize];
    var ret = new SubsetMapping(origin[0], origin[1]);
    ret.length = lcsSize;
    return ret;
  };

  /**
   * This should really be a predefined function in Array...
   */
  var makeArray = function (n, v) {
    var deepcopy = function (v) {
      v.slice();
      for (var i = 0, last = v.length; i < last; i++) {
        if (v[i] instanceof Array) {
          v[i] = deepcopy(v[i]);
        }
      }
    };
    if (v instanceof Array) {
      v = deepcopy(v);
    }
    var set = function () {
      return v;
    };
    return (new Array(n)).join('.').split('.').map(set);
  };

  /**
   * Generate arrays that indicate which node belongs to which subset,
   * or whether it's actually an orphan node, existing in only one
   * of the two trees, rather than somewhere in both.
   */
  var getGapInformation = function (t1, t2, stable) {
    // [true, true, ...] arrays
    var set = function (v) {
      return function () {
        return v;
      }
    },
      gaps1 = makeArray(t1.childNodes.length, true),
      gaps2 = makeArray(t2.childNodes.length, true),
      group = 0;

    // give elements from the same subset the same group number
    stable.forEach(function (subset) {
      var i, end;
      for (i = subset["old"], end = i + subset.length; i < end; i++) {
        gaps1[i] = group;
      }
      for (i = subset["new"], end = i + subset.length; i < end; i++) {
        gaps2[i] = group;
      }
      group++;
    });

    return {
      gaps1: gaps1,
      gaps2: gaps2
    };
  };

  /**
   * Find all matching subsets, based on immediate child differences only.
   */
  var markSubTrees = function (oldTree, newTree) {
    oldTree = cleanCloneNode(oldTree);
    newTree = cleanCloneNode(newTree);
    // note: the child lists are views, and so update as we update old/newTree
    var oldChildren = oldTree.childNodes,
      newChildren = newTree.childNodes,
      marked1 = makeArray(oldChildren.length, false),
      marked2 = makeArray(newChildren.length, false),
      subsets = [],
      subset = true,
      i;
    while (subset) {
      subset = findCommonSubsets(oldChildren, newChildren, marked1, marked2);
      if (subset) {
        subsets.push(subset);
        for (i = 0; i < subset.length; i++) {
          marked1[subset.old + i] = true;
        }
        for (i = 0; i < subset.length; i++) {
          marked2[subset.new + i] = true;
        }
      }
    }
    return subsets;
  };

  var findFirstInnerDiff = function (t1, t2, subtrees, route) {
    if (subtrees.length === 0) return false;

    var gapInformation = getGapInformation(t1, t2, subtrees),
      gaps1 = gapInformation.gaps1,
      gl1 = gaps1.length,
      gaps2 = gapInformation.gaps2,
      gl2 = gaps1.length,
      i, j, k,
      last = gl1 < gl2 ? gl1 : gl2;

    // Check for correct submap sequencing (irrespective of gaps) first:
    var sequence = 0,
      group, node, similarNode, testNode,
      shortest = gl1 < gl2 ? gaps1 : gaps2;

    // group relocation
    for (i = 0, last = shortest.length; i < last; i++) {
      if (gaps1[i] === true) {
        node = t1.childNodes[i];
        if (node.nodeType === 3) {
          if (t2.childNodes[i].nodeType === 3 && node.data != t2.childNodes[i].data) {
            testNode = node;
            while (testNode.nextSibling && testNode.nextSibling.nodeType === 3) {
              testNode = testNode.nextSibling;
              if (t2.childNodes[i].data === testNode.data) {
                similarNode = true;
                break;
              }
            }
            if (!similarNode) {
              k = {};
              k[ACTION] = MODIFY_TEXT_ELEMENT;
              k[ROUTE] = route.concat(i);
              k[OLD_VALUE] = node.data;
              k[NEW_VALUE] = t2.childNodes[i].data;
              return new Diff(k);
            }
          }
          k = {};
          k[ACTION] = REMOVE_TEXT_ELEMENT;
          k[ROUTE] = route.concat(i);
          k[VALUE] = node.data;
          return new Diff(k);
        }
        k = {};
        k[ACTION] = REMOVE_ELEMENT;
        k[ROUTE] = route.concat(i);
        k[ELEMENT] = nodeToObj(node);
        return new Diff(k);
      }
      if (gaps2[i] === true) {
        node = t2.childNodes[i];
        if (node.nodeType === 3) {
          k = {};
          k[ACTION] = ADD_TEXT_ELEMENT;
          k[ROUTE] = route.concat(i);
          k[VALUE] = node.data;
          return new Diff(k);
        }
        k = {};
        k[ACTION] = ADD_ELEMENT;
        k[ROUTE] = route.concat(i);
        k[ELEMENT] = nodeToObj(node);
        return new Diff(k);
      }
      if (gaps1[i] != gaps2[i]) {
        group = subtrees[gaps1[i]];
        var toGroup = Math.min(group["new"], (t1.childNodes.length - group.length));
        if (toGroup != i) {
          //Check wehther destination nodes are different than originating ones.
          var destinationDifferent = false;
          for (j = 0; j < group.length; j++) {
            if (!t1.childNodes[toGroup + j].isEqualNode(t1.childNodes[i + j])) {
              destinationDifferent = true;
            }

          }
          if (destinationDifferent) {
            k = {};
            k[ACTION] = RELOCATE_GROUP;
            k[GROUP] = group;
            k[FROM] = i;
            k[TO] = toGroup;
            k[ROUTE] = route;
            return new Diff(k);
          }
        }
      }
    }
    return false;
  };


  function swap(obj, p1, p2) {
    (function (_) {
      obj[p1] = obj[p2];
      obj[p2] = _;
    }(obj[p1]));
  };


  var DiffTracker = function () {
    this.list = [];
  };
  DiffTracker.prototype = {
    list: false,
    add: function (difflist) {
      var list = this.list;
      difflist.forEach(function (diff) {
        list.push(diff);
      });
    },
    forEach: function (fn) {
      this.list.forEach(fn);
    }
  };




  var diffDOM = function (debug, diffcap) {
    if (typeof debug === 'undefined') {
      debug = false;

    } else {

      ADD_ATTRIBUTE = "add attribute",
      MODIFY_ATTRIBUTE = "modify attribute",
      REMOVE_ATTRIBUTE = "remove attribute",
      MODIFY_TEXT_ELEMENT = "modify text element",
      RELOCATE_GROUP = "relocate group",
      REMOVE_ELEMENT = "remove element",
      ADD_ELEMENT = "add element",
      REMOVE_TEXT_ELEMENT = "remove text element",
      ADD_TEXT_ELEMENT = "add text element",
      REPLACE_ELEMENT = "replace element",
      MODIFY_VALUE = "modify value",
      MODIFY_CHECKED = "modify checked",
      MODIFY_SELECTED = "modify selected",
      ACTION = "action",
      ROUTE = "route",
      OLD_VALUE = "oldValue",
      NEW_VALUE = "newValue",
      ELEMENT = "element",
      GROUP = "group",
      FROM = "from",
      TO = "to",
      NAME = "name",
      VALUE = "value",
      TEXT = "text",
      ATTRIBUTES = "attributes",
    NODE_NAME = "nodeName",
    COMMENT = "comment",
    CHILD_NODES = "childNodes",
    CHECKED = "checked",
    SELECTED = "selected";
    }




    if (typeof diffcap === 'undefined')
      diffcap = 10;
    this.debug = debug;
    this.diffcap = diffcap;
  };
  diffDOM.prototype = {

    // ===== Create a diff =====

    diff: function (t1, t2) {
      diffcount = 0;
      t1 = cleanCloneNode(t1);
      t2 = cleanCloneNode(t2);
      if (this.debug) {
        this.t1Orig = nodeToObj(t1);
        this.t2Orig = nodeToObj(t2);
      }

      this.tracker = new DiffTracker();
      return this.findDiffs(t1, t2);
    },
    findDiffs: function (t1, t2) {
      var diff;
      do {
        if (this.debug) {
          diffcount++;
          if (diffcount > this.diffcap) {
            window.diffError = [this.t1Orig, this.t2Orig];
            throw new Error("surpassed diffcap:" + JSON.stringify(this.t1Orig) + " -> " + JSON.stringify(this.t2Orig));
          }
        }
        difflist = this.findFirstDiff(t1, t2, []);
        if (difflist) {
          if (!difflist.length) {
            difflist = [difflist];
          }
          this.tracker.add(difflist);
          this.apply(t1, difflist);
        }
      } while (difflist);
      return this.tracker.list;
    },
    findFirstDiff: function (t1, t2, route) {
      // outer differences?
      var difflist = this.findOuterDiff(t1, t2, route);
      if (difflist.length > 0) {
        return difflist;
      }
      // inner differences?
      var diff = this.findInnerDiff(t1, t2, route);
      if (diff) {
        if (typeof diff.length === "undefined") {
          diff = [diff];
        }
        if (diff.length > 0) {
          return diff;
        }
      }
      // no differences
      return false;
    },
    findOuterDiff: function (t1, t2, route) {
      var k;
      
      if (t1.nodeName != t2.nodeName) {
        k = {};
        k[ACTION] = REPLACE_ELEMENT;
        k[OLD_VALUE] = nodeToObj(t1);
        k[NEW_VALUE] = nodeToObj(t2);
        k[ROUTE] = route;
        return [new Diff(k)];
      }
      
      var slice = Array.prototype.slice,
        byName = function (a, b) {
          return a.name > b.name;
        },
        attr1 = t1.attributes ? slice.call(t1.attributes).sort(byName) : [],
        attr2 = t2.attributes ? slice.call(t2.attributes).sort(byName) : [],
        find = function (attr, list) {
          for (var i = 0, last = list.length; i < last; i++) {
            if (list[i].name === attr.name)
              return i;
          }
          return -1;
        },
        diffs = [];
      if ((t1.value || t2.value) && t1.value !== t2.value && t1.nodeName !== 'OPTION') {
        k = {};
        k[ACTION] = MODIFY_VALUE;
        k[OLD_VALUE] = t1.value;
        k[NEW_VALUE] = t2.value;
        k[ROUTE] = route;
        diffs.push(new Diff(k));
      }
      if ((t1.checked || t2.checked) && t1.checked !== t2.checked) {
        k = {};
        k[ACTION] = MODIFY_CHECKED;
        k[OLD_VALUE] = t1.checked;
        k[NEW_VALUE] = t2.checked;
        k[ROUTE] = route;
        diffs.push(new Diff(k));
      }  

      attr1.forEach(function (attr) {
        var pos = find(attr, attr2),
          k;
        if (pos === -1) {
          k = {};
          k[ACTION] = REMOVE_ATTRIBUTE;
          k[ROUTE] = route;
          k[NAME] = attr.name;
          k[VALUE] = attr.value;
          diffs.push(new Diff(k));
          return diffs;
        }
        var a2 = attr2.splice(pos, 1)[0];
        if (attr.value !== a2.value) {
          k = {};
          k[ACTION] = MODIFY_ATTRIBUTE;
          k[ROUTE] = route;
          k[NAME] = attr.name;
          k[OLD_VALUE] = attr.value;
          k[NEW_VALUE] = a2.value;

          diffs.push(new Diff(k));
               //    console.log(diffs);
        }
      });
      if (!t1.attributes && t1.data !== t2.data) {
          k = {};
          k[ACTION] = MODIFY_DATA;
          k[ROUTE] = route;
          k[OLD_VALUE] = t1.data;
          k[NEW_VALUE] = t2.data;
          diffs.push(new Diff(k));          
      }
      if (diffs.length > 0) {
        return diffs;
      };
      attr2.forEach(function (attr) {
        var k;
        k = {};
        k[ACTION] = ADD_ATTRIBUTE;
        k[ROUTE] = route;
        k[NAME] = attr.name;
        k[VALUE] = attr.value;
        diffs.push(new Diff(k));
        
      });
      
      if ((t1.selected || t2.selected) && t1.selected !== t2.selected) {
        if (diffs.length > 0) {
            return diffs;
        }
        k = {};
        k[ACTION] = MODIFY_SELECTED;
        k[OLD_VALUE] = t1.selected;
        k[NEW_VALUE] = t2.selected;
        k[ROUTE] = route;
        diffs.push(new Diff(k));
      }      
      
      return diffs;
    },
    findInnerDiff: function (t1, t2, route) {
      var subtrees = markSubTrees(t1, t2),
        mappings = subtrees.length,
        k;
      // no correspondence whatsoever
      // if t1 or t2 contain differences that are not text nodes, return a diff. 

      // two text nodes with differences
      if (mappings === 0) {
        if (t1.nodeType === 3 && t2.nodeType === 3 && t1.data !== t2.data) {
          k = {};
          k[ACTION] = MODIFY_TEXT_ELEMENT;
          k[OLD_VALUE] = t1.data;
          k[NEW_VALUE] = t2.data;
          k[ROUTE] = route;
          return new Diff(k);
        }
      }
      // possibly identical content: verify
      if (mappings < 2) {
        var diff, difflist, i, last, e1, e2;
        for (i = 0, last = Math.max(t1.childNodes.length, t2.childNodes.length); i < last; i++) {
          e1 = t1.childNodes[i];
          e2 = t2.childNodes[i];
          // TODO: this is a similar code path to the one
          //       in findFirstInnerDiff. Can we unify these?
          if (e1 && !e2) {
            if (e1.nodeType === 3) {
              k = {};
              k[ACTION] = REMOVE_TEXT_ELEMENT;
              k[ROUTE] = route.concat(i);
              k[VALUE] = e1.data;
              return new Diff(k);
            }
            k = {};
            k[ACTION] = REMOVE_ELEMENT;
            k[ROUTE] = route.concat(i);
            k[ELEMENT] = nodeToObj(e1);
            return new Diff(k);
          }
          if (e2 && !e1) {
            if (e2.nodeType === 3) {
              k = {};
              k[ACTION] = ADD_TEXT_ELEMENT;
              k[ROUTE] = route.concat(i);
              k[VALUE] = e2.data;
              return new Diff(k);
            }
            k = {};
            k[ACTION] = ADD_ELEMENT;
            k[ROUTE] = route.concat(i);
            k[ELEMENT] = nodeToObj(e2);
            return new Diff(k);
          }
          if (e1.nodeType != 3 || e2.nodeType != 3) {
            difflist = this.findOuterDiff(e1, e2, route.concat(i));
            if (difflist.length > 0) {
              return difflist;
            }
          }
          diff = this.findInnerDiff(e1, e2, route.concat(i));
          if (diff) {
            return diff;
          }
        }
      }

      // one or more differences: find first diff
      return this.findFirstInnerDiff(t1, t2, subtrees, route);
    },

    // imported
    findFirstInnerDiff: findFirstInnerDiff,

    // ===== Apply a diff =====

    apply: function (tree, diffs) {
      var dobj = this;
      if (typeof diffs.length === "undefined") {
        diffs = [diffs];
      }
      if (diffs.length === 0) {
        return true;
      }
      diffs.forEach(function (diff) {
        if (!dobj.applyDiff(tree, diff))
          return false;
      });
      return true;
    },
    getFromRoute: function (tree, route) {
      route = route.slice();
      var c, node = tree;
      while (route.length > 0) {
        if (!node.childNodes) {
          return false;
        }
        c = route.splice(0, 1)[0];
        node = node.childNodes[c];
      }
      return node;
    },
    // diffing text elements can be overwritten for use with diff_match_patch and alike
    textDiff: function (node, currentValue, expectedValue, newValue) {
      node.data = newValue;
      return;
    },
    applyDiff: function (tree, diff) {
      var node = this.getFromRoute(tree, diff[ROUTE]);
      if (diff[ACTION] === ADD_ATTRIBUTE) {
        if (!node || !node.setAttribute)
          return false;
        node.setAttribute(diff[NAME], diff[VALUE]);
      } else if (diff[ACTION] === MODIFY_ATTRIBUTE) {
        if (!node || !node.setAttribute)
          return false;
        node.setAttribute(diff[NAME], diff[NEW_VALUE]);
      } else if (diff[ACTION] === REMOVE_ATTRIBUTE) {
        if (!node || !node.removeAttribute)
          return false;
        node.removeAttribute(diff[NAME]);
      } else if (diff[ACTION] === MODIFY_VALUE) {
        if (!node || typeof node.value === 'undefined')
          return false;
        node.value = diff[NEW_VALUE];
      } else if (diff[ACTION] === MODIFY_DATA) {
        if (!node || typeof node.data === 'undefined')
          return false;
        node.data = diff[NEW_VALUE];
      } else if (diff[ACTION] === MODIFY_CHECKED) {
        if (!node || typeof node.checked === 'undefined')
          return false;
        node.checked = diff[NEW_VALUE];
      } else if (diff[ACTION] === MODIFY_SELECTED) {
        if (!node || typeof node.selected === 'undefined')
          return false;
        node.selected = diff[NEW_VALUE];     
      } else if (diff[ACTION] === MODIFY_TEXT_ELEMENT) {
        if (!node || node.nodeType != 3)
          return false;
        this.textDiff(node, node.data, diff[OLD_VALUE], diff[NEW_VALUE]);
      } else if (diff[ACTION] === REPLACE_ELEMENT) {
        var newNode = objToNode(diff[NEW_VALUE]);
        node.parentNode.replaceChild(newNode, node);
      } else if (diff[ACTION] === RELOCATE_GROUP) {
        var group = diff[GROUP],
          from = diff[FROM],
          to = diff[TO],
          child, reference;
        reference = node.childNodes[to + group.length];
        // slide elements up
        if (from < to) {
          for (var i = 0; i < group.length; i++) {
            child = node.childNodes[from];
            node.insertBefore(child, reference);
          }
        } else {
          // slide elements down
          reference = node.childNodes[to];
          for (var i = 0; i < group.length; i++) {
            child = node.childNodes[from + i];
            node.insertBefore(child, reference);
          }
        }
      } else if (diff[ACTION] === REMOVE_ELEMENT) {
        node.parentNode.removeChild(node);
      } else if (diff[ACTION] === REMOVE_TEXT_ELEMENT) {
        if (!node || node.nodeType != 3)
          return false;
        node.parentNode.removeChild(node);
      } else if (diff[ACTION] === ADD_ELEMENT) {
        var route = diff[ROUTE].slice(),
          c = route.splice(route.length - 1, 1)[0];
        node = this.getFromRoute(tree, route);
        var newNode = objToNode(diff[ELEMENT]);
        if (c >= node.childNodes.length) {
          node.appendChild(newNode);
        } else {
          var reference = node.childNodes[c];
          node.insertBefore(newNode, reference);
        }
      } else if (diff[ACTION] === ADD_TEXT_ELEMENT) {
        var route = diff[ROUTE].slice(),
          c = route.splice(route.length - 1, 1)[0],
          newNode = document.createTextNode(diff[VALUE]);
        node = this.getFromRoute(tree, route);
        if (!node || !node.childNodes)
          return false;
        if (c >= node.childNodes.length) {
          node.appendChild(newNode);
        } else {
          var reference = node.childNodes[c];
          node.insertBefore(newNode, reference);
        }
      }
      return true;
    },

    // ===== Undo a diff =====

    undo: function (tree, diffs) {
      diffs = diffs.slice();
      var dobj = this;
      if (!diffs.length) {
        diffs = [diffs];
      }
      diffs.reverse();
      diffs.forEach(function (diff) {
        dobj.undoDiff(tree, diff);
      });
    },
    undoDiff: function (tree, diff) {
      if (diff[ACTION] === ADD_ATTRIBUTE) {
        diff[ACTION] = REMOVE_ATTRIBUTE;
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === MODIFY_ATTRIBUTE) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === REMOVE_ATTRIBUTE) {
        diff[ACTION] = ADD_ATTRIBUTE;
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === MODIFY_TEXT_ELEMENT) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === MODIFY_VALUE) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === MODIFY_DATA) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);        
      } else if (diff[ACTION] === MODIFY_CHECKED) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === MODIFY_SELECTED) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === REPLACE_ELEMENT) {
        swap(diff, OLD_VALUE, NEW_VALUE);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === RELOCATE_GROUP) {
        swap(diff, FROM, TO);
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === REMOVE_ELEMENT) {
        diff[ACTION] = ADD_ELEMENT;
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === ADD_ELEMENT) {
        diff[ACTION] = REMOVE_ELEMENT;
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === REMOVE_TEXT_ELEMENT) {
        diff[ACTION] = ADD_TEXT_ELEMENT;
        this.applyDiff(tree, diff);
      } else if (diff[ACTION] === ADD_TEXT_ELEMENT) {
        diff[ACTION] = REMOVE_TEXT_ELEMENT;
        this.applyDiff(tree, diff);
      }
    },
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = diffDOM;
    }
    exports.diffDOM = diffDOM;
  } else {
    // `window` in the browser, or `exports` on the server
    this.diffDOM = diffDOM;
  }

}.call(this));

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var events = _interopRequire(require("./pub-sub"));

var drawUI = _interopRequire(require("./cart-ui.js"));

function listenUI() {
  events.on("cart:update", function () {
    console.log("redraw");
    drawUI();
  });
}

module.exports = listenUI;

},{"./cart-ui.js":27,"./pub-sub":30}],27:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var events = _interopRequire(require("./pub-sub"));

var diffDOM = _interopRequire(require("diff-dom"));

function drawUI() {

  var summary = cart.getCart();

  var subtotal = document.getElementsByClassName("tinycart-subtotal")[0];
  if (subtotal) {
    subtotal.innerHTML = summary.subtotal;
  }

  var shipping = document.getElementsByClassName("tinycart-shipping")[0];
  if (shipping) {
    shipping.innerHTML = summary.shipTotal;
  }

  var total = document.getElementsByClassName("tinycart-total")[0];
  if (total) {
    total.innerHTML = summary.total;
  }

  var itemDiv = document.getElementsByClassName("tinycart-items")[0];
  if (itemDiv) {
    (function () {
      var dd = new diffDOM();
      var items = cart.getCart().items;
      var tmp = itemDiv.cloneNode(false);
      tmp.innerHTML = "";
      items.forEach(function (item) {
        var id = "'" + item.id + "'";
        var title = "'" + item.title + "'";
        tmp.innerHTML = tmp.innerHTML + "<div class=\"column-24 first-column line-item\">" + "<div class=\"column-1 text-right pre-3\">" + "<a onclick=\"cart.destroyItem(" + id + ");\">x </a>" + "</div>" + "<div class=\"column-9\">" + "<a href=\"" + item.id + "\">" + item.title + "</a>" + "</div>" + "<div class=\"column-1 text-center\">" + "<a onclick=\"cart.removeItem(" + id + ");\"> - </a>" + "</div>" + "<div class=\"column-1 text-center\">" + "<span>" + item.quantity + "</span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<a onclick=\"cart.addItem(" + title + ", " + id + ", " + item.price + ", 1);\"> + </a>" + "</div>" + "<div class=\"column-2 pre-1\">" + "<span>$</span>" + "<span class=\"right\">" + item.price + "</span>" + "</div>" + "<div class=\"column-2 pre-1\">" + "<span>$</span>" + "<span class=\"right\">" + item.quantity * item.price + "</span>" + "</div>" + "</div>";
      });

      dd.apply(itemDiv, dd.diff(itemDiv, tmp));
    })();
  }

  var summaryDiv = document.getElementsByClassName("tinycart-summary")[0];
  if (summaryDiv) {
    (function () {
      var dd = new diffDOM();
      var items = cart.getCart().items;
      var tmp = summaryDiv.cloneNode(false);
      tmp.innerHTML = "";
      items.forEach(function (item) {
        var id = "'" + item.id + "'";
        var title = "'" + item.title + "'";
        tmp.innerHTML = tmp.innerHTML + "<div class=\"column-11 first-column line-item\">" + "<div class=\"column-5\">" + "<span>" + item.title + "</span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<a onclick=\"cart.removeItem(" + id + ");\"> - </a>" + "</div>" + "<div class=\"column-1 text-center\">" + "<span>" + item.quantity + "</span>" + "</div>" + "<div class=\"column-1 text-center\">" + "<a onclick=\"cart.addItem(" + title + ", " + id + ", " + item.price + ", 1);\"> + </a>" + "</div>" + "<div class=\"column-2 pre-1\">" + "<span>$</span>" + "<span class=\"right\">" + item.quantity * item.price + "</span>" + "</div>" + "</div>";
      });

      dd.apply(summaryDiv, dd.diff(summaryDiv, tmp));
    })();
  }

  var cartLink = document.getElementsByClassName("tinycart-link")[0];
  if (cartLink) {
    var dd = new diffDOM();
    var crt = cart.getCart();
    var tmp = cartLink.cloneNode(false);
    if (crt.items.length > 1) {
      tmp.innerHTML = crt.items.length + " items: $" + crt.subtotal;
    } else if (crt.items.length == 1) {
      tmp.innerHTML = crt.items.length + " item: $" + crt.subtotal;
    } else {
      tmp.innerHTML = "";
    }
    dd.apply(cartLink, dd.diff(cartLink, tmp));
  }
}

module.exports = drawUI;

},{"./pub-sub":30,"diff-dom":24}],28:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var TS = _interopRequire(require("tinystore"));

var events = _interopRequire(require("./pub-sub"));

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
    console.log("item added to cart");
    _this.cartUpdated();
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
    _this.cartUpdated();
    return _this;
  };

  this.cartUpdated = function () {
    console.log("cart updated emitted");
    events.trigger("cart:update");
  };
}

module.exports = TinyCart;

},{"./pub-sub":30,"tinystore":25}],29:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var calcite = _interopRequire(require("calcite-web"));

var TinyCart = _interopRequire(require("./cart.js"));

var drawUI = _interopRequire(require("./cart-ui.js"));

var listenUI = _interopRequire(require("./cart-listener.js"));

// var cart = Cart

window.cart = new TinyCart({
  cartName: "lonegoosepressCart",
  currency: "$",
  baseShipping: 10,
  shipping: 4
});

drawUI();
listenUI();

window.calcite.init();

},{"./cart-listener.js":26,"./cart-ui.js":27,"./cart.js":28,"calcite-web":23}],30:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/**
* Create an events hub
*/

var Events = _interopRequire(require("ampersand-events"));

// Create a new event bus
var events = Events.createEmitter();

// list all bound events for debugging
//events.on('all', () => console.log(events._events))

module.exports = events;

},{"ampersand-events":1}]},{},[29])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9hbXBlcnNhbmQtZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1iaW5kL2JpbmQuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWJpbmQvbm9kZV9tb2R1bGVzL2FtcC1pcy1mdW5jdGlvbi9pcy1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtYmluZC9ub2RlX21vZHVsZXMvYW1wLWlzLW9iamVjdC9pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWVhY2gvZWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtZWFjaC9ub2RlX21vZHVsZXMvYW1wLWNyZWF0ZS1jYWxsYmFjay9jcmVhdGUtY2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWV4dGVuZC9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L2lzLWVtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1pcy1lbXB0eS9ub2RlX21vZHVsZXMvYW1wLWlzLWFyZ3VtZW50cy9pcy1hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L25vZGVfbW9kdWxlcy9hbXAtaXMtYXJyYXkvaXMtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L25vZGVfbW9kdWxlcy9hbXAtaXMtbmFuL2lzLW5hbi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtaXMtZW1wdHkvbm9kZV9tb2R1bGVzL2FtcC1pcy1udW1iZXIvaXMtbnVtYmVyLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1pcy1lbXB0eS9ub2RlX21vZHVsZXMvYW1wLWlzLXN0cmluZy9pcy1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWtleXMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAta2V5cy9ub2RlX21vZHVsZXMvYW1wLWhhcy9oYXMuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWtleXMvbm9kZV9tb2R1bGVzL2FtcC1pbmRleC1vZi9pbmRleC1vZi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtb25jZS9ub2RlX21vZHVsZXMvYW1wLWxpbWl0LWNhbGxzL2xpbWl0LWNhbGxzLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1vbmNlL29uY2UuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLXVuaXF1ZS1pZC91bmlxdWUtaWQuanMiLCJub2RlX21vZHVsZXMvY2FsY2l0ZS13ZWIvbGliL2pzL2NhbGNpdGUtd2ViLmpzIiwibm9kZV9tb2R1bGVzL2RpZmYtZG9tL2RpZmZET00uanMiLCJub2RlX21vZHVsZXMvdGlueXN0b3JlL3RpbnlzdG9yZS5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC1saXN0ZW5lci5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC11aS5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC5qcyIsInNvdXJjZS9hc3NldHMvanMvaW5kZXguanMiLCJzb3VyY2UvYXNzZXRzL2pzL3B1Yi1zdWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFRLENBQUM7QUFDekIsVUFBUSxFQUFFLG9CQUFvQjtBQUM5QixVQUFRLEVBQUUsR0FBRztBQUNiLGNBQVksRUFBRSxFQUFLO0FBQ25CLFVBQVEsRUFBRSxDQUFJO0NBQ2YsQ0FBQyxDQUFBOztBQUVGLE1BQU0sRUFBRSxDQUFBO0FBQ1IsUUFBUSxFQUFFLENBQUE7O0FBRVYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7Ozs7Ozs7Ozs7SUNkZCxNQUFNLDJCQUFNLGtCQUFrQjs7O0FBR3JDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQTs7Ozs7aUJBS3BCLE1BQU0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiO2lmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7ICB3aW5kb3cuYW1wZXJzYW5kID0gd2luZG93LmFtcGVyc2FuZCB8fCB7fTsgIHdpbmRvdy5hbXBlcnNhbmRbXCJhbXBlcnNhbmQtZXZlbnRzXCJdID0gd2luZG93LmFtcGVyc2FuZFtcImFtcGVyc2FuZC1ldmVudHNcIl0gfHwgW107ICB3aW5kb3cuYW1wZXJzYW5kW1wiYW1wZXJzYW5kLWV2ZW50c1wiXS5wdXNoKFwiMS4wLjFcIik7fVxudmFyIHJ1bk9uY2UgPSByZXF1aXJlKCdhbXAtb25jZScpO1xudmFyIHVuaXF1ZUlkID0gcmVxdWlyZSgnYW1wLXVuaXF1ZS1pZCcpO1xudmFyIGtleXMgPSByZXF1aXJlKCdhbXAta2V5cycpO1xudmFyIGlzRW1wdHkgPSByZXF1aXJlKCdhbXAtaXMtZW1wdHknKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnYW1wLWVhY2gnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnYW1wLWJpbmQnKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCdhbXAtZXh0ZW5kJyk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgZXZlbnRTcGxpdHRlciA9IC9cXHMrLztcblxuXG52YXIgRXZlbnRzID0ge1xuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0gfHwgKHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdKTtcbiAgICAgICAgZXZlbnRzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IHRoaXN9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gb25seSBiZSB0cmlnZ2VyZWQgYSBzaW5nbGUgdGltZS4gQWZ0ZXIgdGhlIGZpcnN0IHRpbWVcbiAgICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxuICAgIG9uY2U6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICdvbmNlJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgb25jZSA9IHJ1bk9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLm9mZihuYW1lLCBvbmNlKTtcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0pO1xuICAgICAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBvbmNlLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50LiBJZiBgbmFtZWAgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgYm91bmRcbiAgICAvLyBjYWxsYmFja3MgZm9yIGFsbCBldmVudHMuXG4gICAgb2ZmOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICB2YXIgcmV0YWluLCBldiwgZXZlbnRzLCBuYW1lcywgaSwgbCwgaiwgaztcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBuYW1lcyA9IG5hbWUgPyBbbmFtZV0gOiBrZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBuYW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgICAgIGlmIChldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbbmFtZV0gPSByZXRhaW4gPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2sgfHwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXYgPSBldmVudHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2suX2NhbGxiYWNrKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBldi5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldGFpbi5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXJldGFpbi5sZW5ndGgpIGRlbGV0ZSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgdmFyIGFsbEV2ZW50cyA9IHRoaXMuX2V2ZW50cy5hbGw7XG4gICAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUZWxsIHRoaXMgb2JqZWN0IHRvIHN0b3AgbGlzdGVuaW5nIHRvIGVpdGhlciBzcGVjaWZpYyBldmVudHMgLi4uIG9yXG4gICAgLy8gdG8gZXZlcnkgb2JqZWN0IGl0J3MgY3VycmVudGx5IGxpc3RlbmluZyB0by5cbiAgICBzdG9wTGlzdGVuaW5nOiBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBsaXN0ZW5pbmdUbyA9IHRoaXMuX2xpc3RlbmluZ1RvO1xuICAgICAgICBpZiAoIWxpc3RlbmluZ1RvKSByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIHJlbW92ZSA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICAgICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgICAgaWYgKG9iaikgKGxpc3RlbmluZ1RvID0ge30pW29iai5fbGlzdGVuSWRdID0gb2JqO1xuICAgICAgICBmb3IgKHZhciBpZCBpbiBsaXN0ZW5pbmdUbykge1xuICAgICAgICAgICAgb2JqID0gbGlzdGVuaW5nVG9baWRdO1xuICAgICAgICAgICAgb2JqLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgICAgICBpZiAocmVtb3ZlIHx8IGlzRW1wdHkob2JqLl9ldmVudHMpKSBkZWxldGUgdGhpcy5fbGlzdGVuaW5nVG9baWRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBleHRlbmQgYW4gb2JqZWN0IHdpdGggZXZlbnQgY2FwYWJpbGl0aWVzIGlmIHBhc3NlZFxuICAgIC8vIG9yIGp1c3QgcmV0dXJuIGEgbmV3IG9uZS5cbiAgICBjcmVhdGVFbWl0dGVyOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBleHRlbmQob2JqIHx8IHt9LCBFdmVudHMpO1xuICAgIH1cbn07XG5cblxuLy8gSW1wbGVtZW50IGZhbmN5IGZlYXR1cmVzIG9mIHRoZSBFdmVudHMgQVBJIHN1Y2ggYXMgbXVsdGlwbGUgZXZlbnRcbi8vIG5hbWVzIGBcImNoYW5nZSBibHVyXCJgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnQgbWFwcyBge2NoYW5nZTogYWN0aW9ufWBcbi8vIGluIHRlcm1zIG9mIHRoZSBleGlzdGluZyBBUEkuXG52YXIgZXZlbnRzQXBpID0gZnVuY3Rpb24ob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gSGFuZGxlIGV2ZW50IG1hcHMuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBba2V5LCBuYW1lW2tleV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGFjZSBzZXBhcmF0ZWQgZXZlbnQgbmFtZXMuXG4gICAgaWYgKGV2ZW50U3BsaXR0ZXIudGVzdChuYW1lKSkge1xuICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8gQSBkaWZmaWN1bHQtdG8tYmVsaWV2ZSwgYnV0IG9wdGltaXplZCBpbnRlcm5hbCBkaXNwYXRjaCBmdW5jdGlvbiBmb3Jcbi8vIHRyaWdnZXJpbmcgZXZlbnRzLiBUcmllcyB0byBrZWVwIHRoZSB1c3VhbCBjYXNlcyBzcGVlZHkuXG52YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uKGV2ZW50cywgYXJncykge1xuICAgIHZhciBldjtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsID0gZXZlbnRzLmxlbmd0aDtcbiAgICB2YXIgYTEgPSBhcmdzWzBdO1xuICAgIHZhciBhMiA9IGFyZ3NbMV07XG4gICAgdmFyIGEzID0gYXJnc1syXTtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgpOyByZXR1cm47XG4gICAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgICBjYXNlIDI6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIpOyByZXR1cm47XG4gICAgICAgIGNhc2UgMzogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMiwgYTMpOyByZXR1cm47XG4gICAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7IHJldHVybjtcbiAgICB9XG59O1xuXG52YXIgbGlzdGVuTWV0aG9kcyA9IHtcbiAgICBsaXN0ZW5UbzogJ29uJywgXG4gICAgbGlzdGVuVG9PbmNlOiAnb25jZSdcbn07XG5cbi8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4vLyBsaXN0ZW4gdG8gYW4gZXZlbnQgaW4gYW5vdGhlciBvYmplY3QgLi4uIGtlZXBpbmcgdHJhY2sgb2Ygd2hhdCBpdCdzXG4vLyBsaXN0ZW5pbmcgdG8uXG5lYWNoKGxpc3Rlbk1ldGhvZHMsIGZ1bmN0aW9uKGltcGxlbWVudGF0aW9uLCBtZXRob2QpIHtcbiAgICBFdmVudHNbbWV0aG9kXSA9IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2ssIHJ1bikge1xuICAgICAgICB2YXIgbGlzdGVuaW5nVG8gPSB0aGlzLl9saXN0ZW5pbmdUbyB8fCAodGhpcy5fbGlzdGVuaW5nVG8gPSB7fSk7XG4gICAgICAgIHZhciBpZCA9IG9iai5fbGlzdGVuSWQgfHwgKG9iai5fbGlzdGVuSWQgPSB1bmlxdWVJZCgnbCcpKTtcbiAgICAgICAgbGlzdGVuaW5nVG9baWRdID0gb2JqO1xuICAgICAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgICBvYmpbaW1wbGVtZW50YXRpb25dKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn0pO1xuXG5FdmVudHMubGlzdGVuVG9BbmRSdW4gPSBmdW5jdGlvbiAob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgIEV2ZW50cy5saXN0ZW5Uby5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICghY2FsbGJhY2sgJiYgdHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgY2FsbGJhY2suYXBwbHkodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50cztcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnYW1wLWlzLWZ1bmN0aW9uJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCdhbXAtaXMtb2JqZWN0Jyk7XG52YXIgbmF0aXZlQmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kO1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIEN0b3IgPSBmdW5jdGlvbiAoKSB7fTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICBDdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgc2VsZiA9IG5ldyBDdG9yKCk7XG4gICAgICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIGlmIChpc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGZ1bmMgPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG4vLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIGFuIElFIDExIGJ1Zy5cbmlmICh0eXBlb2YgLy4vICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgZnVuYyA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuYztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiAhIW9iaiAmJiAodHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0Jyk7XG59O1xuIiwidmFyIG9iaktleXMgPSByZXF1aXJlKCdhbXAta2V5cycpO1xudmFyIGNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnYW1wLWNyZWF0ZS1jYWxsYmFjaycpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBpLCBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPT09ICtsZW5ndGgpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIga2V5cyA9IG9iaktleXMob2JqKTtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayhmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICBjYXNlIDE6IFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgIGNhc2UgMjogXG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgICAgfTtcbiAgICBjYXNlIDM6IFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH07XG4gICAgY2FzZSA0OiBcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJ2FtcC1pcy1vYmplY3QnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn07XG4iLCJ2YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2FtcC1pcy1hcnJheScpO1xudmFyIGlzU3RyaW5nID0gcmVxdWlyZSgnYW1wLWlzLXN0cmluZycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnYW1wLWlzLWFyZ3VtZW50cycpO1xudmFyIGlzTnVtYmVyID0gcmVxdWlyZSgnYW1wLWlzLW51bWJlcicpO1xudmFyIGlzTmFuID0gcmVxdWlyZSgnYW1wLWlzLW5hbicpO1xudmFyIGtleXMgPSByZXF1aXJlKCdhbXAta2V5cycpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNFbXB0eShvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChpc0FycmF5KG9iaikgfHwgaXNTdHJpbmcob2JqKSB8fCBpc0FyZ3VtZW50cyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBpZiAoaXNOdW1iZXIob2JqKSkgcmV0dXJuIG9iaiA9PT0gMCB8fCBpc05hbihvYmopO1xuICAgIGlmIChrZXlzKG9iaikubGVuZ3RoICE9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIGlzQXJncyA9IGZ1bmN0aW9uIGlzQXJncyhvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbi8vIGZvciBJRSA8OVxuaWYgKCFpc0FyZ3MoYXJndW1lbnRzKSkge1xuICAgIGlzQXJncyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiAmJiBoYXNPd24uY2FsbChvYmosICdjYWxsZWUnKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJncztcbiIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCJ2YXIgaXNOdW1iZXIgPSByZXF1aXJlKCdhbXAtaXMtbnVtYmVyJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc05hTihvYmopIHtcbiAgICByZXR1cm4gaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG59O1xuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzTnVtYmVyKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE51bWJlcl0nO1xufTtcbiIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnYW1wLWhhcycpO1xudmFyIGluZGV4T2YgPSByZXF1aXJlKCdhbXAtaW5kZXgtb2YnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJ2FtcC1pcy1vYmplY3QnKTtcbnZhciBuYXRpdmVLZXlzID0gT2JqZWN0LmtleXM7XG52YXIgaGFzRW51bUJ1ZyA9ICEoe3RvU3RyaW5nOiBudWxsfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG52YXIgbm9uRW51bWVyYWJsZVByb3BzID0gWydjb25zdHJ1Y3RvcicsICd2YWx1ZU9mJywgJ2lzUHJvdG90eXBlT2YnLCAndG9TdHJpbmcnLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gICAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChoYXMob2JqLCBrZXkpKSByZXN1bHQucHVzaChrZXkpO1xuICAgIC8vIElFIDwgOVxuICAgIGlmIChoYXNFbnVtQnVnKSB7XG4gICAgICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgICAgICAgdmFyIHByb3AgPSBub25FbnVtZXJhYmxlUHJvcHNbbm9uRW51bUlkeF07XG4gICAgICAgICAgICBpZiAoaGFzKG9iaiwgcHJvcCkgJiYgaW5kZXhPZihyZXN1bHQsIHByb3ApID09PSAtMSkgcmVzdWx0LnB1c2gocHJvcCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCJ2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuIiwidmFyIGlzTnVtYmVyID0gcmVxdWlyZSgnYW1wLWlzLW51bWJlcicpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5kZXhPZihhcnIsIGl0ZW0sIGZyb20pIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGwgPSBhcnIgJiYgYXJyLmxlbmd0aDtcbiAgICBpZiAoaXNOdW1iZXIoZnJvbSkpIHtcbiAgICAgICAgaSA9IGZyb20gPCAwID8gTWF0aC5tYXgoMCwgbCArIGZyb20pIDogZnJvbTtcbiAgICB9XG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxpbWl0Q2FsbHMoZm4sIHRpbWVzKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGltZXMtLSA+IDApIHtcbiAgICAgICAgICAgIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG59O1xuIiwidmFyIGxpbWl0Q2FsbHMgPSByZXF1aXJlKCdhbXAtbGltaXQtY2FsbHMnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICByZXR1cm4gbGltaXRDYWxscyhmbiwgMSk7XG59O1xuIiwiLypnbG9iYWwgd2luZG93LCBnbG9iYWwqL1xudmFyIHRoZUdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiBnbG9iYWw7XG5pZiAoIXRoZUdsb2JhbC5fX2FtcElkQ291bnRlcikge1xuICAgIHRoZUdsb2JhbC5fX2FtcElkQ291bnRlciA9IDA7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmlxdWVJZChwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK3RoZUdsb2JhbC5fX2FtcElkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xufTtcbiIsIihmdW5jdGlvbiBDYWxjaXRlICgpIHtcblxudmFyIGNhbGNpdGUgPSB7XG4gIHZlcnNpb246ICcwLjAuOSdcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERPTSBVdGlsaXRpZXMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuY2FsY2l0ZS5kb20gPSB7fTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIEV2ZW50IE1hbmFnZW1lbnQg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gcmV0dXJucyBzdGFuZGFyZCBpbnRlcmFjdGlvbiBldmVudCwgbGF0ZXIgd2lsbCBhZGQgdG91Y2ggc3VwcG9ydFxuY2FsY2l0ZS5kb20uZXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnY2xpY2snO1xufTtcblxuLy8gYWRkIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYW4gZXZlbnQgb24gYSBET00gbm9kZVxuY2FsY2l0ZS5kb20uYWRkRXZlbnQgPSBmdW5jdGlvbiAoZG9tTm9kZSwgZXZlbnQsIGZuKSB7XG4gIGlmIChkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICB9XG4gIGlmIChkb21Ob2RlLmF0dGFjaEV2ZW50KSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBmbik7XG4gIH1cbn07XG5cbi8vIHJlbW92ZSBhIHNwZWNpZmljIGZ1bmN0aW9uIGJpbmRpbmcgZnJvbSBhIERPTSBub2RlIGV2ZW50XG5jYWxjaXRlLmRvbS5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChkb21Ob2RlLCBldmVudCwgZm4pIHtcbiAgaWYgKGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIHJldHVybiBkb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gIH1cbiAgaWYgKGRvbU5vZGUuZGV0YWNoRXZlbnQpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsICBmbik7XG4gIH1cbn07XG5cbi8vIGdldCB0aGUgdGFyZ2V0IGVsZW1lbnQgb2YgYW4gZXZlbnRcbmNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmICghZXZlbnQudGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnNyY0VsZW1lbnQ7XG4gIH1cbiAgaWYgKGV2ZW50LnRhcmdldCkge1xuICAgIHJldHVybiBldmVudC50YXJnZXQ7XG4gIH1cbn07XG5cbi8vIHByZXZlbnQgZGVmYXVsdCBiZWhhdmlvciBvZiBhbiBldmVudFxuY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgaWYgKGV2ZW50LnJldHVyblZhbHVlKSB7XG4gICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgfVxufTtcblxuLy8gc3RvcCBhbmQgZXZlbnQgZnJvbSBidWJibGluZyB1cCB0aGUgRE9NIHRyZWVcbmNhbGNpdGUuZG9tLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICBldmVudCA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcbiAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIHJldHVybiBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBpZiAoZXZlbnQuY2FuY2VsQnViYmxlKSB7XG4gICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2xhc3MgTWFuaXB1bGF0aW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbi8vIGNoZWNrIGlmIGFuIGVsZW1lbnQgaGFzIGEgc3BlY2lmaWMgY2xhc3NcbmNhbGNpdGUuZG9tLmhhc0NsYXNzID0gZnVuY3Rpb24gKGRvbU5vZGUsIGNsYXNzTmFtZSkge1xuICB2YXIgZXhwID0gbmV3IFJlZ0V4cCgnICcgKyBjbGFzc05hbWUgKyAnICcpO1xuICBpZiAoZXhwLnRlc3QoJyAnICsgZG9tTm9kZS5jbGFzc05hbWUgKyAnICcpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBhZGQgb25lIG9yIG1vcmUgY2xhc3NlcyB0byBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBjbGFzc2VzKSB7XG4gIGNsYXNzZXMgPSBjbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFjYWxjaXRlLmRvbS5oYXNDbGFzcyhkb21Ob2RlLCBjbGFzc2VzW2ldKSkge1xuICAgICAgZG9tTm9kZS5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3Nlc1tpXTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHJlbW92ZSBvbmUgb3IgbW9yZSBjbGFzc2VzIGZyb20gYW4gZWxlbWVudFxuY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoZG9tTm9kZSwgY2xhc3Nlcykge1xuICBjbGFzc2VzID0gY2xhc3Nlcy5zcGxpdCgnICcpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBuZXdDbGFzcyA9ICcgJyArIGRvbU5vZGUuY2xhc3NOYW1lLnJlcGxhY2UoIC9bXFx0XFxyXFxuXS9nLCAnICcpICsgJyAnO1xuXG4gICAgaWYgKGNhbGNpdGUuZG9tLmhhc0NsYXNzKGRvbU5vZGUsIGNsYXNzZXNbaV0pKSB7XG4gICAgICB3aGlsZSAobmV3Q2xhc3MuaW5kZXhPZignICcgKyBjbGFzc2VzW2ldICsgJyAnKSA+PSAwKSB7XG4gICAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgnICcgKyBjbGFzc2VzW2ldICsgJyAnLCAnICcpO1xuICAgICAgfVxuXG4gICAgICBkb21Ob2RlLmNsYXNzTmFtZSA9IG5ld0NsYXNzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERPTSBUcmF2ZXJzYWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gcmV0dXJucyBjbG9zZXN0IGVsZW1lbnQgdXAgdGhlIERPTSB0cmVlIG1hdGNoaW5nIGEgZ2l2ZW4gY2xhc3NcbmNhbGNpdGUuZG9tLmNsb3Nlc3QgPSBmdW5jdGlvbiAoY2xhc3NOYW1lLCBjb250ZXh0KSB7XG4gIHZhciByZXN1bHQsIGN1cnJlbnQ7XG4gIGZvciAoY3VycmVudCA9IGNvbnRleHQ7IGN1cnJlbnQ7IGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudE5vZGUpIHtcbiAgICBpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gMSAmJiBjYWxjaXRlLmRvbS5oYXNDbGFzcyhjdXJyZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBjdXJyZW50O1xufTtcblxuLy8gZ2V0IGFuIGF0dHJpYnV0ZSBmb3IgYW4gZWxlbWVudFxuY2FsY2l0ZS5kb20uZ2V0QXR0ciA9IGZ1bmN0aW9uKGRvbU5vZGUsIGF0dHIpIHtcbiAgaWYgKGRvbU5vZGUuZ2V0QXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIGRvbU5vZGUuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICB9XG5cbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGF0dHJzID0gZG9tTm9kZS5hdHRyaWJ1dGVzO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXR0cnNbaV0ubm9kZU5hbWUgPT09IGF0dHIpIHtcbiAgICAgIHJlc3VsdCA9IGF0dHJzW2ldLm5vZGVWYWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgT2JqZWN0IENvbnZlcnNpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gdHVybiBhIGRvbU5vZGVMaXN0IGludG8gYW4gYXJyYXlcbmNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheSA9IGZ1bmN0aW9uIChkb21Ob2RlTGlzdCkge1xuICB2YXIgYXJyYXkgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb21Ob2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5LnB1c2goZG9tTm9kZUxpc3RbaV0pO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEFycmF5IE1hbmlwdWxhdGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG5jYWxjaXRlLmFyciA9IHt9O1xuXG4vLyByZXR1cm4gdGhlIGluZGV4IG9mIGFuIG9iamVjdCBpbiBhbiBhcnJheSB3aXRoIG9wdGlvbmFsIG9mZnNldFxuY2FsY2l0ZS5hcnIuaW5kZXhPZiA9IGZ1bmN0aW9uIChvYmosIGFyciwgb2Zmc2V0KSB7XG4gIHZhciBpID0gb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKGFyci5pbmRleE9mKSB7XG4gICAgcmV0dXJuIGFyci5pbmRleE9mKG9iaiwgaSk7XG4gIH1cblxuICBmb3IgKGk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEJyb3dzZXIgRmVhdHVyZSBEZXRlY3Rpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGRldGVjdCBmZWF0dXJlcyBsaWtlIHRvdWNoLCBpZSwgZXRjLlxuXG5jYWxjaXRlLmJyb3dzZXIgPSB7fTtcblxuLy8gZGV0ZWN0IHRvdWNoLCBjb3VsZCBiZSBpbXByb3ZlZCBmb3IgbW9yZSBjb3ZlcmFnZVxuY2FsY2l0ZS5icm93c2VyLmlzVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG4gIGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEpTIFBhdHRlcm5zIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBqYXZhc2NyaXB0IGxvZ2ljIGZvciB1aSBwYXR0ZXJuc1xuXG5mdW5jdGlvbiBmaW5kRWxlbWVudHMgKGNsYXNzTmFtZSkge1xuICB2YXIgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGNsYXNzTmFtZSk7XG4gIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5KGVsZW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gcmVtb3ZlICdpcy1hY3RpdmUnIGNsYXNzIGZyb20gZXZlcnkgZWxlbWVudCBpbiBhbiBhcnJheVxuZnVuY3Rpb24gcmVtb3ZlQWN0aXZlIChhcnJheSkge1xuICBpZiAodHlwZW9mIGFycmF5ID09ICdvYmplY3QnKSB7XG4gICAgYXJyYXkgPSBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoYXJyYXkpO1xuICB9XG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhpdGVtLCAnaXMtYWN0aXZlJyk7XG4gIH0pO1xufVxuXG4vLyByZW1vdmUgJ2lzLWFjdGl2ZScgZnJvbSBhcnJheSwgYWRkIHRvIGVsZW1lbnRcbmZ1bmN0aW9uIHRvZ2dsZUFjdGl2ZSAoYXJyYXksIGVsKSB7XG4gIHZhciBpc0FjdGl2ZSA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIGlmIChpc0FjdGl2ZSkge1xuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIH0gZWxzZSB7XG4gICAgcmVtb3ZlQWN0aXZlKGFycmF5KTtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhlbCwgJ2lzLWFjdGl2ZScpO1xuICB9XG59XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEFjY29yZGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gY29sbGFwc2libGUgYWNjb3JkaW9uIGxpc3RcblxuY2FsY2l0ZS5hY2NvcmRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY2NvcmRpb25zID0gZmluZEVsZW1lbnRzKCcuanMtYWNjb3JkaW9uJyk7XG5cbiAgaWYgKCFhY2NvcmRpb25zKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY2NvcmRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gYWNjb3JkaW9uc1tpXS5jaGlsZHJlbjtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChjaGlsZHJlbltqXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgdG9nZ2xlQWNjb3JkaW9uKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVBY2NvcmRpb24gKGV2ZW50KSB7XG4gICAgdmFyIHBhcmVudCA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2FjY29yZGlvbi1zZWN0aW9uJywgY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZXZlbnQpKTtcbiAgICBpZiAoY2FsY2l0ZS5kb20uaGFzQ2xhc3MocGFyZW50LCAnaXMtYWN0aXZlJykpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKHBhcmVudCwgJ2lzLWFjdGl2ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhwYXJlbnQsICdpcy1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2Fyb3VzZWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgY2Fyb3VzZWwgd2l0aCBhbnkgbnVtYmVyIG9mIHNsaWRlc1xuXG5jYWxjaXRlLmNhcm91c2VsID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjYXJvdXNlbHMgPSBmaW5kRWxlbWVudHMoJy5qcy1jYXJvdXNlbCcpO1xuXG4gIGlmICghY2Fyb3VzZWxzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXJvdXNlbHMubGVuZ3RoOyBpKyspIHtcblxuICAgIHZhciBjYXJvdXNlbCA9IGNhcm91c2Vsc1tpXTtcbiAgICB2YXIgd3JhcHBlciA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZXMnKVswXTtcbiAgICB2YXIgc2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlJyk7XG4gICAgdmFyIHRvZ2dsZXMgPSBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhcm91c2VsLWxpbmsnKSk7XG5cbiAgICB3cmFwcGVyLnN0eWxlLndpZHRoID0gc2xpZGVzLmxlbmd0aCAqIDEwMCArICclJztcblxuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHNsaWRlc1swXSwgJ2lzLWFjdGl2ZScpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUnKTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgc2xpZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICBzbGlkZXNba10uc3R5bGUud2lkdGggPSAxMDAgLyBzbGlkZXMubGVuZ3RoICsgJyUnO1xuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdG9nZ2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlc1tqXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgdG9nZ2xlU2xpZGUpO1xuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlU2xpZGUgKGUpIHtcbiAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChlKTtcbiAgICB2YXIgbGluayA9IGNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0KGUpO1xuICAgIHZhciBpbmRleCA9IGNhbGNpdGUuZG9tLmdldEF0dHIobGluaywgJ2RhdGEtc2xpZGUnKTtcbiAgICB2YXIgY2Fyb3VzZWwgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdjYXJvdXNlbCcsIGxpbmspO1xuICAgIHZhciBjdXJyZW50ID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlLmlzLWFjdGl2ZScpWzBdO1xuICAgIHZhciBzbGlkZXMgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUnKTtcbiAgICB2YXIgd3JhcHBlciA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZXMnKVswXTtcblxuICAgIGlmIChpbmRleCA9PSAncHJldicpIHtcbiAgICAgIGluZGV4ID0gY2FsY2l0ZS5hcnIuaW5kZXhPZihjdXJyZW50LCBzbGlkZXMpO1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7IGluZGV4ID0gMTsgfVxuICAgIH0gZWxzZSBpZiAoaW5kZXggPT0gJ25leHQnKSB7XG4gICAgICBpbmRleCA9IGNhbGNpdGUuYXJyLmluZGV4T2YoY3VycmVudCwgc2xpZGVzKSArIDI7XG4gICAgICBpZiAoaW5kZXggPiBzbGlkZXMubGVuZ3RoKSB7IGluZGV4ID0gc2xpZGVzLmxlbmd0aDsgfVxuICAgIH1cblxuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUgaXMtbGFzdC1zbGlkZScpO1xuXG4gICAgaWYgKGluZGV4ID09IHNsaWRlcy5sZW5ndGgpIHsgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY2Fyb3VzZWwsICdpcy1sYXN0LXNsaWRlJyk7IH1cbiAgICBpZiAoaW5kZXggPT0gMSkgeyBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjYXJvdXNlbCwgJ2lzLWZpcnN0LXNsaWRlJyk7IH1cblxuICAgIHJlbW92ZUFjdGl2ZShzbGlkZXMpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHNsaWRlc1tpbmRleCAtIDFdLCAnaXMtYWN0aXZlJyk7XG4gICAgdmFyIG9mZnNldCA9IChpbmRleCAtIDEpL3NsaWRlcy5sZW5ndGggKiAtMTAwICsgJyUnO1xuICAgIHdyYXBwZXIuc3R5bGUudHJhbnNmb3JtPSAndHJhbnNsYXRlM2QoJyArIG9mZnNldCArICcsMCwwKSc7XG4gIH1cblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRHJvcGRvd24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgZHJvcGRvd24gbWVudXNcblxuY2FsY2l0ZS5kcm9wZG93biA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWRyb3Bkb3duLXRvZ2dsZScpO1xuICB2YXIgZHJvcGRvd25zID0gZmluZEVsZW1lbnRzKCcuanMtZHJvcGRvd24nKTtcblxuICBpZiAoIWRyb3Bkb3ducykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlQWxsRHJvcGRvd25zICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyb3Bkb3ducy5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZHJvcGRvd25zW2ldLCAnaXMtYWN0aXZlJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlRHJvcGRvd24gKGRyb3Bkb3duKSB7XG4gICAgdmFyIGlzQWN0aXZlID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGRyb3Bkb3duLCAnaXMtYWN0aXZlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGNpdGUuZG9tLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgY2xvc2VBbGxEcm9wZG93bnMoKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGRyb3Bkb3duLCAnaXMtYWN0aXZlJyk7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChkb2N1bWVudC5ib2R5LCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbG9zZUFsbERyb3Bkb3ducygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmluZERyb3Bkb3duICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy1kcm9wZG93bicsIHRvZ2dsZSk7XG4gICAgICB0b2dnbGVEcm9wZG93bihkcm9wZG93bik7XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kRHJvcGRvd24odG9nZ2xlc1tpXSk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIERyYXdlciDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBkcmF3ZXJzXG5jYWxjaXRlLmRyYXdlciA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWRyYXdlci10b2dnbGUnKTtcbiAgdmFyIGRyYXdlcnMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcmF3ZXInKTtcblxuICBpZiAoIWRyYXdlcnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLWRyYXdlcicpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkcmF3ZXIgPSBkcmF3ZXJzW2ldO1xuICAgICAgICB2YXIgaXNUYXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKGRyYXdlcnNbaV0sICdkYXRhLWRyYXdlcicpO1xuICAgICAgICBpZiAodGFyZ2V0ID09IGlzVGFyZ2V0KSB7XG4gICAgICAgICB0b2dnbGVBY3RpdmUoZHJhd2VycywgZHJhd2VyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZERyYXdlciAoZHJhd2VyKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQoZHJhd2VyLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgdG9nZ2xlQWN0aXZlKGRyYXdlcnMsIGRyYXdlcik7XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kVG9nZ2xlKHRvZ2dsZXNbaV0pO1xuICB9XG4gIGZvciAodmFyIGogPSAwOyBqIDwgZHJhd2Vycy5sZW5ndGg7IGorKykge1xuICAgIGJpbmREcmF3ZXIoZHJhd2Vyc1tqXSk7XG4gIH1cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIEV4cGFuZGluZyBOYXYg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgZXhhbmRpbmcgbmF2IGxvY2F0ZWQgdW5kZXIgdG9wbmF2XG5jYWxjaXRlLmV4cGFuZGluZ05hdiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1leHBhbmRpbmctdG9nZ2xlJyk7XG4gIHZhciBleHBhbmRlcnMgPSBmaW5kRWxlbWVudHMoJy5qcy1leHBhbmRpbmcnKTtcblxuICBpZiAoIWV4cGFuZGVycykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcblxuICAgICAgdmFyIHNlY3Rpb25OYW1lID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLWV4cGFuZGluZy1uYXYnKTtcbiAgICAgIHZhciBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1leHBhbmRpbmctbmF2Jyk7XG4gICAgICB2YXIgc2VjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1leHBhbmRpbmctbmF2W2RhdGEtZXhwYW5kaW5nLW5hdj1cIicgKyBzZWN0aW9uTmFtZSArICdcIl0nKVswXTtcbiAgICAgIHZhciBleHBhbmRlciA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLWV4cGFuZGluZycsIHNlY3Rpb24pO1xuICAgICAgdmFyIGlzT3BlbiA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKGV4cGFuZGVyLCAnaXMtYWN0aXZlJyk7XG4gICAgICB2YXIgc2hvdWxkQ2xvc2UgPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhzZWN0aW9uLCAnaXMtYWN0aXZlJyk7XG5cbiAgICAgIGlmIChpc09wZW4pIHtcbiAgICAgICAgaWYgKHNob3VsZENsb3NlKSB7XG4gICAgICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICB0b2dnbGVBY3RpdmUoc2VjdGlvbnMsIHNlY3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9nZ2xlQWN0aXZlKHNlY3Rpb25zLCBzZWN0aW9uKTtcbiAgICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZFRvZ2dsZSh0b2dnbGVzW2ldKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgTW9kYWwg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHNob3cgYW5kIGhpZGUgbW9kYWwgZGlhbG9ndWVzXG5cbmNhbGNpdGUubW9kYWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRvZ2dsZXMgPSBmaW5kRWxlbWVudHMoJy5qcy1tb2RhbC10b2dnbGUnKTtcbiAgdmFyIG1vZGFscyA9IGZpbmRFbGVtZW50cygnLmpzLW1vZGFsJyk7XG5cbiAgaWYgKCFtb2RhbHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICh0b2dnbGUpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGUsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cih0b2dnbGUsICdkYXRhLW1vZGFsJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbW9kYWwgPSBtb2RhbHNbaV07XG4gICAgICAgIHZhciBpc1RhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIobW9kYWxzW2ldLCAnZGF0YS1tb2RhbCcpO1xuICAgICAgICBpZiAodGFyZ2V0ID09IGlzVGFyZ2V0KSB7XG4gICAgICAgICB0b2dnbGVBY3RpdmUobW9kYWxzLCBtb2RhbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRNb2RhbCAobW9kYWwpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChtb2RhbCwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHRvZ2dsZUFjdGl2ZShtb2RhbHMsIG1vZGFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmRUb2dnbGUodG9nZ2xlc1tpXSk7XG4gIH1cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBtb2RhbHMubGVuZ3RoOyBqKyspIHtcbiAgICBiaW5kTW9kYWwobW9kYWxzW2pdKTtcbiAgfVxufTtcblxuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBUYWJzIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyB0YWJiZWQgY29udGVudCBwYW5lXG5cbmNhbGNpdGUudGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhYnMgPSBmaW5kRWxlbWVudHMoJy5qcy10YWInKTtcbiAgdmFyIHRhYkdyb3VwcyA9IGZpbmRFbGVtZW50cygnLmpzLXRhYi1ncm91cCcpO1xuXG4gIGlmICghdGFicykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHNldCBtYXggd2lkdGggZm9yIGVhY2ggdGFiXG4gIGZvciAodmFyIGogPSAwOyBqIDwgdGFiR3JvdXBzLmxlbmd0aDsgaisrKSB7XG4gICAgdmFyIHRhYnNJbkdyb3VwID0gdGFiR3JvdXBzW2pdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWInKTtcbiAgICB2YXIgcGVyY2VudCA9IDEwMCAvIHRhYnNJbkdyb3VwLmxlbmd0aDtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IHRhYnNJbkdyb3VwLmxlbmd0aDsgaysrKXtcbiAgICAgIHRhYnNJbkdyb3VwW2tdLnN0eWxlLm1heFdpZHRoID0gcGVyY2VudCArICclJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzd2l0Y2hUYWIgKGV2ZW50KSB7XG4gICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuXG4gICAgdmFyIHRhYiA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLXRhYicsIGNhbGNpdGUuZG9tLmV2ZW50VGFyZ2V0KGV2ZW50KSk7XG4gICAgdmFyIHRhYkdyb3VwID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtdGFiLWdyb3VwJywgdGFiKTtcbiAgICB2YXIgdGFicyA9IHRhYkdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWInKTtcbiAgICB2YXIgY29udGVudHMgPSB0YWJHcm91cC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtdGFiLXNlY3Rpb24nKTtcbiAgICB2YXIgaW5kZXggPSBjYWxjaXRlLmFyci5pbmRleE9mKHRhYiwgdGFicyk7XG5cbiAgICByZW1vdmVBY3RpdmUodGFicyk7XG4gICAgcmVtb3ZlQWN0aXZlKGNvbnRlbnRzKTtcblxuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHRhYiwgJ2lzLWFjdGl2ZScpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGNvbnRlbnRzW2luZGV4XSwgJ2lzLWFjdGl2ZScpO1xuICB9XG5cbiAgLy8gYXR0YWNoIHRoZSBzd2l0Y2hUYWIgZXZlbnQgdG8gYWxsIHRhYnNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodGFic1tpXSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgc3dpdGNoVGFiKTtcbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBTdGlja3kg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHN0aWNrcyB0aGluZ3MgdG8gdGhlIHdpbmRvd1xuXG5jYWxjaXRlLnN0aWNreSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVsZW1lbnRzID0gZmluZEVsZW1lbnRzKCcuanMtc3RpY2t5Jyk7XG5cbiAgaWYgKCFlbGVtZW50cykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzdGlja2llcyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWwgPSBlbGVtZW50c1tpXTtcbiAgICB2YXIgdG9wID0gZWwub2Zmc2V0VG9wO1xuICAgIGlmIChlbC5kYXRhc2V0LnRvcCkge1xuICAgICAgdG9wID0gdG9wIC0gcGFyc2VJbnQoZWwuZGF0YXNldC50b3AsIDApO1xuICAgIH1cbiAgICBzdGlja2llcy5wdXNoKHtcbiAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICB0b3A6IHRvcCxcbiAgICAgIHNoaW06IGVsLmNsb25lTm9kZSgnZGVlcCcpLFxuICAgICAgZWxlbWVudDogZWxcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNjcm9sbChpdGVtLCBvZmZzZXQpIHtcbiAgICB2YXIgZWxlbSA9IGl0ZW0uZWxlbWVudDtcbiAgICB2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIHZhciBkaXN0YW5jZSA9IGl0ZW0udG9wIC0gb2Zmc2V0O1xuXG4gICAgaWYgKGRpc3RhbmNlIDwgMSAmJiAhaXRlbS5hY3RpdmUpIHtcbiAgICAgIGl0ZW0uc2hpbS5zdHlsZS52aXNpYmxpdHkgPSAnaGlkZGVuJztcbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoaXRlbS5zaGltLCBlbGVtKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGVsZW0sICdpcy1zdGlja3knKTtcbiAgICAgIGl0ZW0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGVsZW0uc3R5bGUudG9wID0gZWxlbS5kYXRhc2V0LnRvcCArICdweCc7XG4gICAgfSBlbHNlIGlmIChpdGVtLmFjdGl2ZSAmJiBvZmZzZXQgPCBpdGVtLnRvcCl7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbS5zaGltKTtcbiAgICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGVsZW0sICdpcy1zdGlja3knKTtcbiAgICAgIGVsZW0uc3R5bGUudG9wID0gbnVsbDtcbiAgICAgIGl0ZW0uYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgY2FsY2l0ZS5kb20uYWRkRXZlbnQod2luZG93LCAnc2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0aWNraWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYW5kbGVTY3JvbGwoc3RpY2tpZXNbaV0sIG9mZnNldCk7XG4gICAgfVxuICB9KTtcblxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgSW5pdGlhbGl6ZSBDYWxjaXRlIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzdGFydCB1cCBDYWxjaXRlIGFuZCBhdHRhY2ggYWxsIHRoZSBwYXR0ZXJuc1xuLy8gb3B0aW9uYWxseSBwYXNzIGFuIGFycmF5IG9mIHBhdHRlcm5zIHlvdSdkIGxpa2UgdG8gd2F0Y2hcblxuY2FsY2l0ZS5pbml0ID0gZnVuY3Rpb24gKHBhdHRlcm5zKSB7XG4gIGlmIChwYXR0ZXJucykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0dGVybnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNhbGNpdGVbcGF0dGVybnNbaV1dKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNhbGNpdGUubW9kYWwoKTtcbiAgICBjYWxjaXRlLmRyb3Bkb3duKCk7XG4gICAgY2FsY2l0ZS5kcmF3ZXIoKTtcbiAgICBjYWxjaXRlLmV4cGFuZGluZ05hdigpO1xuICAgIGNhbGNpdGUudGFicygpO1xuICAgIGNhbGNpdGUuYWNjb3JkaW9uKCk7XG4gICAgY2FsY2l0ZS5jYXJvdXNlbCgpO1xuICAgIGNhbGNpdGUuc3RpY2t5KCk7XG4gIH1cblxuICAvLyBhZGQgYSB0b3VjaCBjbGFzcyB0byB0aGUgYm9keVxuICBpZiAoIGNhbGNpdGUuYnJvd3Nlci5pc1RvdWNoKCkgKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ2NhbGNpdGUtdG91Y2gnKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRXhwb3NlIENhbGNpdGUuanMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGltcGxlbWVudGF0aW9uIGJvcnJvd2VkIGZyb20gTGVhZmxldFxuXG4vLyBkZWZpbmUgY2FsY2l0ZSBhcyBhIGdsb2JhbCB2YXJpYWJsZSwgc2F2aW5nIHRoZSBvcmlnaW5hbCB0byByZXN0b3JlIGxhdGVyIGlmIG5lZWRlZFxuZnVuY3Rpb24gZXhwb3NlICgpIHtcbiAgdmFyIG9sZENhbGNpdGUgPSB3aW5kb3cuY2FsY2l0ZTtcblxuICBjYWxjaXRlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmNhbGNpdGUgPSBvbGRDYWxjaXRlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHdpbmRvdy5jYWxjaXRlID0gY2FsY2l0ZTtcbn1cblxuLy8gbm8gTlBNL0FNRCBmb3Igbm93IGJlY2F1c2UgaXQganVzdCBjYXVzZXMgaXNzdWVzXG4vLyBAVE9ETzogYnVzdCB0aGVtIGludG8gQU1EICYgTlBNIGRpc3Ryb3NcblxuLy8gLy8gZGVmaW5lIENhbGNpdGUgZm9yIENvbW1vbkpTIG1vZHVsZSBwYXR0ZXJuIGxvYWRlcnMgKE5QTSwgQnJvd3NlcmlmeSlcbi8vIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4vLyAgIG1vZHVsZS5leHBvcnRzID0gY2FsY2l0ZTtcbi8vIH1cblxuLy8gLy8gZGVmaW5lIENhbGNpdGUgYXMgYW4gQU1EIG1vZHVsZVxuLy8gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4vLyAgIGRlZmluZShjYWxjaXRlKTtcbi8vIH1cblxuZXhwb3NlKCk7XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gIHZhciBkaWZmY291bnQ7XG5cbiAgdmFyIEFERF9BVFRSSUJVVEUgPSAwLFxuICAgIE1PRElGWV9BVFRSSUJVVEUgPSAxLFxuICAgIFJFTU9WRV9BVFRSSUJVVEUgPSAyLFxuICAgIE1PRElGWV9URVhUX0VMRU1FTlQgPSAzLFxuICAgIFJFTE9DQVRFX0dST1VQID0gNCxcbiAgICBSRU1PVkVfRUxFTUVOVCA9IDUsXG4gICAgQUREX0VMRU1FTlQgPSA2LFxuICAgIFJFTU9WRV9URVhUX0VMRU1FTlQgPSA3LFxuICAgIEFERF9URVhUX0VMRU1FTlQgPSA4LFxuICAgIFJFUExBQ0VfRUxFTUVOVCA9IDksXG4gICAgTU9ESUZZX1ZBTFVFID0gMTAsXG4gICAgTU9ESUZZX0NIRUNLRUQgPSAxMSxcbiAgICBNT0RJRllfU0VMRUNURUQgPSAxMixcbiAgICBNT0RJRllfREFUQSA9IDEzLFxuICAgIEFDVElPTiA9IDE0LFxuICAgIFJPVVRFID0gMTUsXG4gICAgT0xEX1ZBTFVFID0gMTYsXG4gICAgTkVXX1ZBTFVFID0gMTcsXG4gICAgRUxFTUVOVCA9IDE4LFxuICAgIEdST1VQID0gMTksXG4gICAgRlJPTSA9IDIwLFxuICAgIFRPID0gMjEsXG4gICAgTkFNRSA9IDIyLFxuICAgIFZBTFVFID0gMjMsXG4gICAgVEVYVCA9IDI0LFxuICAgIEFUVFJJQlVURVMgPSAyNSxcbiAgICBOT0RFX05BTUUgPSAyNixcbiAgICBDT01NRU5UID0gMjcsXG4gICAgQ0hJTERfTk9ERVMgPSAyOCxcbiAgICBDSEVDS0VEID0gMjksXG4gICAgU0VMRUNURUQgPSAzMDtcblxuICB2YXIgRGlmZiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGRpZmYgPSB0aGlzO1xuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgZGlmZltvcHRpb25dID0gb3B0aW9uc1tvcHRpb25dO1xuICAgIH0pO1xuICB9XG4gIERpZmYucHJvdG90eXBlID0ge1xuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBTdWJzZXRNYXBwaW5nID0gZnVuY3Rpb24gU3Vic2V0TWFwcGluZyhhLCBiKSB7XG4gICAgdGhpc1tcIm9sZFwiXSA9IGE7XG4gICAgdGhpc1tcIm5ld1wiXSA9IGI7XG4gIH07XG5cbiAgU3Vic2V0TWFwcGluZy5wcm90b3R5cGUgPSB7XG4gICAgY29udGFpbnM6IGZ1bmN0aW9uIGNvbnRhaW5zKHN1YnNldCkge1xuICAgICAgaWYgKHN1YnNldC5sZW5ndGggPCB0aGlzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3Vic2V0W1wibmV3XCJdID49IHRoaXNbXCJuZXdcIl0gJiYgc3Vic2V0W1wibmV3XCJdIDwgdGhpc1tcIm5ld1wiXSArIHRoaXMubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoICsgXCIgZWxlbWVudCBzdWJzZXQsIGZpcnN0IG1hcHBpbmc6IG9sZCBcIiArIHRoaXNbXCJvbGRcIl0gKyBcIiDihpIgbmV3IFwiICsgdGhpc1tcIm5ld1wiXTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHJvdWdobHlFcXVhbCA9IGZ1bmN0aW9uIHJvdWdobHlFcXVhbChlMSwgZTIsIHByZXZlbnRSZWN1cnNpb24pIHtcbiAgICBpZiAoIWUxIHx8ICFlMikgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlMS5ub2RlVHlwZSAhPT0gZTIubm9kZVR5cGUpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZTEubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgIGlmIChlMi5ub2RlVHlwZSAhPT0gMykgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gTm90ZSB0aGF0IHdlIGluaXRpYWxseSBkb24ndCBjYXJlIHdoYXQgdGhlIHRleHQgY29udGVudCBvZiBhIG5vZGUgaXMsXG4gICAgICAvLyB0aGUgbWVyZSBmYWN0IHRoYXQgaXQncyB0aGUgc2FtZSB0YWcgYW5kIFwiaGFzIHRleHRcIiBtZWFucyBpdCdzIHJvdWdobHlcbiAgICAgIC8vIGVxdWFsLCBhbmQgdGhlbiB3ZSBjYW4gZmluZCBvdXQgdGhlIHRydWUgdGV4dCBkaWZmZXJlbmNlIGxhdGVyLlxuICAgICAgcmV0dXJuIHByZXZlbnRSZWN1cnNpb24gPyB0cnVlIDogZTEuZGF0YSA9PT0gZTIuZGF0YTtcbiAgICB9XG4gICAgaWYgKGUxLm5vZGVOYW1lICE9PSBlMi5ub2RlTmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlMS5jaGlsZE5vZGVzLmxlbmd0aCAhPT0gZTIuY2hpbGROb2Rlcy5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgdGhlc2FtZSA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IGUxLmNoaWxkTm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChwcmV2ZW50UmVjdXJzaW9uKSB7XG4gICAgICAgIHRoZXNhbWUgPSB0aGVzYW1lICYmIChlMS5jaGlsZE5vZGVzW2ldLm5vZGVOYW1lID09PSBlMi5jaGlsZE5vZGVzW2ldLm5vZGVOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGU6IHdlIG9ubHkgYWxsb3cgb25lIGxldmVsIG9mIHJlY3Vyc2lvbiBhdCBhbnkgZGVwdGguIElmICdwcmV2ZW50UmVjdXJzaW9uJ1xuICAgICAgICAvLyAgICAgICB3YXMgbm90IHNldCwgd2UgbXVzdCBleHBsaWNpdGx5IGZvcmNlIGl0IHRvIHRydWUgZm9yIGNoaWxkIGl0ZXJhdGlvbnMuXG4gICAgICAgIHRoZXNhbWUgPSB0aGVzYW1lICYmIHJvdWdobHlFcXVhbChlMS5jaGlsZE5vZGVzW2ldLCBlMi5jaGlsZE5vZGVzW2ldLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoZXNhbWU7XG4gIH07XG5cblxuICB2YXIgY2xlYW5DbG9uZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIC8vIENsb25lIGEgbm9kZSB3aXRoIGNvbnRlbnRzIGFuZCBhZGQgdmFsdWVzIG1hbnVhbGx5LFxuICAgIC8vIHRvIGF2b2lkIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTIzMDMwN1xuICAgIHZhciBjbG9uZWROb2RlID0gbm9kZS5jbG9uZU5vZGUodHJ1ZSksXG4gICAgICB0ZXh0YXJlYXMsIGNsb25lZFRleHRhcmVhcywgb3B0aW9ucywgY2xvbmVkT3B0aW9ucywgaTtcblxuICAgIGlmIChub2RlLm5vZGVUeXBlICE9IDggJiYgbm9kZS5ub2RlVHlwZSAhPSAzKSB7XG5cbiAgICAgIHRleHRhcmVhcyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKTtcbiAgICAgIGNsb25lZFRleHRhcmVhcyA9IGNsb25lZE5vZGUucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0ZXh0YXJlYXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNsb25lZFRleHRhcmVhc1tpXS52YWx1ZSAhPT0gdGV4dGFyZWFzW2ldLnZhbHVlKSB7XG4gICAgICAgICAgY2xvbmVkVGV4dGFyZWFzW2ldLnZhbHVlID0gdGV4dGFyZWFzW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobm9kZS52YWx1ZSAmJiAobm9kZS52YWx1ZSAhPT0gY2xvbmVkTm9kZS52YWx1ZSkpIHtcbiAgICAgICAgY2xvbmVkTm9kZS52YWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgICB9XG4gICAgICBvcHRpb25zID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb24nKTtcbiAgICAgIGNsb25lZE9wdGlvbnMgPSBjbG9uZWROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9wdGlvbnNbaV0uc2VsZWN0ZWQgJiYgIShjbG9uZWRPcHRpb25zW2ldLnNlbGVjdGVkKSkge1xuICAgICAgICAgIGNsb25lZE9wdGlvbnNbaV0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCEob3B0aW9uc1tpXS5zZWxlY3RlZCkgJiYgY2xvbmVkT3B0aW9uc1tpXS5zZWxlY3RlZCkge1xuICAgICAgICAgIGNsb25lZE9wdGlvbnNbaV0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSAgICAgIFxuICAgICAgaWYgKG5vZGUuc2VsZWN0ZWQgJiYgIShjbG9uZWROb2RlLnNlbGVjdGVkKSkge1xuICAgICAgICBjbG9uZWROb2RlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoIShub2RlLnNlbGVjdGVkKSAmJiBjbG9uZWROb2RlLnNlbGVjdGVkKSB7XG4gICAgICAgIGNsb25lZE5vZGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNsb25lZE5vZGU7XG4gIH07XG5cbiAgdmFyIG5vZGVUb09iaiA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIG9iak5vZGUgPSB7fSwgaTtcblxuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICBvYmpOb2RlW1RFWFRdID0gbm9kZS5kYXRhO1xuICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgb2JqTm9kZVtDT01NRU5UXSA9IG5vZGUuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqTm9kZVtOT0RFX05BTUVdID0gbm9kZS5ub2RlTmFtZTtcbiAgICAgIGlmIChub2RlLmF0dHJpYnV0ZXMgJiYgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgb2JqTm9kZVtBVFRSSUJVVEVTXSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgb2JqTm9kZVtBVFRSSUJVVEVTXS5wdXNoKFtub2RlLmF0dHJpYnV0ZXNbaV0ubmFtZSwgbm9kZS5hdHRyaWJ1dGVzW2ldLnZhbHVlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgb2JqTm9kZVtDSElMRF9OT0RFU10gPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG9iak5vZGVbQ0hJTERfTk9ERVNdLnB1c2gobm9kZVRvT2JqKG5vZGUuY2hpbGROb2Rlc1tpXSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobm9kZS52YWx1ZSkge1xuICAgICAgICBvYmpOb2RlW1ZBTFVFXSA9IG5vZGUudmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5jaGVja2VkKSB7XG4gICAgICAgIG9iak5vZGVbQ0hFQ0tFRF0gPSBub2RlLmNoZWNrZWQ7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5zZWxlY3RlZCkge1xuICAgICAgICBvYmpOb2RlW1NFTEVDVEVEXSA9IG5vZGUuc2VsZWN0ZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmpOb2RlO1xuICB9O1xuXG4gIHZhciBvYmpUb05vZGUgPSBmdW5jdGlvbiAob2JqTm9kZSwgaW5zaWRlU3ZnKSB7XG4gICAgdmFyIG5vZGUsIGk7XG4gICAgaWYgKG9iak5vZGUuaGFzT3duUHJvcGVydHkoVEVYVCkpIHtcbiAgICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShvYmpOb2RlW1RFWFRdKTtcbiAgICB9IGVsc2UgaWYgKG9iak5vZGUuaGFzT3duUHJvcGVydHkoQ09NTUVOVCkpIHtcbiAgICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KG9iak5vZGVbQ09NTUVOVF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob2JqTm9kZVtOT0RFX05BTUVdID09PSAnc3ZnJyB8fCBpbnNpZGVTdmcpIHtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBvYmpOb2RlW05PREVfTkFNRV0pO1xuICAgICAgICBpbnNpZGVTdmcgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob2JqTm9kZVtOT0RFX05BTUVdKTtcbiAgICAgIH1cbiAgICAgIGlmIChvYmpOb2RlW0FUVFJJQlVURVNdKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmpOb2RlW0FUVFJJQlVURVNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUob2JqTm9kZVtBVFRSSUJVVEVTXVtpXVswXSwgb2JqTm9kZVtBVFRSSUJVVEVTXVtpXVsxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvYmpOb2RlW0NISUxEX05PREVTXSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2JqTm9kZVtDSElMRF9OT0RFU10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKG9ialRvTm9kZShvYmpOb2RlW0NISUxEX05PREVTXVtpXSwgaW5zaWRlU3ZnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvYmpOb2RlW1ZBTFVFXSkge1xuICAgICAgICBub2RlLnZhbHVlID0gb2JqTm9kZVtWQUxVRV07XG4gICAgICB9XG4gICAgICBpZiAob2JqTm9kZVtDSEVDS0VEXSkge1xuICAgICAgICBub2RlLmNoZWNrZWQgPSBvYmpOb2RlW0NIRUNLRURdO1xuICAgICAgfVxuICAgICAgaWYgKG9iak5vZGVbU0VMRUNURURdKSB7XG4gICAgICAgIG5vZGUuc2VsZWN0ZWQgPSBvYmpOb2RlW1NFTEVDVEVEXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cblxuXG4gIC8qKlxuICAgKiBiYXNlZCBvbiBodHRwczovL2VuLndpa2lib29rcy5vcmcvd2lraS9BbGdvcml0aG1faW1wbGVtZW50YXRpb24vU3RyaW5ncy9Mb25nZXN0X2NvbW1vbl9zdWJzdHJpbmcjSmF2YVNjcmlwdFxuICAgKi9cbiAgdmFyIGZpbmRDb21tb25TdWJzZXRzID0gZnVuY3Rpb24gKGMxLCBjMiwgbWFya2VkMSwgbWFya2VkMikge1xuICAgIHZhciBsY3NTaXplID0gMCxcbiAgICAgIGluZGV4ID0gW10sXG4gICAgICBsZW4xID0gYzEubGVuZ3RoLFxuICAgICAgbGVuMiA9IGMyLmxlbmd0aDtcbiAgICAvLyBzZXQgdXAgdGhlIG1hdGNoaW5nIHRhYmxlXG4gICAgdmFyIG1hdGNoZXMgPSBbXSxcbiAgICAgIGEsIGksIGo7XG4gICAgZm9yIChhID0gMDsgYSA8IGxlbjEgKyAxOyBhKyspIHtcbiAgICAgIG1hdGNoZXNbYV0gPSBbXTtcbiAgICB9XG4gICAgLy8gZmlsbCB0aGUgbWF0Y2hlcyB3aXRoIGRpc3RhbmNlIHZhbHVlc1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW4xOyBpKyspIHtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBsZW4yOyBqKyspIHtcbiAgICAgICAgaWYgKCFtYXJrZWQxW2ldICYmICFtYXJrZWQyW2pdICYmIHJvdWdobHlFcXVhbChjMVtpXSwgYzJbal0pKSB7XG4gICAgICAgICAgbWF0Y2hlc1tpICsgMV1baiArIDFdID0gKG1hdGNoZXNbaV1bal0gPyBtYXRjaGVzW2ldW2pdICsgMSA6IDEpO1xuICAgICAgICAgIGlmIChtYXRjaGVzW2kgKyAxXVtqICsgMV0gPiBsY3NTaXplKSB7XG4gICAgICAgICAgICBsY3NTaXplID0gbWF0Y2hlc1tpICsgMV1baiArIDFdO1xuICAgICAgICAgICAgaW5kZXggPSBbaSArIDEsIGogKyAxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlc1tpICsgMV1baiArIDFdID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGNzU2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgb3JpZ2luID0gW2luZGV4WzBdIC0gbGNzU2l6ZSwgaW5kZXhbMV0gLSBsY3NTaXplXTtcbiAgICB2YXIgcmV0ID0gbmV3IFN1YnNldE1hcHBpbmcob3JpZ2luWzBdLCBvcmlnaW5bMV0pO1xuICAgIHJldC5sZW5ndGggPSBsY3NTaXplO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgc2hvdWxkIHJlYWxseSBiZSBhIHByZWRlZmluZWQgZnVuY3Rpb24gaW4gQXJyYXkuLi5cbiAgICovXG4gIHZhciBtYWtlQXJyYXkgPSBmdW5jdGlvbiAobiwgdikge1xuICAgIHZhciBkZWVwY29weSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICB2LnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGFzdCA9IHYubGVuZ3RoOyBpIDwgbGFzdDsgaSsrKSB7XG4gICAgICAgIGlmICh2W2ldIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICB2W2ldID0gZGVlcGNvcHkodltpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGlmICh2IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHYgPSBkZWVwY29weSh2KTtcbiAgICB9XG4gICAgdmFyIHNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2O1xuICAgIH07XG4gICAgcmV0dXJuIChuZXcgQXJyYXkobikpLmpvaW4oJy4nKS5zcGxpdCgnLicpLm1hcChzZXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhcnJheXMgdGhhdCBpbmRpY2F0ZSB3aGljaCBub2RlIGJlbG9uZ3MgdG8gd2hpY2ggc3Vic2V0LFxuICAgKiBvciB3aGV0aGVyIGl0J3MgYWN0dWFsbHkgYW4gb3JwaGFuIG5vZGUsIGV4aXN0aW5nIGluIG9ubHkgb25lXG4gICAqIG9mIHRoZSB0d28gdHJlZXMsIHJhdGhlciB0aGFuIHNvbWV3aGVyZSBpbiBib3RoLlxuICAgKi9cbiAgdmFyIGdldEdhcEluZm9ybWF0aW9uID0gZnVuY3Rpb24gKHQxLCB0Miwgc3RhYmxlKSB7XG4gICAgLy8gW3RydWUsIHRydWUsIC4uLl0gYXJyYXlzXG4gICAgdmFyIHNldCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cbiAgICB9LFxuICAgICAgZ2FwczEgPSBtYWtlQXJyYXkodDEuY2hpbGROb2Rlcy5sZW5ndGgsIHRydWUpLFxuICAgICAgZ2FwczIgPSBtYWtlQXJyYXkodDIuY2hpbGROb2Rlcy5sZW5ndGgsIHRydWUpLFxuICAgICAgZ3JvdXAgPSAwO1xuXG4gICAgLy8gZ2l2ZSBlbGVtZW50cyBmcm9tIHRoZSBzYW1lIHN1YnNldCB0aGUgc2FtZSBncm91cCBudW1iZXJcbiAgICBzdGFibGUuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2V0KSB7XG4gICAgICB2YXIgaSwgZW5kO1xuICAgICAgZm9yIChpID0gc3Vic2V0W1wib2xkXCJdLCBlbmQgPSBpICsgc3Vic2V0Lmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIGdhcHMxW2ldID0gZ3JvdXA7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSBzdWJzZXRbXCJuZXdcIl0sIGVuZCA9IGkgKyBzdWJzZXQubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgZ2FwczJbaV0gPSBncm91cDtcbiAgICAgIH1cbiAgICAgIGdyb3VwKys7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZ2FwczE6IGdhcHMxLFxuICAgICAgZ2FwczI6IGdhcHMyXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogRmluZCBhbGwgbWF0Y2hpbmcgc3Vic2V0cywgYmFzZWQgb24gaW1tZWRpYXRlIGNoaWxkIGRpZmZlcmVuY2VzIG9ubHkuXG4gICAqL1xuICB2YXIgbWFya1N1YlRyZWVzID0gZnVuY3Rpb24gKG9sZFRyZWUsIG5ld1RyZWUpIHtcbiAgICBvbGRUcmVlID0gY2xlYW5DbG9uZU5vZGUob2xkVHJlZSk7XG4gICAgbmV3VHJlZSA9IGNsZWFuQ2xvbmVOb2RlKG5ld1RyZWUpO1xuICAgIC8vIG5vdGU6IHRoZSBjaGlsZCBsaXN0cyBhcmUgdmlld3MsIGFuZCBzbyB1cGRhdGUgYXMgd2UgdXBkYXRlIG9sZC9uZXdUcmVlXG4gICAgdmFyIG9sZENoaWxkcmVuID0gb2xkVHJlZS5jaGlsZE5vZGVzLFxuICAgICAgbmV3Q2hpbGRyZW4gPSBuZXdUcmVlLmNoaWxkTm9kZXMsXG4gICAgICBtYXJrZWQxID0gbWFrZUFycmF5KG9sZENoaWxkcmVuLmxlbmd0aCwgZmFsc2UpLFxuICAgICAgbWFya2VkMiA9IG1ha2VBcnJheShuZXdDaGlsZHJlbi5sZW5ndGgsIGZhbHNlKSxcbiAgICAgIHN1YnNldHMgPSBbXSxcbiAgICAgIHN1YnNldCA9IHRydWUsXG4gICAgICBpO1xuICAgIHdoaWxlIChzdWJzZXQpIHtcbiAgICAgIHN1YnNldCA9IGZpbmRDb21tb25TdWJzZXRzKG9sZENoaWxkcmVuLCBuZXdDaGlsZHJlbiwgbWFya2VkMSwgbWFya2VkMik7XG4gICAgICBpZiAoc3Vic2V0KSB7XG4gICAgICAgIHN1YnNldHMucHVzaChzdWJzZXQpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3Vic2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbWFya2VkMVtzdWJzZXQub2xkICsgaV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdWJzZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBtYXJrZWQyW3N1YnNldC5uZXcgKyBpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNldHM7XG4gIH07XG5cbiAgdmFyIGZpbmRGaXJzdElubmVyRGlmZiA9IGZ1bmN0aW9uICh0MSwgdDIsIHN1YnRyZWVzLCByb3V0ZSkge1xuICAgIGlmIChzdWJ0cmVlcy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcblxuICAgIHZhciBnYXBJbmZvcm1hdGlvbiA9IGdldEdhcEluZm9ybWF0aW9uKHQxLCB0Miwgc3VidHJlZXMpLFxuICAgICAgZ2FwczEgPSBnYXBJbmZvcm1hdGlvbi5nYXBzMSxcbiAgICAgIGdsMSA9IGdhcHMxLmxlbmd0aCxcbiAgICAgIGdhcHMyID0gZ2FwSW5mb3JtYXRpb24uZ2FwczIsXG4gICAgICBnbDIgPSBnYXBzMS5sZW5ndGgsXG4gICAgICBpLCBqLCBrLFxuICAgICAgbGFzdCA9IGdsMSA8IGdsMiA/IGdsMSA6IGdsMjtcblxuICAgIC8vIENoZWNrIGZvciBjb3JyZWN0IHN1Ym1hcCBzZXF1ZW5jaW5nIChpcnJlc3BlY3RpdmUgb2YgZ2FwcykgZmlyc3Q6XG4gICAgdmFyIHNlcXVlbmNlID0gMCxcbiAgICAgIGdyb3VwLCBub2RlLCBzaW1pbGFyTm9kZSwgdGVzdE5vZGUsXG4gICAgICBzaG9ydGVzdCA9IGdsMSA8IGdsMiA/IGdhcHMxIDogZ2FwczI7XG5cbiAgICAvLyBncm91cCByZWxvY2F0aW9uXG4gICAgZm9yIChpID0gMCwgbGFzdCA9IHNob3J0ZXN0Lmxlbmd0aDsgaSA8IGxhc3Q7IGkrKykge1xuICAgICAgaWYgKGdhcHMxW2ldID09PSB0cnVlKSB7XG4gICAgICAgIG5vZGUgPSB0MS5jaGlsZE5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgIGlmICh0Mi5jaGlsZE5vZGVzW2ldLm5vZGVUeXBlID09PSAzICYmIG5vZGUuZGF0YSAhPSB0Mi5jaGlsZE5vZGVzW2ldLmRhdGEpIHtcbiAgICAgICAgICAgIHRlc3ROb2RlID0gbm9kZTtcbiAgICAgICAgICAgIHdoaWxlICh0ZXN0Tm9kZS5uZXh0U2libGluZyAmJiB0ZXN0Tm9kZS5uZXh0U2libGluZy5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgICB0ZXN0Tm9kZSA9IHRlc3ROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICBpZiAodDIuY2hpbGROb2Rlc1tpXS5kYXRhID09PSB0ZXN0Tm9kZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2ltaWxhck5vZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXNpbWlsYXJOb2RlKSB7XG4gICAgICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICAgICAga1tBQ1RJT05dID0gTU9ESUZZX1RFWFRfRUxFTUVOVDtcbiAgICAgICAgICAgICAga1tST1VURV0gPSByb3V0ZS5jb25jYXQoaSk7XG4gICAgICAgICAgICAgIGtbT0xEX1ZBTFVFXSA9IG5vZGUuZGF0YTtcbiAgICAgICAgICAgICAga1tORVdfVkFMVUVdID0gdDIuY2hpbGROb2Rlc1tpXS5kYXRhO1xuICAgICAgICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICBrW0FDVElPTl0gPSBSRU1PVkVfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICAgIGtbVkFMVUVdID0gbm9kZS5kYXRhO1xuICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgfVxuICAgICAgICBrID0ge307XG4gICAgICAgIGtbQUNUSU9OXSA9IFJFTU9WRV9FTEVNRU5UO1xuICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAga1tFTEVNRU5UXSA9IG5vZGVUb09iaihub2RlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgfVxuICAgICAgaWYgKGdhcHMyW2ldID09PSB0cnVlKSB7XG4gICAgICAgIG5vZGUgPSB0Mi5jaGlsZE5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICBrW0FDVElPTl0gPSBBRERfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICAgIGtbVkFMVUVdID0gbm9kZS5kYXRhO1xuICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgfVxuICAgICAgICBrID0ge307XG4gICAgICAgIGtbQUNUSU9OXSA9IEFERF9FTEVNRU5UO1xuICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAga1tFTEVNRU5UXSA9IG5vZGVUb09iaihub2RlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgfVxuICAgICAgaWYgKGdhcHMxW2ldICE9IGdhcHMyW2ldKSB7XG4gICAgICAgIGdyb3VwID0gc3VidHJlZXNbZ2FwczFbaV1dO1xuICAgICAgICB2YXIgdG9Hcm91cCA9IE1hdGgubWluKGdyb3VwW1wibmV3XCJdLCAodDEuY2hpbGROb2Rlcy5sZW5ndGggLSBncm91cC5sZW5ndGgpKTtcbiAgICAgICAgaWYgKHRvR3JvdXAgIT0gaSkge1xuICAgICAgICAgIC8vQ2hlY2sgd2VodGhlciBkZXN0aW5hdGlvbiBub2RlcyBhcmUgZGlmZmVyZW50IHRoYW4gb3JpZ2luYXRpbmcgb25lcy5cbiAgICAgICAgICB2YXIgZGVzdGluYXRpb25EaWZmZXJlbnQgPSBmYWxzZTtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZ3JvdXAubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghdDEuY2hpbGROb2Rlc1t0b0dyb3VwICsgal0uaXNFcXVhbE5vZGUodDEuY2hpbGROb2Rlc1tpICsgal0pKSB7XG4gICAgICAgICAgICAgIGRlc3RpbmF0aW9uRGlmZmVyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZGVzdGluYXRpb25EaWZmZXJlbnQpIHtcbiAgICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICAgIGtbQUNUSU9OXSA9IFJFTE9DQVRFX0dST1VQO1xuICAgICAgICAgICAga1tHUk9VUF0gPSBncm91cDtcbiAgICAgICAgICAgIGtbRlJPTV0gPSBpO1xuICAgICAgICAgICAga1tUT10gPSB0b0dyb3VwO1xuICAgICAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gc3dhcChvYmosIHAxLCBwMikge1xuICAgIChmdW5jdGlvbiAoXykge1xuICAgICAgb2JqW3AxXSA9IG9ialtwMl07XG4gICAgICBvYmpbcDJdID0gXztcbiAgICB9KG9ialtwMV0pKTtcbiAgfTtcblxuXG4gIHZhciBEaWZmVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxpc3QgPSBbXTtcbiAgfTtcbiAgRGlmZlRyYWNrZXIucHJvdG90eXBlID0ge1xuICAgIGxpc3Q6IGZhbHNlLFxuICAgIGFkZDogZnVuY3Rpb24gKGRpZmZsaXN0KSB7XG4gICAgICB2YXIgbGlzdCA9IHRoaXMubGlzdDtcbiAgICAgIGRpZmZsaXN0LmZvckVhY2goZnVuY3Rpb24gKGRpZmYpIHtcbiAgICAgICAgbGlzdC5wdXNoKGRpZmYpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGZuKTtcbiAgICB9XG4gIH07XG5cblxuXG5cbiAgdmFyIGRpZmZET00gPSBmdW5jdGlvbiAoZGVidWcsIGRpZmZjYXApIHtcbiAgICBpZiAodHlwZW9mIGRlYnVnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZGVidWcgPSBmYWxzZTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIEFERF9BVFRSSUJVVEUgPSBcImFkZCBhdHRyaWJ1dGVcIixcbiAgICAgIE1PRElGWV9BVFRSSUJVVEUgPSBcIm1vZGlmeSBhdHRyaWJ1dGVcIixcbiAgICAgIFJFTU9WRV9BVFRSSUJVVEUgPSBcInJlbW92ZSBhdHRyaWJ1dGVcIixcbiAgICAgIE1PRElGWV9URVhUX0VMRU1FTlQgPSBcIm1vZGlmeSB0ZXh0IGVsZW1lbnRcIixcbiAgICAgIFJFTE9DQVRFX0dST1VQID0gXCJyZWxvY2F0ZSBncm91cFwiLFxuICAgICAgUkVNT1ZFX0VMRU1FTlQgPSBcInJlbW92ZSBlbGVtZW50XCIsXG4gICAgICBBRERfRUxFTUVOVCA9IFwiYWRkIGVsZW1lbnRcIixcbiAgICAgIFJFTU9WRV9URVhUX0VMRU1FTlQgPSBcInJlbW92ZSB0ZXh0IGVsZW1lbnRcIixcbiAgICAgIEFERF9URVhUX0VMRU1FTlQgPSBcImFkZCB0ZXh0IGVsZW1lbnRcIixcbiAgICAgIFJFUExBQ0VfRUxFTUVOVCA9IFwicmVwbGFjZSBlbGVtZW50XCIsXG4gICAgICBNT0RJRllfVkFMVUUgPSBcIm1vZGlmeSB2YWx1ZVwiLFxuICAgICAgTU9ESUZZX0NIRUNLRUQgPSBcIm1vZGlmeSBjaGVja2VkXCIsXG4gICAgICBNT0RJRllfU0VMRUNURUQgPSBcIm1vZGlmeSBzZWxlY3RlZFwiLFxuICAgICAgQUNUSU9OID0gXCJhY3Rpb25cIixcbiAgICAgIFJPVVRFID0gXCJyb3V0ZVwiLFxuICAgICAgT0xEX1ZBTFVFID0gXCJvbGRWYWx1ZVwiLFxuICAgICAgTkVXX1ZBTFVFID0gXCJuZXdWYWx1ZVwiLFxuICAgICAgRUxFTUVOVCA9IFwiZWxlbWVudFwiLFxuICAgICAgR1JPVVAgPSBcImdyb3VwXCIsXG4gICAgICBGUk9NID0gXCJmcm9tXCIsXG4gICAgICBUTyA9IFwidG9cIixcbiAgICAgIE5BTUUgPSBcIm5hbWVcIixcbiAgICAgIFZBTFVFID0gXCJ2YWx1ZVwiLFxuICAgICAgVEVYVCA9IFwidGV4dFwiLFxuICAgICAgQVRUUklCVVRFUyA9IFwiYXR0cmlidXRlc1wiLFxuICAgIE5PREVfTkFNRSA9IFwibm9kZU5hbWVcIixcbiAgICBDT01NRU5UID0gXCJjb21tZW50XCIsXG4gICAgQ0hJTERfTk9ERVMgPSBcImNoaWxkTm9kZXNcIixcbiAgICBDSEVDS0VEID0gXCJjaGVja2VkXCIsXG4gICAgU0VMRUNURUQgPSBcInNlbGVjdGVkXCI7XG4gICAgfVxuXG5cblxuXG4gICAgaWYgKHR5cGVvZiBkaWZmY2FwID09PSAndW5kZWZpbmVkJylcbiAgICAgIGRpZmZjYXAgPSAxMDtcbiAgICB0aGlzLmRlYnVnID0gZGVidWc7XG4gICAgdGhpcy5kaWZmY2FwID0gZGlmZmNhcDtcbiAgfTtcbiAgZGlmZkRPTS5wcm90b3R5cGUgPSB7XG5cbiAgICAvLyA9PT09PSBDcmVhdGUgYSBkaWZmID09PT09XG5cbiAgICBkaWZmOiBmdW5jdGlvbiAodDEsIHQyKSB7XG4gICAgICBkaWZmY291bnQgPSAwO1xuICAgICAgdDEgPSBjbGVhbkNsb25lTm9kZSh0MSk7XG4gICAgICB0MiA9IGNsZWFuQ2xvbmVOb2RlKHQyKTtcbiAgICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHRoaXMudDFPcmlnID0gbm9kZVRvT2JqKHQxKTtcbiAgICAgICAgdGhpcy50Mk9yaWcgPSBub2RlVG9PYmoodDIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRyYWNrZXIgPSBuZXcgRGlmZlRyYWNrZXIoKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmREaWZmcyh0MSwgdDIpO1xuICAgIH0sXG4gICAgZmluZERpZmZzOiBmdW5jdGlvbiAodDEsIHQyKSB7XG4gICAgICB2YXIgZGlmZjtcbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICBkaWZmY291bnQrKztcbiAgICAgICAgICBpZiAoZGlmZmNvdW50ID4gdGhpcy5kaWZmY2FwKSB7XG4gICAgICAgICAgICB3aW5kb3cuZGlmZkVycm9yID0gW3RoaXMudDFPcmlnLCB0aGlzLnQyT3JpZ107XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdXJwYXNzZWQgZGlmZmNhcDpcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMudDFPcmlnKSArIFwiIC0+IFwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy50Mk9yaWcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGlmZmxpc3QgPSB0aGlzLmZpbmRGaXJzdERpZmYodDEsIHQyLCBbXSk7XG4gICAgICAgIGlmIChkaWZmbGlzdCkge1xuICAgICAgICAgIGlmICghZGlmZmxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBkaWZmbGlzdCA9IFtkaWZmbGlzdF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudHJhY2tlci5hZGQoZGlmZmxpc3QpO1xuICAgICAgICAgIHRoaXMuYXBwbHkodDEsIGRpZmZsaXN0KTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoZGlmZmxpc3QpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tlci5saXN0O1xuICAgIH0sXG4gICAgZmluZEZpcnN0RGlmZjogZnVuY3Rpb24gKHQxLCB0Miwgcm91dGUpIHtcbiAgICAgIC8vIG91dGVyIGRpZmZlcmVuY2VzP1xuICAgICAgdmFyIGRpZmZsaXN0ID0gdGhpcy5maW5kT3V0ZXJEaWZmKHQxLCB0Miwgcm91dGUpO1xuICAgICAgaWYgKGRpZmZsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGRpZmZsaXN0O1xuICAgICAgfVxuICAgICAgLy8gaW5uZXIgZGlmZmVyZW5jZXM/XG4gICAgICB2YXIgZGlmZiA9IHRoaXMuZmluZElubmVyRGlmZih0MSwgdDIsIHJvdXRlKTtcbiAgICAgIGlmIChkaWZmKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGlmZi5sZW5ndGggPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBkaWZmID0gW2RpZmZdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaWZmLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gZGlmZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gZGlmZmVyZW5jZXNcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGZpbmRPdXRlckRpZmY6IGZ1bmN0aW9uICh0MSwgdDIsIHJvdXRlKSB7XG4gICAgICB2YXIgaztcbiAgICAgIFxuICAgICAgaWYgKHQxLm5vZGVOYW1lICE9IHQyLm5vZGVOYW1lKSB7XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gUkVQTEFDRV9FTEVNRU5UO1xuICAgICAgICBrW09MRF9WQUxVRV0gPSBub2RlVG9PYmoodDEpO1xuICAgICAgICBrW05FV19WQUxVRV0gPSBub2RlVG9PYmoodDIpO1xuICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICByZXR1cm4gW25ldyBEaWZmKGspXTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuICAgICAgICBieU5hbWUgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLm5hbWUgPiBiLm5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIGF0dHIxID0gdDEuYXR0cmlidXRlcyA/IHNsaWNlLmNhbGwodDEuYXR0cmlidXRlcykuc29ydChieU5hbWUpIDogW10sXG4gICAgICAgIGF0dHIyID0gdDIuYXR0cmlidXRlcyA/IHNsaWNlLmNhbGwodDIuYXR0cmlidXRlcykuc29ydChieU5hbWUpIDogW10sXG4gICAgICAgIGZpbmQgPSBmdW5jdGlvbiAoYXR0ciwgbGlzdCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsYXN0ID0gbGlzdC5sZW5ndGg7IGkgPCBsYXN0OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLm5hbWUgPT09IGF0dHIubmFtZSlcbiAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlmZnMgPSBbXTtcbiAgICAgIGlmICgodDEudmFsdWUgfHwgdDIudmFsdWUpICYmIHQxLnZhbHVlICE9PSB0Mi52YWx1ZSAmJiB0MS5ub2RlTmFtZSAhPT0gJ09QVElPTicpIHtcbiAgICAgICAgayA9IHt9O1xuICAgICAgICBrW0FDVElPTl0gPSBNT0RJRllfVkFMVUU7XG4gICAgICAgIGtbT0xEX1ZBTFVFXSA9IHQxLnZhbHVlO1xuICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi52YWx1ZTtcbiAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7XG4gICAgICB9XG4gICAgICBpZiAoKHQxLmNoZWNrZWQgfHwgdDIuY2hlY2tlZCkgJiYgdDEuY2hlY2tlZCAhPT0gdDIuY2hlY2tlZCkge1xuICAgICAgICBrID0ge307XG4gICAgICAgIGtbQUNUSU9OXSA9IE1PRElGWV9DSEVDS0VEO1xuICAgICAgICBrW09MRF9WQUxVRV0gPSB0MS5jaGVja2VkO1xuICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi5jaGVja2VkO1xuICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICBkaWZmcy5wdXNoKG5ldyBEaWZmKGspKTtcbiAgICAgIH0gIFxuXG4gICAgICBhdHRyMS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgICAgIHZhciBwb3MgPSBmaW5kKGF0dHIsIGF0dHIyKSxcbiAgICAgICAgICBrO1xuICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICBrW0FDVElPTl0gPSBSRU1PVkVfQVRUUklCVVRFO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgICAga1tOQU1FXSA9IGF0dHIubmFtZTtcbiAgICAgICAgICBrW1ZBTFVFXSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7XG4gICAgICAgICAgcmV0dXJuIGRpZmZzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhMiA9IGF0dHIyLnNwbGljZShwb3MsIDEpWzBdO1xuICAgICAgICBpZiAoYXR0ci52YWx1ZSAhPT0gYTIudmFsdWUpIHtcbiAgICAgICAgICBrID0ge307XG4gICAgICAgICAga1tBQ1RJT05dID0gTU9ESUZZX0FUVFJJQlVURTtcbiAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICAgIGtbTkFNRV0gPSBhdHRyLm5hbWU7XG4gICAgICAgICAga1tPTERfVkFMVUVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICBrW05FV19WQUxVRV0gPSBhMi52YWx1ZTtcblxuICAgICAgICAgIGRpZmZzLnB1c2gobmV3IERpZmYoaykpO1xuICAgICAgICAgICAgICAgLy8gICAgY29uc29sZS5sb2coZGlmZnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghdDEuYXR0cmlidXRlcyAmJiB0MS5kYXRhICE9PSB0Mi5kYXRhKSB7XG4gICAgICAgICAgayA9IHt9O1xuICAgICAgICAgIGtbQUNUSU9OXSA9IE1PRElGWV9EQVRBO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgICAga1tPTERfVkFMVUVdID0gdDEuZGF0YTtcbiAgICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi5kYXRhO1xuICAgICAgICAgIGRpZmZzLnB1c2gobmV3IERpZmYoaykpOyAgICAgICAgICBcbiAgICAgIH1cbiAgICAgIGlmIChkaWZmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBkaWZmcztcbiAgICAgIH07XG4gICAgICBhdHRyMi5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgICAgIHZhciBrO1xuICAgICAgICBrID0ge307XG4gICAgICAgIGtbQUNUSU9OXSA9IEFERF9BVFRSSUJVVEU7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgIGtbTkFNRV0gPSBhdHRyLm5hbWU7XG4gICAgICAgIGtbVkFMVUVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7XG4gICAgICAgIFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGlmICgodDEuc2VsZWN0ZWQgfHwgdDIuc2VsZWN0ZWQpICYmIHQxLnNlbGVjdGVkICE9PSB0Mi5zZWxlY3RlZCkge1xuICAgICAgICBpZiAoZGlmZnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpZmZzO1xuICAgICAgICB9XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gTU9ESUZZX1NFTEVDVEVEO1xuICAgICAgICBrW09MRF9WQUxVRV0gPSB0MS5zZWxlY3RlZDtcbiAgICAgICAga1tORVdfVkFMVUVdID0gdDIuc2VsZWN0ZWQ7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgIGRpZmZzLnB1c2gobmV3IERpZmYoaykpO1xuICAgICAgfSAgICAgIFxuICAgICAgXG4gICAgICByZXR1cm4gZGlmZnM7XG4gICAgfSxcbiAgICBmaW5kSW5uZXJEaWZmOiBmdW5jdGlvbiAodDEsIHQyLCByb3V0ZSkge1xuICAgICAgdmFyIHN1YnRyZWVzID0gbWFya1N1YlRyZWVzKHQxLCB0MiksXG4gICAgICAgIG1hcHBpbmdzID0gc3VidHJlZXMubGVuZ3RoLFxuICAgICAgICBrO1xuICAgICAgLy8gbm8gY29ycmVzcG9uZGVuY2Ugd2hhdHNvZXZlclxuICAgICAgLy8gaWYgdDEgb3IgdDIgY29udGFpbiBkaWZmZXJlbmNlcyB0aGF0IGFyZSBub3QgdGV4dCBub2RlcywgcmV0dXJuIGEgZGlmZi4gXG5cbiAgICAgIC8vIHR3byB0ZXh0IG5vZGVzIHdpdGggZGlmZmVyZW5jZXNcbiAgICAgIGlmIChtYXBwaW5ncyA9PT0gMCkge1xuICAgICAgICBpZiAodDEubm9kZVR5cGUgPT09IDMgJiYgdDIubm9kZVR5cGUgPT09IDMgJiYgdDEuZGF0YSAhPT0gdDIuZGF0YSkge1xuICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICBrW0FDVElPTl0gPSBNT0RJRllfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgIGtbT0xEX1ZBTFVFXSA9IHQxLmRhdGE7XG4gICAgICAgICAga1tORVdfVkFMVUVdID0gdDIuZGF0YTtcbiAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gcG9zc2libHkgaWRlbnRpY2FsIGNvbnRlbnQ6IHZlcmlmeVxuICAgICAgaWYgKG1hcHBpbmdzIDwgMikge1xuICAgICAgICB2YXIgZGlmZiwgZGlmZmxpc3QsIGksIGxhc3QsIGUxLCBlMjtcbiAgICAgICAgZm9yIChpID0gMCwgbGFzdCA9IE1hdGgubWF4KHQxLmNoaWxkTm9kZXMubGVuZ3RoLCB0Mi5jaGlsZE5vZGVzLmxlbmd0aCk7IGkgPCBsYXN0OyBpKyspIHtcbiAgICAgICAgICBlMSA9IHQxLmNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgZTIgPSB0Mi5jaGlsZE5vZGVzW2ldO1xuICAgICAgICAgIC8vIFRPRE86IHRoaXMgaXMgYSBzaW1pbGFyIGNvZGUgcGF0aCB0byB0aGUgb25lXG4gICAgICAgICAgLy8gICAgICAgaW4gZmluZEZpcnN0SW5uZXJEaWZmLiBDYW4gd2UgdW5pZnkgdGhlc2U/XG4gICAgICAgICAgaWYgKGUxICYmICFlMikge1xuICAgICAgICAgICAgaWYgKGUxLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICAgICAga1tBQ1RJT05dID0gUkVNT1ZFX1RFWFRfRUxFTUVOVDtcbiAgICAgICAgICAgICAga1tST1VURV0gPSByb3V0ZS5jb25jYXQoaSk7XG4gICAgICAgICAgICAgIGtbVkFMVUVdID0gZTEuZGF0YTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgayA9IHt9O1xuICAgICAgICAgICAga1tBQ1RJT05dID0gUkVNT1ZFX0VMRU1FTlQ7XG4gICAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAgICAgIGtbRUxFTUVOVF0gPSBub2RlVG9PYmooZTEpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZTIgJiYgIWUxKSB7XG4gICAgICAgICAgICBpZiAoZTIubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgICAgayA9IHt9O1xuICAgICAgICAgICAgICBrW0FDVElPTl0gPSBBRERfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAgICAgICAga1tWQUxVRV0gPSBlMi5kYXRhO1xuICAgICAgICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrID0ge307XG4gICAgICAgICAgICBrW0FDVElPTl0gPSBBRERfRUxFTUVOVDtcbiAgICAgICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICAgICAga1tFTEVNRU5UXSA9IG5vZGVUb09iaihlMik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlMS5ub2RlVHlwZSAhPSAzIHx8IGUyLm5vZGVUeXBlICE9IDMpIHtcbiAgICAgICAgICAgIGRpZmZsaXN0ID0gdGhpcy5maW5kT3V0ZXJEaWZmKGUxLCBlMiwgcm91dGUuY29uY2F0KGkpKTtcbiAgICAgICAgICAgIGlmIChkaWZmbGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkaWZmbGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZGlmZiA9IHRoaXMuZmluZElubmVyRGlmZihlMSwgZTIsIHJvdXRlLmNvbmNhdChpKSk7XG4gICAgICAgICAgaWYgKGRpZmYpIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBvbmUgb3IgbW9yZSBkaWZmZXJlbmNlczogZmluZCBmaXJzdCBkaWZmXG4gICAgICByZXR1cm4gdGhpcy5maW5kRmlyc3RJbm5lckRpZmYodDEsIHQyLCBzdWJ0cmVlcywgcm91dGUpO1xuICAgIH0sXG5cbiAgICAvLyBpbXBvcnRlZFxuICAgIGZpbmRGaXJzdElubmVyRGlmZjogZmluZEZpcnN0SW5uZXJEaWZmLFxuXG4gICAgLy8gPT09PT0gQXBwbHkgYSBkaWZmID09PT09XG5cbiAgICBhcHBseTogZnVuY3Rpb24gKHRyZWUsIGRpZmZzKSB7XG4gICAgICB2YXIgZG9iaiA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGRpZmZzLmxlbmd0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBkaWZmcyA9IFtkaWZmc107XG4gICAgICB9XG4gICAgICBpZiAoZGlmZnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZGlmZnMuZm9yRWFjaChmdW5jdGlvbiAoZGlmZikge1xuICAgICAgICBpZiAoIWRvYmouYXBwbHlEaWZmKHRyZWUsIGRpZmYpKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBnZXRGcm9tUm91dGU6IGZ1bmN0aW9uICh0cmVlLCByb3V0ZSkge1xuICAgICAgcm91dGUgPSByb3V0ZS5zbGljZSgpO1xuICAgICAgdmFyIGMsIG5vZGUgPSB0cmVlO1xuICAgICAgd2hpbGUgKHJvdXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKCFub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYyA9IHJvdXRlLnNwbGljZSgwLCAxKVswXTtcbiAgICAgICAgbm9kZSA9IG5vZGUuY2hpbGROb2Rlc1tjXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgLy8gZGlmZmluZyB0ZXh0IGVsZW1lbnRzIGNhbiBiZSBvdmVyd3JpdHRlbiBmb3IgdXNlIHdpdGggZGlmZl9tYXRjaF9wYXRjaCBhbmQgYWxpa2VcbiAgICB0ZXh0RGlmZjogZnVuY3Rpb24gKG5vZGUsIGN1cnJlbnRWYWx1ZSwgZXhwZWN0ZWRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIG5vZGUuZGF0YSA9IG5ld1ZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH0sXG4gICAgYXBwbHlEaWZmOiBmdW5jdGlvbiAodHJlZSwgZGlmZikge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLmdldEZyb21Sb3V0ZSh0cmVlLCBkaWZmW1JPVVRFXSk7XG4gICAgICBpZiAoZGlmZltBQ1RJT05dID09PSBBRERfQVRUUklCVVRFKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5zZXRBdHRyaWJ1dGUpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShkaWZmW05BTUVdLCBkaWZmW1ZBTFVFXSk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX0FUVFJJQlVURSkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuc2V0QXR0cmlidXRlKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoZGlmZltOQU1FXSwgZGlmZltORVdfVkFMVUVdKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRU1PVkVfQVRUUklCVVRFKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5yZW1vdmVBdHRyaWJ1dGUpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShkaWZmW05BTUVdKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfVkFMVUUpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlLnZhbHVlID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUudmFsdWUgPSBkaWZmW05FV19WQUxVRV07XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX0RBVEEpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlLmRhdGEgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbm9kZS5kYXRhID0gZGlmZltORVdfVkFMVUVdO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9DSEVDS0VEKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCB0eXBlb2Ygbm9kZS5jaGVja2VkID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUuY2hlY2tlZCA9IGRpZmZbTkVXX1ZBTFVFXTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfU0VMRUNURUQpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlLnNlbGVjdGVkID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUuc2VsZWN0ZWQgPSBkaWZmW05FV19WQUxVRV07ICAgICBcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfVEVYVF9FTEVNRU5UKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCBub2RlLm5vZGVUeXBlICE9IDMpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLnRleHREaWZmKG5vZGUsIG5vZGUuZGF0YSwgZGlmZltPTERfVkFMVUVdLCBkaWZmW05FV19WQUxVRV0pO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFUExBQ0VfRUxFTUVOVCkge1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG9ialRvTm9kZShkaWZmW05FV19WQUxVRV0pO1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIG5vZGUpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTE9DQVRFX0dST1VQKSB7XG4gICAgICAgIHZhciBncm91cCA9IGRpZmZbR1JPVVBdLFxuICAgICAgICAgIGZyb20gPSBkaWZmW0ZST01dLFxuICAgICAgICAgIHRvID0gZGlmZltUT10sXG4gICAgICAgICAgY2hpbGQsIHJlZmVyZW5jZTtcbiAgICAgICAgcmVmZXJlbmNlID0gbm9kZS5jaGlsZE5vZGVzW3RvICsgZ3JvdXAubGVuZ3RoXTtcbiAgICAgICAgLy8gc2xpZGUgZWxlbWVudHMgdXBcbiAgICAgICAgaWYgKGZyb20gPCB0bykge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZE5vZGVzW2Zyb21dO1xuICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUoY2hpbGQsIHJlZmVyZW5jZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHNsaWRlIGVsZW1lbnRzIGRvd25cbiAgICAgICAgICByZWZlcmVuY2UgPSBub2RlLmNoaWxkTm9kZXNbdG9dO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZE5vZGVzW2Zyb20gKyBpXTtcbiAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKGNoaWxkLCByZWZlcmVuY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTU9WRV9FTEVNRU5UKSB7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRU1PVkVfVEVYVF9FTEVNRU5UKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCBub2RlLm5vZGVUeXBlICE9IDMpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gQUREX0VMRU1FTlQpIHtcbiAgICAgICAgdmFyIHJvdXRlID0gZGlmZltST1VURV0uc2xpY2UoKSxcbiAgICAgICAgICBjID0gcm91dGUuc3BsaWNlKHJvdXRlLmxlbmd0aCAtIDEsIDEpWzBdO1xuICAgICAgICBub2RlID0gdGhpcy5nZXRGcm9tUm91dGUodHJlZSwgcm91dGUpO1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG9ialRvTm9kZShkaWZmW0VMRU1FTlRdKTtcbiAgICAgICAgaWYgKGMgPj0gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQobmV3Tm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHJlZmVyZW5jZSA9IG5vZGUuY2hpbGROb2Rlc1tjXTtcbiAgICAgICAgICBub2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gQUREX1RFWFRfRUxFTUVOVCkge1xuICAgICAgICB2YXIgcm91dGUgPSBkaWZmW1JPVVRFXS5zbGljZSgpLFxuICAgICAgICAgIGMgPSByb3V0ZS5zcGxpY2Uocm91dGUubGVuZ3RoIC0gMSwgMSlbMF0sXG4gICAgICAgICAgbmV3Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmZbVkFMVUVdKTtcbiAgICAgICAgbm9kZSA9IHRoaXMuZ2V0RnJvbVJvdXRlKHRyZWUsIHJvdXRlKTtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLmNoaWxkTm9kZXMpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYyA+PSBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChuZXdOb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgcmVmZXJlbmNlID0gbm9kZS5jaGlsZE5vZGVzW2NdO1xuICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyA9PT09PSBVbmRvIGEgZGlmZiA9PT09PVxuXG4gICAgdW5kbzogZnVuY3Rpb24gKHRyZWUsIGRpZmZzKSB7XG4gICAgICBkaWZmcyA9IGRpZmZzLnNsaWNlKCk7XG4gICAgICB2YXIgZG9iaiA9IHRoaXM7XG4gICAgICBpZiAoIWRpZmZzLmxlbmd0aCkge1xuICAgICAgICBkaWZmcyA9IFtkaWZmc107XG4gICAgICB9XG4gICAgICBkaWZmcy5yZXZlcnNlKCk7XG4gICAgICBkaWZmcy5mb3JFYWNoKGZ1bmN0aW9uIChkaWZmKSB7XG4gICAgICAgIGRvYmoudW5kb0RpZmYodHJlZSwgZGlmZik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHVuZG9EaWZmOiBmdW5jdGlvbiAodHJlZSwgZGlmZikge1xuICAgICAgaWYgKGRpZmZbQUNUSU9OXSA9PT0gQUREX0FUVFJJQlVURSkge1xuICAgICAgICBkaWZmW0FDVElPTl0gPSBSRU1PVkVfQVRUUklCVVRFO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfQVRUUklCVVRFKSB7XG4gICAgICAgIHN3YXAoZGlmZiwgT0xEX1ZBTFVFLCBORVdfVkFMVUUpO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRU1PVkVfQVRUUklCVVRFKSB7XG4gICAgICAgIGRpZmZbQUNUSU9OXSA9IEFERF9BVFRSSUJVVEU7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9URVhUX0VMRU1FTlQpIHtcbiAgICAgICAgc3dhcChkaWZmLCBPTERfVkFMVUUsIE5FV19WQUxVRSk7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9WQUxVRSkge1xuICAgICAgICBzd2FwKGRpZmYsIE9MRF9WQUxVRSwgTkVXX1ZBTFVFKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX0RBVEEpIHtcbiAgICAgICAgc3dhcChkaWZmLCBPTERfVkFMVUUsIE5FV19WQUxVRSk7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpOyAgICAgICAgXG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX0NIRUNLRUQpIHtcbiAgICAgICAgc3dhcChkaWZmLCBPTERfVkFMVUUsIE5FV19WQUxVRSk7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9TRUxFQ1RFRCkge1xuICAgICAgICBzd2FwKGRpZmYsIE9MRF9WQUxVRSwgTkVXX1ZBTFVFKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gUkVQTEFDRV9FTEVNRU5UKSB7XG4gICAgICAgIHN3YXAoZGlmZiwgT0xEX1ZBTFVFLCBORVdfVkFMVUUpO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRUxPQ0FURV9HUk9VUCkge1xuICAgICAgICBzd2FwKGRpZmYsIEZST00sIFRPKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gUkVNT1ZFX0VMRU1FTlQpIHtcbiAgICAgICAgZGlmZltBQ1RJT05dID0gQUREX0VMRU1FTlQ7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IEFERF9FTEVNRU5UKSB7XG4gICAgICAgIGRpZmZbQUNUSU9OXSA9IFJFTU9WRV9FTEVNRU5UO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRU1PVkVfVEVYVF9FTEVNRU5UKSB7XG4gICAgICAgIGRpZmZbQUNUSU9OXSA9IEFERF9URVhUX0VMRU1FTlQ7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IEFERF9URVhUX0VMRU1FTlQpIHtcbiAgICAgICAgZGlmZltBQ1RJT05dID0gUkVNT1ZFX1RFWFRfRUxFTUVOVDtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcblxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkaWZmRE9NO1xuICAgIH1cbiAgICBleHBvcnRzLmRpZmZET00gPSBkaWZmRE9NO1xuICB9IGVsc2Uge1xuICAgIC8vIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlclxuICAgIHRoaXMuZGlmZkRPTSA9IGRpZmZET007XG4gIH1cblxufS5jYWxsKHRoaXMpKTtcbiIsIihmdW5jdGlvbihnbG9iYWwpe1xuXG4gIGZ1bmN0aW9uIFRpbnlTdG9yZSAobmFtZSwgb3B0aW9uYWxTdG9yZSkge1xuICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xuICAgIHRoaXMuc3RvcmUgPSB0eXBlb2Ygb3B0aW9uYWxTdG9yZSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25hbFN0b3JlIDogbG9jYWxTdG9yYWdlO1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgJ1RpbnlTdG9yZSc7XG4gICAgdGhpcy5lbmFibGVkID0gaXNFbmFibGVkKHRoaXMuc3RvcmUpO1xuXG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JlW3RoaXMubmFtZV0pIHx8IHt9O1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cblxuICBUaW55U3RvcmUucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy5zdG9yZVt0aGlzLm5hbWVdID0gSlNPTi5zdHJpbmdpZnkodGhpcy5zZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbjtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5zZXNzaW9uW2tleV0gPSB2YWx1ZTtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uW2tleV07XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbltrZXldO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc2Vzc2lvbltrZXldO1xuICAgIGRlbGV0ZSB0aGlzLnNlc3Npb25ba2V5XTtcbiAgICB0aGlzLnNhdmUoKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNlc3Npb24gPSB7fTtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICBkZWxldGUgdGhpcy5zdG9yZVt0aGlzLm5hbWVdO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBpc0VuYWJsZWQgKHN0b3JlKSB7XG4gICAgLy8gZGVmaW5pdGVseSBpbnZhbGlkOlxuICAgIC8vICogbnVsbFxuICAgIC8vICogdW5kZWZpbmVkXG4gICAgLy8gKiBOYU5cbiAgICAvLyAqIGVtcHR5IHN0cmluZyAoXCJcIilcbiAgICAvLyAqIDBcbiAgICAvLyAqIGZhbHNlXG4gICAgaWYgKCFzdG9yZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHZhciBzdG9yZVR5cGUgPSB0eXBlb2Ygc3RvcmU7XG4gICAgdmFyIGlzTG9jYWxPclNlc3Npb24gPSB0eXBlb2Ygc3RvcmUuZ2V0SXRlbSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygc3RvcmUuc2V0SXRlbSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB2YXIgaXNPYmplY3RPckZ1bmN0aW9uID0gc3RvcmVUeXBlID09PSAnb2JqZWN0JyB8fCBzdG9yZVR5cGUgPT09ICdmdW5jdGlvbic7XG5cbiAgICAvLyBzdG9yZSBpcyB2YWxpZCBpZmYgaXQgaXMgZWl0aGVyXG4gICAgLy8gKGEpIGxvY2FsU3RvcmFnZSBvciBzZXNzaW9uU3RvcmFnZVxuICAgIC8vIChiKSBhIHJlZ3VsYXIgb2JqZWN0IG9yIGZ1bmN0aW9uXG4gICAgaWYgKGlzTG9jYWxPclNlc3Npb24gfHwgaXNPYmplY3RPckZ1bmN0aW9uKSB7IHJldHVybiB0cnVlOyB9XG5cbiAgICAvLyBjYXRjaGFsbCBmb3Igb3V0bGllcnMgKHN0cmluZywgcG9zaXRpdmUgbnVtYmVyLCB0cnVlIGJvb2xlYW4sIHhtbClcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnbG9iYWwuVGlueVN0b3JlID0gVGlueVN0b3JlO1xuXG59KSh0aGlzKTtcbiIsImltcG9ydCBldmVudHMgZnJvbSAnLi9wdWItc3ViJ1xuaW1wb3J0IGRyYXdVSSBmcm9tICcuL2NhcnQtdWkuanMnXG5cbmZ1bmN0aW9uIGxpc3RlblVJICgpIHtcbiAgZXZlbnRzLm9uKCdjYXJ0OnVwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygncmVkcmF3JylcbiAgICBkcmF3VUkgKClcbiAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlzdGVuVUkiLCJpbXBvcnQgZXZlbnRzIGZyb20gJy4vcHViLXN1YidcbmltcG9ydCBkaWZmRE9NIGZyb20gJ2RpZmYtZG9tJ1xuXG5mdW5jdGlvbiBkcmF3VUkgKCkge1xuXG4gIHZhciBzdW1tYXJ5ID0gY2FydC5nZXRDYXJ0KClcblxuICB2YXIgc3VidG90YWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGlueWNhcnQtc3VidG90YWxcIilbMF1cbiAgaWYgKHN1YnRvdGFsKSB7IHN1YnRvdGFsLmlubmVySFRNTCA9IHN1bW1hcnkuc3VidG90YWx9XG5cbiAgdmFyIHNoaXBwaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LXNoaXBwaW5nXCIpWzBdXG4gIGlmIChzaGlwcGluZykgeyBzaGlwcGluZy5pbm5lckhUTUwgPSBzdW1tYXJ5LnNoaXBUb3RhbCB9XG5cbiAgdmFyIHRvdGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LXRvdGFsXCIpWzBdXG4gIGlmICh0b3RhbCkgeyB0b3RhbC5pbm5lckhUTUwgPSBzdW1tYXJ5LnRvdGFsIH1cblxuICB2YXIgaXRlbURpdj0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LWl0ZW1zXCIpWzBdXG4gIGlmIChpdGVtRGl2KSB7XG4gICAgbGV0IGRkID0gbmV3IGRpZmZET01cbiAgICBsZXQgaXRlbXMgPSBjYXJ0LmdldENhcnQoKS5pdGVtc1xuICAgIGxldCB0bXAgPSBpdGVtRGl2LmNsb25lTm9kZShmYWxzZSlcbiAgICB0bXAuaW5uZXJIVE1MID0gJydcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgbGV0IGlkICAgID0gXCInXCIgKyBpdGVtLmlkICsgXCInXCJcbiAgICAgIGxldCB0aXRsZSA9IFwiJ1wiICsgIGl0ZW0udGl0bGUgKyBcIidcIlxuICAgICAgdG1wLmlubmVySFRNTCA9IHRtcC5pbm5lckhUTUxcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0yNCBmaXJzdC1jb2x1bW4gbGluZS1pdGVtXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LXJpZ2h0IHByZS0zXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGEgb25jbGljaz1cImNhcnQuZGVzdHJveUl0ZW0oJyArIGlkICArICcpO1wiPnggPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi05XCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGEgaHJlZj1cIicgKyBpdGVtLmlkICsgJ1wiPicgKyBpdGVtLnRpdGxlICsgJzwvYT4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LWNlbnRlclwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxhIG9uY2xpY2s9XCJjYXJ0LnJlbW92ZUl0ZW0oJyArIGlkICsgJyk7XCI+IC0gPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JyArIGl0ZW0ucXVhbnRpdHkgKyAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGEgb25jbGljaz1cImNhcnQuYWRkSXRlbSgnICsgdGl0bGUgKyAnLCAnKyBpZCArICcsICcgKyBpdGVtLnByaWNlICsgJywgMSk7XCI+ICsgPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0yIHByZS0xXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JDwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInJpZ2h0XCI+JyArIGl0ZW0ucHJpY2UgKyAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0yIHByZS0xXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JDwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInJpZ2h0XCI+JyArIGl0ZW0ucXVhbnRpdHkgKiBpdGVtLnByaWNlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgfSlcblxuICAgIGRkLmFwcGx5KGl0ZW1EaXYsIGRkLmRpZmYoaXRlbURpdiwgdG1wKSlcbiAgfVxuXG4gIHZhciBzdW1tYXJ5RGl2PSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGlueWNhcnQtc3VtbWFyeVwiKVswXVxuICBpZiAoc3VtbWFyeURpdikge1xuICAgIGxldCBkZCA9IG5ldyBkaWZmRE9NXG4gICAgbGV0IGl0ZW1zID0gY2FydC5nZXRDYXJ0KCkuaXRlbXNcbiAgICBsZXQgdG1wID0gc3VtbWFyeURpdi5jbG9uZU5vZGUoZmFsc2UpXG4gICAgdG1wLmlubmVySFRNTCA9ICcnXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGxldCBpZCAgICA9IFwiJ1wiICsgaXRlbS5pZCArIFwiJ1wiXG4gICAgICBsZXQgdGl0bGUgPSBcIidcIiArICBpdGVtLnRpdGxlICsgXCInXCJcbiAgICAgIHRtcC5pbm5lckhUTUwgPSB0bXAuaW5uZXJIVE1MXG4gICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMTEgZmlyc3QtY29sdW1uIGxpbmUtaXRlbVwiPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTVcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4nICsgaXRlbS50aXRsZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTEgdGV4dC1jZW50ZXJcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8YSBvbmNsaWNrPVwiY2FydC5yZW1vdmVJdGVtKCcgKyBpZCArICcpO1wiPiAtIDwvYT4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LWNlbnRlclwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuPicgKyBpdGVtLnF1YW50aXR5ICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LWNlbnRlclwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxhIG9uY2xpY2s9XCJjYXJ0LmFkZEl0ZW0oJyArIHRpdGxlICsgJywgJysgaWQgKyAnLCAnICsgaXRlbS5wcmljZSArICcsIDEpO1wiPiArIDwvYT4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMiBwcmUtMVwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuPiQ8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4gY2xhc3M9XCJyaWdodFwiPicgKyBpdGVtLnF1YW50aXR5ICogaXRlbS5wcmljZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgIH0pXG5cbiAgICBkZC5hcHBseShzdW1tYXJ5RGl2LCBkZC5kaWZmKHN1bW1hcnlEaXYsIHRtcCkpXG4gIH1cblxuICB2YXIgY2FydExpbms9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0aW55Y2FydC1saW5rXCIpWzBdXG4gIGlmIChjYXJ0TGluaykge1xuICAgIGxldCBkZCA9IG5ldyBkaWZmRE9NXG4gICAgbGV0IGNydCA9IGNhcnQuZ2V0Q2FydCgpXG4gICAgbGV0IHRtcCA9IGNhcnRMaW5rLmNsb25lTm9kZShmYWxzZSlcbiAgICBpZiAoY3J0Lml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRtcC5pbm5lckhUTUwgPSBjcnQuaXRlbXMubGVuZ3RoICsgJyBpdGVtczogJCcgKyBjcnQuc3VidG90YWxcbiAgICB9IGVsc2UgaWYgKGNydC5pdGVtcy5sZW5ndGggPT0gMSkge1xuICAgICAgdG1wLmlubmVySFRNTCA9IGNydC5pdGVtcy5sZW5ndGggKyAnIGl0ZW06ICQnICsgY3J0LnN1YnRvdGFsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcC5pbm5lckhUTUwgPSAnJ1xuICAgIH1cbiAgICBkZC5hcHBseShjYXJ0TGluaywgZGQuZGlmZihjYXJ0TGluaywgdG1wKSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkcmF3VUkiLCJpbXBvcnQgVFMgZnJvbSAndGlueXN0b3JlJ1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuL3B1Yi1zdWInXG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIENhcnQg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilJhcbi8vIGhhbmRsZSB0aGUgZmluZXN0IG9mIHNob3BwaW5nIGV4cGVyaWVuY2VzXG5mdW5jdGlvbiBUaW55Q2FydCh7XG4gIGNhcnROYW1lID0gJ1RpbnlDYXJ0JyxcbiAgY3VycmVuY3kgPSAnJCcsXG4gIHRheFJhdGUgPSAwLjAwLFxuICB0YXggPSAwLjAwLFxuICBiYXNlU2hpcHBpbmcgPSAwLjAwLFxuICBzaGlwcGluZyA9IDAuMDAsXG4gIHNoaXBUb3RhbCA9IDAuMDAsXG4gIHN1YnRvdGFsID0gMC4wMCxcbiAgdG90YWwgPSAwLjAwLFxuICBpdGVtcyA9IFtdXG59ID0ge30pIHtcbiAgdmFyIHRzID0gbmV3IFRTLlRpbnlTdG9yZShjYXJ0TmFtZSlcblxuICBpZiAoIXRzLmdldCgnY3VycmVuY3knKSkge3RzLnNldCgnY3VycmVuY3knLCBjdXJyZW5jeSl9XG4gIGlmICghdHMuZ2V0KCd0YXhSYXRlJykpIHt0cy5zZXQoJ3RheFJhdGUnLCB0YXhSYXRlKX1cbiAgaWYgKCF0cy5nZXQoJ3RheCcpKSB7dHMuc2V0KCd0YXgnLCB0YXgpfVxuICBpZiAoIXRzLmdldCgnYmFzZVNoaXBwaW5nJykpIHt0cy5zZXQoJ2Jhc2VTaGlwcGluZycsIGJhc2VTaGlwcGluZyl9XG4gIGlmICghdHMuZ2V0KCdzaGlwcGluZycpKSB7dHMuc2V0KCdzaGlwcGluZycsIHNoaXBwaW5nKX1cbiAgaWYgKCF0cy5nZXQoJ3N1YnRvdGFsJykpIHt0cy5zZXQoJ3N1YnRvdGFsJywgc3VidG90YWwpfVxuICBpZiAoIXRzLmdldCgndG90YWwnKSkge3RzLnNldCgndG90YWwnLCB0b3RhbCl9XG4gIGlmICghdHMuZ2V0KCdpdGVtcycpKSB7dHMuc2V0KCdpdGVtcycsIGl0ZW1zKX1cblxuICAvLyBSZXR1cm5zIHRoZSBDYXJ0IG9iamVjdCBhbmQgc3BlY2lmaWMgY2FydCBvYmplY3QgdmFsdWVzXG4gIHRoaXMuZ2V0Q2FydCA9ICgpID0+IHsgcmV0dXJuIHRzLnNlc3Npb24gfVxuXG4gIHRoaXMuY2FsY3VsYXRlQ2FydCA9ICgpID0+IHtcbiAgICBsZXQgbnVtSXRlbXMgICAgID0gMFxuICAgIGxldCBzdWJ0b3RhbCAgICAgPSAwXG4gICAgbGV0IHRheCAgICAgICAgICA9IDBcbiAgICBsZXQgdG90YWwgICAgICAgID0gMFxuICAgIGxldCBzaGlwVG90YWwgICAgPSAwXG4gICAgbGV0IGl0ZW1zICAgICAgICA9IHRzLmdldCgnaXRlbXMnKVxuICAgIGxldCBiYXNlU2hpcHBpbmcgPSB0cy5nZXQoJ2Jhc2VTaGlwcGluZycpXG4gICAgbGV0IHRheFJhdGUgICAgICA9IHRzLmdldCgndGF4UmF0ZScpXG4gICAgbGV0IHNoaXBwaW5nICAgICA9IHRzLmdldCgnc2hpcHBpbmcnKVxuXG4gICAgaXRlbXMuZm9yRWFjaChpID0+IHtcbiAgICAgIG51bUl0ZW1zID0gbnVtSXRlbXMgKyBpLnF1YW50aXR5XG4gICAgICBzdWJ0b3RhbCA9IGkucHJpY2UgKiBpLnF1YW50aXR5ICsgc3VidG90YWxcbiAgICB9KVxuXG4gICAgdGF4ID0gdGF4UmF0ZSAqIHN1YnRvdGFsXG4gICAgc2hpcFRvdGFsID0gIWl0ZW1zLmxlbmd0aCA/IDAgOiBzaGlwcGluZyAqIG51bUl0ZW1zICsgYmFzZVNoaXBwaW5nXG4gICAgdG90YWwgPSBzaGlwVG90YWwgKyBzdWJ0b3RhbCArIHRheFxuXG4gICAgdHMuc2V0KCd0YXgnLCB0YXgpXG4gICAgdHMuc2V0KCdzdWJ0b3RhbCcsIHN1YnRvdGFsKVxuICAgIHRzLnNldCgnc2hpcFRvdGFsJywgc2hpcFRvdGFsKVxuICAgIHRzLnNldCgndG90YWwnLCB0b3RhbClcbiAgICBjb25zb2xlLmxvZygnaXRlbSBhZGRlZCB0byBjYXJ0JylcbiAgICB0aGlzLmNhcnRVcGRhdGVkKClcbiAgfVxuXG4gIHRoaXMuYWRkSXRlbSA9ICh0aXRsZSwgaWQsIHByaWNlLCBxdWFudGl0eSkgPT4ge1xuICAgIGxldCBoYXNJdGVtID0gZmFsc2VcbiAgICBsZXQgaXRlbUlkXG5cbiAgICBpZiAodHMuZ2V0KCdpdGVtcycpLmxlbmd0aCkge1xuICAgICAgdHMuZ2V0KCdpdGVtcycpLmZvckVhY2goaSA9PiB7XG4gICAgICAgIGlmIChpLmlkID09IGlkKSB7XG4gICAgICAgICAgaGFzSXRlbSA9IHRydWVcbiAgICAgICAgICBpdGVtSWQgPSBpZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmICghaGFzSXRlbSkge1xuICAgICAgdHMuZ2V0KCdpdGVtcycpLnB1c2goe1xuICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAgcHJpY2U6IHByaWNlLFxuICAgICAgICBxdWFudGl0eTogcXVhbnRpdHlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRzLmdldCgnaXRlbXMnKS5mb3JFYWNoKGkgPT4ge1xuICAgICAgICBpZiAoaS5pZCA9PSBpZCkge1xuICAgICAgICAgIGkucXVhbnRpdHkgPSBpLnF1YW50aXR5ICsgcXVhbnRpdHlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBpdGVtIGhlbHBlcnNcbiAgdGhpcy5oYXNJdGVtcyA9ICgpID0+IHtcbiAgICB0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlXG4gIH1cblxuICB0aGlzLmlzSXRlbSA9IChpLCBpZCkgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKHRzLmdldCgnaXRlbXMnKVtpXS5pZCwgaWQpXG4gICAgdHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkID8gdHJ1ZSA6IGZhbHNlXG4gIH1cblxuICB0aGlzLmdldEl0ZW0gPSAoaWQpID0+IHtcbiAgICBpZiAodGhpcy5oYXNJdGVtcygpKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gaXRlbXMgaW4gY2FydDogJywgdHMuc2Vzc2lvbilcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHMuZ2V0KCdpdGVtcycpLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5pc0l0ZW0oaSwgaWQpKSB7XG4gICAgICAgIHJldHVybiB0cy5nZXQoJ2l0ZW1zJylbaV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLnJlbW92ZUl0ZW0gPSAoaWQsIG51bSApID0+IHtcbiAgICBsZXQgaXRlbXMgPSB0cy5nZXQoJ2l0ZW1zJylcbiAgICBudW0gPSB0eXBlb2YgbnVtICE9PSAndW5kZWZpbmVkJyA/ICBudW0gOiAxO1xuICAgIGlmICh0aGlzLmhhc0l0ZW1zKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdObyBpdGVtcyBpbiBjYXJ0OiAnLCB0cy5zZXNzaW9uKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRzLmdldCgnaXRlbXMnKVtpXS5pZCA9PSBpZCkge1xuICAgICAgICBpZiAoaXRlbXNbaV0ucXVhbnRpdHkgPT0gMSkge1xuICAgICAgICAgIGl0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtc1tpXS5xdWFudGl0eSA9IGl0ZW1zW2ldLnF1YW50aXR5IC0gbnVtXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDYXJ0KClcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmRlc3Ryb3lJdGVtID0gKGlkKSA9PiB7XG4gICAgbGV0IGl0ZW1zID0gdHMuZ2V0KCdpdGVtcycpXG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkKSB7XG4gICAgICAgIGl0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDYXJ0KClcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmVtcHR5Q2FydCA9ICgpID0+IHtcbiAgICB0cy5zZXQoJ2l0ZW1zJywgW10pXG4gICAgdGhpcy5jYWxjdWxhdGVDYXJ0KClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdGhpcy5kZXN0cm95Q2FydCA9ICgpID0+IHtcbiAgICB0cy5jbGVhcigpXG4gICAgdGhpcy5jYXJ0VXBkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHRoaXMuY2FydFVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2NhcnQgdXBkYXRlZCBlbWl0dGVkJylcbiAgICBldmVudHMudHJpZ2dlcignY2FydDp1cGRhdGUnKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGlueUNhcnQiLCJpbXBvcnQgY2FsY2l0ZSBmcm9tICdjYWxjaXRlLXdlYidcbmltcG9ydCBUaW55Q2FydCBmcm9tICcuL2NhcnQuanMnXG5pbXBvcnQgZHJhd1VJIGZyb20gJy4vY2FydC11aS5qcydcbmltcG9ydCBsaXN0ZW5VSSBmcm9tICcuL2NhcnQtbGlzdGVuZXIuanMnXG5cbi8vIHZhciBjYXJ0ID0gQ2FydFxuXG53aW5kb3cuY2FydCA9IG5ldyBUaW55Q2FydCh7XG4gIGNhcnROYW1lOiAnbG9uZWdvb3NlcHJlc3NDYXJ0JyxcbiAgY3VycmVuY3k6ICckJyxcbiAgYmFzZVNoaXBwaW5nOiAxMC4wMCxcbiAgc2hpcHBpbmc6IDQuMDBcbn0pXG5cbmRyYXdVSSgpXG5saXN0ZW5VSSgpXG5cbndpbmRvdy5jYWxjaXRlLmluaXQoKVxuXG4iLCIvKipcbiogQ3JlYXRlIGFuIGV2ZW50cyBodWJcbiovXG5pbXBvcnQgRXZlbnRzIGZyb20gJ2FtcGVyc2FuZC1ldmVudHMnXG5cbi8vIENyZWF0ZSBhIG5ldyBldmVudCBidXNcbnZhciBldmVudHMgPSBFdmVudHMuY3JlYXRlRW1pdHRlcigpXG5cbi8vIGxpc3QgYWxsIGJvdW5kIGV2ZW50cyBmb3IgZGVidWdnaW5nXG4vL2V2ZW50cy5vbignYWxsJywgKCkgPT4gY29uc29sZS5sb2coZXZlbnRzLl9ldmVudHMpKVxuXG5leHBvcnQgZGVmYXVsdCBldmVudHMiXX0=

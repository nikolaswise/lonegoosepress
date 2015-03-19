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

var success = document.getElementsByClassName("thanks")[0];
if (success) {
  cart.emptyCart();
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9hbXBlcnNhbmQtZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1iaW5kL2JpbmQuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWJpbmQvbm9kZV9tb2R1bGVzL2FtcC1pcy1mdW5jdGlvbi9pcy1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtYmluZC9ub2RlX21vZHVsZXMvYW1wLWlzLW9iamVjdC9pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWVhY2gvZWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtZWFjaC9ub2RlX21vZHVsZXMvYW1wLWNyZWF0ZS1jYWxsYmFjay9jcmVhdGUtY2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWV4dGVuZC9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L2lzLWVtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1pcy1lbXB0eS9ub2RlX21vZHVsZXMvYW1wLWlzLWFyZ3VtZW50cy9pcy1hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L25vZGVfbW9kdWxlcy9hbXAtaXMtYXJyYXkvaXMtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWlzLWVtcHR5L25vZGVfbW9kdWxlcy9hbXAtaXMtbmFuL2lzLW5hbi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtaXMtZW1wdHkvbm9kZV9tb2R1bGVzL2FtcC1pcy1udW1iZXIvaXMtbnVtYmVyLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1pcy1lbXB0eS9ub2RlX21vZHVsZXMvYW1wLWlzLXN0cmluZy9pcy1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWtleXMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAta2V5cy9ub2RlX21vZHVsZXMvYW1wLWhhcy9oYXMuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLWtleXMvbm9kZV9tb2R1bGVzL2FtcC1pbmRleC1vZi9pbmRleC1vZi5qcyIsIm5vZGVfbW9kdWxlcy9hbXBlcnNhbmQtZXZlbnRzL25vZGVfbW9kdWxlcy9hbXAtb25jZS9ub2RlX21vZHVsZXMvYW1wLWxpbWl0LWNhbGxzL2xpbWl0LWNhbGxzLmpzIiwibm9kZV9tb2R1bGVzL2FtcGVyc2FuZC1ldmVudHMvbm9kZV9tb2R1bGVzL2FtcC1vbmNlL29uY2UuanMiLCJub2RlX21vZHVsZXMvYW1wZXJzYW5kLWV2ZW50cy9ub2RlX21vZHVsZXMvYW1wLXVuaXF1ZS1pZC91bmlxdWUtaWQuanMiLCJub2RlX21vZHVsZXMvY2FsY2l0ZS13ZWIvbGliL2pzL2NhbGNpdGUtd2ViLmpzIiwibm9kZV9tb2R1bGVzL2RpZmYtZG9tL2RpZmZET00uanMiLCJub2RlX21vZHVsZXMvdGlueXN0b3JlL3RpbnlzdG9yZS5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC1saXN0ZW5lci5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC11aS5qcyIsInNvdXJjZS9hc3NldHMvanMvY2FydC5qcyIsInNvdXJjZS9hc3NldHMvanMvaW5kZXguanMiLCJzb3VyY2UvYXNzZXRzL2pzL3B1Yi1zdWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFRLENBQUM7QUFDekIsVUFBUSxFQUFFLG9CQUFvQjtBQUM5QixVQUFRLEVBQUUsR0FBRztBQUNiLGNBQVksRUFBRSxFQUFLO0FBQ25CLFVBQVEsRUFBRSxDQUFJO0NBQ2YsQ0FBQyxDQUFBOztBQUVGLE1BQU0sRUFBRSxDQUFBO0FBQ1IsUUFBUSxFQUFFLENBQUE7O0FBRVYsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzFELElBQUksT0FBTyxFQUFFO0FBQ1gsTUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO0NBQ2pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7Ozs7Ozs7Ozs7O0lDbkJkLE1BQU0sMkJBQU0sa0JBQWtCOzs7QUFHckMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFBOzs7OztpQkFLcEIsTUFBTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7aWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHsgIHdpbmRvdy5hbXBlcnNhbmQgPSB3aW5kb3cuYW1wZXJzYW5kIHx8IHt9OyAgd2luZG93LmFtcGVyc2FuZFtcImFtcGVyc2FuZC1ldmVudHNcIl0gPSB3aW5kb3cuYW1wZXJzYW5kW1wiYW1wZXJzYW5kLWV2ZW50c1wiXSB8fCBbXTsgIHdpbmRvdy5hbXBlcnNhbmRbXCJhbXBlcnNhbmQtZXZlbnRzXCJdLnB1c2goXCIxLjAuMVwiKTt9XG52YXIgcnVuT25jZSA9IHJlcXVpcmUoJ2FtcC1vbmNlJyk7XG52YXIgdW5pcXVlSWQgPSByZXF1aXJlKCdhbXAtdW5pcXVlLWlkJyk7XG52YXIga2V5cyA9IHJlcXVpcmUoJ2FtcC1rZXlzJyk7XG52YXIgaXNFbXB0eSA9IHJlcXVpcmUoJ2FtcC1pcy1lbXB0eScpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdhbXAtZWFjaCcpO1xudmFyIGJpbmQgPSByZXF1aXJlKCdhbXAtYmluZCcpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2FtcC1leHRlbmQnKTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBldmVudFNwbGl0dGVyID0gL1xccysvO1xuXG5cbnZhciBFdmVudHMgPSB7XG4gICAgLy8gQmluZCBhbiBldmVudCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZFxuICAgIC8vIHRoZSBjYWxsYmFjayB0byBhbGwgZXZlbnRzIGZpcmVkLlxuICAgIG9uOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb24nLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xuICAgICAgICBldmVudHMucHVzaCh7Y2FsbGJhY2s6IGNhbGxiYWNrLCBjb250ZXh0OiBjb250ZXh0LCBjdHg6IGNvbnRleHQgfHwgdGhpc30pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uY2UnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBvbmNlID0gcnVuT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYub2ZmKG5hbWUsIG9uY2UpO1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9uY2UuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIG9uY2UsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgb25lIG9yIG1hbnkgY2FsbGJhY2tzLiBJZiBgY29udGV4dGAgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3Mgd2l0aCB0aGF0IGZ1bmN0aW9uLiBJZiBgY2FsbGJhY2tgIGlzIG51bGwsIHJlbW92ZXMgYWxsXG4gICAgLy8gY2FsbGJhY2tzIGZvciB0aGUgZXZlbnQuIElmIGBuYW1lYCBpcyBudWxsLCByZW1vdmVzIGFsbCBib3VuZFxuICAgIC8vIGNhbGxiYWNrcyBmb3IgYWxsIGV2ZW50cy5cbiAgICBvZmY6IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhZXZlbnRzQXBpKHRoaXMsICdvZmYnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGlmICghbmFtZSAmJiAhY2FsbGJhY2sgJiYgIWNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IGtleXModGhpcy5fZXZlbnRzKTtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjay5fY2FsbGJhY2spIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuIENhbGxiYWNrcyBhcmVcbiAgICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAgIC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuICAgIC8vIHJlY2VpdmUgdGhlIHRydWUgbmFtZSBvZiB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50KS5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGlmICghZXZlbnRzQXBpKHRoaXMsICd0cmlnZ2VyJywgbmFtZSwgYXJncykpIHJldHVybiB0aGlzO1xuICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgICAgaWYgKGV2ZW50cykgdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpO1xuICAgICAgICBpZiAoYWxsRXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGFsbEV2ZW50cywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGxpc3RlbmluZ1RvID0gdGhpcy5fbGlzdGVuaW5nVG87XG4gICAgICAgIGlmICghbGlzdGVuaW5nVG8pIHJldHVybiB0aGlzO1xuICAgICAgICB2YXIgcmVtb3ZlID0gIW5hbWUgJiYgIWNhbGxiYWNrO1xuICAgICAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgICBpZiAob2JqKSAobGlzdGVuaW5nVG8gPSB7fSlbb2JqLl9saXN0ZW5JZF0gPSBvYmo7XG4gICAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmluZ1RvKSB7XG4gICAgICAgICAgICBvYmogPSBsaXN0ZW5pbmdUb1tpZF07XG4gICAgICAgICAgICBvYmoub2ZmKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgICAgICAgIGlmIChyZW1vdmUgfHwgaXNFbXB0eShvYmouX2V2ZW50cykpIGRlbGV0ZSB0aGlzLl9saXN0ZW5pbmdUb1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIGV4dGVuZCBhbiBvYmplY3Qgd2l0aCBldmVudCBjYXBhYmlsaXRpZXMgaWYgcGFzc2VkXG4gICAgLy8gb3IganVzdCByZXR1cm4gYSBuZXcgb25lLlxuICAgIGNyZWF0ZUVtaXR0ZXI6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZChvYmogfHwge30sIEV2ZW50cyk7XG4gICAgfVxufTtcblxuXG4vLyBJbXBsZW1lbnQgZmFuY3kgZmVhdHVyZXMgb2YgdGhlIEV2ZW50cyBBUEkgc3VjaCBhcyBtdWx0aXBsZSBldmVudFxuLy8gbmFtZXMgYFwiY2hhbmdlIGJsdXJcImAgYW5kIGpRdWVyeS1zdHlsZSBldmVudCBtYXBzIGB7Y2hhbmdlOiBhY3Rpb259YFxuLy8gaW4gdGVybXMgb2YgdGhlIGV4aXN0aW5nIEFQSS5cbnZhciBldmVudHNBcGkgPSBmdW5jdGlvbihvYmosIGFjdGlvbiwgbmFtZSwgcmVzdCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtrZXksIG5hbWVba2V5XV0uY29uY2F0KHJlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cbiAgICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBvYmpbYWN0aW9uXS5hcHBseShvYmosIFtuYW1lc1tpXV0uY29uY2F0KHJlc3QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuLy8gdHJpZ2dlcmluZyBldmVudHMuIFRyaWVzIHRvIGtlZXAgdGhlIHVzdWFsIGNhc2VzIHNwZWVkeS5cbnZhciB0cmlnZ2VyRXZlbnRzID0gZnVuY3Rpb24oZXZlbnRzLCBhcmdzKSB7XG4gICAgdmFyIGV2O1xuICAgIHZhciBpID0gLTE7XG4gICAgdmFyIGwgPSBldmVudHMubGVuZ3RoO1xuICAgIHZhciBhMSA9IGFyZ3NbMF07XG4gICAgdmFyIGEyID0gYXJnc1sxXTtcbiAgICB2YXIgYTMgPSBhcmdzWzJdO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgICAgY2FzZSAxOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEpOyByZXR1cm47XG4gICAgICAgIGNhc2UgMjogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7IHJldHVybjtcbiAgICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgICAgZGVmYXVsdDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suYXBwbHkoZXYuY3R4LCBhcmdzKTsgcmV0dXJuO1xuICAgIH1cbn07XG5cbnZhciBsaXN0ZW5NZXRob2RzID0ge1xuICAgIGxpc3RlblRvOiAnb24nLCBcbiAgICBsaXN0ZW5Ub09uY2U6ICdvbmNlJ1xufTtcblxuLy8gSW52ZXJzaW9uLW9mLWNvbnRyb2wgdmVyc2lvbnMgb2YgYG9uYCBhbmQgYG9uY2VgLiBUZWxsICp0aGlzKiBvYmplY3QgdG9cbi8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3Ncbi8vIGxpc3RlbmluZyB0by5cbmVhY2gobGlzdGVuTWV0aG9kcywgZnVuY3Rpb24oaW1wbGVtZW50YXRpb24sIG1ldGhvZCkge1xuICAgIEV2ZW50c1ttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaywgcnVuKSB7XG4gICAgICAgIHZhciBsaXN0ZW5pbmdUbyA9IHRoaXMuX2xpc3RlbmluZ1RvIHx8ICh0aGlzLl9saXN0ZW5pbmdUbyA9IHt9KTtcbiAgICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5JZCB8fCAob2JqLl9saXN0ZW5JZCA9IHVuaXF1ZUlkKCdsJykpO1xuICAgICAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmo7XG4gICAgICAgIGlmICghY2FsbGJhY2sgJiYgdHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSBjYWxsYmFjayA9IHRoaXM7XG4gICAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0obmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufSk7XG5cbkV2ZW50cy5saXN0ZW5Ub0FuZFJ1biA9IGZ1bmN0aW9uIChvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgRXZlbnRzLmxpc3RlblRvLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICBjYWxsYmFjay5hcHBseSh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRzO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdhbXAtaXMtZnVuY3Rpb24nKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJ2FtcC1pcy1vYmplY3QnKTtcbnZhciBuYXRpdmVCaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgQ3RvciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmdW5jLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MsIGJvdW5kO1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSkgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIEN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBzZWxmID0gbmV3IEN0b3IoKTtcbiAgICAgICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xufTtcbiIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgZnVuYyA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cbi8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgYW4gSUUgMTEgYnVnLlxuaWYgKHR5cGVvZiAvLi8gIT09ICdmdW5jdGlvbicpIHtcbiAgICBmdW5jID0gZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuICEhb2JqICYmICh0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnKTtcbn07XG4iLCJ2YXIgb2JqS2V5cyA9IHJlcXVpcmUoJ2FtcC1rZXlzJyk7XG52YXIgY3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCdhbXAtY3JlYXRlLWNhbGxiYWNrJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA9PT0gK2xlbmd0aCkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqS2V5cyhvYmopO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTogXG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgY2FzZSAyOiBcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgICB9O1xuICAgIGNhc2UgMzogXG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICBjYXNlIDQ6IFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnYW1wLWlzLW9iamVjdCcpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHZhciBzb3VyY2UsIHByb3A7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufTtcbiIsInZhciBpc0FycmF5ID0gcmVxdWlyZSgnYW1wLWlzLWFycmF5Jyk7XG52YXIgaXNTdHJpbmcgPSByZXF1aXJlKCdhbXAtaXMtc3RyaW5nJyk7XG52YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCdhbXAtaXMtYXJndW1lbnRzJyk7XG52YXIgaXNOdW1iZXIgPSByZXF1aXJlKCdhbXAtaXMtbnVtYmVyJyk7XG52YXIgaXNOYW4gPSByZXF1aXJlKCdhbXAtaXMtbmFuJyk7XG52YXIga2V5cyA9IHJlcXVpcmUoJ2FtcC1rZXlzJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0VtcHR5KG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGlzQXJyYXkob2JqKSB8fCBpc1N0cmluZyhvYmopIHx8IGlzQXJndW1lbnRzKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGlmIChpc051bWJlcihvYmopKSByZXR1cm4gb2JqID09PSAwIHx8IGlzTmFuKG9iaik7XG4gICAgaWYgKGtleXMob2JqKS5sZW5ndGggIT09IDApIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgaXNBcmdzID0gZnVuY3Rpb24gaXNBcmdzKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuLy8gZm9yIElFIDw5XG5pZiAoIWlzQXJncyhhcmd1bWVudHMpKSB7XG4gICAgaXNBcmdzID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICYmIGhhc093bi5jYWxsKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmdzO1xuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBuYXRpdmVJc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsInZhciBpc051bWJlciA9IHJlcXVpcmUoJ2FtcC1pcy1udW1iZXInKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzTmFOKG9iaikge1xuICAgIHJldHVybiBpc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNOdW1iZXIob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XG59O1xuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCdhbXAtaGFzJyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJ2FtcC1pbmRleC1vZicpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnYW1wLWlzLW9iamVjdCcpO1xudmFyIG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cztcbnZhciBoYXNFbnVtQnVnID0gISh7dG9TdHJpbmc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbnZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ2NvbnN0cnVjdG9yJywgJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdoYXNPd25Qcm9wZXJ0eScsICd0b0xvY2FsZVN0cmluZyddO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykge1xuICAgICAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKGhhcyhvYmosIGtleSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgLy8gSUUgPCA5XG4gICAgaWYgKGhhc0VudW1CdWcpIHtcbiAgICAgICAgdmFyIG5vbkVudW1JZHggPSBub25FbnVtZXJhYmxlUHJvcHMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobm9uRW51bUlkeC0tKSB7XG4gICAgICAgICAgICB2YXIgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgICAgICAgIGlmIChoYXMob2JqLCBwcm9wKSAmJiBpbmRleE9mKHJlc3VsdCwgcHJvcCkgPT09IC0xKSByZXN1bHQucHVzaChwcm9wKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG4iLCJ2YXIgaXNOdW1iZXIgPSByZXF1aXJlKCdhbXAtaXMtbnVtYmVyJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmRleE9mKGFyciwgaXRlbSwgZnJvbSkge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbCA9IGFyciAmJiBhcnIubGVuZ3RoO1xuICAgIGlmIChpc051bWJlcihmcm9tKSkge1xuICAgICAgICBpID0gZnJvbSA8IDAgPyBNYXRoLm1heCgwLCBsICsgZnJvbSkgOiBmcm9tO1xuICAgIH1cbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGltaXRDYWxscyhmbiwgdGltZXMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aW1lcy0tID4gMCkge1xuICAgICAgICAgICAgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbn07XG4iLCJ2YXIgbGltaXRDYWxscyA9IHJlcXVpcmUoJ2FtcC1saW1pdC1jYWxscycpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25jZShmbikge1xuICAgIHJldHVybiBsaW1pdENhbGxzKGZuLCAxKTtcbn07XG4iLCIvKmdsb2JhbCB3aW5kb3csIGdsb2JhbCovXG52YXIgdGhlR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IGdsb2JhbDtcbmlmICghdGhlR2xvYmFsLl9fYW1wSWRDb3VudGVyKSB7XG4gICAgdGhlR2xvYmFsLl9fYW1wSWRDb3VudGVyID0gMDtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsrdGhlR2xvYmFsLl9fYW1wSWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG59O1xuIiwiKGZ1bmN0aW9uIENhbGNpdGUgKCkge1xuXG52YXIgY2FsY2l0ZSA9IHtcbiAgdmVyc2lvbjogJzAuMC45J1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIFV0aWxpdGllcyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG5jYWxjaXRlLmRvbSA9IHt9O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBET00gRXZlbnQgTWFuYWdlbWVudCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyByZXR1cm5zIHN0YW5kYXJkIGludGVyYWN0aW9uIGV2ZW50LCBsYXRlciB3aWxsIGFkZCB0b3VjaCBzdXBwb3J0XG5jYWxjaXRlLmRvbS5ldmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICdjbGljayc7XG59O1xuXG4vLyBhZGQgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBhbiBldmVudCBvbiBhIERPTSBub2RlXG5jYWxjaXRlLmRvbS5hZGRFdmVudCA9IGZ1bmN0aW9uIChkb21Ob2RlLCBldmVudCwgZm4pIHtcbiAgaWYgKGRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHJldHVybiBkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gIH1cbiAgaWYgKGRvbU5vZGUuYXR0YWNoRXZlbnQpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgfVxufTtcblxuLy8gcmVtb3ZlIGEgc3BlY2lmaWMgZnVuY3Rpb24gYmluZGluZyBmcm9tIGEgRE9NIG5vZGUgZXZlbnRcbmNhbGNpdGUuZG9tLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gKGRvbU5vZGUsIGV2ZW50LCBmbikge1xuICBpZiAoZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgcmV0dXJuIGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgfVxuICBpZiAoZG9tTm9kZS5kZXRhY2hFdmVudCkge1xuICAgIHJldHVybiBkb21Ob2RlLmRldGFjaEV2ZW50KCdvbicgKyBldmVudCwgIGZuKTtcbiAgfVxufTtcblxuLy8gZ2V0IHRoZSB0YXJnZXQgZWxlbWVudCBvZiBhbiBldmVudFxuY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFldmVudC50YXJnZXQpIHtcbiAgICByZXR1cm4gZXZlbnQuc3JjRWxlbWVudDtcbiAgfVxuICBpZiAoZXZlbnQudGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldDtcbiAgfVxufTtcblxuLy8gcHJldmVudCBkZWZhdWx0IGJlaGF2aW9yIG9mIGFuIGV2ZW50XG5jYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICByZXR1cm4gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBpZiAoZXZlbnQucmV0dXJuVmFsdWUpIHtcbiAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICB9XG59O1xuXG4vLyBzdG9wIGFuZCBldmVudCBmcm9tIGJ1YmJsaW5nIHVwIHRoZSBET00gdHJlZVxuY2FsY2l0ZS5kb20uc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xuICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgcmV0dXJuIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGlmIChldmVudC5jYW5jZWxCdWJibGUpIHtcbiAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBDbGFzcyBNYW5pcHVsYXRpb24g4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcblxuLy8gY2hlY2sgaWYgYW4gZWxlbWVudCBoYXMgYSBzcGVjaWZpYyBjbGFzc1xuY2FsY2l0ZS5kb20uaGFzQ2xhc3MgPSBmdW5jdGlvbiAoZG9tTm9kZSwgY2xhc3NOYW1lKSB7XG4gIHZhciBleHAgPSBuZXcgUmVnRXhwKCcgJyArIGNsYXNzTmFtZSArICcgJyk7XG4gIGlmIChleHAudGVzdCgnICcgKyBkb21Ob2RlLmNsYXNzTmFtZSArICcgJykpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIGFkZCBvbmUgb3IgbW9yZSBjbGFzc2VzIHRvIGFuIGVsZW1lbnRcbmNhbGNpdGUuZG9tLmFkZENsYXNzID0gZnVuY3Rpb24gKGRvbU5vZGUsIGNsYXNzZXMpIHtcbiAgY2xhc3NlcyA9IGNsYXNzZXMuc3BsaXQoJyAnKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIWNhbGNpdGUuZG9tLmhhc0NsYXNzKGRvbU5vZGUsIGNsYXNzZXNbaV0pKSB7XG4gICAgICBkb21Ob2RlLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc2VzW2ldO1xuICAgIH1cbiAgfVxufTtcblxuLy8gcmVtb3ZlIG9uZSBvciBtb3JlIGNsYXNzZXMgZnJvbSBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBjbGFzc2VzKSB7XG4gIGNsYXNzZXMgPSBjbGFzc2VzLnNwbGl0KCcgJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG5ld0NsYXNzID0gJyAnICsgZG9tTm9kZS5jbGFzc05hbWUucmVwbGFjZSggL1tcXHRcXHJcXG5dL2csICcgJykgKyAnICc7XG5cbiAgICBpZiAoY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZG9tTm9kZSwgY2xhc3Nlc1tpXSkpIHtcbiAgICAgIHdoaWxlIChuZXdDbGFzcy5pbmRleE9mKCcgJyArIGNsYXNzZXNbaV0gKyAnICcpID49IDApIHtcbiAgICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKCcgJyArIGNsYXNzZXNbaV0gKyAnICcsICcgJyk7XG4gICAgICB9XG5cbiAgICAgIGRvbU5vZGUuY2xhc3NOYW1lID0gbmV3Q2xhc3MucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgIH1cbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRE9NIFRyYXZlcnNhbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyByZXR1cm5zIGNsb3Nlc3QgZWxlbWVudCB1cCB0aGUgRE9NIHRyZWUgbWF0Y2hpbmcgYSBnaXZlbiBjbGFzc1xuY2FsY2l0ZS5kb20uY2xvc2VzdCA9IGZ1bmN0aW9uIChjbGFzc05hbWUsIGNvbnRleHQpIHtcbiAgdmFyIHJlc3VsdCwgY3VycmVudDtcbiAgZm9yIChjdXJyZW50ID0gY29udGV4dDsgY3VycmVudDsgY3VycmVudCA9IGN1cnJlbnQucGFyZW50Tm9kZSkge1xuICAgIGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSAxICYmIGNhbGNpdGUuZG9tLmhhc0NsYXNzKGN1cnJlbnQsIGNsYXNzTmFtZSkpIHtcbiAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnQ7XG59O1xuXG4vLyBnZXQgYW4gYXR0cmlidXRlIGZvciBhbiBlbGVtZW50XG5jYWxjaXRlLmRvbS5nZXRBdHRyID0gZnVuY3Rpb24oZG9tTm9kZSwgYXR0cikge1xuICBpZiAoZG9tTm9kZS5nZXRBdHRyaWJ1dGUpIHtcbiAgICByZXR1cm4gZG9tTm9kZS5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gIH1cblxuICB2YXIgcmVzdWx0O1xuICB2YXIgYXR0cnMgPSBkb21Ob2RlLmF0dHJpYnV0ZXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhdHRyc1tpXS5ub2RlTmFtZSA9PT0gYXR0cikge1xuICAgICAgcmVzdWx0ID0gYXR0cnNbaV0ubm9kZVZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBPYmplY3QgQ29udmVyc2lvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuXG4vLyB0dXJuIGEgZG9tTm9kZUxpc3QgaW50byBhbiBhcnJheVxuY2FsY2l0ZS5kb20ubm9kZUxpc3RUb0FycmF5ID0gZnVuY3Rpb24gKGRvbU5vZGVMaXN0KSB7XG4gIHZhciBhcnJheSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRvbU5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXkucHVzaChkb21Ob2RlTGlzdFtpXSk7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQXJyYXkgTWFuaXB1bGF0aW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG5cbmNhbGNpdGUuYXJyID0ge307XG5cbi8vIHJldHVybiB0aGUgaW5kZXggb2YgYW4gb2JqZWN0IGluIGFuIGFycmF5IHdpdGggb3B0aW9uYWwgb2Zmc2V0XG5jYWxjaXRlLmFyci5pbmRleE9mID0gZnVuY3Rpb24gKG9iaiwgYXJyLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBvZmZzZXQgfHwgMDtcblxuICBpZiAoYXJyLmluZGV4T2YpIHtcbiAgICByZXR1cm4gYXJyLmluZGV4T2Yob2JqLCBpKTtcbiAgfVxuXG4gIGZvciAoaTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQnJvd3NlciBGZWF0dXJlIERldGVjdGlvbiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gZGV0ZWN0IGZlYXR1cmVzIGxpa2UgdG91Y2gsIGllLCBldGMuXG5cbmNhbGNpdGUuYnJvd3NlciA9IHt9O1xuXG4vLyBkZXRlY3QgdG91Y2gsIGNvdWxkIGJlIGltcHJvdmVkIGZvciBtb3JlIGNvdmVyYWdlXG5jYWxjaXRlLmJyb3dzZXIuaXNUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgSlMgUGF0dGVybnMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIGphdmFzY3JpcHQgbG9naWMgZm9yIHVpIHBhdHRlcm5zXG5cbmZ1bmN0aW9uIGZpbmRFbGVtZW50cyAoY2xhc3NOYW1lKSB7XG4gIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2xhc3NOYW1lKTtcbiAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBjYWxjaXRlLmRvbS5ub2RlTGlzdFRvQXJyYXkoZWxlbWVudHMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vLyByZW1vdmUgJ2lzLWFjdGl2ZScgY2xhc3MgZnJvbSBldmVyeSBlbGVtZW50IGluIGFuIGFycmF5XG5mdW5jdGlvbiByZW1vdmVBY3RpdmUgKGFycmF5KSB7XG4gIGlmICh0eXBlb2YgYXJyYXkgPT0gJ29iamVjdCcpIHtcbiAgICBhcnJheSA9IGNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheShhcnJheSk7XG4gIH1cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIGNhbGNpdGUuZG9tLnJlbW92ZUNsYXNzKGl0ZW0sICdpcy1hY3RpdmUnKTtcbiAgfSk7XG59XG5cbi8vIHJlbW92ZSAnaXMtYWN0aXZlJyBmcm9tIGFycmF5LCBhZGQgdG8gZWxlbWVudFxuZnVuY3Rpb24gdG9nZ2xlQWN0aXZlIChhcnJheSwgZWwpIHtcbiAgdmFyIGlzQWN0aXZlID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZWwsICdpcy1hY3RpdmUnKTtcbiAgaWYgKGlzQWN0aXZlKSB7XG4gICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZWwsICdpcy1hY3RpdmUnKTtcbiAgfSBlbHNlIHtcbiAgICByZW1vdmVBY3RpdmUoYXJyYXkpO1xuICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKGVsLCAnaXMtYWN0aXZlJyk7XG4gIH1cbn1cblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQWNjb3JkaW9uIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBjb2xsYXBzaWJsZSBhY2NvcmRpb24gbGlzdFxuXG5jYWxjaXRlLmFjY29yZGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjY29yZGlvbnMgPSBmaW5kRWxlbWVudHMoJy5qcy1hY2NvcmRpb24nKTtcblxuICBpZiAoIWFjY29yZGlvbnMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFjY29yZGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBhY2NvcmRpb25zW2ldLmNoaWxkcmVuO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KGNoaWxkcmVuW2pdLCBjYWxjaXRlLmRvbS5ldmVudCgpLCB0b2dnbGVBY2NvcmRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZUFjY29yZGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgcGFyZW50ID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnYWNjb3JkaW9uLXNlY3Rpb24nLCBjYWxjaXRlLmRvbS5ldmVudFRhcmdldChldmVudCkpO1xuICAgIGlmIChjYWxjaXRlLmRvbS5oYXNDbGFzcyhwYXJlbnQsICdpcy1hY3RpdmUnKSkge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MocGFyZW50LCAnaXMtYWN0aXZlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZENsYXNzKHBhcmVudCwgJ2lzLWFjdGl2ZScpO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBDYXJvdXNlbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBjYXJvdXNlbCB3aXRoIGFueSBudW1iZXIgb2Ygc2xpZGVzXG5cbmNhbGNpdGUuY2Fyb3VzZWwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGNhcm91c2VscyA9IGZpbmRFbGVtZW50cygnLmpzLWNhcm91c2VsJyk7XG5cbiAgaWYgKCFjYXJvdXNlbHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcm91c2Vscy5sZW5ndGg7IGkrKykge1xuXG4gICAgdmFyIGNhcm91c2VsID0gY2Fyb3VzZWxzW2ldO1xuICAgIHZhciB3cmFwcGVyID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlcycpWzBdO1xuICAgIHZhciBzbGlkZXMgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUnKTtcbiAgICB2YXIgdG9nZ2xlcyA9IGNhbGNpdGUuZG9tLm5vZGVMaXN0VG9BcnJheShjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2Fyb3VzZWwtbGluaycpKTtcblxuICAgIHdyYXBwZXIuc3R5bGUud2lkdGggPSBzbGlkZXMubGVuZ3RoICogMTAwICsgJyUnO1xuXG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3Moc2xpZGVzWzBdLCAnaXMtYWN0aXZlJyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY2Fyb3VzZWwsICdpcy1maXJzdC1zbGlkZScpO1xuXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBzbGlkZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgIHNsaWRlc1trXS5zdHlsZS53aWR0aCA9IDEwMCAvIHNsaWRlcy5sZW5ndGggKyAnJSc7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0b2dnbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0b2dnbGVzW2pdLCBjYWxjaXRlLmRvbS5ldmVudCgpLCB0b2dnbGVTbGlkZSk7XG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVTbGlkZSAoZSkge1xuICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGUpO1xuICAgIHZhciBsaW5rID0gY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZSk7XG4gICAgdmFyIGluZGV4ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cihsaW5rLCAnZGF0YS1zbGlkZScpO1xuICAgIHZhciBjYXJvdXNlbCA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2Nhcm91c2VsJywgbGluayk7XG4gICAgdmFyIGN1cnJlbnQgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuY2Fyb3VzZWwtc2xpZGUuaXMtYWN0aXZlJylbMF07XG4gICAgdmFyIHNsaWRlcyA9IGNhcm91c2VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJvdXNlbC1zbGlkZScpO1xuICAgIHZhciB3cmFwcGVyID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmNhcm91c2VsLXNsaWRlcycpWzBdO1xuXG4gICAgaWYgKGluZGV4ID09ICdwcmV2Jykge1xuICAgICAgaW5kZXggPSBjYWxjaXRlLmFyci5pbmRleE9mKGN1cnJlbnQsIHNsaWRlcyk7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHsgaW5kZXggPSAxOyB9XG4gICAgfSBlbHNlIGlmIChpbmRleCA9PSAnbmV4dCcpIHtcbiAgICAgIGluZGV4ID0gY2FsY2l0ZS5hcnIuaW5kZXhPZihjdXJyZW50LCBzbGlkZXMpICsgMjtcbiAgICAgIGlmIChpbmRleCA+IHNsaWRlcy5sZW5ndGgpIHsgaW5kZXggPSBzbGlkZXMubGVuZ3RoOyB9XG4gICAgfVxuXG4gICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoY2Fyb3VzZWwsICdpcy1maXJzdC1zbGlkZSBpcy1sYXN0LXNsaWRlJyk7XG5cbiAgICBpZiAoaW5kZXggPT0gc2xpZGVzLmxlbmd0aCkgeyBjYWxjaXRlLmRvbS5hZGRDbGFzcyhjYXJvdXNlbCwgJ2lzLWxhc3Qtc2xpZGUnKTsgfVxuICAgIGlmIChpbmRleCA9PSAxKSB7IGNhbGNpdGUuZG9tLmFkZENsYXNzKGNhcm91c2VsLCAnaXMtZmlyc3Qtc2xpZGUnKTsgfVxuXG4gICAgcmVtb3ZlQWN0aXZlKHNsaWRlcyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3Moc2xpZGVzW2luZGV4IC0gMV0sICdpcy1hY3RpdmUnKTtcbiAgICB2YXIgb2Zmc2V0ID0gKGluZGV4IC0gMSkvc2xpZGVzLmxlbmd0aCAqIC0xMDAgKyAnJSc7XG4gICAgd3JhcHBlci5zdHlsZS50cmFuc2Zvcm09ICd0cmFuc2xhdGUzZCgnICsgb2Zmc2V0ICsgJywwLDApJztcbiAgfVxuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBEcm9wZG93biDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBkcm9wZG93biBtZW51c1xuXG5jYWxjaXRlLmRyb3Bkb3duID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtZHJvcGRvd24tdG9nZ2xlJyk7XG4gIHZhciBkcm9wZG93bnMgPSBmaW5kRWxlbWVudHMoJy5qcy1kcm9wZG93bicpO1xuXG4gIGlmICghZHJvcGRvd25zKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VBbGxEcm9wZG93bnMgKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJvcGRvd25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhkcm9wZG93bnNbaV0sICdpcy1hY3RpdmUnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVEcm9wZG93biAoZHJvcGRvd24pIHtcbiAgICB2YXIgaXNBY3RpdmUgPSBjYWxjaXRlLmRvbS5oYXNDbGFzcyhkcm9wZG93biwgJ2lzLWFjdGl2ZScpO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsY2l0ZS5kb20uc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBjbG9zZUFsbERyb3Bkb3ducygpO1xuICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZHJvcGRvd24sICdpcy1hY3RpdmUnKTtcbiAgICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KGRvY3VtZW50LmJvZHksIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsb3NlQWxsRHJvcGRvd25zKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRHJvcGRvd24gKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciBkcm9wZG93biA9IGNhbGNpdGUuZG9tLmNsb3Nlc3QoJ2pzLWRyb3Bkb3duJywgdG9nZ2xlKTtcbiAgICAgIHRvZ2dsZURyb3Bkb3duKGRyb3Bkb3duKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmREcm9wZG93bih0b2dnbGVzW2ldKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRHJhd2VyIOKUglxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4vLyBzaG93IGFuZCBoaWRlIGRyYXdlcnNcbmNhbGNpdGUuZHJhd2VyID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b2dnbGVzID0gZmluZEVsZW1lbnRzKCcuanMtZHJhd2VyLXRvZ2dsZScpO1xuICB2YXIgZHJhd2VycyA9IGZpbmRFbGVtZW50cygnLmpzLWRyYXdlcicpO1xuXG4gIGlmICghZHJhd2Vycykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciB0YXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtZHJhd2VyJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRyYXdlciA9IGRyYXdlcnNbaV07XG4gICAgICAgIHZhciBpc1RhcmdldCA9IGNhbGNpdGUuZG9tLmdldEF0dHIoZHJhd2Vyc1tpXSwgJ2RhdGEtZHJhd2VyJyk7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gaXNUYXJnZXQpIHtcbiAgICAgICAgIHRvZ2dsZUFjdGl2ZShkcmF3ZXJzLCBkcmF3ZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kRHJhd2VyIChkcmF3ZXIpIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudChkcmF3ZXIsIGNhbGNpdGUuZG9tLmV2ZW50KCksIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0b2dnbGVBY3RpdmUoZHJhd2VycywgZHJhd2VyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9nZ2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmRUb2dnbGUodG9nZ2xlc1tpXSk7XG4gIH1cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBkcmF3ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgYmluZERyYXdlcihkcmF3ZXJzW2pdKTtcbiAgfVxufTtcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgRXhwYW5kaW5nIE5hdiDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBleGFuZGluZyBuYXYgbG9jYXRlZCB1bmRlciB0b3BuYXZcbmNhbGNpdGUuZXhwYW5kaW5nTmF2ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLWV4cGFuZGluZy10b2dnbGUnKTtcbiAgdmFyIGV4cGFuZGVycyA9IGZpbmRFbGVtZW50cygnLmpzLWV4cGFuZGluZycpO1xuXG4gIGlmICghZXhwYW5kZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZFRvZ2dsZSAodG9nZ2xlKSB7XG4gICAgY2FsY2l0ZS5kb20uYWRkRXZlbnQodG9nZ2xlLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuXG4gICAgICB2YXIgc2VjdGlvbk5hbWUgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtZXhwYW5kaW5nLW5hdicpO1xuICAgICAgdmFyIHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWV4cGFuZGluZy1uYXYnKTtcbiAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWV4cGFuZGluZy1uYXZbZGF0YS1leHBhbmRpbmctbmF2PVwiJyArIHNlY3Rpb25OYW1lICsgJ1wiXScpWzBdO1xuICAgICAgdmFyIGV4cGFuZGVyID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtZXhwYW5kaW5nJywgc2VjdGlvbik7XG4gICAgICB2YXIgaXNPcGVuID0gY2FsY2l0ZS5kb20uaGFzQ2xhc3MoZXhwYW5kZXIsICdpcy1hY3RpdmUnKTtcbiAgICAgIHZhciBzaG91bGRDbG9zZSA9IGNhbGNpdGUuZG9tLmhhc0NsYXNzKHNlY3Rpb24sICdpcy1hY3RpdmUnKTtcblxuICAgICAgaWYgKGlzT3Blbikge1xuICAgICAgICBpZiAoc2hvdWxkQ2xvc2UpIHtcbiAgICAgICAgICBjYWxjaXRlLmRvbS5yZW1vdmVDbGFzcyhleHBhbmRlciwgJ2lzLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHRvZ2dsZUFjdGl2ZShzZWN0aW9ucywgc2VjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2dnbGVBY3RpdmUoc2VjdGlvbnMsIHNlY3Rpb24pO1xuICAgICAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhleHBhbmRlciwgJ2lzLWFjdGl2ZScpO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRvZ2dsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5kVG9nZ2xlKHRvZ2dsZXNbaV0pO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBNb2RhbCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc2hvdyBhbmQgaGlkZSBtb2RhbCBkaWFsb2d1ZXNcblxuY2FsY2l0ZS5tb2RhbCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9nZ2xlcyA9IGZpbmRFbGVtZW50cygnLmpzLW1vZGFsLXRvZ2dsZScpO1xuICB2YXIgbW9kYWxzID0gZmluZEVsZW1lbnRzKCcuanMtbW9kYWwnKTtcblxuICBpZiAoIW1vZGFscykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmRUb2dnbGUgKHRvZ2dsZSkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KHRvZ2dsZSwgY2FsY2l0ZS5kb20uZXZlbnQoKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNhbGNpdGUuZG9tLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgIHZhciB0YXJnZXQgPSBjYWxjaXRlLmRvbS5nZXRBdHRyKHRvZ2dsZSwgJ2RhdGEtbW9kYWwnKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBtb2RhbCA9IG1vZGFsc1tpXTtcbiAgICAgICAgdmFyIGlzVGFyZ2V0ID0gY2FsY2l0ZS5kb20uZ2V0QXR0cihtb2RhbHNbaV0sICdkYXRhLW1vZGFsJyk7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gaXNUYXJnZXQpIHtcbiAgICAgICAgIHRvZ2dsZUFjdGl2ZShtb2RhbHMsIG1vZGFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZE1vZGFsIChtb2RhbCkge1xuICAgIGNhbGNpdGUuZG9tLmFkZEV2ZW50KG1vZGFsLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY2FsY2l0ZS5kb20ucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgdG9nZ2xlQWN0aXZlKG1vZGFscywgbW9kYWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZFRvZ2dsZSh0b2dnbGVzW2ldKTtcbiAgfVxuICBmb3IgKHZhciBqID0gMDsgaiA8IG1vZGFscy5sZW5ndGg7IGorKykge1xuICAgIGJpbmRNb2RhbChtb2RhbHNbal0pO1xuICB9XG59O1xuXG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIFRhYnMg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilJhcbi8vIHRhYmJlZCBjb250ZW50IHBhbmVcblxuY2FsY2l0ZS50YWJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGFicyA9IGZpbmRFbGVtZW50cygnLmpzLXRhYicpO1xuICB2YXIgdGFiR3JvdXBzID0gZmluZEVsZW1lbnRzKCcuanMtdGFiLWdyb3VwJyk7XG5cbiAgaWYgKCF0YWJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gc2V0IG1heCB3aWR0aCBmb3IgZWFjaCB0YWJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCB0YWJHcm91cHMubGVuZ3RoOyBqKyspIHtcbiAgICB2YXIgdGFic0luR3JvdXAgPSB0YWJHcm91cHNbal0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRhYicpO1xuICAgIHZhciBwZXJjZW50ID0gMTAwIC8gdGFic0luR3JvdXAubGVuZ3RoO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGFic0luR3JvdXAubGVuZ3RoOyBrKyspe1xuICAgICAgdGFic0luR3JvdXBba10uc3R5bGUubWF4V2lkdGggPSBwZXJjZW50ICsgJyUnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN3aXRjaFRhYiAoZXZlbnQpIHtcbiAgICBjYWxjaXRlLmRvbS5wcmV2ZW50RGVmYXVsdChldmVudCk7XG5cbiAgICB2YXIgdGFiID0gY2FsY2l0ZS5kb20uY2xvc2VzdCgnanMtdGFiJywgY2FsY2l0ZS5kb20uZXZlbnRUYXJnZXQoZXZlbnQpKTtcbiAgICB2YXIgdGFiR3JvdXAgPSBjYWxjaXRlLmRvbS5jbG9zZXN0KCdqcy10YWItZ3JvdXAnLCB0YWIpO1xuICAgIHZhciB0YWJzID0gdGFiR3JvdXAucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRhYicpO1xuICAgIHZhciBjb250ZW50cyA9IHRhYkdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10YWItc2VjdGlvbicpO1xuICAgIHZhciBpbmRleCA9IGNhbGNpdGUuYXJyLmluZGV4T2YodGFiLCB0YWJzKTtcblxuICAgIHJlbW92ZUFjdGl2ZSh0YWJzKTtcbiAgICByZW1vdmVBY3RpdmUoY29udGVudHMpO1xuXG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3ModGFiLCAnaXMtYWN0aXZlJyk7XG4gICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoY29udGVudHNbaW5kZXhdLCAnaXMtYWN0aXZlJyk7XG4gIH1cblxuICAvLyBhdHRhY2ggdGhlIHN3aXRjaFRhYiBldmVudCB0byBhbGwgdGFic1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRFdmVudCh0YWJzW2ldLCBjYWxjaXRlLmRvbS5ldmVudCgpLCBzd2l0Y2hUYWIpO1xuICB9XG5cbn07XG5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuLy8g4pSCIFN0aWNreSDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gc3RpY2tzIHRoaW5ncyB0byB0aGUgd2luZG93XG5cbmNhbGNpdGUuc3RpY2t5ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZWxlbWVudHMgPSBmaW5kRWxlbWVudHMoJy5qcy1zdGlja3knKTtcblxuICBpZiAoIWVsZW1lbnRzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHN0aWNraWVzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IGVsZW1lbnRzW2ldO1xuICAgIHZhciB0b3AgPSBlbC5vZmZzZXRUb3A7XG4gICAgaWYgKGVsLmRhdGFzZXQudG9wKSB7XG4gICAgICB0b3AgPSB0b3AgLSBwYXJzZUludChlbC5kYXRhc2V0LnRvcCwgMCk7XG4gICAgfVxuICAgIHN0aWNraWVzLnB1c2goe1xuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgIHRvcDogdG9wLFxuICAgICAgc2hpbTogZWwuY2xvbmVOb2RlKCdkZWVwJyksXG4gICAgICBlbGVtZW50OiBlbFxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGl0ZW0sIG9mZnNldCkge1xuICAgIHZhciBlbGVtID0gaXRlbS5lbGVtZW50O1xuICAgIHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgdmFyIGRpc3RhbmNlID0gaXRlbS50b3AgLSBvZmZzZXQ7XG5cbiAgICBpZiAoZGlzdGFuY2UgPCAxICYmICFpdGVtLmFjdGl2ZSkge1xuICAgICAgaXRlbS5zaGltLnN0eWxlLnZpc2libGl0eSA9ICdoaWRkZW4nO1xuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShpdGVtLnNoaW0sIGVsZW0pO1xuICAgICAgY2FsY2l0ZS5kb20uYWRkQ2xhc3MoZWxlbSwgJ2lzLXN0aWNreScpO1xuICAgICAgaXRlbS5hY3RpdmUgPSB0cnVlO1xuICAgICAgZWxlbS5zdHlsZS50b3AgPSBlbGVtLmRhdGFzZXQudG9wICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKGl0ZW0uYWN0aXZlICYmIG9mZnNldCA8IGl0ZW0udG9wKXtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtLnNoaW0pO1xuICAgICAgY2FsY2l0ZS5kb20ucmVtb3ZlQ2xhc3MoZWxlbSwgJ2lzLXN0aWNreScpO1xuICAgICAgZWxlbS5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgaXRlbS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjYWxjaXRlLmRvbS5hZGRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RpY2tpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhbmRsZVNjcm9sbChzdGlja2llc1tpXSwgb2Zmc2V0KTtcbiAgICB9XG4gIH0pO1xuXG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBJbml0aWFsaXplIENhbGNpdGUg4pSCXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbi8vIHN0YXJ0IHVwIENhbGNpdGUgYW5kIGF0dGFjaCBhbGwgdGhlIHBhdHRlcm5zXG4vLyBvcHRpb25hbGx5IHBhc3MgYW4gYXJyYXkgb2YgcGF0dGVybnMgeW91J2QgbGlrZSB0byB3YXRjaFxuXG5jYWxjaXRlLmluaXQgPSBmdW5jdGlvbiAocGF0dGVybnMpIHtcbiAgaWYgKHBhdHRlcm5zKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXR0ZXJucy5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsY2l0ZVtwYXR0ZXJuc1tpXV0oKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2FsY2l0ZS5tb2RhbCgpO1xuICAgIGNhbGNpdGUuZHJvcGRvd24oKTtcbiAgICBjYWxjaXRlLmRyYXdlcigpO1xuICAgIGNhbGNpdGUuZXhwYW5kaW5nTmF2KCk7XG4gICAgY2FsY2l0ZS50YWJzKCk7XG4gICAgY2FsY2l0ZS5hY2NvcmRpb24oKTtcbiAgICBjYWxjaXRlLmNhcm91c2VsKCk7XG4gICAgY2FsY2l0ZS5zdGlja3koKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRvdWNoIGNsYXNzIHRvIHRoZSBib2R5XG4gIGlmICggY2FsY2l0ZS5icm93c2VyLmlzVG91Y2goKSApIHtcbiAgICBjYWxjaXRlLmRvbS5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAnY2FsY2l0ZS10b3VjaCcpO1xuICB9XG59O1xuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbi8vIOKUgiBFeHBvc2UgQ2FsY2l0ZS5qcyDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gaW1wbGVtZW50YXRpb24gYm9ycm93ZWQgZnJvbSBMZWFmbGV0XG5cbi8vIGRlZmluZSBjYWxjaXRlIGFzIGEgZ2xvYmFsIHZhcmlhYmxlLCBzYXZpbmcgdGhlIG9yaWdpbmFsIHRvIHJlc3RvcmUgbGF0ZXIgaWYgbmVlZGVkXG5mdW5jdGlvbiBleHBvc2UgKCkge1xuICB2YXIgb2xkQ2FsY2l0ZSA9IHdpbmRvdy5jYWxjaXRlO1xuXG4gIGNhbGNpdGUubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuY2FsY2l0ZSA9IG9sZENhbGNpdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgd2luZG93LmNhbGNpdGUgPSBjYWxjaXRlO1xufVxuXG4vLyBubyBOUE0vQU1EIGZvciBub3cgYmVjYXVzZSBpdCBqdXN0IGNhdXNlcyBpc3N1ZXNcbi8vIEBUT0RPOiBidXN0IHRoZW0gaW50byBBTUQgJiBOUE0gZGlzdHJvc1xuXG4vLyAvLyBkZWZpbmUgQ2FsY2l0ZSBmb3IgQ29tbW9uSlMgbW9kdWxlIHBhdHRlcm4gbG9hZGVycyAoTlBNLCBCcm93c2VyaWZ5KVxuLy8gaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbi8vICAgbW9kdWxlLmV4cG9ydHMgPSBjYWxjaXRlO1xuLy8gfVxuXG4vLyAvLyBkZWZpbmUgQ2FsY2l0ZSBhcyBhbiBBTUQgbW9kdWxlXG4vLyBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbi8vICAgZGVmaW5lKGNhbGNpdGUpO1xuLy8gfVxuXG5leHBvc2UoKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGRpZmZjb3VudDtcblxuICB2YXIgQUREX0FUVFJJQlVURSA9IDAsXG4gICAgTU9ESUZZX0FUVFJJQlVURSA9IDEsXG4gICAgUkVNT1ZFX0FUVFJJQlVURSA9IDIsXG4gICAgTU9ESUZZX1RFWFRfRUxFTUVOVCA9IDMsXG4gICAgUkVMT0NBVEVfR1JPVVAgPSA0LFxuICAgIFJFTU9WRV9FTEVNRU5UID0gNSxcbiAgICBBRERfRUxFTUVOVCA9IDYsXG4gICAgUkVNT1ZFX1RFWFRfRUxFTUVOVCA9IDcsXG4gICAgQUREX1RFWFRfRUxFTUVOVCA9IDgsXG4gICAgUkVQTEFDRV9FTEVNRU5UID0gOSxcbiAgICBNT0RJRllfVkFMVUUgPSAxMCxcbiAgICBNT0RJRllfQ0hFQ0tFRCA9IDExLFxuICAgIE1PRElGWV9TRUxFQ1RFRCA9IDEyLFxuICAgIE1PRElGWV9EQVRBID0gMTMsXG4gICAgQUNUSU9OID0gMTQsXG4gICAgUk9VVEUgPSAxNSxcbiAgICBPTERfVkFMVUUgPSAxNixcbiAgICBORVdfVkFMVUUgPSAxNyxcbiAgICBFTEVNRU5UID0gMTgsXG4gICAgR1JPVVAgPSAxOSxcbiAgICBGUk9NID0gMjAsXG4gICAgVE8gPSAyMSxcbiAgICBOQU1FID0gMjIsXG4gICAgVkFMVUUgPSAyMyxcbiAgICBURVhUID0gMjQsXG4gICAgQVRUUklCVVRFUyA9IDI1LFxuICAgIE5PREVfTkFNRSA9IDI2LFxuICAgIENPTU1FTlQgPSAyNyxcbiAgICBDSElMRF9OT0RFUyA9IDI4LFxuICAgIENIRUNLRUQgPSAyOSxcbiAgICBTRUxFQ1RFRCA9IDMwO1xuXG4gIHZhciBEaWZmID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgZGlmZiA9IHRoaXM7XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICBkaWZmW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG4gICAgfSk7XG4gIH1cbiAgRGlmZi5wcm90b3R5cGUgPSB7XG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIFN1YnNldE1hcHBpbmcgPSBmdW5jdGlvbiBTdWJzZXRNYXBwaW5nKGEsIGIpIHtcbiAgICB0aGlzW1wib2xkXCJdID0gYTtcbiAgICB0aGlzW1wibmV3XCJdID0gYjtcbiAgfTtcblxuICBTdWJzZXRNYXBwaW5nLnByb3RvdHlwZSA9IHtcbiAgICBjb250YWluczogZnVuY3Rpb24gY29udGFpbnMoc3Vic2V0KSB7XG4gICAgICBpZiAoc3Vic2V0Lmxlbmd0aCA8IHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdWJzZXRbXCJuZXdcIl0gPj0gdGhpc1tcIm5ld1wiXSAmJiBzdWJzZXRbXCJuZXdcIl0gPCB0aGlzW1wibmV3XCJdICsgdGhpcy5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICB0b1N0cmluZzogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5sZW5ndGggKyBcIiBlbGVtZW50IHN1YnNldCwgZmlyc3QgbWFwcGluZzogb2xkIFwiICsgdGhpc1tcIm9sZFwiXSArIFwiIOKGkiBuZXcgXCIgKyB0aGlzW1wibmV3XCJdO1xuICAgIH1cbiAgfTtcblxuICB2YXIgcm91Z2hseUVxdWFsID0gZnVuY3Rpb24gcm91Z2hseUVxdWFsKGUxLCBlMiwgcHJldmVudFJlY3Vyc2lvbikge1xuICAgIGlmICghZTEgfHwgIWUyKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGUxLm5vZGVUeXBlICE9PSBlMi5ub2RlVHlwZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlMS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgaWYgKGUyLm5vZGVUeXBlICE9PSAzKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBOb3RlIHRoYXQgd2UgaW5pdGlhbGx5IGRvbid0IGNhcmUgd2hhdCB0aGUgdGV4dCBjb250ZW50IG9mIGEgbm9kZSBpcyxcbiAgICAgIC8vIHRoZSBtZXJlIGZhY3QgdGhhdCBpdCdzIHRoZSBzYW1lIHRhZyBhbmQgXCJoYXMgdGV4dFwiIG1lYW5zIGl0J3Mgcm91Z2hseVxuICAgICAgLy8gZXF1YWwsIGFuZCB0aGVuIHdlIGNhbiBmaW5kIG91dCB0aGUgdHJ1ZSB0ZXh0IGRpZmZlcmVuY2UgbGF0ZXIuXG4gICAgICByZXR1cm4gcHJldmVudFJlY3Vyc2lvbiA/IHRydWUgOiBlMS5kYXRhID09PSBlMi5kYXRhO1xuICAgIH1cbiAgICBpZiAoZTEubm9kZU5hbWUgIT09IGUyLm5vZGVOYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGUxLmNoaWxkTm9kZXMubGVuZ3RoICE9PSBlMi5jaGlsZE5vZGVzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciB0aGVzYW1lID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gZTEuY2hpbGROb2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHByZXZlbnRSZWN1cnNpb24pIHtcbiAgICAgICAgdGhlc2FtZSA9IHRoZXNhbWUgJiYgKGUxLmNoaWxkTm9kZXNbaV0ubm9kZU5hbWUgPT09IGUyLmNoaWxkTm9kZXNbaV0ubm9kZU5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90ZTogd2Ugb25seSBhbGxvdyBvbmUgbGV2ZWwgb2YgcmVjdXJzaW9uIGF0IGFueSBkZXB0aC4gSWYgJ3ByZXZlbnRSZWN1cnNpb24nXG4gICAgICAgIC8vICAgICAgIHdhcyBub3Qgc2V0LCB3ZSBtdXN0IGV4cGxpY2l0bHkgZm9yY2UgaXQgdG8gdHJ1ZSBmb3IgY2hpbGQgaXRlcmF0aW9ucy5cbiAgICAgICAgdGhlc2FtZSA9IHRoZXNhbWUgJiYgcm91Z2hseUVxdWFsKGUxLmNoaWxkTm9kZXNbaV0sIGUyLmNoaWxkTm9kZXNbaV0sIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhlc2FtZTtcbiAgfTtcblxuXG4gIHZhciBjbGVhbkNsb25lTm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgLy8gQ2xvbmUgYSBub2RlIHdpdGggY29udGVudHMgYW5kIGFkZCB2YWx1ZXMgbWFudWFsbHksXG4gICAgLy8gdG8gYXZvaWQgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjMwMzA3XG4gICAgdmFyIGNsb25lZE5vZGUgPSBub2RlLmNsb25lTm9kZSh0cnVlKSxcbiAgICAgIHRleHRhcmVhcywgY2xvbmVkVGV4dGFyZWFzLCBvcHRpb25zLCBjbG9uZWRPcHRpb25zLCBpO1xuXG4gICAgaWYgKG5vZGUubm9kZVR5cGUgIT0gOCAmJiBub2RlLm5vZGVUeXBlICE9IDMpIHtcblxuICAgICAgdGV4dGFyZWFzID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCd0ZXh0YXJlYScpO1xuICAgICAgY2xvbmVkVGV4dGFyZWFzID0gY2xvbmVkTm9kZS5xdWVyeVNlbGVjdG9yQWxsKCd0ZXh0YXJlYScpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRleHRhcmVhcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2xvbmVkVGV4dGFyZWFzW2ldLnZhbHVlICE9PSB0ZXh0YXJlYXNbaV0udmFsdWUpIHtcbiAgICAgICAgICBjbG9uZWRUZXh0YXJlYXNbaV0udmFsdWUgPSB0ZXh0YXJlYXNbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnZhbHVlICYmIChub2RlLnZhbHVlICE9PSBjbG9uZWROb2RlLnZhbHVlKSkge1xuICAgICAgICBjbG9uZWROb2RlLnZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpO1xuICAgICAgY2xvbmVkT3B0aW9ucyA9IGNsb25lZE5vZGUucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uJyk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob3B0aW9uc1tpXS5zZWxlY3RlZCAmJiAhKGNsb25lZE9wdGlvbnNbaV0uc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgY2xvbmVkT3B0aW9uc1tpXS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIShvcHRpb25zW2ldLnNlbGVjdGVkKSAmJiBjbG9uZWRPcHRpb25zW2ldLnNlbGVjdGVkKSB7XG4gICAgICAgICAgY2xvbmVkT3B0aW9uc1tpXS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9ICAgICAgXG4gICAgICBpZiAobm9kZS5zZWxlY3RlZCAmJiAhKGNsb25lZE5vZGUuc2VsZWN0ZWQpKSB7XG4gICAgICAgIGNsb25lZE5vZGUuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghKG5vZGUuc2VsZWN0ZWQpICYmIGNsb25lZE5vZGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2xvbmVkTm9kZS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2xvbmVkTm9kZTtcbiAgfTtcblxuICB2YXIgbm9kZVRvT2JqID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgb2JqTm9kZSA9IHt9LCBpO1xuXG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgIG9iak5vZGVbVEVYVF0gPSBub2RlLmRhdGE7XG4gICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICBvYmpOb2RlW0NPTU1FTlRdID0gbm9kZS5kYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpOb2RlW05PREVfTkFNRV0gPSBub2RlLm5vZGVOYW1lO1xuICAgICAgaWYgKG5vZGUuYXR0cmlidXRlcyAmJiBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBvYmpOb2RlW0FUVFJJQlVURVNdID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBvYmpOb2RlW0FUVFJJQlVURVNdLnB1c2goW25vZGUuYXR0cmlidXRlc1tpXS5uYW1lLCBub2RlLmF0dHJpYnV0ZXNbaV0udmFsdWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBvYmpOb2RlW0NISUxEX05PREVTXSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgb2JqTm9kZVtDSElMRF9OT0RFU10ucHVzaChub2RlVG9PYmoobm9kZS5jaGlsZE5vZGVzW2ldKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnZhbHVlKSB7XG4gICAgICAgIG9iak5vZGVbVkFMVUVdID0gbm9kZS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLmNoZWNrZWQpIHtcbiAgICAgICAgb2JqTm9kZVtDSEVDS0VEXSA9IG5vZGUuY2hlY2tlZDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnNlbGVjdGVkKSB7XG4gICAgICAgIG9iak5vZGVbU0VMRUNURURdID0gbm9kZS5zZWxlY3RlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iak5vZGU7XG4gIH07XG5cbiAgdmFyIG9ialRvTm9kZSA9IGZ1bmN0aW9uIChvYmpOb2RlLCBpbnNpZGVTdmcpIHtcbiAgICB2YXIgbm9kZSwgaTtcbiAgICBpZiAob2JqTm9kZS5oYXNPd25Qcm9wZXJ0eShURVhUKSkge1xuICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG9iak5vZGVbVEVYVF0pO1xuICAgIH0gZWxzZSBpZiAob2JqTm9kZS5oYXNPd25Qcm9wZXJ0eShDT01NRU5UKSkge1xuICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQob2JqTm9kZVtDT01NRU5UXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvYmpOb2RlW05PREVfTkFNRV0gPT09ICdzdmcnIHx8IGluc2lkZVN2Zykge1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG9iak5vZGVbTk9ERV9OQU1FXSk7XG4gICAgICAgIGluc2lkZVN2ZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvYmpOb2RlW05PREVfTkFNRV0pO1xuICAgICAgfVxuICAgICAgaWYgKG9iak5vZGVbQVRUUklCVVRFU10pIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iak5vZGVbQVRUUklCVVRFU10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShvYmpOb2RlW0FUVFJJQlVURVNdW2ldWzBdLCBvYmpOb2RlW0FUVFJJQlVURVNdW2ldWzFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG9iak5vZGVbQ0hJTERfTk9ERVNdKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmpOb2RlW0NISUxEX05PREVTXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQob2JqVG9Ob2RlKG9iak5vZGVbQ0hJTERfTk9ERVNdW2ldLCBpbnNpZGVTdmcpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG9iak5vZGVbVkFMVUVdKSB7XG4gICAgICAgIG5vZGUudmFsdWUgPSBvYmpOb2RlW1ZBTFVFXTtcbiAgICAgIH1cbiAgICAgIGlmIChvYmpOb2RlW0NIRUNLRURdKSB7XG4gICAgICAgIG5vZGUuY2hlY2tlZCA9IG9iak5vZGVbQ0hFQ0tFRF07XG4gICAgICB9XG4gICAgICBpZiAob2JqTm9kZVtTRUxFQ1RFRF0pIHtcbiAgICAgICAgbm9kZS5zZWxlY3RlZCA9IG9iak5vZGVbU0VMRUNURURdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuXG5cbiAgLyoqXG4gICAqIGJhc2VkIG9uIGh0dHBzOi8vZW4ud2lraWJvb2tzLm9yZy93aWtpL0FsZ29yaXRobV9pbXBsZW1lbnRhdGlvbi9TdHJpbmdzL0xvbmdlc3RfY29tbW9uX3N1YnN0cmluZyNKYXZhU2NyaXB0XG4gICAqL1xuICB2YXIgZmluZENvbW1vblN1YnNldHMgPSBmdW5jdGlvbiAoYzEsIGMyLCBtYXJrZWQxLCBtYXJrZWQyKSB7XG4gICAgdmFyIGxjc1NpemUgPSAwLFxuICAgICAgaW5kZXggPSBbXSxcbiAgICAgIGxlbjEgPSBjMS5sZW5ndGgsXG4gICAgICBsZW4yID0gYzIubGVuZ3RoO1xuICAgIC8vIHNldCB1cCB0aGUgbWF0Y2hpbmcgdGFibGVcbiAgICB2YXIgbWF0Y2hlcyA9IFtdLFxuICAgICAgYSwgaSwgajtcbiAgICBmb3IgKGEgPSAwOyBhIDwgbGVuMSArIDE7IGErKykge1xuICAgICAgbWF0Y2hlc1thXSA9IFtdO1xuICAgIH1cbiAgICAvLyBmaWxsIHRoZSBtYXRjaGVzIHdpdGggZGlzdGFuY2UgdmFsdWVzXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjE7IGkrKykge1xuICAgICAgZm9yIChqID0gMDsgaiA8IGxlbjI7IGorKykge1xuICAgICAgICBpZiAoIW1hcmtlZDFbaV0gJiYgIW1hcmtlZDJbal0gJiYgcm91Z2hseUVxdWFsKGMxW2ldLCBjMltqXSkpIHtcbiAgICAgICAgICBtYXRjaGVzW2kgKyAxXVtqICsgMV0gPSAobWF0Y2hlc1tpXVtqXSA/IG1hdGNoZXNbaV1bal0gKyAxIDogMSk7XG4gICAgICAgICAgaWYgKG1hdGNoZXNbaSArIDFdW2ogKyAxXSA+IGxjc1NpemUpIHtcbiAgICAgICAgICAgIGxjc1NpemUgPSBtYXRjaGVzW2kgKyAxXVtqICsgMV07XG4gICAgICAgICAgICBpbmRleCA9IFtpICsgMSwgaiArIDFdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVzW2kgKyAxXVtqICsgMV0gPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsY3NTaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBvcmlnaW4gPSBbaW5kZXhbMF0gLSBsY3NTaXplLCBpbmRleFsxXSAtIGxjc1NpemVdO1xuICAgIHZhciByZXQgPSBuZXcgU3Vic2V0TWFwcGluZyhvcmlnaW5bMF0sIG9yaWdpblsxXSk7XG4gICAgcmV0Lmxlbmd0aCA9IGxjc1NpemU7XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBzaG91bGQgcmVhbGx5IGJlIGEgcHJlZGVmaW5lZCBmdW5jdGlvbiBpbiBBcnJheS4uLlxuICAgKi9cbiAgdmFyIG1ha2VBcnJheSA9IGZ1bmN0aW9uIChuLCB2KSB7XG4gICAgdmFyIGRlZXBjb3B5ID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgIHYuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsYXN0ID0gdi5sZW5ndGg7IGkgPCBsYXN0OyBpKyspIHtcbiAgICAgICAgaWYgKHZbaV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIHZbaV0gPSBkZWVwY29weSh2W2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgdiA9IGRlZXBjb3B5KHYpO1xuICAgIH1cbiAgICB2YXIgc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHY7XG4gICAgfTtcbiAgICByZXR1cm4gKG5ldyBBcnJheShuKSkuam9pbignLicpLnNwbGl0KCcuJykubWFwKHNldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGFycmF5cyB0aGF0IGluZGljYXRlIHdoaWNoIG5vZGUgYmVsb25ncyB0byB3aGljaCBzdWJzZXQsXG4gICAqIG9yIHdoZXRoZXIgaXQncyBhY3R1YWxseSBhbiBvcnBoYW4gbm9kZSwgZXhpc3RpbmcgaW4gb25seSBvbmVcbiAgICogb2YgdGhlIHR3byB0cmVlcywgcmF0aGVyIHRoYW4gc29tZXdoZXJlIGluIGJvdGguXG4gICAqL1xuICB2YXIgZ2V0R2FwSW5mb3JtYXRpb24gPSBmdW5jdGlvbiAodDEsIHQyLCBzdGFibGUpIHtcbiAgICAvLyBbdHJ1ZSwgdHJ1ZSwgLi4uXSBhcnJheXNcbiAgICB2YXIgc2V0ID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgICAgfVxuICAgIH0sXG4gICAgICBnYXBzMSA9IG1ha2VBcnJheSh0MS5jaGlsZE5vZGVzLmxlbmd0aCwgdHJ1ZSksXG4gICAgICBnYXBzMiA9IG1ha2VBcnJheSh0Mi5jaGlsZE5vZGVzLmxlbmd0aCwgdHJ1ZSksXG4gICAgICBncm91cCA9IDA7XG5cbiAgICAvLyBnaXZlIGVsZW1lbnRzIGZyb20gdGhlIHNhbWUgc3Vic2V0IHRoZSBzYW1lIGdyb3VwIG51bWJlclxuICAgIHN0YWJsZS5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzZXQpIHtcbiAgICAgIHZhciBpLCBlbmQ7XG4gICAgICBmb3IgKGkgPSBzdWJzZXRbXCJvbGRcIl0sIGVuZCA9IGkgKyBzdWJzZXQubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgZ2FwczFbaV0gPSBncm91cDtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IHN1YnNldFtcIm5ld1wiXSwgZW5kID0gaSArIHN1YnNldC5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICBnYXBzMltpXSA9IGdyb3VwO1xuICAgICAgfVxuICAgICAgZ3JvdXArKztcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBnYXBzMTogZ2FwczEsXG4gICAgICBnYXBzMjogZ2FwczJcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBGaW5kIGFsbCBtYXRjaGluZyBzdWJzZXRzLCBiYXNlZCBvbiBpbW1lZGlhdGUgY2hpbGQgZGlmZmVyZW5jZXMgb25seS5cbiAgICovXG4gIHZhciBtYXJrU3ViVHJlZXMgPSBmdW5jdGlvbiAob2xkVHJlZSwgbmV3VHJlZSkge1xuICAgIG9sZFRyZWUgPSBjbGVhbkNsb25lTm9kZShvbGRUcmVlKTtcbiAgICBuZXdUcmVlID0gY2xlYW5DbG9uZU5vZGUobmV3VHJlZSk7XG4gICAgLy8gbm90ZTogdGhlIGNoaWxkIGxpc3RzIGFyZSB2aWV3cywgYW5kIHNvIHVwZGF0ZSBhcyB3ZSB1cGRhdGUgb2xkL25ld1RyZWVcbiAgICB2YXIgb2xkQ2hpbGRyZW4gPSBvbGRUcmVlLmNoaWxkTm9kZXMsXG4gICAgICBuZXdDaGlsZHJlbiA9IG5ld1RyZWUuY2hpbGROb2RlcyxcbiAgICAgIG1hcmtlZDEgPSBtYWtlQXJyYXkob2xkQ2hpbGRyZW4ubGVuZ3RoLCBmYWxzZSksXG4gICAgICBtYXJrZWQyID0gbWFrZUFycmF5KG5ld0NoaWxkcmVuLmxlbmd0aCwgZmFsc2UpLFxuICAgICAgc3Vic2V0cyA9IFtdLFxuICAgICAgc3Vic2V0ID0gdHJ1ZSxcbiAgICAgIGk7XG4gICAgd2hpbGUgKHN1YnNldCkge1xuICAgICAgc3Vic2V0ID0gZmluZENvbW1vblN1YnNldHMob2xkQ2hpbGRyZW4sIG5ld0NoaWxkcmVuLCBtYXJrZWQxLCBtYXJrZWQyKTtcbiAgICAgIGlmIChzdWJzZXQpIHtcbiAgICAgICAgc3Vic2V0cy5wdXNoKHN1YnNldCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdWJzZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBtYXJrZWQxW3N1YnNldC5vbGQgKyBpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN1YnNldC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG1hcmtlZDJbc3Vic2V0Lm5ldyArIGldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3Vic2V0cztcbiAgfTtcblxuICB2YXIgZmluZEZpcnN0SW5uZXJEaWZmID0gZnVuY3Rpb24gKHQxLCB0Miwgc3VidHJlZXMsIHJvdXRlKSB7XG4gICAgaWYgKHN1YnRyZWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIGdhcEluZm9ybWF0aW9uID0gZ2V0R2FwSW5mb3JtYXRpb24odDEsIHQyLCBzdWJ0cmVlcyksXG4gICAgICBnYXBzMSA9IGdhcEluZm9ybWF0aW9uLmdhcHMxLFxuICAgICAgZ2wxID0gZ2FwczEubGVuZ3RoLFxuICAgICAgZ2FwczIgPSBnYXBJbmZvcm1hdGlvbi5nYXBzMixcbiAgICAgIGdsMiA9IGdhcHMxLmxlbmd0aCxcbiAgICAgIGksIGosIGssXG4gICAgICBsYXN0ID0gZ2wxIDwgZ2wyID8gZ2wxIDogZ2wyO1xuXG4gICAgLy8gQ2hlY2sgZm9yIGNvcnJlY3Qgc3VibWFwIHNlcXVlbmNpbmcgKGlycmVzcGVjdGl2ZSBvZiBnYXBzKSBmaXJzdDpcbiAgICB2YXIgc2VxdWVuY2UgPSAwLFxuICAgICAgZ3JvdXAsIG5vZGUsIHNpbWlsYXJOb2RlLCB0ZXN0Tm9kZSxcbiAgICAgIHNob3J0ZXN0ID0gZ2wxIDwgZ2wyID8gZ2FwczEgOiBnYXBzMjtcblxuICAgIC8vIGdyb3VwIHJlbG9jYXRpb25cbiAgICBmb3IgKGkgPSAwLCBsYXN0ID0gc2hvcnRlc3QubGVuZ3RoOyBpIDwgbGFzdDsgaSsrKSB7XG4gICAgICBpZiAoZ2FwczFbaV0gPT09IHRydWUpIHtcbiAgICAgICAgbm9kZSA9IHQxLmNoaWxkTm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgaWYgKHQyLmNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT09IDMgJiYgbm9kZS5kYXRhICE9IHQyLmNoaWxkTm9kZXNbaV0uZGF0YSkge1xuICAgICAgICAgICAgdGVzdE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgd2hpbGUgKHRlc3ROb2RlLm5leHRTaWJsaW5nICYmIHRlc3ROb2RlLm5leHRTaWJsaW5nLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICAgIHRlc3ROb2RlID0gdGVzdE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgIGlmICh0Mi5jaGlsZE5vZGVzW2ldLmRhdGEgPT09IHRlc3ROb2RlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzaW1pbGFyTm9kZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc2ltaWxhck5vZGUpIHtcbiAgICAgICAgICAgICAgayA9IHt9O1xuICAgICAgICAgICAgICBrW0FDVElPTl0gPSBNT0RJRllfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAgICAgICAga1tPTERfVkFMVUVdID0gbm9kZS5kYXRhO1xuICAgICAgICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi5jaGlsZE5vZGVzW2ldLmRhdGE7XG4gICAgICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgayA9IHt9O1xuICAgICAgICAgIGtbQUNUSU9OXSA9IFJFTU9WRV9URVhUX0VMRU1FTlQ7XG4gICAgICAgICAga1tST1VURV0gPSByb3V0ZS5jb25jYXQoaSk7XG4gICAgICAgICAga1tWQUxVRV0gPSBub2RlLmRhdGE7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICB9XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gUkVNT1ZFX0VMRU1FTlQ7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICBrW0VMRU1FTlRdID0gbm9kZVRvT2JqKG5vZGUpO1xuICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICB9XG4gICAgICBpZiAoZ2FwczJbaV0gPT09IHRydWUpIHtcbiAgICAgICAgbm9kZSA9IHQyLmNoaWxkTm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgayA9IHt9O1xuICAgICAgICAgIGtbQUNUSU9OXSA9IEFERF9URVhUX0VMRU1FTlQ7XG4gICAgICAgICAga1tST1VURV0gPSByb3V0ZS5jb25jYXQoaSk7XG4gICAgICAgICAga1tWQUxVRV0gPSBub2RlLmRhdGE7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICB9XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gQUREX0VMRU1FTlQ7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICBrW0VMRU1FTlRdID0gbm9kZVRvT2JqKG5vZGUpO1xuICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICB9XG4gICAgICBpZiAoZ2FwczFbaV0gIT0gZ2FwczJbaV0pIHtcbiAgICAgICAgZ3JvdXAgPSBzdWJ0cmVlc1tnYXBzMVtpXV07XG4gICAgICAgIHZhciB0b0dyb3VwID0gTWF0aC5taW4oZ3JvdXBbXCJuZXdcIl0sICh0MS5jaGlsZE5vZGVzLmxlbmd0aCAtIGdyb3VwLmxlbmd0aCkpO1xuICAgICAgICBpZiAodG9Hcm91cCAhPSBpKSB7XG4gICAgICAgICAgLy9DaGVjayB3ZWh0aGVyIGRlc3RpbmF0aW9uIG5vZGVzIGFyZSBkaWZmZXJlbnQgdGhhbiBvcmlnaW5hdGluZyBvbmVzLlxuICAgICAgICAgIHZhciBkZXN0aW5hdGlvbkRpZmZlcmVudCA9IGZhbHNlO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBncm91cC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKCF0MS5jaGlsZE5vZGVzW3RvR3JvdXAgKyBqXS5pc0VxdWFsTm9kZSh0MS5jaGlsZE5vZGVzW2kgKyBqXSkpIHtcbiAgICAgICAgICAgICAgZGVzdGluYXRpb25EaWZmZXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkZXN0aW5hdGlvbkRpZmZlcmVudCkge1xuICAgICAgICAgICAgayA9IHt9O1xuICAgICAgICAgICAga1tBQ1RJT05dID0gUkVMT0NBVEVfR1JPVVA7XG4gICAgICAgICAgICBrW0dST1VQXSA9IGdyb3VwO1xuICAgICAgICAgICAga1tGUk9NXSA9IGk7XG4gICAgICAgICAgICBrW1RPXSA9IHRvR3JvdXA7XG4gICAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cblxuICBmdW5jdGlvbiBzd2FwKG9iaiwgcDEsIHAyKSB7XG4gICAgKGZ1bmN0aW9uIChfKSB7XG4gICAgICBvYmpbcDFdID0gb2JqW3AyXTtcbiAgICAgIG9ialtwMl0gPSBfO1xuICAgIH0ob2JqW3AxXSkpO1xuICB9O1xuXG5cbiAgdmFyIERpZmZUcmFja2VyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGlzdCA9IFtdO1xuICB9O1xuICBEaWZmVHJhY2tlci5wcm90b3R5cGUgPSB7XG4gICAgbGlzdDogZmFsc2UsXG4gICAgYWRkOiBmdW5jdGlvbiAoZGlmZmxpc3QpIHtcbiAgICAgIHZhciBsaXN0ID0gdGhpcy5saXN0O1xuICAgICAgZGlmZmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGlmZikge1xuICAgICAgICBsaXN0LnB1c2goZGlmZik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uIChmbikge1xuICAgICAgdGhpcy5saXN0LmZvckVhY2goZm4pO1xuICAgIH1cbiAgfTtcblxuXG5cblxuICB2YXIgZGlmZkRPTSA9IGZ1bmN0aW9uIChkZWJ1ZywgZGlmZmNhcCkge1xuICAgIGlmICh0eXBlb2YgZGVidWcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkZWJ1ZyA9IGZhbHNlO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgQUREX0FUVFJJQlVURSA9IFwiYWRkIGF0dHJpYnV0ZVwiLFxuICAgICAgTU9ESUZZX0FUVFJJQlVURSA9IFwibW9kaWZ5IGF0dHJpYnV0ZVwiLFxuICAgICAgUkVNT1ZFX0FUVFJJQlVURSA9IFwicmVtb3ZlIGF0dHJpYnV0ZVwiLFxuICAgICAgTU9ESUZZX1RFWFRfRUxFTUVOVCA9IFwibW9kaWZ5IHRleHQgZWxlbWVudFwiLFxuICAgICAgUkVMT0NBVEVfR1JPVVAgPSBcInJlbG9jYXRlIGdyb3VwXCIsXG4gICAgICBSRU1PVkVfRUxFTUVOVCA9IFwicmVtb3ZlIGVsZW1lbnRcIixcbiAgICAgIEFERF9FTEVNRU5UID0gXCJhZGQgZWxlbWVudFwiLFxuICAgICAgUkVNT1ZFX1RFWFRfRUxFTUVOVCA9IFwicmVtb3ZlIHRleHQgZWxlbWVudFwiLFxuICAgICAgQUREX1RFWFRfRUxFTUVOVCA9IFwiYWRkIHRleHQgZWxlbWVudFwiLFxuICAgICAgUkVQTEFDRV9FTEVNRU5UID0gXCJyZXBsYWNlIGVsZW1lbnRcIixcbiAgICAgIE1PRElGWV9WQUxVRSA9IFwibW9kaWZ5IHZhbHVlXCIsXG4gICAgICBNT0RJRllfQ0hFQ0tFRCA9IFwibW9kaWZ5IGNoZWNrZWRcIixcbiAgICAgIE1PRElGWV9TRUxFQ1RFRCA9IFwibW9kaWZ5IHNlbGVjdGVkXCIsXG4gICAgICBBQ1RJT04gPSBcImFjdGlvblwiLFxuICAgICAgUk9VVEUgPSBcInJvdXRlXCIsXG4gICAgICBPTERfVkFMVUUgPSBcIm9sZFZhbHVlXCIsXG4gICAgICBORVdfVkFMVUUgPSBcIm5ld1ZhbHVlXCIsXG4gICAgICBFTEVNRU5UID0gXCJlbGVtZW50XCIsXG4gICAgICBHUk9VUCA9IFwiZ3JvdXBcIixcbiAgICAgIEZST00gPSBcImZyb21cIixcbiAgICAgIFRPID0gXCJ0b1wiLFxuICAgICAgTkFNRSA9IFwibmFtZVwiLFxuICAgICAgVkFMVUUgPSBcInZhbHVlXCIsXG4gICAgICBURVhUID0gXCJ0ZXh0XCIsXG4gICAgICBBVFRSSUJVVEVTID0gXCJhdHRyaWJ1dGVzXCIsXG4gICAgTk9ERV9OQU1FID0gXCJub2RlTmFtZVwiLFxuICAgIENPTU1FTlQgPSBcImNvbW1lbnRcIixcbiAgICBDSElMRF9OT0RFUyA9IFwiY2hpbGROb2Rlc1wiLFxuICAgIENIRUNLRUQgPSBcImNoZWNrZWRcIixcbiAgICBTRUxFQ1RFRCA9IFwic2VsZWN0ZWRcIjtcbiAgICB9XG5cblxuXG5cbiAgICBpZiAodHlwZW9mIGRpZmZjYXAgPT09ICd1bmRlZmluZWQnKVxuICAgICAgZGlmZmNhcCA9IDEwO1xuICAgIHRoaXMuZGVidWcgPSBkZWJ1ZztcbiAgICB0aGlzLmRpZmZjYXAgPSBkaWZmY2FwO1xuICB9O1xuICBkaWZmRE9NLnByb3RvdHlwZSA9IHtcblxuICAgIC8vID09PT09IENyZWF0ZSBhIGRpZmYgPT09PT1cblxuICAgIGRpZmY6IGZ1bmN0aW9uICh0MSwgdDIpIHtcbiAgICAgIGRpZmZjb3VudCA9IDA7XG4gICAgICB0MSA9IGNsZWFuQ2xvbmVOb2RlKHQxKTtcbiAgICAgIHQyID0gY2xlYW5DbG9uZU5vZGUodDIpO1xuICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgdGhpcy50MU9yaWcgPSBub2RlVG9PYmoodDEpO1xuICAgICAgICB0aGlzLnQyT3JpZyA9IG5vZGVUb09iaih0Mik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHJhY2tlciA9IG5ldyBEaWZmVHJhY2tlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZmluZERpZmZzKHQxLCB0Mik7XG4gICAgfSxcbiAgICBmaW5kRGlmZnM6IGZ1bmN0aW9uICh0MSwgdDIpIHtcbiAgICAgIHZhciBkaWZmO1xuICAgICAgZG8ge1xuICAgICAgICBpZiAodGhpcy5kZWJ1Zykge1xuICAgICAgICAgIGRpZmZjb3VudCsrO1xuICAgICAgICAgIGlmIChkaWZmY291bnQgPiB0aGlzLmRpZmZjYXApIHtcbiAgICAgICAgICAgIHdpbmRvdy5kaWZmRXJyb3IgPSBbdGhpcy50MU9yaWcsIHRoaXMudDJPcmlnXTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInN1cnBhc3NlZCBkaWZmY2FwOlwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy50MU9yaWcpICsgXCIgLT4gXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnQyT3JpZykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkaWZmbGlzdCA9IHRoaXMuZmluZEZpcnN0RGlmZih0MSwgdDIsIFtdKTtcbiAgICAgICAgaWYgKGRpZmZsaXN0KSB7XG4gICAgICAgICAgaWYgKCFkaWZmbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRpZmZsaXN0ID0gW2RpZmZsaXN0XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50cmFja2VyLmFkZChkaWZmbGlzdCk7XG4gICAgICAgICAgdGhpcy5hcHBseSh0MSwgZGlmZmxpc3QpO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlIChkaWZmbGlzdCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFja2VyLmxpc3Q7XG4gICAgfSxcbiAgICBmaW5kRmlyc3REaWZmOiBmdW5jdGlvbiAodDEsIHQyLCByb3V0ZSkge1xuICAgICAgLy8gb3V0ZXIgZGlmZmVyZW5jZXM/XG4gICAgICB2YXIgZGlmZmxpc3QgPSB0aGlzLmZpbmRPdXRlckRpZmYodDEsIHQyLCByb3V0ZSk7XG4gICAgICBpZiAoZGlmZmxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gZGlmZmxpc3Q7XG4gICAgICB9XG4gICAgICAvLyBpbm5lciBkaWZmZXJlbmNlcz9cbiAgICAgIHZhciBkaWZmID0gdGhpcy5maW5kSW5uZXJEaWZmKHQxLCB0Miwgcm91dGUpO1xuICAgICAgaWYgKGRpZmYpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkaWZmLmxlbmd0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGRpZmYgPSBbZGlmZl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpZmYubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiBkaWZmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBkaWZmZXJlbmNlc1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgZmluZE91dGVyRGlmZjogZnVuY3Rpb24gKHQxLCB0Miwgcm91dGUpIHtcbiAgICAgIHZhciBrO1xuICAgICAgXG4gICAgICBpZiAodDEubm9kZU5hbWUgIT0gdDIubm9kZU5hbWUpIHtcbiAgICAgICAgayA9IHt9O1xuICAgICAgICBrW0FDVElPTl0gPSBSRVBMQUNFX0VMRU1FTlQ7XG4gICAgICAgIGtbT0xEX1ZBTFVFXSA9IG5vZGVUb09iaih0MSk7XG4gICAgICAgIGtbTkVXX1ZBTFVFXSA9IG5vZGVUb09iaih0Mik7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgIHJldHVybiBbbmV3IERpZmYoayldO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgICAgIGJ5TmFtZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEubmFtZSA+IGIubmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cjEgPSB0MS5hdHRyaWJ1dGVzID8gc2xpY2UuY2FsbCh0MS5hdHRyaWJ1dGVzKS5zb3J0KGJ5TmFtZSkgOiBbXSxcbiAgICAgICAgYXR0cjIgPSB0Mi5hdHRyaWJ1dGVzID8gc2xpY2UuY2FsbCh0Mi5hdHRyaWJ1dGVzKS5zb3J0KGJ5TmFtZSkgOiBbXSxcbiAgICAgICAgZmluZCA9IGZ1bmN0aW9uIChhdHRyLCBsaXN0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxhc3QgPSBsaXN0Lmxlbmd0aDsgaSA8IGxhc3Q7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0ubmFtZSA9PT0gYXR0ci5uYW1lKVxuICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuICAgICAgICBkaWZmcyA9IFtdO1xuICAgICAgaWYgKCh0MS52YWx1ZSB8fCB0Mi52YWx1ZSkgJiYgdDEudmFsdWUgIT09IHQyLnZhbHVlICYmIHQxLm5vZGVOYW1lICE9PSAnT1BUSU9OJykge1xuICAgICAgICBrID0ge307XG4gICAgICAgIGtbQUNUSU9OXSA9IE1PRElGWV9WQUxVRTtcbiAgICAgICAga1tPTERfVkFMVUVdID0gdDEudmFsdWU7XG4gICAgICAgIGtbTkVXX1ZBTFVFXSA9IHQyLnZhbHVlO1xuICAgICAgICBrW1JPVVRFXSA9IHJvdXRlO1xuICAgICAgICBkaWZmcy5wdXNoKG5ldyBEaWZmKGspKTtcbiAgICAgIH1cbiAgICAgIGlmICgodDEuY2hlY2tlZCB8fCB0Mi5jaGVja2VkKSAmJiB0MS5jaGVja2VkICE9PSB0Mi5jaGVja2VkKSB7XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gTU9ESUZZX0NIRUNLRUQ7XG4gICAgICAgIGtbT0xEX1ZBTFVFXSA9IHQxLmNoZWNrZWQ7XG4gICAgICAgIGtbTkVXX1ZBTFVFXSA9IHQyLmNoZWNrZWQ7XG4gICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgIGRpZmZzLnB1c2gobmV3IERpZmYoaykpO1xuICAgICAgfSAgXG5cbiAgICAgIGF0dHIxLmZvckVhY2goZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgICAgdmFyIHBvcyA9IGZpbmQoYXR0ciwgYXR0cjIpLFxuICAgICAgICAgIGs7XG4gICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgayA9IHt9O1xuICAgICAgICAgIGtbQUNUSU9OXSA9IFJFTU9WRV9BVFRSSUJVVEU7XG4gICAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAgICBrW05BTUVdID0gYXR0ci5uYW1lO1xuICAgICAgICAgIGtbVkFMVUVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICBkaWZmcy5wdXNoKG5ldyBEaWZmKGspKTtcbiAgICAgICAgICByZXR1cm4gZGlmZnM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGEyID0gYXR0cjIuc3BsaWNlKHBvcywgMSlbMF07XG4gICAgICAgIGlmIChhdHRyLnZhbHVlICE9PSBhMi52YWx1ZSkge1xuICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICBrW0FDVElPTl0gPSBNT0RJRllfQVRUUklCVVRFO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgICAga1tOQU1FXSA9IGF0dHIubmFtZTtcbiAgICAgICAgICBrW09MRF9WQUxVRV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgIGtbTkVXX1ZBTFVFXSA9IGEyLnZhbHVlO1xuXG4gICAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7XG4gICAgICAgICAgICAgICAvLyAgICBjb25zb2xlLmxvZyhkaWZmcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCF0MS5hdHRyaWJ1dGVzICYmIHQxLmRhdGEgIT09IHQyLmRhdGEpIHtcbiAgICAgICAgICBrID0ge307XG4gICAgICAgICAga1tBQ1RJT05dID0gTU9ESUZZX0RBVEE7XG4gICAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAgICBrW09MRF9WQUxVRV0gPSB0MS5kYXRhO1xuICAgICAgICAgIGtbTkVXX1ZBTFVFXSA9IHQyLmRhdGE7XG4gICAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7ICAgICAgICAgIFxuICAgICAgfVxuICAgICAgaWYgKGRpZmZzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGRpZmZzO1xuICAgICAgfTtcbiAgICAgIGF0dHIyLmZvckVhY2goZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgICAgdmFyIGs7XG4gICAgICAgIGsgPSB7fTtcbiAgICAgICAga1tBQ1RJT05dID0gQUREX0FUVFJJQlVURTtcbiAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAga1tOQU1FXSA9IGF0dHIubmFtZTtcbiAgICAgICAga1tWQUxVRV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICBkaWZmcy5wdXNoKG5ldyBEaWZmKGspKTtcbiAgICAgICAgXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKCh0MS5zZWxlY3RlZCB8fCB0Mi5zZWxlY3RlZCkgJiYgdDEuc2VsZWN0ZWQgIT09IHQyLnNlbGVjdGVkKSB7XG4gICAgICAgIGlmIChkaWZmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZGlmZnM7XG4gICAgICAgIH1cbiAgICAgICAgayA9IHt9O1xuICAgICAgICBrW0FDVElPTl0gPSBNT0RJRllfU0VMRUNURUQ7XG4gICAgICAgIGtbT0xEX1ZBTFVFXSA9IHQxLnNlbGVjdGVkO1xuICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi5zZWxlY3RlZDtcbiAgICAgICAga1tST1VURV0gPSByb3V0ZTtcbiAgICAgICAgZGlmZnMucHVzaChuZXcgRGlmZihrKSk7XG4gICAgICB9ICAgICAgXG4gICAgICBcbiAgICAgIHJldHVybiBkaWZmcztcbiAgICB9LFxuICAgIGZpbmRJbm5lckRpZmY6IGZ1bmN0aW9uICh0MSwgdDIsIHJvdXRlKSB7XG4gICAgICB2YXIgc3VidHJlZXMgPSBtYXJrU3ViVHJlZXModDEsIHQyKSxcbiAgICAgICAgbWFwcGluZ3MgPSBzdWJ0cmVlcy5sZW5ndGgsXG4gICAgICAgIGs7XG4gICAgICAvLyBubyBjb3JyZXNwb25kZW5jZSB3aGF0c29ldmVyXG4gICAgICAvLyBpZiB0MSBvciB0MiBjb250YWluIGRpZmZlcmVuY2VzIHRoYXQgYXJlIG5vdCB0ZXh0IG5vZGVzLCByZXR1cm4gYSBkaWZmLiBcblxuICAgICAgLy8gdHdvIHRleHQgbm9kZXMgd2l0aCBkaWZmZXJlbmNlc1xuICAgICAgaWYgKG1hcHBpbmdzID09PSAwKSB7XG4gICAgICAgIGlmICh0MS5ub2RlVHlwZSA9PT0gMyAmJiB0Mi5ub2RlVHlwZSA9PT0gMyAmJiB0MS5kYXRhICE9PSB0Mi5kYXRhKSB7XG4gICAgICAgICAgayA9IHt9O1xuICAgICAgICAgIGtbQUNUSU9OXSA9IE1PRElGWV9URVhUX0VMRU1FTlQ7XG4gICAgICAgICAga1tPTERfVkFMVUVdID0gdDEuZGF0YTtcbiAgICAgICAgICBrW05FV19WQUxVRV0gPSB0Mi5kYXRhO1xuICAgICAgICAgIGtbUk9VVEVdID0gcm91dGU7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaWZmKGspO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBwb3NzaWJseSBpZGVudGljYWwgY29udGVudDogdmVyaWZ5XG4gICAgICBpZiAobWFwcGluZ3MgPCAyKSB7XG4gICAgICAgIHZhciBkaWZmLCBkaWZmbGlzdCwgaSwgbGFzdCwgZTEsIGUyO1xuICAgICAgICBmb3IgKGkgPSAwLCBsYXN0ID0gTWF0aC5tYXgodDEuY2hpbGROb2Rlcy5sZW5ndGgsIHQyLmNoaWxkTm9kZXMubGVuZ3RoKTsgaSA8IGxhc3Q7IGkrKykge1xuICAgICAgICAgIGUxID0gdDEuY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgICBlMiA9IHQyLmNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgLy8gVE9ETzogdGhpcyBpcyBhIHNpbWlsYXIgY29kZSBwYXRoIHRvIHRoZSBvbmVcbiAgICAgICAgICAvLyAgICAgICBpbiBmaW5kRmlyc3RJbm5lckRpZmYuIENhbiB3ZSB1bmlmeSB0aGVzZT9cbiAgICAgICAgICBpZiAoZTEgJiYgIWUyKSB7XG4gICAgICAgICAgICBpZiAoZTEubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgICAgayA9IHt9O1xuICAgICAgICAgICAgICBrW0FDVElPTl0gPSBSRU1PVkVfVEVYVF9FTEVNRU5UO1xuICAgICAgICAgICAgICBrW1JPVVRFXSA9IHJvdXRlLmNvbmNhdChpKTtcbiAgICAgICAgICAgICAga1tWQUxVRV0gPSBlMS5kYXRhO1xuICAgICAgICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrID0ge307XG4gICAgICAgICAgICBrW0FDVElPTl0gPSBSRU1PVkVfRUxFTUVOVDtcbiAgICAgICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICAgICAga1tFTEVNRU5UXSA9IG5vZGVUb09iaihlMSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERpZmYoayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlMiAmJiAhZTEpIHtcbiAgICAgICAgICAgIGlmIChlMi5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgICBrID0ge307XG4gICAgICAgICAgICAgIGtbQUNUSU9OXSA9IEFERF9URVhUX0VMRU1FTlQ7XG4gICAgICAgICAgICAgIGtbUk9VVEVdID0gcm91dGUuY29uY2F0KGkpO1xuICAgICAgICAgICAgICBrW1ZBTFVFXSA9IGUyLmRhdGE7XG4gICAgICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGsgPSB7fTtcbiAgICAgICAgICAgIGtbQUNUSU9OXSA9IEFERF9FTEVNRU5UO1xuICAgICAgICAgICAga1tST1VURV0gPSByb3V0ZS5jb25jYXQoaSk7XG4gICAgICAgICAgICBrW0VMRU1FTlRdID0gbm9kZVRvT2JqKGUyKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGlmZihrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGUxLm5vZGVUeXBlICE9IDMgfHwgZTIubm9kZVR5cGUgIT0gMykge1xuICAgICAgICAgICAgZGlmZmxpc3QgPSB0aGlzLmZpbmRPdXRlckRpZmYoZTEsIGUyLCByb3V0ZS5jb25jYXQoaSkpO1xuICAgICAgICAgICAgaWYgKGRpZmZsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRpZmZsaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBkaWZmID0gdGhpcy5maW5kSW5uZXJEaWZmKGUxLCBlMiwgcm91dGUuY29uY2F0KGkpKTtcbiAgICAgICAgICBpZiAoZGlmZikge1xuICAgICAgICAgICAgcmV0dXJuIGRpZmY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG9uZSBvciBtb3JlIGRpZmZlcmVuY2VzOiBmaW5kIGZpcnN0IGRpZmZcbiAgICAgIHJldHVybiB0aGlzLmZpbmRGaXJzdElubmVyRGlmZih0MSwgdDIsIHN1YnRyZWVzLCByb3V0ZSk7XG4gICAgfSxcblxuICAgIC8vIGltcG9ydGVkXG4gICAgZmluZEZpcnN0SW5uZXJEaWZmOiBmaW5kRmlyc3RJbm5lckRpZmYsXG5cbiAgICAvLyA9PT09PSBBcHBseSBhIGRpZmYgPT09PT1cblxuICAgIGFwcGx5OiBmdW5jdGlvbiAodHJlZSwgZGlmZnMpIHtcbiAgICAgIHZhciBkb2JqID0gdGhpcztcbiAgICAgIGlmICh0eXBlb2YgZGlmZnMubGVuZ3RoID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGRpZmZzID0gW2RpZmZzXTtcbiAgICAgIH1cbiAgICAgIGlmIChkaWZmcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBkaWZmcy5mb3JFYWNoKGZ1bmN0aW9uIChkaWZmKSB7XG4gICAgICAgIGlmICghZG9iai5hcHBseURpZmYodHJlZSwgZGlmZikpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGdldEZyb21Sb3V0ZTogZnVuY3Rpb24gKHRyZWUsIHJvdXRlKSB7XG4gICAgICByb3V0ZSA9IHJvdXRlLnNsaWNlKCk7XG4gICAgICB2YXIgYywgbm9kZSA9IHRyZWU7XG4gICAgICB3aGlsZSAocm91dGUubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoIW5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjID0gcm91dGUuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgICBub2RlID0gbm9kZS5jaGlsZE5vZGVzW2NdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICAvLyBkaWZmaW5nIHRleHQgZWxlbWVudHMgY2FuIGJlIG92ZXJ3cml0dGVuIGZvciB1c2Ugd2l0aCBkaWZmX21hdGNoX3BhdGNoIGFuZCBhbGlrZVxuICAgIHRleHREaWZmOiBmdW5jdGlvbiAobm9kZSwgY3VycmVudFZhbHVlLCBleHBlY3RlZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgbm9kZS5kYXRhID0gbmV3VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgICBhcHBseURpZmY6IGZ1bmN0aW9uICh0cmVlLCBkaWZmKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuZ2V0RnJvbVJvdXRlKHRyZWUsIGRpZmZbUk9VVEVdKTtcbiAgICAgIGlmIChkaWZmW0FDVElPTl0gPT09IEFERF9BVFRSSUJVVEUpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLnNldEF0dHJpYnV0ZSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGRpZmZbTkFNRV0sIGRpZmZbVkFMVUVdKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfQVRUUklCVVRFKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5zZXRBdHRyaWJ1dGUpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShkaWZmW05BTUVdLCBkaWZmW05FV19WQUxVRV0pO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTU9WRV9BVFRSSUJVVEUpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLnJlbW92ZUF0dHJpYnV0ZSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGRpZmZbTkFNRV0pO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9WQUxVRSkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgdHlwZW9mIG5vZGUudmFsdWUgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbm9kZS52YWx1ZSA9IGRpZmZbTkVXX1ZBTFVFXTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfREFUQSkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgdHlwZW9mIG5vZGUuZGF0YSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBub2RlLmRhdGEgPSBkaWZmW05FV19WQUxVRV07XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX0NIRUNLRUQpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlLmNoZWNrZWQgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbm9kZS5jaGVja2VkID0gZGlmZltORVdfVkFMVUVdO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9TRUxFQ1RFRCkge1xuICAgICAgICBpZiAoIW5vZGUgfHwgdHlwZW9mIG5vZGUuc2VsZWN0ZWQgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbm9kZS5zZWxlY3RlZCA9IGRpZmZbTkVXX1ZBTFVFXTsgICAgIFxuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9URVhUX0VMRU1FTlQpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IG5vZGUubm9kZVR5cGUgIT0gMylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMudGV4dERpZmYobm9kZSwgbm9kZS5kYXRhLCBkaWZmW09MRF9WQUxVRV0sIGRpZmZbTkVXX1ZBTFVFXSk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gUkVQTEFDRV9FTEVNRU5UKSB7XG4gICAgICAgIHZhciBuZXdOb2RlID0gb2JqVG9Ob2RlKGRpZmZbTkVXX1ZBTFVFXSk7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgbm9kZSk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gUkVMT0NBVEVfR1JPVVApIHtcbiAgICAgICAgdmFyIGdyb3VwID0gZGlmZltHUk9VUF0sXG4gICAgICAgICAgZnJvbSA9IGRpZmZbRlJPTV0sXG4gICAgICAgICAgdG8gPSBkaWZmW1RPXSxcbiAgICAgICAgICBjaGlsZCwgcmVmZXJlbmNlO1xuICAgICAgICByZWZlcmVuY2UgPSBub2RlLmNoaWxkTm9kZXNbdG8gKyBncm91cC5sZW5ndGhdO1xuICAgICAgICAvLyBzbGlkZSBlbGVtZW50cyB1cFxuICAgICAgICBpZiAoZnJvbSA8IHRvKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGQgPSBub2RlLmNoaWxkTm9kZXNbZnJvbV07XG4gICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZShjaGlsZCwgcmVmZXJlbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc2xpZGUgZWxlbWVudHMgZG93blxuICAgICAgICAgIHJlZmVyZW5jZSA9IG5vZGUuY2hpbGROb2Rlc1t0b107XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGQgPSBub2RlLmNoaWxkTm9kZXNbZnJvbSArIGldO1xuICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUoY2hpbGQsIHJlZmVyZW5jZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gUkVNT1ZFX0VMRU1FTlQpIHtcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTU9WRV9URVhUX0VMRU1FTlQpIHtcbiAgICAgICAgaWYgKCFub2RlIHx8IG5vZGUubm9kZVR5cGUgIT0gMylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBBRERfRUxFTUVOVCkge1xuICAgICAgICB2YXIgcm91dGUgPSBkaWZmW1JPVVRFXS5zbGljZSgpLFxuICAgICAgICAgIGMgPSByb3V0ZS5zcGxpY2Uocm91dGUubGVuZ3RoIC0gMSwgMSlbMF07XG4gICAgICAgIG5vZGUgPSB0aGlzLmdldEZyb21Sb3V0ZSh0cmVlLCByb3V0ZSk7XG4gICAgICAgIHZhciBuZXdOb2RlID0gb2JqVG9Ob2RlKGRpZmZbRUxFTUVOVF0pO1xuICAgICAgICBpZiAoYyA+PSBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChuZXdOb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgcmVmZXJlbmNlID0gbm9kZS5jaGlsZE5vZGVzW2NdO1xuICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBBRERfVEVYVF9FTEVNRU5UKSB7XG4gICAgICAgIHZhciByb3V0ZSA9IGRpZmZbUk9VVEVdLnNsaWNlKCksXG4gICAgICAgICAgYyA9IHJvdXRlLnNwbGljZShyb3V0ZS5sZW5ndGggLSAxLCAxKVswXSxcbiAgICAgICAgICBuZXdOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZltWQUxVRV0pO1xuICAgICAgICBub2RlID0gdGhpcy5nZXRGcm9tUm91dGUodHJlZSwgcm91dGUpO1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuY2hpbGROb2RlcylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChjID49IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKG5ld05vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciByZWZlcmVuY2UgPSBub2RlLmNoaWxkTm9kZXNbY107XG4gICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgcmVmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vID09PT09IFVuZG8gYSBkaWZmID09PT09XG5cbiAgICB1bmRvOiBmdW5jdGlvbiAodHJlZSwgZGlmZnMpIHtcbiAgICAgIGRpZmZzID0gZGlmZnMuc2xpY2UoKTtcbiAgICAgIHZhciBkb2JqID0gdGhpcztcbiAgICAgIGlmICghZGlmZnMubGVuZ3RoKSB7XG4gICAgICAgIGRpZmZzID0gW2RpZmZzXTtcbiAgICAgIH1cbiAgICAgIGRpZmZzLnJldmVyc2UoKTtcbiAgICAgIGRpZmZzLmZvckVhY2goZnVuY3Rpb24gKGRpZmYpIHtcbiAgICAgICAgZG9iai51bmRvRGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdW5kb0RpZmY6IGZ1bmN0aW9uICh0cmVlLCBkaWZmKSB7XG4gICAgICBpZiAoZGlmZltBQ1RJT05dID09PSBBRERfQVRUUklCVVRFKSB7XG4gICAgICAgIGRpZmZbQUNUSU9OXSA9IFJFTU9WRV9BVFRSSUJVVEU7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IE1PRElGWV9BVFRSSUJVVEUpIHtcbiAgICAgICAgc3dhcChkaWZmLCBPTERfVkFMVUUsIE5FV19WQUxVRSk7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTU9WRV9BVFRSSUJVVEUpIHtcbiAgICAgICAgZGlmZltBQ1RJT05dID0gQUREX0FUVFJJQlVURTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX1RFWFRfRUxFTUVOVCkge1xuICAgICAgICBzd2FwKGRpZmYsIE9MRF9WQUxVRSwgTkVXX1ZBTFVFKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX1ZBTFVFKSB7XG4gICAgICAgIHN3YXAoZGlmZiwgT0xEX1ZBTFVFLCBORVdfVkFMVUUpO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfREFUQSkge1xuICAgICAgICBzd2FwKGRpZmYsIE9MRF9WQUxVRSwgTkVXX1ZBTFVFKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7ICAgICAgICBcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBNT0RJRllfQ0hFQ0tFRCkge1xuICAgICAgICBzd2FwKGRpZmYsIE9MRF9WQUxVRSwgTkVXX1ZBTFVFKTtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gTU9ESUZZX1NFTEVDVEVEKSB7XG4gICAgICAgIHN3YXAoZGlmZiwgT0xEX1ZBTFVFLCBORVdfVkFMVUUpO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRVBMQUNFX0VMRU1FTlQpIHtcbiAgICAgICAgc3dhcChkaWZmLCBPTERfVkFMVUUsIE5FV19WQUxVRSk7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTE9DQVRFX0dST1VQKSB7XG4gICAgICAgIHN3YXAoZGlmZiwgRlJPTSwgVE8pO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZltBQ1RJT05dID09PSBSRU1PVkVfRUxFTUVOVCkge1xuICAgICAgICBkaWZmW0FDVElPTl0gPSBBRERfRUxFTUVOVDtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gQUREX0VMRU1FTlQpIHtcbiAgICAgICAgZGlmZltBQ1RJT05dID0gUkVNT1ZFX0VMRU1FTlQ7XG4gICAgICAgIHRoaXMuYXBwbHlEaWZmKHRyZWUsIGRpZmYpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmW0FDVElPTl0gPT09IFJFTU9WRV9URVhUX0VMRU1FTlQpIHtcbiAgICAgICAgZGlmZltBQ1RJT05dID0gQUREX1RFWFRfRUxFTUVOVDtcbiAgICAgICAgdGhpcy5hcHBseURpZmYodHJlZSwgZGlmZik7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZbQUNUSU9OXSA9PT0gQUREX1RFWFRfRUxFTUVOVCkge1xuICAgICAgICBkaWZmW0FDVElPTl0gPSBSRU1PVkVfVEVYVF9FTEVNRU5UO1xuICAgICAgICB0aGlzLmFwcGx5RGlmZih0cmVlLCBkaWZmKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGRpZmZET007XG4gICAgfVxuICAgIGV4cG9ydHMuZGlmZkRPTSA9IGRpZmZET007XG4gIH0gZWxzZSB7XG4gICAgLy8gYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyXG4gICAgdGhpcy5kaWZmRE9NID0gZGlmZkRPTTtcbiAgfVxuXG59LmNhbGwodGhpcykpO1xuIiwiKGZ1bmN0aW9uKGdsb2JhbCl7XG5cbiAgZnVuY3Rpb24gVGlueVN0b3JlIChuYW1lLCBvcHRpb25hbFN0b3JlKSB7XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgdGhpcy5zdG9yZSA9IHR5cGVvZiBvcHRpb25hbFN0b3JlICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbmFsU3RvcmUgOiBsb2NhbFN0b3JhZ2U7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnVGlueVN0b3JlJztcbiAgICB0aGlzLmVuYWJsZWQgPSBpc0VuYWJsZWQodGhpcy5zdG9yZSk7XG5cbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNlc3Npb24gPSBKU09OLnBhcnNlKHRoaXMuc3RvcmVbdGhpcy5uYW1lXSkgfHwge307XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLnN0b3JlW3RoaXMubmFtZV0gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnNlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uO1xuICB9O1xuXG4gIFRpbnlTdG9yZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLnNlc3Npb25ba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25ba2V5XTtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uW2tleV07XG4gIH07XG5cbiAgVGlueVN0b3JlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5zZXNzaW9uW2tleV07XG4gICAgZGVsZXRlIHRoaXMuc2Vzc2lvbltrZXldO1xuICAgIHRoaXMuc2F2ZSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBUaW55U3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW3RoaXMubmFtZV07XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRW5hYmxlZCAoc3RvcmUpIHtcbiAgICAvLyBkZWZpbml0ZWx5IGludmFsaWQ6XG4gICAgLy8gKiBudWxsXG4gICAgLy8gKiB1bmRlZmluZWRcbiAgICAvLyAqIE5hTlxuICAgIC8vICogZW1wdHkgc3RyaW5nIChcIlwiKVxuICAgIC8vICogMFxuICAgIC8vICogZmFsc2VcbiAgICBpZiAoIXN0b3JlKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdmFyIHN0b3JlVHlwZSA9IHR5cGVvZiBzdG9yZTtcbiAgICB2YXIgaXNMb2NhbE9yU2Vzc2lvbiA9IHR5cGVvZiBzdG9yZS5nZXRJdGVtID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBzdG9yZS5zZXRJdGVtID09PSAnZnVuY3Rpb24nO1xuICAgIHZhciBpc09iamVjdE9yRnVuY3Rpb24gPSBzdG9yZVR5cGUgPT09ICdvYmplY3QnIHx8IHN0b3JlVHlwZSA9PT0gJ2Z1bmN0aW9uJztcblxuICAgIC8vIHN0b3JlIGlzIHZhbGlkIGlmZiBpdCBpcyBlaXRoZXJcbiAgICAvLyAoYSkgbG9jYWxTdG9yYWdlIG9yIHNlc3Npb25TdG9yYWdlXG4gICAgLy8gKGIpIGEgcmVndWxhciBvYmplY3Qgb3IgZnVuY3Rpb25cbiAgICBpZiAoaXNMb2NhbE9yU2Vzc2lvbiB8fCBpc09iamVjdE9yRnVuY3Rpb24pIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIC8vIGNhdGNoYWxsIGZvciBvdXRsaWVycyAoc3RyaW5nLCBwb3NpdGl2ZSBudW1iZXIsIHRydWUgYm9vbGVhbiwgeG1sKVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdsb2JhbC5UaW55U3RvcmUgPSBUaW55U3RvcmU7XG5cbn0pKHRoaXMpO1xuIiwiaW1wb3J0IGV2ZW50cyBmcm9tICcuL3B1Yi1zdWInXG5pbXBvcnQgZHJhd1VJIGZyb20gJy4vY2FydC11aS5qcydcblxuZnVuY3Rpb24gbGlzdGVuVUkgKCkge1xuICBldmVudHMub24oJ2NhcnQ6dXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZWRyYXcnKVxuICAgIGRyYXdVSSAoKVxuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBsaXN0ZW5VSSIsImltcG9ydCBldmVudHMgZnJvbSAnLi9wdWItc3ViJ1xuaW1wb3J0IGRpZmZET00gZnJvbSAnZGlmZi1kb20nXG5cbmZ1bmN0aW9uIGRyYXdVSSAoKSB7XG5cbiAgdmFyIHN1bW1hcnkgPSBjYXJ0LmdldENhcnQoKVxuXG4gIHZhciBzdWJ0b3RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0aW55Y2FydC1zdWJ0b3RhbFwiKVswXVxuICBpZiAoc3VidG90YWwpIHsgc3VidG90YWwuaW5uZXJIVE1MID0gc3VtbWFyeS5zdWJ0b3RhbH1cblxuICB2YXIgc2hpcHBpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGlueWNhcnQtc2hpcHBpbmdcIilbMF1cbiAgaWYgKHNoaXBwaW5nKSB7IHNoaXBwaW5nLmlubmVySFRNTCA9IHN1bW1hcnkuc2hpcFRvdGFsIH1cblxuICB2YXIgdG90YWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGlueWNhcnQtdG90YWxcIilbMF1cbiAgaWYgKHRvdGFsKSB7IHRvdGFsLmlubmVySFRNTCA9IHN1bW1hcnkudG90YWwgfVxuXG4gIHZhciBpdGVtRGl2PSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGlueWNhcnQtaXRlbXNcIilbMF1cbiAgaWYgKGl0ZW1EaXYpIHtcbiAgICBsZXQgZGQgPSBuZXcgZGlmZkRPTVxuICAgIGxldCBpdGVtcyA9IGNhcnQuZ2V0Q2FydCgpLml0ZW1zXG4gICAgbGV0IHRtcCA9IGl0ZW1EaXYuY2xvbmVOb2RlKGZhbHNlKVxuICAgIHRtcC5pbm5lckhUTUwgPSAnJ1xuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBsZXQgaWQgICAgPSBcIidcIiArIGl0ZW0uaWQgKyBcIidcIlxuICAgICAgbGV0IHRpdGxlID0gXCInXCIgKyAgaXRlbS50aXRsZSArIFwiJ1wiXG4gICAgICB0bXAuaW5uZXJIVE1MID0gdG1wLmlubmVySFRNTFxuICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTI0IGZpcnN0LWNvbHVtbiBsaW5lLWl0ZW1cIj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtcmlnaHQgcHJlLTNcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8YSBvbmNsaWNrPVwiY2FydC5kZXN0cm95SXRlbSgnICsgaWQgICsgJyk7XCI+eCA8L2E+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTlcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8YSBocmVmPVwiJyArIGl0ZW0uaWQgKyAnXCI+JyArIGl0ZW0udGl0bGUgKyAnPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGEgb25jbGljaz1cImNhcnQucmVtb3ZlSXRlbSgnICsgaWQgKyAnKTtcIj4gLSA8L2E+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTEgdGV4dC1jZW50ZXJcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4nICsgaXRlbS5xdWFudGl0eSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTEgdGV4dC1jZW50ZXJcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8YSBvbmNsaWNrPVwiY2FydC5hZGRJdGVtKCcgKyB0aXRsZSArICcsICcrIGlkICsgJywgJyArIGl0ZW0ucHJpY2UgKyAnLCAxKTtcIj4gKyA8L2E+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTIgcHJlLTFcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4kPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwicmlnaHRcIj4nICsgaXRlbS5wcmljZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICArICc8ZGl2IGNsYXNzPVwiY29sdW1uLTIgcHJlLTFcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3Bhbj4kPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuIGNsYXNzPVwicmlnaHRcIj4nICsgaXRlbS5xdWFudGl0eSAqIGl0ZW0ucHJpY2UgKyAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICsgJzwvZGl2PidcbiAgICB9KVxuXG4gICAgZGQuYXBwbHkoaXRlbURpdiwgZGQuZGlmZihpdGVtRGl2LCB0bXApKVxuICB9XG5cbiAgdmFyIHN1bW1hcnlEaXY9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0aW55Y2FydC1zdW1tYXJ5XCIpWzBdXG4gIGlmIChzdW1tYXJ5RGl2KSB7XG4gICAgbGV0IGRkID0gbmV3IGRpZmZET01cbiAgICBsZXQgaXRlbXMgPSBjYXJ0LmdldENhcnQoKS5pdGVtc1xuICAgIGxldCB0bXAgPSBzdW1tYXJ5RGl2LmNsb25lTm9kZShmYWxzZSlcbiAgICB0bXAuaW5uZXJIVE1MID0gJydcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgbGV0IGlkICAgID0gXCInXCIgKyBpdGVtLmlkICsgXCInXCJcbiAgICAgIGxldCB0aXRsZSA9IFwiJ1wiICsgIGl0ZW0udGl0bGUgKyBcIidcIlxuICAgICAgdG1wLmlubmVySFRNTCA9IHRtcC5pbm5lckhUTUxcbiAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xMSBmaXJzdC1jb2x1bW4gbGluZS1pdGVtXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tNVwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzcGFuPicgKyBpdGVtLnRpdGxlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICsgJzxkaXYgY2xhc3M9XCJjb2x1bW4tMSB0ZXh0LWNlbnRlclwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzxhIG9uY2xpY2s9XCJjYXJ0LnJlbW92ZUl0ZW0oJyArIGlkICsgJyk7XCI+IC0gPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JyArIGl0ZW0ucXVhbnRpdHkgKyAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0xIHRleHQtY2VudGVyXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGEgb25jbGljaz1cImNhcnQuYWRkSXRlbSgnICsgdGl0bGUgKyAnLCAnKyBpZCArICcsICcgKyBpdGVtLnByaWNlICsgJywgMSk7XCI+ICsgPC9hPidcbiAgICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPGRpdiBjbGFzcz1cImNvbHVtbi0yIHByZS0xXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPHNwYW4+JDwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArICc8c3BhbiBjbGFzcz1cInJpZ2h0XCI+JyArIGl0ZW0ucXVhbnRpdHkgKiBpdGVtLnByaWNlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgICAgICAgKyAnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICArICc8L2Rpdj4nXG4gICAgfSlcblxuICAgIGRkLmFwcGx5KHN1bW1hcnlEaXYsIGRkLmRpZmYoc3VtbWFyeURpdiwgdG1wKSlcbiAgfVxuXG4gIHZhciBjYXJ0TGluaz0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInRpbnljYXJ0LWxpbmtcIilbMF1cbiAgaWYgKGNhcnRMaW5rKSB7XG4gICAgbGV0IGRkID0gbmV3IGRpZmZET01cbiAgICBsZXQgY3J0ID0gY2FydC5nZXRDYXJ0KClcbiAgICBsZXQgdG1wID0gY2FydExpbmsuY2xvbmVOb2RlKGZhbHNlKVxuICAgIGlmIChjcnQuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgdG1wLmlubmVySFRNTCA9IGNydC5pdGVtcy5sZW5ndGggKyAnIGl0ZW1zOiAkJyArIGNydC5zdWJ0b3RhbFxuICAgIH0gZWxzZSBpZiAoY3J0Lml0ZW1zLmxlbmd0aCA9PSAxKSB7XG4gICAgICB0bXAuaW5uZXJIVE1MID0gY3J0Lml0ZW1zLmxlbmd0aCArICcgaXRlbTogJCcgKyBjcnQuc3VidG90YWxcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wLmlubmVySFRNTCA9ICcnXG4gICAgfVxuICAgIGRkLmFwcGx5KGNhcnRMaW5rLCBkZC5kaWZmKGNhcnRMaW5rLCB0bXApKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRyYXdVSSIsImltcG9ydCBUUyBmcm9tICd0aW55c3RvcmUnXG5pbXBvcnQgZXZlbnRzIGZyb20gJy4vcHViLXN1YidcblxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4vLyDilIIgQ2FydCDilIJcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuLy8gaGFuZGxlIHRoZSBmaW5lc3Qgb2Ygc2hvcHBpbmcgZXhwZXJpZW5jZXNcbmZ1bmN0aW9uIFRpbnlDYXJ0KHtcbiAgY2FydE5hbWUgPSAnVGlueUNhcnQnLFxuICBjdXJyZW5jeSA9ICckJyxcbiAgdGF4UmF0ZSA9IDAuMDAsXG4gIHRheCA9IDAuMDAsXG4gIGJhc2VTaGlwcGluZyA9IDAuMDAsXG4gIHNoaXBwaW5nID0gMC4wMCxcbiAgc2hpcFRvdGFsID0gMC4wMCxcbiAgc3VidG90YWwgPSAwLjAwLFxuICB0b3RhbCA9IDAuMDAsXG4gIGl0ZW1zID0gW11cbn0gPSB7fSkge1xuICB2YXIgdHMgPSBuZXcgVFMuVGlueVN0b3JlKGNhcnROYW1lKVxuXG4gIGlmICghdHMuZ2V0KCdjdXJyZW5jeScpKSB7dHMuc2V0KCdjdXJyZW5jeScsIGN1cnJlbmN5KX1cbiAgaWYgKCF0cy5nZXQoJ3RheFJhdGUnKSkge3RzLnNldCgndGF4UmF0ZScsIHRheFJhdGUpfVxuICBpZiAoIXRzLmdldCgndGF4JykpIHt0cy5zZXQoJ3RheCcsIHRheCl9XG4gIGlmICghdHMuZ2V0KCdiYXNlU2hpcHBpbmcnKSkge3RzLnNldCgnYmFzZVNoaXBwaW5nJywgYmFzZVNoaXBwaW5nKX1cbiAgaWYgKCF0cy5nZXQoJ3NoaXBwaW5nJykpIHt0cy5zZXQoJ3NoaXBwaW5nJywgc2hpcHBpbmcpfVxuICBpZiAoIXRzLmdldCgnc3VidG90YWwnKSkge3RzLnNldCgnc3VidG90YWwnLCBzdWJ0b3RhbCl9XG4gIGlmICghdHMuZ2V0KCd0b3RhbCcpKSB7dHMuc2V0KCd0b3RhbCcsIHRvdGFsKX1cbiAgaWYgKCF0cy5nZXQoJ2l0ZW1zJykpIHt0cy5zZXQoJ2l0ZW1zJywgaXRlbXMpfVxuXG4gIC8vIFJldHVybnMgdGhlIENhcnQgb2JqZWN0IGFuZCBzcGVjaWZpYyBjYXJ0IG9iamVjdCB2YWx1ZXNcbiAgdGhpcy5nZXRDYXJ0ID0gKCkgPT4geyByZXR1cm4gdHMuc2Vzc2lvbiB9XG5cbiAgdGhpcy5jYWxjdWxhdGVDYXJ0ID0gKCkgPT4ge1xuICAgIGxldCBudW1JdGVtcyAgICAgPSAwXG4gICAgbGV0IHN1YnRvdGFsICAgICA9IDBcbiAgICBsZXQgdGF4ICAgICAgICAgID0gMFxuICAgIGxldCB0b3RhbCAgICAgICAgPSAwXG4gICAgbGV0IHNoaXBUb3RhbCAgICA9IDBcbiAgICBsZXQgaXRlbXMgICAgICAgID0gdHMuZ2V0KCdpdGVtcycpXG4gICAgbGV0IGJhc2VTaGlwcGluZyA9IHRzLmdldCgnYmFzZVNoaXBwaW5nJylcbiAgICBsZXQgdGF4UmF0ZSAgICAgID0gdHMuZ2V0KCd0YXhSYXRlJylcbiAgICBsZXQgc2hpcHBpbmcgICAgID0gdHMuZ2V0KCdzaGlwcGluZycpXG5cbiAgICBpdGVtcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgbnVtSXRlbXMgPSBudW1JdGVtcyArIGkucXVhbnRpdHlcbiAgICAgIHN1YnRvdGFsID0gaS5wcmljZSAqIGkucXVhbnRpdHkgKyBzdWJ0b3RhbFxuICAgIH0pXG5cbiAgICB0YXggPSB0YXhSYXRlICogc3VidG90YWxcbiAgICBzaGlwVG90YWwgPSAhaXRlbXMubGVuZ3RoID8gMCA6IHNoaXBwaW5nICogbnVtSXRlbXMgKyBiYXNlU2hpcHBpbmdcbiAgICB0b3RhbCA9IHNoaXBUb3RhbCArIHN1YnRvdGFsICsgdGF4XG5cbiAgICB0cy5zZXQoJ3RheCcsIHRheClcbiAgICB0cy5zZXQoJ3N1YnRvdGFsJywgc3VidG90YWwpXG4gICAgdHMuc2V0KCdzaGlwVG90YWwnLCBzaGlwVG90YWwpXG4gICAgdHMuc2V0KCd0b3RhbCcsIHRvdGFsKVxuICAgIGNvbnNvbGUubG9nKCdpdGVtIGFkZGVkIHRvIGNhcnQnKVxuICAgIHRoaXMuY2FydFVwZGF0ZWQoKVxuICB9XG5cbiAgdGhpcy5hZGRJdGVtID0gKHRpdGxlLCBpZCwgcHJpY2UsIHF1YW50aXR5KSA9PiB7XG4gICAgbGV0IGhhc0l0ZW0gPSBmYWxzZVxuICAgIGxldCBpdGVtSWRcblxuICAgIGlmICh0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykuZm9yRWFjaChpID0+IHtcbiAgICAgICAgaWYgKGkuaWQgPT0gaWQpIHtcbiAgICAgICAgICBoYXNJdGVtID0gdHJ1ZVxuICAgICAgICAgIGl0ZW1JZCA9IGlkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKCFoYXNJdGVtKSB7XG4gICAgICB0cy5nZXQoJ2l0ZW1zJykucHVzaCh7XG4gICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICBwcmljZTogcHJpY2UsXG4gICAgICAgIHF1YW50aXR5OiBxdWFudGl0eVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdHMuZ2V0KCdpdGVtcycpLmZvckVhY2goaSA9PiB7XG4gICAgICAgIGlmIChpLmlkID09IGlkKSB7XG4gICAgICAgICAgaS5xdWFudGl0eSA9IGkucXVhbnRpdHkgKyBxdWFudGl0eVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuY2FsY3VsYXRlQ2FydCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIGl0ZW0gaGVscGVyc1xuICB0aGlzLmhhc0l0ZW1zID0gKCkgPT4ge1xuICAgIHRzLmdldCgnaXRlbXMnKS5sZW5ndGggPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuaXNJdGVtID0gKGksIGlkKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2codHMuZ2V0KCdpdGVtcycpW2ldLmlkLCBpZClcbiAgICB0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQgPyB0cnVlIDogZmFsc2VcbiAgfVxuXG4gIHRoaXMuZ2V0SXRlbSA9IChpZCkgPT4ge1xuICAgIGlmICh0aGlzLmhhc0l0ZW1zKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdObyBpdGVtcyBpbiBjYXJ0OiAnLCB0cy5zZXNzaW9uKVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cy5nZXQoJ2l0ZW1zJykubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmlzSXRlbShpLCBpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRzLmdldCgnaXRlbXMnKVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVtb3ZlSXRlbSA9IChpZCwgbnVtICkgPT4ge1xuICAgIGxldCBpdGVtcyA9IHRzLmdldCgnaXRlbXMnKVxuICAgIG51bSA9IHR5cGVvZiBudW0gIT09ICd1bmRlZmluZWQnID8gIG51bSA6IDE7XG4gICAgaWYgKHRoaXMuaGFzSXRlbXMoKSkge1xuICAgICAgY29uc29sZS5sb2coJ05vIGl0ZW1zIGluIGNhcnQ6ICcsIHRzLnNlc3Npb24pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHMuZ2V0KCdpdGVtcycpW2ldLmlkID09IGlkKSB7XG4gICAgICAgIGlmIChpdGVtc1tpXS5xdWFudGl0eSA9PSAxKSB7XG4gICAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1zW2ldLnF1YW50aXR5ID0gaXRlbXNbaV0ucXVhbnRpdHkgLSBudW1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZGVzdHJveUl0ZW0gPSAoaWQpID0+IHtcbiAgICBsZXQgaXRlbXMgPSB0cy5nZXQoJ2l0ZW1zJylcbiAgICBpZiAodGhpcy5oYXNJdGVtcygpKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gaXRlbXMgaW4gY2FydDogJywgdHMuc2Vzc2lvbilcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0cy5nZXQoJ2l0ZW1zJylbaV0uaWQgPT0gaWQpIHtcbiAgICAgICAgaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZW1wdHlDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLnNldCgnaXRlbXMnLCBbXSlcbiAgICB0aGlzLmNhbGN1bGF0ZUNhcnQoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB0aGlzLmRlc3Ryb3lDYXJ0ID0gKCkgPT4ge1xuICAgIHRzLmNsZWFyKClcbiAgICB0aGlzLmNhcnRVcGRhdGVkKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdGhpcy5jYXJ0VXBkYXRlZCA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnY2FydCB1cGRhdGVkIGVtaXR0ZWQnKVxuICAgIGV2ZW50cy50cmlnZ2VyKCdjYXJ0OnVwZGF0ZScpXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUaW55Q2FydCIsImltcG9ydCBjYWxjaXRlIGZyb20gJ2NhbGNpdGUtd2ViJ1xuaW1wb3J0IFRpbnlDYXJ0IGZyb20gJy4vY2FydC5qcydcbmltcG9ydCBkcmF3VUkgZnJvbSAnLi9jYXJ0LXVpLmpzJ1xuaW1wb3J0IGxpc3RlblVJIGZyb20gJy4vY2FydC1saXN0ZW5lci5qcydcblxuLy8gdmFyIGNhcnQgPSBDYXJ0XG5cbndpbmRvdy5jYXJ0ID0gbmV3IFRpbnlDYXJ0KHtcbiAgY2FydE5hbWU6ICdsb25lZ29vc2VwcmVzc0NhcnQnLFxuICBjdXJyZW5jeTogJyQnLFxuICBiYXNlU2hpcHBpbmc6IDEwLjAwLFxuICBzaGlwcGluZzogNC4wMFxufSlcblxuZHJhd1VJKClcbmxpc3RlblVJKClcblxudmFyIHN1Y2Nlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwidGhhbmtzXCIpWzBdXG5pZiAoc3VjY2Vzcykge1xuICBjYXJ0LmVtcHR5Q2FydCgpXG59XG5cbndpbmRvdy5jYWxjaXRlLmluaXQoKVxuXG4iLCIvKipcbiogQ3JlYXRlIGFuIGV2ZW50cyBodWJcbiovXG5pbXBvcnQgRXZlbnRzIGZyb20gJ2FtcGVyc2FuZC1ldmVudHMnXG5cbi8vIENyZWF0ZSBhIG5ldyBldmVudCBidXNcbnZhciBldmVudHMgPSBFdmVudHMuY3JlYXRlRW1pdHRlcigpXG5cbi8vIGxpc3QgYWxsIGJvdW5kIGV2ZW50cyBmb3IgZGVidWdnaW5nXG4vL2V2ZW50cy5vbignYWxsJywgKCkgPT4gY29uc29sZS5sb2coZXZlbnRzLl9ldmVudHMpKVxuXG5leHBvcnQgZGVmYXVsdCBldmVudHMiXX0=

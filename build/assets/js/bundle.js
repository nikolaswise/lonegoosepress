(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

console.log("yes hello I am a javascript");
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

expandingNav();

},{}]},{},[1])
//# sourceMappingURL=bundle.js.map

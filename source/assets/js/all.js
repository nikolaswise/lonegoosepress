// ┌───────────────┐
// │ DOM Utilities │
// └───────────────┘

dom = {};
console.log('hey');
// ┌──────────────────────┐
// │ DOM Event Management │
// └──────────────────────┘

// returns standard interaction event, later will add touch support
dom.event = function () {
  return 'click';
};

// add a callback function to an event on a DOM node
dom.addEvent = function (domNode, event, fn) {
  if (domNode.addEventListener) {
    return domNode.addEventListener(event, fn, false);
  }
  if (domNode.attachEvent) {
    return domNode.attachEvent('on' + event, fn);
  }
};

// remove a specific function binding from a DOM node event
dom.removeEvent = function (domNode, event, fn) {
  if (domNode.removeEventListener) {
    return domNode.removeEventListener(event, fn, false);
  }
  if (domNode.detachEvent) {
    return domNode.detachEvent('on' + event,  fn);
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
// │ Class Manipulation │
// └────────────────────┘

// check if an element has a specific class
dom.hasClass = function (domNode, className) {
  var exp = new RegExp(' ' + className + ' ');
  if (exp.test(' ' + domNode.className + ' ')) {
    return true;
  }

  return false;
};

// add one or more classes to an element
dom.addClass = function (domNode, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    if (!dom.hasClass(domNode, classes[i])) {
      domNode.className += ' ' + classes[i];
    }
  }
};

// remove one or more classes from an element
dom.removeClass = function (domNode, classes) {
  classes = classes.split(' ');

  for (var i = 0; i < classes.length; i++) {
    var newClass = ' ' + domNode.className.replace( /[\t\r\n]/g, ' ') + ' ';

    if (dom.hasClass(domNode, classes[i])) {
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

// get an attribute for an element
dom.getAttr = function(domNode, attr) {
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
dom.nodeListToArray = function (domNodeList) {
  var array = [];
  for (var i = 0; i < domNodeList.length; i++) {
    array.push(domNodeList[i]);
  }
  return array;
};

// ┌────────────────────┐
// │ Array Manipulation │
// └────────────────────┘

arr = {};

// return the index of an object in an array with optional offset
arr.indexOf = function (obj, arr, offset) {
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


// ┌─────────────┐
// │ JS Patterns │
// └─────────────┘
// javascript logic for ui patterns

function findElements (className) {
  var elements = document.querySelectorAll(className);
  if (elements.length) {
    return dom.nodeListToArray(elements);
  } else {
    return false;
  }
}

// remove 'is-active' class from every element in an array
function removeActive (array) {
  if (typeof array == 'object') {
    array = dom.nodeListToArray(array);
  }
  array.forEach(function (item) {
    dom.removeClass(item, 'is-active');
  });
}

// remove 'is-active' from array, add to element
function toggleActive (array, el) {
  var isActive = dom.hasClass(el, 'is-active');
  if (isActive) {
    dom.removeClass(el, 'is-active');
  } else {
    removeActive(array);
    dom.addClass(el, 'is-active');
  }
}

// ┌───────────────┐
// │ Expanding Nav │
// └───────────────┘
// show and hide exanding nav located under topnav
expandingNav = function () {
  var toggles = findElements('.js-expanding-toggle');
  var expanders = findElements('.js-expanding');

  if (!expanders) {
    return;
  }

  function bindToggle (toggle) {
    dom.addEvent(toggle, dom.event(), function(event) {
      dom.preventDefault(event);

      var sectionName = dom.getAttr(toggle, 'data-expanding-nav');
      var sections = document.querySelectorAll('.js-expanding-nav');
      var section = document.querySelectorAll('.js-expanding-nav[data-expanding-nav="' + sectionName + '"]')[0];
      var expander = dom.closest('js-expanding', section);
      var isOpen = dom.hasClass(expander, 'is-active');
      var shouldClose = dom.hasClass(section, 'is-active');

      if (isOpen) {
        if (shouldClose) {
          dom.removeClass(expander, 'is-active');
        }
        toggleActive(sections, section);
      } else {
        toggleActive(sections, section);
        dom.addClass(expander, 'is-active');
      }

    });
  }

  for (var i = 0; i < toggles.length; i++) {
    bindToggle(toggles[i]);
  }
};

expandingNav();
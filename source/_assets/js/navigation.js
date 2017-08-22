var dom = require('dom')

// ┌────────────┐
// │ Navigation │
// └────────────┘
function expandingNav (domNode) {
  var toggles = dom.findElements('.js-expanding-toggle', domNode)
  var sections = document.querySelectorAll('.js-expanding')

  toggles.forEach(function (toggle) {
    dom.addEvent(toggle, dom.click(), function (e) {
      dom.preventDefault(e)

      var sectionId = toggle.getAttribute('data-expanding')
      var section = document.querySelector('.js-expanding[data-expanding="' + sectionId + '"]')
      var isOpen = dom.hasClass(section, 'is-active')
      var shouldClose = dom.hasClass(section, 'is-active')

      dom.toggleActive(sections, section)

      if (isOpen && shouldClose) {
        dom.removeClass(section, 'is-active')
      } else {
        dom.addClass(section, 'is-active')
      }
    })
  })
}

module.exports = expandingNav
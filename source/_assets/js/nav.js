import bus from 'modular-bus'
import * as event from 'modular-event'
import * as classy from 'modular-class'
import * as dom from 'modular-dom'

export default function () {
  let navToggles = dom.findElements('.js-expanding-toggle')
  let menus = dom.findElements('.js-expanding')
  const toggleMenu = () => {
    console.log('tog tog tog')
    menus.forEach(menu => {
      classy.toggle(menu, 'is-active')
    })
  }
  navToggles.forEach(toggle => {
    event.add(toggle, 'click', toggleMenu)
  })
}

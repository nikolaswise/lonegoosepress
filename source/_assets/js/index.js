import bus from 'modular-bus'
import * as classy from 'modular-class'
import * as aria from 'modular-aria'
import * as dom from 'modular-dom'
import * as event from 'modular-event'
import modal from 'modular-modal'

import Cart from './cart/app'

const cart = Cart({name: 'lonegoosepress'})
const setCartCounter = () => {
  let count = cart.get().itemCount
  let counters = dom.findElements('.js-cart-counter')
  counters.forEach(counter => {
    counter.innerHTML = count
  })
}
bus.on('cart:updated', setCartCounter)
setCartCounter()
modal()



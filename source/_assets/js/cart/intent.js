import bus from 'modular-bus'
import * as classy from 'modular-class'
import * as aria from 'modular-aria'
import * as dom from 'modular-dom'
import * as event from 'modular-event'

const bind = () => {
  let incrementItemButtons = dom.findElements('.js-add-one')
  let deincrementItemButtons = dom.findElements('.js-remove-one')
  let addToCartButtons = dom.findElements('.js-add-to-cart')
  let pricePickers = dom.findElements('.js-purchase-amount')
  let cartClearButtons = dom.findElements('.js-cart-clear')

  incrementItemButtons.forEach((button) => {
    button.addEventListener('click', incrementItemClick)
  })
  deincrementItemButtons.forEach((button) => {
    button.addEventListener('click', deincrementItemClick)
  })
  addToCartButtons.forEach((button) => {
    button.addEventListener('click', addToCartClick)
  })
  pricePickers.forEach((input) => {
    input.addEventListener('change', updatePrice)
  })
  cartClearButtons.forEach((button) => {
    button.addEventListener('click', cartClearClick)
  })
}

const addToCartClick = (e) => {
  let id = e.target.getAttribute('data-id')
  let price = e.target.getAttribute('data-price')
  bus.emit('cart:add', id, price)
}
const deincrementItemClick = (e) => {
  let id = e.target.getAttribute('data-id')
  bus.emit('cart:adjust', id, -1)
}
const incrementItemClick = (e) => {
  let id = e.target.getAttribute('data-id')
  bus.emit('cart:adjust', id, 1)
}
const updatePrice = (e) => {
  bus.emit('cart:price', e)
}
const cartClearClick = (e) => {
  bus.emit('cart:clear')
}

export default function () {
  bind()
  bus.on('cart:bind', bind)
}
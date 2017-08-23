import bus from './helpers/bus'
import * as classy from './helpers/classy'
import * as dom from './helpers/dom'
import * as event from './helpers/event'

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
  let id = e.target.getAttribute('data-artist')
  bus.emit('cart:add', id)
}
const deincrementItemClick = (e) => {
  let id = e.target.getAttribute('data-artist')
  bus.emit('cart:adjust', id, -1)
}
const incrementItemClick = (e) => {
  let id = e.target.getAttribute('data-artist')
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
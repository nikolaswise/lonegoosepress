import bus from 'modular-bus'
import * as classy from 'modular-classy'
import * as dom from 'modular-dom'
import cartTemplate from './cart-template'
var swig = require('swig')

const setToggleCartToggle = (cart) => {
  return function () {
    let cartToggleButtons = dom.findElements('.js-cart-toggle')
    let data = cart.get()
    if (data.items.length > 0) {
      cartToggleButtons.forEach((button) => {
        classy.remove(button, 'is-hidden')
      })
    } else {
      cartToggleButtons.forEach((button) => {
        classy.add(button, 'is-hidden')
      })
    }
  }
}
// THIS FUNCTION IS P GROSS
const setSetActions = (cart) => {
  return function () {
    let data = cart.get()
    let itemActions = dom.findElements('.js-action-container')
    let artistsInCart = []
    data.items.forEach((item) => {
      artistsInCart.push(item.id)
    })
    itemActions.forEach((item) => {
      let btn = item.querySelector('.js-add-to-cart')
      let num = item.querySelector('.js-action-current')
      let artist = btn.getAttribute('data-artist')
      if (artistsInCart.includes(artist)) {
        classy.add(item, 'is-in-cart')
        data.items.forEach((item) => {
          if (item.id === artist) {
            num.innerHTML = item.num
          }
        })
      } else {
        classy.remove(item, 'is-in-cart')
      }
    })
  }
}

const setCart = (cart) => {
  return function () {
    let data = cart.get()
    let cartOverviewSections = dom.findElements('.js-cart-overview')

    cartOverviewSections.forEach((section) => {
      let subTotal = section.querySelector('.js-purchase-amount')
      if (subTotal && parseInt(subTotal.value) > data.subtotal) {
        data.subtotal = parseInt(subTotal.value)
        data.total = data.shipping + data.subtotal
      }
      section.innerHTML = swig.render(cartTemplate, {locals: data})
    })

    if (data.itemCount > 0) {
      let body = document.querySelector('body')
      classy.add(body, 'is-cart')
      classy.remove(body, 'no-cart')
    } else {
      let body = document.querySelector('body')
      classy.remove(body, 'is-cart')
      classy.add(body, 'no-cart')
    }
    bus.emit('cart:bind')
  }
}

export default function (cart) {
  const renderCart = setCart(cart)
  const setActions = setSetActions(cart)
  const toggleCartToggle = setToggleCartToggle(cart)
  const bind = () => {
    console.log('bind')
    setActions();
  }
  bus.on('cart:updated', renderCart)
  bus.on('cart:updated', setActions)
  bus.on('cart:updated', toggleCartToggle)

  renderCart()
  setActions()
  toggleCartToggle()
}

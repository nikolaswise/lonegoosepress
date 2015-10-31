var dom = require('dom')
var Cart = require('cart')

var expandingNav = require('./navigation')
var modal = require('./modal')



var cart = Cart('lgpCart')

// ┌─────────────────────┐
// │ Cart Implementation │
// └─────────────────────┘
cart.count = function () {
  var cartCounter = document.querySelector('.js-cart-counter')
  var myCart = cart.get()
  cartCounter.innerHTML = myCart.itemCount
}

window.cart = cart

expandingNav()
modal()
cart.count()

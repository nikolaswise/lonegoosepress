var dom = require('dom')
var Cart = require('cart')
var swig = require('swig')

var expandingNav = require('./navigation')
var modal = require('./modal')



var cart = Cart('lgpCart')

// ┌─────────────────────┐
// │ Cart Implementation │
// └─────────────────────┘
var cartNode = document.querySelector('.js-cart-content')
var cartCounter = document.querySelector('.js-cart-counter')
var cartTemplate = `
{% if itemCount == 0 %}
  <p class="text-center padding-leader-2 padding-trailer-2">No items in your cart.</p>
{% else %}
  <h3 class="pre-1 trailer-half">Your Cart</h3>
  {% for item in items %}
    <div class="first-column font-size-1 padding-tailer-half trailer-half column-11 phone-column-5 text-center">
      <span class="left">{{item.id}}</span>
      <a href="#" class="js-remove-one gutter-right-1 link-white" data-id={{item.id}} data-add="false">-</a>
      <span>{{item.num}}</span>
      <a href="#" class="js-add-one gutter-left-1 link-white" data-id={{item.id}} data-add="true">+</a>
      <span class="right gutter-right-1">{{item.price}}</span>
      <hr />
    </div>
  {% endfor %}
  <div class="column-11 phone-column-5">
    <p class="font-size-1 trailer-half text-right gutter-right-1">Subtotal: $ {{ subtotal }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Shipping: $ {{ shipping }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Total: $ {{ total }}</p>
    <p class="leader-1">
      <a href="#" class="btn right js-checkout">Checkout</a>
    </p>
  </div>
{% endif %}
`



cart.count = function () {
  var myCart = cart.get()
  console.log(myCart)
  cartCounter.innerHTML = myCart.itemCount
  cartNode.innerHTML = swig.render(cartTemplate, {locals: myCart})


  var addItemButtons = document.querySelectorAll('.js-add-one')
  var minusItemButtons = document.querySelectorAll('.js-remove-one')
  if (addItemButtons.length > 0) {
    let addBtns = dom.nodeListToArray(addItemButtons)
    let mnsBtns = dom.nodeListToArray(minusItemButtons)
    bindButtons(addBtns)
    bindButtons(mnsBtns)
  }



}

var initCart = function () {
  var addToCartBtn = document.querySelector('.js-add-to-cart')

  if (addToCartBtn) {
    let title = addToCartBtn.getAttribute('data-title')
    let price = addToCartBtn.getAttribute('data-price')
    var addItemToCart = function () {
      cart.addItem(title, 1, price)
      cart.count()
    }
    dom.addEvent(addToCartBtn, dom.click(), addItemToCart)
  }
  cart.count()
}

var bindButtons = function (btns) {
  btns.forEach(function (btn) {
    let id = btn.getAttribute('data-id')
    dom.addEvent(btn, dom.click(), incrementItem)
  })
}


var incrementItem = function(e) {
  let id = e.target.getAttribute('data-id')
  let addOne = e.target.getAttribute('data-add')
  if (addOne == 'true') {
    cart.incrementItem(id, 1)
  } else {
    cart.incrementItem(id, -1)
  }
  cart.count()
}

window.cart = cart

expandingNav()
modal()
initCart()

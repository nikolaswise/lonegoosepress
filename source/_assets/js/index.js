var dom = require('dom')
var Cart = require('cart')
var swig = require('swig')

var expandingNav = require('./navigation')
var modal = require('./modal')
var rq = require('./rq');

var cart = Cart({name: 'lgpCart'})

// ┌─────────────────────┐
// │ Cart Implementation │
// └─────────────────────┘
var cartSummary = document.querySelector('.js-cart-summary')
var cartNode = document.querySelector('.js-cart-content')
var cartCounter = document.querySelector('.js-cart-counter')
var cartTemplate = `
{% if itemCount == 0 %}
  <p class="text-center padding-leader-2 padding-trailer-2">No items in your cart.</p>
  <a href="#" class="btn right js-modal-toggle" data-modal="cart">Keep Shopping</a>
{% else %}
  <h3 class="trailer-1">Your Cart</h3>
  {% for item in items %}
    <div class="first-column font-size-1 padding-tailer-half trailer-half column-11 phone-column-5">
      <a href="#" class="js-remove-one gutter-right-1 link-white" data-id="{{item.id|url_encode}}"" data-add="false">-</a>
      <span>{{item.num}}</span>
      <a href="#" class="js-add-one gutter-left-1 link-white" data-id="{{item.id|url_encode}}" data-add="true">+</a>
      <span class="gutter-left-1">{{item.id}}</span>
      <span class="right gutter-right-1">{{item.price}}</span>
      <hr />
    </div>
  {% endfor %}
  <div class="column-11 phone-column-5">
    <p class="font-size-1 trailer-half text-right gutter-right-1">Subtotal: $ {{ subtotal }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Shipping: $ {{ shipping }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Total: $ {{ total }}</p>
    <p class="leader-1 text-right">
      <a href="#" class="btn btn-clear js-modal-toggle gutter-right-1" data-modal="cart">Keep Shopping</a>
      <a href="/checkout" class="btn">Checkout</a>
    </p>
  </div>
{% endif %}
`

var cartSummaryTemplate = `
{% if itemCount == 0 %}
  <p class="text-center padding-leader-2 padding-trailer-2">Thanks for your purchase!</p>
{% else %}
  <h3 class="trailer-1">Your Cart</h3>
  {% for item in items %}
    <div class="first-column font-size-1 padding-tailer-half trailer-half column-11 phone-column-5">
      <a href="#" class="js-remove-one gutter-right-1 link-white" data-id={{item.id|url_encode}} data-add="false">-</a>
      <span>{{item.num}}</span>
      <a href="#" class="js-add-one gutter-left-1 link-white" data-id={{item.id|url_encode}} data-add="true">+</a>
      <span class="gutter-left-1">{{item.id}}</span>
      <span class="right gutter-right-1">{{item.price}}</span>
      <hr />
    </div>
  {% endfor %}
  <div class="column-11 phone-column-5">
    <p class="font-size-1 trailer-half text-right gutter-right-1">Subtotal: $ {{ subtotal }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Shipping: $ {{ shipping }}</p>
    <p class="font-size-1 trailer-half text-right gutter-right-1">Total: $ {{ total }}</p>
  </div>
{% endif %}
`
cart.count = function () {
  var myCart = cart.get()
  myCart.shipping = (myCart.itemCount*5) + 7
  myCart.total = myCart.subtotal + myCart.shipping
  cart.set(myCart)

  if (cartCounter) {
    cartCounter.innerHTML = myCart.itemCount
  }
  if (cartNode) {
    cartNode.innerHTML = swig.render(cartTemplate, {locals: myCart})
  }
  if (cartSummary) {
    cartSummary.innerHTML = swig.render(cartSummaryTemplate, {locals: myCart})
    window.myCart = myCart
  }

  var addItemButtons = document.querySelectorAll('.js-add-one')
  var minusItemButtons = document.querySelectorAll('.js-remove-one')
  if (addItemButtons.length > 0) {
    let addBtns = dom.nodeListToArray(addItemButtons)
    let mnsBtns = dom.nodeListToArray(minusItemButtons)
    bindButtons(addBtns)
    bindButtons(mnsBtns)
  }

  var checkoutBtn = document.querySelector('.js-checkout')
  if (checkoutBtn) {
    console.log(checkoutBtn)
    dom.addEvent(checkoutBtn, dom.click(), checkout)
  }
}

var initCart = function () {
  var addToCartBtn = document.querySelector('.js-add-to-cart')

  if (addToCartBtn) {
    let title = addToCartBtn.getAttribute('data-title')
    console.log(title)
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
  e.preventDefault()
  let encodedId = e.target.getAttribute('data-id')
  let id = unescape(encodedId)
  console.log(id)
  let addOne = e.target.getAttribute('data-add')
  if (addOne == 'true') {
    cart.incrementItem(id, 1)
  } else {
    cart.incrementItem(id, -1)
  }
  cart.count()
}

var checkout = function (e) {
  e.preventDefault()
  let purchase = cart.get()
}

window.cart = cart


function post(path, params, method) {
  method = method || "post"; // Set method to post by default if not specified.

  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
      if(params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
       }
  }

  document.body.appendChild(form);
  form.submit();
}

// payments
var purchase
var handler = StripeCheckout.configure({
  key: 'pk_live_wLZlZRJUMFZTeyK5tab54l8X', //lgp live key
  // key: 'pk_test_t47yPEUuI5OJSNGqqkpjV1tO', //department test key
  locale: 'auto',
  billingAddress: true,
  shippingAddress: true,
  token: function(token, addresses) {
    console.log(token)
    console.log(addresses)
    let order = cart.get();
    let obj = {order: []};
    order.items.forEach(function (item) {
      obj.order.push({
        quantity: item.num,
        description: item.id
      })
    })
    let form = Object.assign(token, addresses);
    form.amount = order.total * 100;
    form.description = `${order.itemCount} items`;
    form.order = JSON.stringify(obj);
    console.log(form)
    rq.post('http://api.nikolas.ws/lone-goose-press/charge', form)
    .then((response) => {
      console.log(response);
      window.location.assign('/thanks');
    }).catch((err) => {
      window.location.assign('/problem');
    })
  }
});

function submitCheckout () {
  let order = cart.get();
  var charge = {
    name: 'Secure Checkout',
    description: `${order.itemCount} items`,
    amount: order.total * 100
  }
  handler.open(charge);
}

var payBtn = document.querySelector('.js-stripe-pay')
if (payBtn) {
  dom.addEvent(payBtn, dom.click(), submitCheckout)
}


  // var handler = StripeCheckout.configure({
  //   key: 'pk_live_wLZlZRJUMFZTeyK5tab54l8X',
  //   locale: 'auto',
  //   token: function(token, addresses) {
  //     // Use the token to create the charge with a server-side script.
  //     // You can access the token ID with `token.id`
  //     var charge = {
  //       token: JSON.stringify(token),
  //       details: JSON.stringify(purchase),
  //       addresses: JSON.stringify(addresses)
  //     }
  //     post('/charge', charge)
  //     dom.addClass(payBtn, 'hide')
  //   }
  // })

  // var submitCheckout = function (e) {
  //   // e.preventDefault();
  //   purchase = cart.get()
  //   handler.open({
  //     name: 'Secure Checkout',
  //     description: `${purchase.itemCount} items`,
  //     billingAddress: true,
  //     shippingAddress: true,
  //     zipCode: true,
  //     allowRememberMe: false,
  //     amount: purchase.total * 100
  //   });
  // }

  // const handler = StripeCheckout.configure({
  //   key: 'pk_test_t47yPEUuI5OJSNGqqkpjV1tO',
  //   image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  //   locale: 'auto',
  //   billingAddress: true,
  //   shippingAddress: true,
  //   token: function(token, addresses) {
  //     let form = Object.assign(parseForm(), token, addresses)
  //     form.order = JSON.stringify(order)
  //     console.log(form)
  //     rq.post('http://localhost:3000/charge', form)
  //     .then((response) => {
  //       console.log(`here is your response: ${response}`)
  //     }).catch((err) => {
  //       console.log(`there was an error: ${err}`)
  //     })
  //   }
  // });
  // handler.open(form);


//   dom.addEvent(payBtn, dom.click(), submitCheckout)
// }

expandingNav()
initCart()
modal()

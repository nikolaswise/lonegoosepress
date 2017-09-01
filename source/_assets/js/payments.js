
import bus from 'modular-bus'
import 'whatwg-fetch'
import * as classy from 'modular-class'
import * as aria from 'modular-aria'
import * as dom from 'modular-dom'
import * as event from 'modular-event'

const req = fetch

const payment = {
  "redirect_url": "https://lonegoosepress.com/thanks/",
  "idempotency_key": "{{UNIQUE STRING FOR THIS TRANSACTION}}",
  "ask_for_shipping_address": true,
  "merchant_support_email": "orders@lonegoosepress.com",
}

const buildOrder = data => {
  const order = {
    "line_items": buildItems(data.items, data.shipping)
  }
  return order
}

const buildItems = (items, shipping) => {
  items.push({
    id: "Shipping",
    num: 1,
    price: shipping
  })
  return items.map(item => {
    return {
      "name": item.id,
      "quantity": item.num.toString(),
      "base_price_money": {
        "amount": parseInt(item.price),
        "currency": "USD"
      }
    }
  })
}

const bind = () => {
  const btnClick = () => bus.emit('payment:start')
  let submitBtns = dom.findElements('.js-submit-payment')
  submitBtns.forEach(btn => {
    event.add(btn, 'click', btnClick)
  })
}

const setup = cart => () => {
  const data = cart.get()
  const order = buildOrder(data)
  const body = JSON.stringify(order)
  req('http://local.nikolas.ws:3000/lone-goose-press/square/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
  .then(function(res){
    return res.json();
  })
  .then(function(data){
    bus.emit('checkout:new', data)
  })
}

const handleCheckout = data => {
  location.assign(data.checkout.checkout_page_url)
}

const init = cart => {
  window.cart = cart
  bind()
  const submitCart = setup(cart)
  bus.on('payment:start', submitCart)
  bus.on('checkout:new', handleCheckout)
}

export default init
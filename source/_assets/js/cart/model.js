import bus from 'modular-bus'

export default function (cart) {
  const addToCart = (id, price) => {
    console.log(id)
    cart.addItem(id, 1, price)
    bus.emit('cart:updated')
  }
  const adjustItemCount = (id, count) => {
   cart.incrementItem(id, count)
   bus.emit('cart:updated')
  }
  const setPrice = (e) => {
   let pricePickers = document.querySelectorAll('.js-purchase-amount')
   pricePickers.forEach((input) => {
     input.value = e.target.value
   })
   bus.emit('cart:updated')
  }
  const clearCart = () => {
    cart.clear()
    bus.emit('cart:updated')
  }
  bus.on('cart:clear', clearCart)
  bus.on('cart:add', addToCart)
  bus.on('cart:adjust', adjustItemCount)
  bus.on('cart:price', setPrice)
}
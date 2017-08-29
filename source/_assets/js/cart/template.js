const lineItem = item => {
  return`
    <div class="first-column font-size-1 padding-tailer-half trailer-half column-11 phone-column-5">
      <a href="#" class="js-remove-one gutter-right-1 link-white" data-id="${item.id}" data-add="false">-</a>
      <span>${item.num}</span>
      <a href="#" class="js-add-one gutter-left-1 link-white" data-id="${item.id}" data-add="true">+</a>
      <span class="gutter-left-1">${item.id}</span>
      <span class="right gutter-right-1">${item.price}</span>
      <hr />
    </div>
  `
}

const render = cart => {
  console.log(cart)
  if (cart.items.length == 0) {
    return `
      <p class="text-center padding-leader-2 padding-trailer-2">No items in your cart.</p>
      <a href="#" class="btn right js-modal-toggle" data-modal="cart">Keep Shopping</a>
    `
  }
  return `
    <h3 class="trailer-1">Your Cart</h3>
    ${cart.items.map(item => lineItem(item)).join('')}
    <div class="column-11 phone-column-5">
      <p class="font-size-1 trailer-half text-right gutter-right-1">Subtotal: $ ${ cart.subtotal }</p>
      <p class="font-size-1 trailer-half text-right gutter-right-1">Shipping: $ ${ cart.shipping }</p>
      <p class="font-size-1 trailer-half text-right gutter-right-1">Total: $ ${ cart.total }</p>
    </div>
  `
}

export default render
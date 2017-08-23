export default `
  {% if items.length == 0 %}
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

import bus from 'modular-bus'
import * as classy from 'modular-class'
import * as aria from 'modular-aria'
import * as dom from 'modular-dom'
import * as event from 'modular-event'
import intent from './intent'
import model from './model'
import view from './view'

var cart = function (options) {
  var name = options.name
  var emptyModel = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  }

  var set = function (model) {
    window.localStorage.setItem(name, JSON.stringify(model))
    return this
  }

  var get = function () {
    var model = JSON.parse(window.localStorage.getItem(name))
    model.itemCount = 0
    model.subtotal = 0
    model.shipping = 0
    model.items.forEach(function (item){
      console.log(item)
      model.subtotal += (item.price * item.num)
      model.itemCount += item.num
      model.shipping += (item.shipping * item.num)
    })
    model.total = model.subtotal + model.shipping
    return model
  }

  var clear = function () {
    set(emptyModel)
    return this
  }

  var getItemIds = function () {
    var model = get()
    return model.items.map(function (item){
      return item.id
    })
  }

  var addItem = function (id, num, price, shipping) {
    var model = get()
    var item = {
      id: id,
      price: price,
      shipping: shipping,
      num: num
    }
    if (!hasItem(id)) {
      model.items.push(item)
    } else {
      var i = getItemIds().indexOf(id)
      model.items[i].num += num
    }
    set(model)
    return this
  }

  var hasItem = function (id) {
    var model = get()
    var itemIds = getItemIds()
    return itemIds.indexOf(id) > -1
  }

  var incrementItem = function(id, num) {
    var model = get()
    var i = getItemIds().indexOf(id)
    model.items[i].num += num
    if (model.items[i].num == 0) {
      model.items.splice(i, 1)
    }
    set(model)
    return this
  }

  var setItemCount = function(id, num) {
    var model = get()
    var i = getItemIds().indexOf(id)
    model.items[i].num = num
    if (model.items[i].num == 0) {
      model.items.splice(i, 1)
    }
    set(model)
    return this
  }

  var submit = function (cb) {
    var model = get()
    cb(model)
    return this
  }

  var current = JSON.parse(window.localStorage.getItem(name))
  if (!current) {
    set(emptyModel)
  }


  const Cart = {
    set: set,
    get: get,
    clear: clear,
    getItemIds: getItemIds,
    addItem: addItem,
    hasItem: hasItem,
    incrementItem: incrementItem,
    setItemCount: setItemCount,
    submit: submit
  }
  intent()
  model(Cart)
  view(Cart)
  return Cart
}

export default cart
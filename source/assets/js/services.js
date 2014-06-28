angular.module('lgpCommerce.services', [])

// create a data service that provides a store and a shopping
// cart that will be shared by all views
// (instead of creating fresh ones for each view).
.service("DataService", function() {
  // var myStore = new store();
  var myCart = new shoppingCart("lgpStore");
  window.myCart = myCart;

  return {
    cart: myCart
  };
});
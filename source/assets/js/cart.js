// ┌──────────────┐
// │ Angular Cart │
// └──────────────┘
// handle the finest of shopping experiences

var myApp = angular.module('myApp',['ngCart']);

myApp.controller ('myCtrl', ['ngCart', function(ngCart) {
    ngCart.setTax(7.5);
    ngCart.setShipping(2.99);
    console.log (ngCart);
}]);

console.log(angular);
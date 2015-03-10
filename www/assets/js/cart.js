// ┌──────────────┐
// │ Angular Cart │
// └──────────────┘
// handle the finest of shopping experiences

var myApp = angular.module('myApp',['ngCart']);

myApp.controller ('myCtrl', ['$scope', '$http', 'ngCart', function($scope, $http, ngCart) {
    ngCart.setTax(7.5);
    ngCart.setShipping(2.99);
    // console.log (ngCart);

    $scope.checkout = function() {
      console.log(ngCart.totalCost()*100)
     //$http.post('cart/', ngCart.totalCost()*100);
    };
}]);

// console.log(angular);
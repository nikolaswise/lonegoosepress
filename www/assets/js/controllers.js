angular.module('lgpCommerce.controllers', [])

.controller('storeController', ['$scope', 'DataService', function($scope, DataService) {
  // // get store and cart from service
  // $scope.store = DataService.store;
  $scope.cart = DataService.cart;

  console.log($scope.cart);
}]);

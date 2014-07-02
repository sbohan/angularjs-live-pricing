'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', ['$scope','socket','SubscriptionService', function ($scope, socket, SubscriptionService) {

    $scope.$watch('selectedInstruments', function(newval, oldval){
      //check if instruments has changed and if so, emit socket back to server to add subscription to this user
      if(oldval !== newval){
        socket.emit('subscription:request', JSON.stringify(newval));
      }
    }, true);

    $scope.select2Options = {
        'maximumSelectionSize': 6,
        'placeholder': "Select instruments to stream",
    };

    $scope.selectedInstruments = ["EUR_USD"];

    var _init = function(){
      SubscriptionService.loadAvailableProductsFromServer().then(function(){
        $scope.productList = SubscriptionService.getProductsSymbols();
      });
    };

    $scope.getProductDisplayName = function(instrument){
      return SubscriptionService.getProductDisplayName(instrument);
    }

    _init();

  }]).
  controller('MyCtrl1', ['$scope','socket','$http', function ($scope, socket, $http) {

  }]).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here
  });

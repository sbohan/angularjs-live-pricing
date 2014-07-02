'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  factory('SubscriptionService', function ($http) {

  	var _products,
  		_productMap = [];

  	var _loadAvailableProductsFromServer = function() {

		var promise = $http.get('/api/products');

		promise.success(function(data, status, headers, config) {
			console.log('got products response' + status +" content: "+ data);
			_products = data.instruments;

			for(var i=0;i<data.instruments.length;i++){
			  _productMap[data.instruments[i].instrument] = data.instruments[i].displayName;
			}

			return data.instruments;
		}).
		error(function(data, status, headers, config) {
			console.log('no response from server');
		});

		return promise;
    },

	_getProductDisplayName = function(instrument){
    	return _productMap[instrument];
    },
    _getProductsSymbols = function(instrument){
    	return _products;
    }

    return {
    	loadAvailableProductsFromServer: _loadAvailableProductsFromServer,
    	getProductDisplayName: _getProductDisplayName,
    	getProductsSymbols: _getProductsSymbols
    };

  }).
factory('socket', function (socketFactory) {
    return socketFactory();
  }).
  value('version', '0.1');

'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('sbInstrumentPanel', function (version) {
    return {
    	controller: ['$scope','socket','$http', function ($scope, socket, $http) {
		      $scope.prices = [
		      {
		        "key": "bid",
		        "values": []
		      },
		      {
		        "key": "ask",
		        "values": []
		      },
		      {
		        "key": "mid",
		        "values": []
		      }
		    ];

		    $scope.spreads = [
		      {
		        "key": "spread",
		        "values": []
		      }
		    ];

		    $scope.xAxisTickFormatFunction = function(){
		        return function(d){
		            var val = d3.time.format('%H:%M:%S')(moment(d).toDate());
		            return val;
		        }
		    };

		    $scope.yAxisTickFormatFunction = function(){
		        return function(d){
		            return d.toFixed(5);
		        }
		    };

		    var colorArray = ['#AA3939', '#1B2E58', '#384155'];
		    $scope.colorFunction = function() {
		        return function(d, i) {
		            return colorArray[i];
		        };
		    };

		    var MAX_DATA_POINTS = 50;

		    var PRICES = {
		      BID : 0,
		      ASK : 1,
		      MID : 2
		    }


		    socket.on('stream:'+$scope.instrument, function (data) {
		      $scope.time = data.time;
		      $scope.bid = data.bid;
		      $scope.ask = data.ask;
		      //$scope.instrument = $scope.getProductDisplayName(data.instrument);

		      var date = new Date(data.time);

		      //Add data points, safe to assume 0 array matches all...

		      //TODO: Change the backing datastructure of these to be a queue like data structure...
		      if($scope.prices[PRICES.BID].values.length >= MAX_DATA_POINTS) {
		        var bidArray = angular.copy($scope.prices[PRICES.BID].values);
		        var askArray = angular.copy($scope.prices[PRICES.ASK].values);
		        var midArray = angular.copy($scope.prices[PRICES.MID].values);

		        var spreadArray = angular.copy($scope.spreads[0].values);

		        bidArray.shift();
		        askArray.shift();
		        midArray.shift();
		        spreadArray.shift();

		        bidArray.push([date.getTime(), data.bid]);
		        askArray.push([date.getTime(), data.ask]);
		        midArray.push([date.getTime(), ((data.ask+data.bid)/2)]);
		        spreadArray.push([date.getTime(), ((data.ask-data.bid)*10000).toFixed(2)]);

		        $scope.prices[PRICES.BID].values = bidArray;
		        $scope.prices[PRICES.ASK].values = askArray;
		        $scope.prices[PRICES.MID].values = midArray;
		        $scope.spreads[0].values = spreadArray;

		      }else{
		        $scope.prices[PRICES.BID].values.push([date.getTime(), data.bid]);
		        $scope.prices[PRICES.ASK].values.push([date.getTime(), data.ask]);
		        $scope.prices[PRICES.MID].values.push([date.getTime(), ((data.ask+data.bid)/2)]);

		        $scope.spreads[0].values.push([date.getTime(), ((data.ask-data.bid)*10000).toFixed(2)]);
		      }


		    });
		}],
		scope: {
            'instrument': '=',
            'displayName': '='
        },
        restrict: 'E',
        templateUrl: '/views/instrument-panel.html'
    }
  });

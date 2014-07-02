'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }).
  filter('formatPrice', function () {
    return function (price) {
    	if(!price)
    		return;
    	var priceParts = price.toString().split("");
    	var result = "<span>";
    	for(var i=0;i<priceParts.length;i++){

    		if(i===priceParts.length-3)
				result += "<span class='sigFig'>";

			result += priceParts[i];

			if(i===priceParts.length-2)
				result += "</span>";
    	}
    	result += "</span>";

    	return result;
    }
  });

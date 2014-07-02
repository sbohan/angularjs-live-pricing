'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngRoute',
  'ngSanitize',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',

  // 3rd party dependencies
  'btford.socket-io',
  'nvd3ChartDirectives',
  'ui.select2'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/prices', {
      templateUrl: 'partials/partial1',
      controller: 'MyCtrl1'
    }).
    otherwise({
      redirectTo: '/prices'
    });

  $locationProvider.html5Mode(true);
});

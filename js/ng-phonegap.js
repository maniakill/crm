/*
 * angular-phonegap-ready v0.0.1
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */
'use strict';
angular.module('btford.phonegap.ready', []).
factory('phonegapReady', function ($rootScope) {
  return function (fn) {
    var queue = [];
    var impl = function () {
      queue.push(Array.prototype.slice.call(arguments));
    };
    document.addEventListener('deviceready', function () {
      queue.forEach(function (args) {
        fn.apply(this, args);
      });
      impl = fn;
    }, false);
    return function () {
      return impl.apply(this, arguments);
    };
  };
});
/*
 * angular-phonegap-geolocation v0.0.1
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */
angular.module('btford.phonegap.geolocation',['btford.phonegap.ready']).
factory('geolocation', function ($rootScope, phonegapReady) {
  return {
    getCurrentPosition: phonegapReady(function (onSuccess, onError, options) {
      navigator.geolocation.getCurrentPosition(function () {
        var that = this, args = arguments;
        if (onSuccess) {
          $rootScope.$apply(function () {
            onSuccess.apply(that, args);
          });
        }
      }, function () {
        var that = this, args = arguments;
        if (onError) {
          $rootScope.$apply(function () {
            onError.apply(that, args);
          });
        }
      }, options);
    })
  };
});

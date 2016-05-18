angular.module('hm', ['hm.bootstrap', 'hm.device', 'hm.http', 'hm.load', 'hm.resource']);

angular.module('hm.device', []);

angular.module('hm.load', []);

angular.module('hm.http', []);

angular.module('hm.resource', []);

angular.module('hm').provider('hmProvider', [
  '$timeout', function($timeout) {
    var _serverUrl, _tokenHeaders;
    _serverUrl = '';
    _tokenHeaders = {};
    return this.$get = function() {
      return {
        serverUrl: _serverUrl,
        tokenHeaders: _tokenHeaders
      };
    };
  }
]);

angular.module('hm.device').factory('hmDevice', [
  '$window', function($window) {
    return {
      isIE: function() {
        return !!navigator.userAgent.match(/MSIE/i);
      },
      isSmartDevice: function() {
        var ua;
        ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        return /iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(ua);
      }
    };
  }
]);


/*
 * http处理
 * get
 * post --> application/x-www-form-urlencoded
 * put  --> application/x-www-form-urlencoded
 * delete
 * payload --> application/json
 */
angular.module('hm.http').factory('hmHttp', [
  '$http', 'hm', function($http, hm) {
    var _getHeaders, _getUrl, _seriliz;
    _getUrl = function(url) {
      return hm.serverUrl + url;
    };
    _seriliz = function(params) {
      params = !!params ? params : {};
      return $.param(params);
    };
    _getHeaders = function(headers) {
      return angular.extend({}, headers);
    };
    return {
      get: function(url, params) {
        return $http({
          method: 'GET',
          url: _getUrl(url),
          params: params,
          headers: _getHeaders(hm.tokenHeaders)
        });
      },
      post: function(url, params, headers) {
        return $http({
          method: 'POST',
          url: _getUrl(url),
          data: _seriliz(params),
          headers: _getHeaders(headers, hm.tokenHeaders, {
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        });
      },
      put: function(url, params, headers) {
        return $http({
          method: 'PUT',
          url: _getUrl(url),
          data: _seriliz(params),
          headers: _getHeaders(headers, hm.tokenHeaders, {
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        });
      },
      payload: function(url, params, headers) {
        return $http({
          method: 'POST',
          url: _getUrl(url),
          data: params,
          headers: _getHeaders(headers, hm.tokenHeaders, {
            'Content-Type': 'application/json'
          })
        });
      },
      "delete": function(url) {
        return $http({
          method: 'DELETE',
          url: _getUrl(url),
          headers: _getHeaders(hm.tokenHeaders)
        });
      }
    };
  }
]);

angular.module('hm.resource').factory('hmResource', [
  '$q', '$timeout', function($q, $timeout) {
    return {
      load: function(datas) {
        var deferred, promise;
        deferred = $q.defer();
        promise = deferred.promise;
        promise.success = function(fn) {
          return promise.then(fn);
        };
        promise.error = function(fn) {
          return promise.then(null, fn);
        };
        $timeout((function() {
          return deferred.resolve(datas);
        }), 100);
        return promise;
      }
    };
  }
]);

angular.module('hm.load').factory('hmLoad', [
  '$q', '$timeout', '$document', function($q, $timeout, $document) {
    var _deferred, _loaded, _promise;
    _loaded = [];
    _promise = false;
    _deferred = $q.defer();
    return {
      loadScript: function(src) {
        var deferred, script;
        if (loaded[src]) {
          return loaded[src].promise;
        }
        deferred = $q.defer();
        script = $document[0].createElement('script');
        script.src = src;
        script.onload = function(e) {
          return $timeout(function() {
            return deferred.resolve(e);
          });
        };
        script.onerror = function(e) {
          return $timeout(function() {
            return deferred.reject(e);
          });
        };
        $document[0].body.appendChild(script);
        loaded[src] = deferred;
        return deferred.promise;
      },
      loadCSS: function(href) {
        var deferred, style;
        if (loaded[href]) {
          return loaded[href].promise;
        }
        deferred = $q.defer();
        style = $document[0].createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = href;
        script.onload = function(e) {
          return $timeout(function() {
            return deferred.resolve(e);
          });
        };
        script.onerror = function(e) {
          return $timeout(function() {
            return deferred.reject(e);
          });
        };
        $document[0].body.appendChild(script);
        loaded[href] = deferred;
        return deferred.promise;
      }
    };
  }
]);

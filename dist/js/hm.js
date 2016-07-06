angular.module('hm', ['hm.device', 'hm.load', 'hm.log', 'hm.http', 'hm.resource']);

angular.module('hm.device', []);

angular.module('hm.http', []);

angular.module('hm.load', []);

angular.module('hm.log', []);

angular.module('hm.resource', []);

angular.module('hm').provider('hm', [
  function() {
    this.defaults = {
      serverUrl: ''
    };
    this.tokenHeaders = {};
    this.$get = function() {
      return {
        defaults: this.defaults
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
      return hm.defaults.serverUrl + url;
    };
    _seriliz = function(params) {
      params = !!params ? params : {};
      return $.param(params);
    };
    _getHeaders = function() {
      var array, validArray;
      array = Array.prototype.slice.call(arguments);
      validArray = [];
      array.forEach(function(ele) {
        if (!!ele) {
          return validArray[validArray.length] = ele;
        }
      });
      return angular.extend({}, validArray);
    };
    return {
      get: function(url, params) {
        return $http({
          method: 'GET',
          url: _getUrl(url),
          params: params
        });
      },
      post: function(url, params, headers) {
        return $http({
          method: 'POST',
          url: _getUrl(url),
          data: _seriliz(params),
          headers: _getHeaders(headers, {
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        });
      },
      put: function(url, params, headers) {
        return $http({
          method: 'PUT',
          url: _getUrl(url),
          data: _seriliz(params),
          headers: _getHeaders(headers, {
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        });
      },
      payload: function(url, params, headers) {
        return $http({
          method: 'POST',
          url: _getUrl(url),
          data: params,
          headers: _getHeaders(headers, {
            'Content-Type': 'application/json'
          })
        });
      },
      "delete": function(url) {
        return $http({
          method: 'DELETE',
          url: _getUrl(url)
        });
      }
    };
  }
]);

angular.module('hm.log').factory('hmLog', [
  '$log', function($log) {
    return {
      debug: function() {
        if ($log.isDebugEnabled()) {
          return $log.debug(arguments);
        }
      },
      info: function() {
        if ($log.isInfoEnabled()) {
          return $log.info(arguments);
        }
      },
      warn: function() {
        if ($log.isWarnEnabled()) {
          return $log.warn(arguments);
        }
      },
      error: function() {
        return $log.error(arguments);
      },
      log: function() {
        if ($log.isDebugEnabled()) {
          return $log.debug(arguments);
        }
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
      },
      load: function(srcs) {
        var promise, self;
        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
        self = this;
        if (!promise) {
          promise = deferred.promise;
        }
        angular.forEach(srcs, function(src) {
          return promise = promise.then(function() {
            if (src.indexOf('.css') >= 0) {
              return self.loadCSS(src);
            } else {
              return self.loadScript(src);
            }
          });
        });
        deferred.resolve();
        return promise;
      }
    };
  }
]);

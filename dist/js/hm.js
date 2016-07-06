angular.module('hm', ['hm.device', 'hm.ui.load', 'hm.directive', 'hm.log', 'hm.http', 'hm.resource']);


/*
 * 通用指令
 */
angular.module('hm.directive', []);

angular.module('hm.device', []);

angular.module('hm.http', []);

angular.module('hm.ui.load', []);

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

angular.module('hm.ui.load').factory('hmUiLoad', [
  '$q', '$timeout', '$document', function($q, $timeout, $document) {
    var _loaded;
    _loaded = [];
    return {
      loadScript: function(src) {
        var deferred, script;
        if (_loaded[src]) {
          return _loaded[src].promise;
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
        _loaded[src] = deferred;
        return deferred.promise;
      },
      loadCSS: function(href) {
        var deferred, style;
        if (_loaded[href]) {
          return _loaded[href].promise;
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
        _loaded[href] = deferred;
        return deferred.promise;
      },
      load: function(srcs) {
        var deferred, promise, self;
        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
        self = this;
        deferred = $q.defer();
        promise = deferred.promise;
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


/*
 * 0.1.1
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 *
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 *
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 *     Multiple parameters can be separated by commas
 * @param [ui-refresh] {expression} Watch expression and refire plugin on changes
 *
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter" ui-refresh="iChange">
 */
angular.module('hm.directive').directive('hmUiJq', [
  'hmUiLoad', 'hmLog', 'JQ_ASSETS_LIB', '$timeout', function(hmUiLoad, hmLog, JQ_ASSETS_LIB, $timeout) {
    var hmUiJqCompilingFunction;
    return {
      restrict: 'A',
      compile: hmUiJqCompilingFunction = function(ele, attrs) {
        var hmUiJqLinkingFunction;
        if (!angular.isFunction(ele[attrs.hmUiJq]) && !JQ_ASSETS_LIB[attrs.hmUiJq]) {
          throw new Error('hm-ui-jq: The "' + attrs.hmUiJq + '" function does not exist');
        }
        return hmUiJqLinkingFunction = function(scope, ele, attrs) {
          var callPlugin, getOptions, refresh;
          getOptions = function() {
            var linkOptions;
            linkOptions = [];
            if (attrs.uiOptions) {
              linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
            }
            return linkOptions;
          };
          callPlugin = function() {
            return $timeout((function() {
              return ele[attrs.hmUiJq].apply(ele, getOptions());
            }), 0, false);
          };
          refresh = function() {
            if (attrs.uiRefresh) {
              return scope.$watch(attrs.uiRefresh, function() {
                return callPlugin();
              });
            }
          };
          if (attrs.ngModel && ele.is('select,input,textarea')) {
            ele.bind('change', function() {
              return ele.trigger('input');
            });
          }
          if (JQ_ASSETS_LIB[attrs.hmUiJq]) {
            return hmUiLoad.load(JQ_ASSETS_LIB[attrs.hmUiJq]).then(function() {
              callPlugin();
              return refresh();
            })["catch"](function(e) {
              return hmLog.warn(e);
            });
          } else {
            callPlugin();
            return refresh();
          }
        };
      }
    };
  }
]);

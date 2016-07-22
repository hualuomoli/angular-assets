
/*
 * 集合工具
 */
angular.module('hm.util', []).factory('hmUtils', [
  function() {
    var _self;
    _self = this;
    return {
      array: function() {
        return {
          copy: function(datas) {
            var _datas, data, k, len;
            _datas = [];
            if (!angular.isArray(datas)) {
              return _datas;
            }
            for (k = 0, len = datas.length; k < len; k++) {
              data = datas[k];
              _datas[_datas.length] = _self.object.copy(data);
            }
            return _datas;
          },
          sort: function(datas, callback) {
            var _temp, d1, d2, i, j, k, l, len, len1;
            if (!angular.isArray(datas)) {
              return datas;
            }
            for (i = k = 0, len = datas.length; k < len; i = ++k) {
              d1 = datas[i];
              for (j = l = 0, len1 = datas.length; l < len1; j = ++l) {
                d2 = datas[j];
                if (j > i && callback(d1, d2)) {
                  _temp = datas[i];
                  datas[i] = datas[j];
                  datas[j] = _temp;
                }
              }
            }
            return datas;
          }
        };
      },
      object: function() {
        return {
          copy: function(data) {
            var _data, key, value;
            _data = {};
            if (!angular.isObject(data)) {
              return _data;
            }
            for (key in data) {
              value = data[key];
              if (angular.isArray(value)) {
                _data[key] = _self.array.copy(value);
              }
              if (angular.isObject(value)) {
                _data[key] = _self.object.copy(value);
              }
              _data[key] = value;
            }
            return _data;
          },
          replace: function(data, config) {
            var _data, _key, _temp, _value, key;
            _data = _self.object.copy(data);
            if (!!config) {
              return _data;
            }
            _temp = {};
            for (key in config) {
              _key = config[key];
              _value = _data[_key];
              if (!!_value) {
                _temp[key] = _value;
                delete _data(_key);
              }
            }
            for (key in _temp) {
              _data[key] = _temp[key];
            }
            return _data;
          }
        };
      },
      tree: function() {
        return {
          parse: function(datas, config) {
            var _addChild, _config, _datas, _parse, defaultConfig;
            defaultConfig = {
              "code": 'code',
              "pcode": 'pcode',
              "sort": "sort",
              "sorts": function(d1, d2) {
                return d1[this.sort] >= d2[this.sort];
              }
            };
            if (!angular.isArray(datas)) {
              return datas;
            }
            _config = angular.extend({}, defaultConfig, config);
            _datas = _self.array.copy(datas);
            _addChild = function(pData) {
              var _children, _data, child, index, k, l, len, len1;
              _children = [];
              for (k = 0, len = _datas.length; k < len; k++) {
                _data = _datas[k];
                if (!!_data[_config.pcode] && !!pData[_config.code] && _data[_config.pcode] === pData[_config.code]) {
                  _children.push(_data);
                  _data.level = pData.level + 1;
                  _addChild(_data);
                }
              }
              pData.leaf = _children.length > 0 ? 'N' : 'Y';
              _children = _self.array.sort(_children, _config.sorts);
              for (index = l = 0, len1 = _children.length; l < len1; index = ++l) {
                child = _children[index];
                child.sort = index + 1;
              }
              pData.children = _children;
              return pData;
            };
            _parse = function() {
              var _data, _result, index, k, l, len, len1, r;
              _result = [];
              for (k = 0, len = _datas.length; k < len; k++) {
                _data = _datas[k];
                if (!_data[_config.pcode] || _data[_config.pcode] === '') {
                  _data.level = 1;
                  _result.push(_data);
                  _addChild(_data);
                }
              }
              _self.array.sort(_result, _config.sorts);
              for (index = l = 0, len1 = _result.length; l < len1; index = ++l) {
                r = _result[index];
                r.sort = index + 1;
              }
              return _result;
            };
            return _parse();
          }
        };
      }
    };
  }
]);

angular.module('hm', ['hm.device', 'hm.log', 'hm.http', 'hm.resource', 'hm.ui.load', 'hm.ui.jq', 'hm.ui.screenfull', 'hm.ui.toggleClass', 'hm.util']);

angular.module('hm.device', []);

angular.module('hm.http', []);

angular.module('hm.log', []);

angular.module('hm.resource', []);

angular.module('hm.ui.load', []);

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
 * 调用 jquery 的plugin 插件
 */
angular.module('hm.ui.jq', ['hm.ui.load', 'hm.log']).directive('hmUiJq', [
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


/*
 * 全屏
 */
angular.module('hm.ui.screenfull', ['hm.ui.load']).directive('hmUiScreenfull', [
  'hmUiLoad', 'ASSETS_LIB', '$document', function(hmUiLoad, ASSETS_LIB, $document) {
    return {
      restrict: 'AC',
      template: '<i class="fa fa-expand fa-fw text"></i><i class="fa fa-compress fa-fw text-active"></i>',
      link: function(scope, ele, attrs) {
        ele.addClass('hide');
        return hmUiLoad.load(ASSETS_LIB.screenfull).then(function() {
          var screenfull;
          screenfull = window.screenfull;
          if (screenfull.enabled && !navigator.userAgent.match(/Trident.*rv:11\./)) {
            ele.removeClass('hide');
          }
          ele.on('click', function() {
            var target;
            attrs.target && (target = $(attrs.target)[0]);
            return screenfull.toggle(target);
          });
          return $document.on(screenfull.raw.fullscreenchange, function() {
            if (screenfull.isFullscreen) {
              return ele.addClass('active');
            } else {
              return ele.removeClass('active');
            }
          });
        });
      }
    };
  }
]);


/*
 * 点击指令的元素,让target对应元素toggle样式
 */
angular.module('hm.ui.toggleClass', []).directive('hmUiToggleClass', [
  function() {
    return {
      restrict: 'AC',
      link: function(scope, ele, attrs) {
        return ele.on('click', function(e) {
          var classes, key, targets;
          e.preventDefault();
          classes = attrs.hmUiToggleClass.split(',');
          targets = attrs.target ? attrs.target.split(',') : Array(ele);
          key = 0;
          angular.forEach(classes, function(_class) {
            var target;
            target = targets[targets.length && key];
            $(target).toggleClass(_class);
            return key += 1;
          });
          return $(ele).toggleClass('active');
        });
      }
    };
  }
]);

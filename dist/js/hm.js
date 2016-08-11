
/*
 * 集合工具
 */
angular.module('hm.util', []).factory('hmUtils', [
  function() {
    var _self;
    _self = this;
    _self.array = {
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
    _self.object = {
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
    _self.tree = {
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
      },
      leaf: function(treeDatas) {
        var _datas, _leaf;
        _datas = [];
        if (!angular.isArray(treeDatas)) {
          return _datas;
        }
        _leaf = function(treeDatas) {
          var data, k, len;
          for (k = 0, len = treeDatas.length; k < len; k++) {
            data = treeDatas[k];
            if (data.leaf !== 'Y') {
              _leaf(data.children);
            }
            _datas[_datas.length] = data;
          }
          return _datas;
        };
        return _leaf(treeDatas);
      }
    };
    return {
      array: _self.array,
      object: _self.object,
      tree: _self.tree
    };
  }
]);

angular.module('hm', ['hm.device', 'hm.log', 'hm.http', 'hm.resource', 'hm.ui.load', 'hm.ui.jq', 'hm.ui.screenfull', 'hm.ui.toggleClass', 'hm.ui.nav.tree', 'hm.util']);

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
    _getHeaders = function(userHeader, httpHeader) {
      return angular.extend({}, userHeader, httpHeader);
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

angular.module('hm.ui.nav.tree', ['ngAnimate']).directive('hmNavTree', [
  '$timeout', '$parse', function($timeout, $parse) {
    return {
      restrict: 'E',
      template: "<ul class=\"nav nav-list nav-pills nav-stacked hm-nav-tree\">\n  <li ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\"\n      ng-class=\"'level-{{row.branch.level}}' + (row.branch.selected ? ' active':'') + ' ' +row.branch.classes.join(' ')\" \n      class=\"nav-tree-row\">\n    <a ng-click=\"user_select_branch(row.branch)\">\n      <i ng-class=\"row.branch.tree_check_icon\" \n         ng-click=\"user_check_branch(row.branch)\" \n         class=\"indented\" ng-show=\"tree_type == 'checkbox'\"> \n      </i>\n      <i ng-class=\"row.branch.tree_radio_icon\" \n         ng-click=\"user_radio_branch(row.branch)\" \n         class=\"indented\" ng-show=\"tree_type == 'radio'\"> \n      </i>\n      <i ng-class=\"row.branch.tree_icon\" \n         ng-click=\"user_expand_branch(row.branch)\" \n         class=\"indented\"> \n      </i>\n      <span class=\"indented tree-label\">{{ row.branch.label }} </span>\n    </a>\n  </li>\n</ul>",
      scope: {
        treeData: '=',
        onSelect: '&',
        onCheck: '&',
        onRadio: '&',
        loadData: '&',
        initSelect: '@',
        initRadio: '@',
        initCheck: '@',
        treeControl: '='
      },
      link: function(scope, element, attrs) {
        var c_check_some, c_checked, c_tree_type_checkbox, c_tree_type_radio, c_tree_type_select, c_unchecked, check_children, checker_parent, checkes, collapse_children, expand_branch, expanded_child, expanded_parent, for_each_branch, for_each_child, for_each_parent, get_checked, get_parent, on_treeData_change, radio_branch, radioed_branch, select_branch, selected_branch, tree, uid, uncheck_children;
        if (attrs.iconExpand == null) {
          attrs.iconExpand = 'fa fa-plus';
        }
        if (attrs.iconCollapse == null) {
          attrs.iconCollapse = 'fa fa-minus';
        }
        if (attrs.iconLeaf == null) {
          attrs.iconLeaf = 'fa fa-file';
        }
        if (attrs.iconChecked == null) {
          attrs.iconChecked = 'fa fa-check-square';
        }
        if (attrs.iconUnchecked == null) {
          attrs.iconUnchecked = 'fa fa-square-o';
        }
        if (attrs.iconSomeChecked == null) {
          attrs.iconSomeChecked = 'fa fa-square';
        }
        if (attrs.iconRadioed == null) {
          attrs.iconRadioed = 'fa fa-check-circle';
        }
        if (attrs.iconunRadioed == null) {
          attrs.iconunRadioed = 'fa fa-circle-o';
        }
        if (attrs.iconRadioForbid == null) {
          attrs.iconRadioForbid = 'fa fa-ban fa-flip-horizontal';
        }
        if (attrs.radioOnlyLeaf == null) {
          attrs.radioOnlyLeaf = true;
        }
        if (attrs.lazyLoad == null) {
          attrs.lazyLoad = false;
        }
        if (attrs.treeType == null) {
          attrs.treeType = 'select';
        }
        c_checked = 2;
        c_check_some = 1;
        c_unchecked = 0;
        c_tree_type_select = 'select';
        c_tree_type_checkbox = 'checkbox';
        c_tree_type_radio = 'radio';
        selected_branch = null;
        radioed_branch = null;
        scope.tree_rows = [];
        scope.tree_type = attrs.treeType;
        get_parent = function(branch) {
          var parent;
          parent = void 0;
          if (branch.parent_uid) {
            for_each_branch(function(b) {
              if (b.uid === branch.parent_uid) {
                return parent = b;
              }
            });
          }
          return parent;
        };
        for_each_child = function(branch, fn) {
          var do_f;
          do_f = function(branch) {
            var child, i, len, ref, results;
            if (!!branch.children && branch.children.length > 0) {
              ref = branch.children;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                child = ref[i];
                fn(child, branch);
                results.push(do_f(child));
              }
              return results;
            }
          };
          return do_f(branch);
        };
        for_each_parent = function(branch, fn) {
          var do_f;
          do_f = function(branch) {
            var parent;
            parent = get_parent(branch);
            if (!!parent) {
              fn(parent, branch);
              return do_f(parent);
            }
          };
          return do_f(branch);
        };
        for_each_branch = function(fn) {
          var i, len, ref, results, root_branch;
          ref = scope.treeData;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            root_branch = ref[i];
            fn(root_branch);
            results.push(for_each_child(root_branch, function(b, p) {
              return fn(b, p);
            }));
          }
          return results;
        };
        select_branch = function(branch) {
          if (selected_branch != null) {
            selected_branch.selected = false;
            selected_branch === null;
          }
          branch.selected = true;
          selected_branch = branch;
          if (branch.onSelect != null) {
            return $timeout(function() {
              return branch.onSelect(branch);
            });
          } else if (scope.onSelect != null) {
            return $timeout(function() {
              return scope.onSelect({
                branch: branch
              });
            });
          }
        };
        scope.user_select_branch = function(branch) {
          if (branch !== selected_branch) {
            return select_branch(branch);
          }
        };
        radio_branch = function(branch) {
          if (radioed_branch != null) {
            radioed_branch.radio = false;
            radioed_branch === null;
          }
          branch.radio = true;
          radioed_branch = branch;
          if (branch.onRadio != null) {
            return $timeout(function() {
              return branch.onRadio(branch);
            });
          } else if (scope.onRadio != null) {
            return $timeout(function() {
              return scope.onRadio({
                branch: branch
              });
            });
          }
        };
        scope.user_radio_branch = function(branch) {
          if (branch !== radioed_branch) {
            if (branch.tree_radio_icon !== attrs.iconRadioForbid) {
              return radio_branch(branch);
            }
          }
        };
        expanded_parent = function(branch) {
          return for_each_parent(branch, function(p, b) {
            var child, i, len, ref, results;
            p.visible = true;
            p.expanded = true;
            ref = p.children;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              results.push(child.visible = true);
            }
            return results;
          });
        };
        expanded_child = function(branch) {
          var child, i, len, ref, results;
          branch.expanded = true;
          if (!!branch.children && branch.children.length > 0) {
            ref = branch.children;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              results.push(child.visible = true);
            }
            return results;
          }
        };
        collapse_children = function(branch) {
          branch.expanded = false;
          return for_each_child(branch, function(b) {
            b.visible = false;
            return b.expanded = false;
          });
        };
        expand_branch = function(branch) {
          branch.expanded = !branch.expanded;
          if (branch.expanded) {
            return expanded_child(branch);
          } else {
            return collapse_children(branch);
          }
        };
        scope.user_expand_branch = function(branch) {
          if (attrs.lazyLoad && !branch.leaf && (!branch.children || branch.children.length === 0)) {
            if (scope.loadData != null) {
              return $timeout(function() {
                var data, datas, i, len;
                datas = scope.loadData({
                  branch: branch
                });
                if (!datas || datas.length === 0) {
                  return branch.leaf = true;
                } else {
                  for (i = 0, len = datas.length; i < len; i++) {
                    data = datas[i];
                    data.parent_uid = branch.uid;
                    data.checked = branch.checked;
                  }
                  branch.children = datas;
                  return expand_branch(branch);
                }
              });
            } else {
              return branch.leaf = true;
            }
          } else {
            return expand_branch(branch);
          }
        };
        get_checked = function() {
          var check_array, do_f, i, len, ref, root_branch;
          do_f = function(branch, fn) {
            var child, i, len, ref, results;
            if (branch.checked === c_checked) {
              return fn(branch);
            } else if (branch.checked === c_check_some) {
              if (!!branch.children && branch.children.length > 0) {
                ref = branch.children;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                  child = ref[i];
                  results.push(do_f(child, fn));
                }
                return results;
              }
            }
          };
          check_array = [];
          ref = scope.treeData;
          for (i = 0, len = ref.length; i < len; i++) {
            root_branch = ref[i];
            do_f(root_branch, function(branch) {
              return check_array.push(branch);
            });
          }
          return check_array;
        };
        check_children = function(branch) {
          return for_each_child(branch, function(b) {
            var child, i, len, ref, results;
            b.checked = c_checked;
            if (!!b.children && b.children.length > 0) {
              ref = b.children;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                child = ref[i];
                results.push(child.checked = c_checked);
              }
              return results;
            }
          });
        };
        uncheck_children = function(branch) {
          return for_each_child(branch, function(b) {
            var child, i, len, ref, results;
            b.checked = c_unchecked;
            if (!!b.children && b.children.length > 0) {
              ref = b.children;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                child = ref[i];
                results.push(child.checked = c_unchecked);
              }
              return results;
            }
          });
        };
        checker_parent = function(branch) {
          return for_each_parent(branch, function(parent) {
            var checked, child, children, i, len, total, unchecked;
            children = parent.children;
            total = children.length;
            checked = 0;
            unchecked = 0;
            for (i = 0, len = children.length; i < len; i++) {
              child = children[i];
              if (child.checked === c_checked) {
                checked = checked + 1;
              } else if (child.checked === c_unchecked) {
                unchecked = unchecked + 1;
              }
            }
            if (total === checked) {
              return parent.checked = c_checked;
            } else if (total === unchecked) {
              return parent.checked = c_unchecked;
            } else {
              return parent.checked = c_check_some;
            }
          });
        };
        scope.user_check_branch = function(branch) {
          if (branch.checked === c_checked) {
            branch.checked = c_unchecked;
            uncheck_children(branch);
          } else if (branch.checked === c_unchecked) {
            branch.checked = c_checked;
            check_children(branch);
          } else {
            branch.checked = c_checked;
            check_children(branch);
          }
          checker_parent(branch);
          if (branch.onCheck != null) {
            return $timeout(function() {
              return branch.onCheck(branch);
            });
          } else if (scope.onCheck != null) {
            return $timeout(function() {
              var branches;
              branches = get_checked();
              return scope.onCheck({
                branches: branches
              });
            });
          }
        };
        on_treeData_change = function() {
          scope.tree_rows = [];
          return for_each_branch(function(branch, parent) {
            if (branch.uid == null) {
              branch.uid = "" + Math.random();
            }
            if (branch.visible == null) {
              if (!parent) {
                branch.visible = true;
              } else {
                branch.visible = false;
              }
            }
            if (branch.expanded == null) {
              branch.expanded = false;
            }
            if (branch.checked == null) {
              branch.checked = c_unchecked;
            }
            if (branch.radio == null) {
              branch.radio = false;
            }
            if (branch.children == null) {
              branch.children = [];
            }
            if (branch.leaf == null) {
              if (attrs.lazyLoad) {
                branch.leaf = false;
              } else {
                if (!branch.children || branch.children.length === 0) {
                  branch.leaf = true;
                } else {
                  branch.leaf = false;
                }
              }
            }
            if (!!parent) {
              branch.level = parent.level + 1;
              branch.parent_uid = parent.uid;
            } else {
              branch.level = 1;
            }
            if (branch.leaf) {
              branch.tree_icon = attrs.iconLeaf;
            } else if (branch.expanded) {
              branch.tree_icon = attrs.iconCollapse;
            } else {
              branch.tree_icon = attrs.iconExpand;
            }
            if (branch.checked === c_checked) {
              branch.tree_check_icon = attrs.iconChecked;
            } else if (branch.checked === c_unchecked) {
              branch.tree_check_icon = attrs.iconUnchecked;
            } else {
              branch.tree_check_icon = attrs.iconSomeChecked;
            }
            if (branch.radio) {
              branch.tree_radio_icon = attrs.iconRadioed;
            } else if (!branch.leaf && attrs.radioOnlyLeaf) {
              branch.tree_radio_icon = attrs.iconRadioForbid;
            } else {
              branch.tree_radio_icon = attrs.iconunRadioed;
            }
            return scope.tree_rows.push({
              branch: branch,
              visible: branch.visible
            });
          });
        };
        scope.$watch('treeData', on_treeData_change, true);
        if ((attrs.initSelect != null) && !attrs.lazyLoad) {
          uid = attrs.initSelect;
          $timeout(function() {
            var do_f, i, len, ref, results, root_branch;
            do_f = function(branch) {
              var child, i, len, ref, results;
              if (branch.uid === uid) {
                branch.selected = true;
                branch.visible = true;
                return expanded_parent(branch);
              } else {
                if (!!branch.children && branch.children.length > 0) {
                  ref = branch.children;
                  results = [];
                  for (i = 0, len = ref.length; i < len; i++) {
                    child = ref[i];
                    results.push(do_f(child));
                  }
                  return results;
                }
              }
            };
            ref = scope.treeData;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              root_branch = ref[i];
              results.push(do_f(root_branch));
            }
            return results;
          });
        }
        if ((attrs.initRadio != null) && attrs.treeType === c_tree_type_radio && !attrs.lazyLoad) {
          uid = attrs.initRadio;
          $timeout(function() {
            var do_f, i, len, ref, results, root_branch;
            do_f = function(branch) {
              var child, i, len, ref, results;
              if (branch.uid === uid) {
                branch.radio = true;
                branch.selected = true;
                branch.visible = true;
                return expanded_parent(branch);
              } else {
                if (!!branch.children && branch.children.length > 0) {
                  ref = branch.children;
                  results = [];
                  for (i = 0, len = ref.length; i < len; i++) {
                    child = ref[i];
                    results.push(do_f(child));
                  }
                  return results;
                }
              }
            };
            ref = scope.treeData;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              root_branch = ref[i];
              results.push(do_f(root_branch));
            }
            return results;
          });
        }
        if ((attrs.initCheck != null) && attrs.treeType === c_tree_type_checkbox && !attrs.lazyLoad) {
          checkes = scope.$eval(attrs.initCheck);
          if (!!checkes && checkes.length > 0) {
            $timeout(function() {
              var do_f, i, len, ref, results, root_branch;
              do_f = function(branch) {
                var child, i, len, results;
                results = [];
                for (i = 0, len = checkes.length; i < len; i++) {
                  uid = checkes[i];
                  if (branch.uid === uid) {
                    branch.checked = c_checked;
                    branch.visible = true;
                    expanded_parent(branch);
                    results.push(checker_parent(branch));
                  } else {
                    if (!!branch.children && branch.children.length > 0) {
                      results.push((function() {
                        var j, len1, ref, results1;
                        ref = branch.children;
                        results1 = [];
                        for (j = 0, len1 = ref.length; j < len1; j++) {
                          child = ref[j];
                          results1.push(do_f(child));
                        }
                        return results1;
                      })());
                    } else {
                      results.push(void 0);
                    }
                  }
                }
                return results;
              };
              ref = scope.treeData;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                root_branch = ref[i];
                results.push(do_f(root_branch));
              }
              return results;
            });
          }
        }
        if ((scope.treeControl != null) && angular.isObject(scope.treeControl)) {
          tree = scope.treeControl;
          return tree.getCheckes = function() {
            return get_checked();
          };
        }
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

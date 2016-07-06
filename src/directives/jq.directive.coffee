###
# 0.1.1
# General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
#
# It is possible to specify a default set of parameters for each jQuery plugin.
# Under the jq key, namespace each plugin by that which will be passed to ui-jq.
# Unfortunately, at this time you can only pre-define the first parameter.
# @example { jq : { datepicker : { showOn:'click' } } }
#
# @param ui-jq {string} The $elm.[pluginName]() to call.
# @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
#     Multiple parameters can be separated by commas
# @param [ui-refresh] {expression} Watch expression and refire plugin on changes
#
# @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter" ui-refresh="iChange">
###
angular.module 'hm'
.value('uiJqConfig', {})
.directive 'hmUiJq', ['hmLoad', 'hmLog', 'JQ_ASSETS_LIB', 'uiJqConfig', '$timeout', (hmLoad, hmLog, JQ_ASSETS_LIB, uiJqConfig, $timeout)->

  restrict: 'A',
  compile: hmUiJqCompilingFunction = (ele, attrs)->

    # 如果配置的指令不是方法,也不是要加载的资源,错误
    throw new Error('hm-ui-jq: The "' + attrs.hmUiJq + '" function does not exist') if !angular.isFunction(ele[attrs.hmUiJq]) && !JQ_ASSETS_LIB[attrs.hmUiJq]
    
    # 
    options = uiJqConfig && uiJqConfig[attrs.hmUiJq];    

    # 链接
    hmUiJqLinkingFunction = (scope, ele, attrs)->

      # 获取配置信息
      getOptions = ()->
        linkOptions = []

        # If ui-options are passed, merge (or override) them onto global defaults and pass to the jQuery method
        if attrs.uiOptions
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']')
          if angular.isObject(options) && angular.isObject(linkOptions[0])
            linkOptions[0] = angular.extend({}, options, linkOptions[0])
        else if options
          linkOptions = [options]

      # Call jQuery method and pass relevant options
      callPlugin = ()->
        $timeout (()->
          ele[attrs.hmUiJq].apply(ele, getOptions())
        ), 0, false

      # If ui-refresh is used, re-fire the the method upon every change
      refresh = ()->
        if attrs.uiRefresh
          scope.$watch attrs.uiRefresh, ()->
            callPlugin()

      # If change compatibility is enabled, the form input's "change" event will trigger an "input" event
      if attrs.ngModel && ele.is('select,input,textarea')  
        ele.bind 'change', ()->
          ele.trigger('input');

      if JQ_ASSETS_LIB[attrs.hmUiJq]
        hmLoad.load(JQ_ASSETS_LIB[attrs.hmUiJq])
        .then ()->
          callPlugin()
          refresh()
        .catch (e)->
          hmLog.warn e
      else 
        callPlugin()
        refresh()


]
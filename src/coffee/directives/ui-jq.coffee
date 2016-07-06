###
# 调用 jquery 的plugin 插件
###
angular.module 'hm.ui.jq', [
  'hm.ui.load',
  'hm.log'
]
.directive 'hmUiJq', ['hmUiLoad', 'hmLog', 'JQ_ASSETS_LIB', '$timeout', (hmUiLoad, hmLog, JQ_ASSETS_LIB, $timeout)->

  restrict: 'A',
  compile: hmUiJqCompilingFunction = (ele, attrs)->

    # 如果配置的指令不是方法,也不是要加载的资源,错误
    throw new Error('hm-ui-jq: The "' + attrs.hmUiJq + '" function does not exist') if !angular.isFunction(ele[attrs.hmUiJq]) && !JQ_ASSETS_LIB[attrs.hmUiJq]
    
    # 链接
    hmUiJqLinkingFunction = (scope, ele, attrs)->

      # 获取配置信息
      getOptions = ()->
        linkOptions = []

        # If ui-options are passed, merge (or override) them onto global defaults and pass to the jQuery method
        if attrs.uiOptions
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']')

        return linkOptions

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
        hmUiLoad.load(JQ_ASSETS_LIB[attrs.hmUiJq])
        .then ()->
          callPlugin()
          refresh()
        .catch (e)->
          hmLog.warn e
      else 
        callPlugin()
        refresh()


]
###
# 全屏
###
angular.module 'hm.ui.screenfull', [
  'hm.ui.load'
]
.directive 'hmUiScreenfull', ['hmUiLoad', 'ASSETS_LIB', '$document', (hmUiLoad, ASSETS_LIB, $document)->

  restrict: 'AC'
  template:'<i class="fa fa-expand fa-fw text"></i><i class="fa fa-compress fa-fw text-active"></i>'
  link: (scope, ele, attrs)->
    # 先隐藏
    ele.addClass('hide');

    # 加载依赖组件
    hmUiLoad.load(ASSETS_LIB.screenfull).then ()->
      screenfull = window.screenfull
      # disable on ie11
      ele.removeClass('hide') if screenfull.enabled && !navigator.userAgent.match(/Trident.*rv:11\./)
      # 点击事件
      ele.on 'click', ()->
        attrs.target && (target = $(attrs.target)[0] )           
        screenfull.toggle(target);
      # 设置样式
      $document.on screenfull.raw.fullscreenchange, ()->
        if screenfull.isFullscreen then ele.addClass('active') else ele.removeClass('active')
]
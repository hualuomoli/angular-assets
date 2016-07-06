###
# 点击指令的元素,让target对应元素toggle样式
###
angular.module 'hm.ui.toggleClass', []
.directive 'hmUiToggleClass', [()->

  # 方法
  # magic = (_class, target)->

  #   patt = new RegExp( '\\s' + _class.replace( /\*/g, '[A-Za-z0-9-_]+' ).split( ' ' ).join( '\\s|\\s' ) + '\\s', 'g' )
  #   cn = ' ' + $(target)[0].className + ' '
  #   cn = cn.replace( patt, ' ' ) while patt.test( cn )
    
  #   $(target)[0].className = $.trim( cn )

  restrict: 'AC',
  link: (scope, ele, attrs)->
    # 点击事件
    ele.on 'click', (e)->
      # 阻止浏览器默认行为
      e.preventDefault()
      classes = attrs.hmUiToggleClass.split(',')
      targets = if attrs.target then attrs.target.split(',') else Array(ele)
      key = 0

      angular.forEach classes, (_class)->
        target = targets[(targets.length && key)]
        # magic(_class, target) if _class.indexOf( '*' ) != -1
        $(target).toggleClass(_class)
        key += 1

      $(ele).toggleClass('active')


]
#
# hm-nav-tree
#
angular.module 'hm.ui.nav.tree', [
  'ngAnimate'
]
.directive 'hmNavTree', ['$timeout', '$parse', ($timeout, $parse)->

  restrict: 'E'
  template: """
            <ul class="nav nav-list nav-pills nav-stacked hm-nav-tree">
              <li ng-repeat="row in tree_rows | filter:{visible:true} track by row.branch.uid"
                  ng-class="'level-{{row.branch.level}}' + (row.branch.selected ? ' active':'') + ' ' +row.branch.classes.join(' ')" 
                  class="nav-tree-row">
                <a ng-click="user_select_branch(row.branch)">
                  <i ng-class="row.branch.tree_check_icon" 
                     ng-click="user_check_branch(row.branch)" 
                     class="indented" ng-show="tree_type == 'checkbox'"> 
                  </i>
                  <i ng-class="row.branch.tree_radio_icon" 
                     ng-click="user_radio_branch(row.branch)" 
                     class="indented" ng-show="tree_type == 'radio'"> 
                  </i>
                  <i ng-class="row.branch.tree_icon" 
                     ng-click="user_expand_branch(row.branch)" 
                     class="indented"> 
                  </i>
                  <span class="indented tree-label">{{ row.branch.label }} </span>
                </a>
              </li>
            </ul>
            """
  scope: 
    treeData:     '='
    # function
    onSelect:     '&'
    onCheck:      '&'
    onRadio:      '&'
    loadData:     '&'
    # init
    initSelect:   '@'
    initRadio:    '@'
    initCheck:    '@'
    # control
    treeControl:  '='

  link: (scope, element, attrs)->

    # 默认值
    attrs.iconExpand   ?= 'fa fa-plus'    
    attrs.iconCollapse ?= 'fa fa-minus'
    attrs.iconLeaf     ?= 'fa fa-file'

    attrs.iconChecked       ?= 'fa fa-check-square'    
    attrs.iconUnchecked     ?= 'fa fa-square-o'
    attrs.iconSomeChecked   ?= 'fa fa-square'

    attrs.iconRadioed       ?= 'fa fa-check-circle'
    attrs.iconunRadioed     ?= 'fa fa-circle-o'
    attrs.iconRadioForbid   ?= 'fa fa-ban fa-flip-horizontal'

    # 仅叶子节点
    attrs.radioOnlyLeaf ?= true

    # 懒加载
    attrs.lazyLoad    ?= false
    # 类型
    attrs.treeType    ?= 'select'

    # 常量
    c_checked      = 2
    c_check_some   = 1
    c_unchecked    = 0

    c_tree_type_select    = 'select'
    c_tree_type_checkbox  = 'checkbox'
    c_tree_type_radio     = 'radio'

    # 数据
    selected_branch = null
    radioed_branch = null

    # scope
    scope.tree_rows = []
    scope.tree_type = attrs.treeType


    #########################################
    #                 方法                  #
    #########################################
    
    # 
    # 获取父节点
    # 
    get_parent = (branch)->
      parent = undefined
      if branch.parent_uid
        for_each_branch (b)->
          if b.uid == branch.parent_uid
            parent = b
      return parent

    # 
    # 循环处理子节点
    # 
    for_each_child = (branch, fn)->
      do_f = (branch)->
        if !!branch.children && branch.children.length > 0
          for child in branch.children
            fn(child, branch)
            do_f(child)

      do_f(branch)

    #
    # 循环处理子节点
    # 
    for_each_parent = (branch, fn)->
      do_f = (branch)->
        parent = get_parent(branch)
        if !!parent
          fn(parent, branch)
          do_f(parent)

      do_f(branch)

    # 
    # 循环处理所有节点
    # 
    for_each_branch = (fn)->
      for root_branch in scope.treeData
        fn(root_branch)
        for_each_child root_branch, (b, p)->
          fn(b, p)

    ##########################################
    #                 事件                   #
    ##########################################
    
    # 选择
    select_branch = (branch)->

      # 移除上次选择
      if selected_branch?
        selected_branch.selected = false
        selected_branch == null

      # 设置本次选择
      branch.selected = true
      selected_branch = branch

      # select
      if branch.onSelect?
        $timeout ->
          branch.onSelect(branch)
      else if scope.onSelect?
        $timeout ->
          scope.onSelect({branch:branch})

    scope.user_select_branch = (branch)->
      if branch isnt selected_branch
         select_branch(branch)


    # 单选
    radio_branch = (branch)->
      # 移除上次选择
      if radioed_branch?
        radioed_branch.radio = false
        radioed_branch == null

      # 设置本次选择
      branch.radio = true
      radioed_branch = branch

      # radio
      if branch.onRadio?
        $timeout ->
          branch.onRadio(branch)
      else if scope.onRadio?
        $timeout ->
          scope.onRadio({branch:branch})

    scope.user_radio_branch = (branch)->
      if branch isnt radioed_branch
        if branch.tree_radio_icon != attrs.iconRadioForbid
          radio_branch(branch)

    # 展开、折叠
    expanded_parent = (branch)->
      for_each_parent branch, (p, b)->
        p.visible = true
        p.expanded = true

        # subling
        for child in p.children
          child.visible = true

    # 展开子节点
    expanded_child = (branch)->
      branch.expanded = true
      if !!branch.children && branch.children.length > 0
        for child in branch.children
          child.visible = true

    # 折叠所有子节点
    collapse_children = (branch)->
      branch.expanded = false
      for_each_child branch, (b)->
        b.visible = false
        b.expanded = false


    expand_branch = (branch)->
      # 折叠展开替换
        branch.expanded = !branch.expanded

        if branch.expanded
          expanded_child(branch)
        else
          collapse_children(branch)
        

    scope.user_expand_branch = (branch)->
      if attrs.lazyLoad && !branch.leaf && (!branch.children || branch.children.length == 0)
        # 懒加载
        if scope.loadData?
          $timeout ->
            datas = scope.loadData({branch:branch})
            if !datas || datas.length == 0
              branch.leaf = true
            else
              for data in datas
                data.parent_uid = branch.uid
                data.checked = branch.checked

              branch.children = datas
              expand_branch(branch)
        else
          branch.leaf = true

      else
        expand_branch(branch)
        

    # 选中
    get_checked = ()->
      do_f = (branch, fn)->
        if branch.checked == c_checked
          fn(branch)
        else if branch.checked == c_check_some
          if !!branch.children && branch.children.length > 0
            for child in branch.children
              do_f(child, fn)

      check_array = []
      for root_branch in scope.treeData
        do_f root_branch, (branch)->
          check_array.push(branch)

      return check_array

    # 选中子节点
    check_children = (branch)->
      for_each_child branch, (b)->
        b.checked = c_checked
        if !!b.children && b.children.length > 0
          for child in b.children
            child.checked = c_checked

    # 非选中子节点
    uncheck_children = (branch)->
      for_each_child branch, (b)->
        b.checked = c_unchecked
        if !!b.children && b.children.length > 0
          for child in b.children
            child.checked = c_unchecked

    # 父节点是否选中
    checker_parent = (branch)->
      for_each_parent branch, (parent)->
        children = parent.children
        total     = children.length
        checked   = 0
        unchecked = 0

        for child in children
          if child.checked == c_checked
            checked = checked + 1
          else if child.checked == c_unchecked
            unchecked = unchecked + 1

        # 判断
        if total == checked
          parent.checked = c_checked
        else if total == unchecked
          parent.checked = c_unchecked
        else
          parent.checked = c_check_some

    # 点击事件
    scope.user_check_branch = (branch)->
      if branch.checked == c_checked
        # checked --> unchecked
        branch.checked = c_unchecked
        uncheck_children(branch)
      else if branch.checked == c_unchecked
        # unchecked --> checked
        branch.checked = c_checked
        check_children(branch)
      else
        # some --> checked
        branch.checked = c_checked
        check_children(branch)

      checker_parent(branch)

      if branch.onCheck?
        $timeout ->
          branch.onCheck(branch)
      else if scope.onCheck?
        $timeout ->
          branches = get_checked()
          scope.onCheck({branches:branches})






    ##########################################
    #                 初始化                 #
    ##########################################
    #
    # 数据变化后,初始化数据
    on_treeData_change = ()->

      scope.tree_rows = []

      # 
      # 初始化
      # 
      for_each_branch (branch, parent)->

        # uid
        if not branch.uid?
          branch.uid = "" + Math.random()

        # 是否可见
        if not branch.visible?
          if !parent
            branch.visible = true
          else
            branch.visible = false

        # 是否展开
        if not branch.expanded?
          branch.expanded = false

        # 是否选中
        if not branch.checked?
          branch.checked = c_unchecked

        # 是否单选 
        if not branch.radio?
          branch.radio = false

        # 子节点
        if not branch.children?
          branch.children = []

        # 是否是叶子
        if not branch.leaf?
          if attrs.lazyLoad 
            # 懒加载
            branch.leaf = false
          else
            # 已完全加载
            if !branch.children || branch.children.length == 0
              branch.leaf = true
            else
              branch.leaf = false
        

        if !!parent
          # 级别
          branch.level = parent.level + 1
          branch.parent_uid = parent.uid
        else
          branch.level = 1


        # 页面、文件夹展开折叠
        if branch.leaf
          branch.tree_icon = attrs.iconLeaf
        else if branch.expanded
          branch.tree_icon = attrs.iconCollapse
        else
          branch.tree_icon = attrs.iconExpand



        # check
        if branch.checked == c_checked
          branch.tree_check_icon = attrs.iconChecked
        else if branch.checked == c_unchecked
          branch.tree_check_icon = attrs.iconUnchecked
        else
          branch.tree_check_icon = attrs.iconSomeChecked

        # radio
        if branch.radio
          branch.tree_radio_icon = attrs.iconRadioed
        else if !branch.leaf && attrs.radioOnlyLeaf
          branch.tree_radio_icon = attrs.iconRadioForbid
        else
          branch.tree_radio_icon = attrs.iconunRadioed

        # 添加到集合
        scope.tree_rows.push
          branch          : branch
          visible         : branch.visible
        

    # 监控数据变化
    scope.$watch 'treeData', on_treeData_change, true


    # 初始化数据
    
    # 选中
    if attrs.initSelect? && !attrs.lazyLoad
      uid = attrs.initSelect
      $timeout ->
        do_f = (branch)->
          if branch.uid == uid
            branch.selected = true
            branch.visible = true
            # parent
            expanded_parent(branch)
          else
            if !!branch.children && branch.children.length > 0
              for child in branch.children
                do_f(child)

        for root_branch in scope.treeData
          do_f(root_branch)

    # 单选
    if attrs.initRadio? && attrs.treeType == c_tree_type_radio && !attrs.lazyLoad
      uid = attrs.initRadio
      $timeout ->
        do_f = (branch)->
          if branch.uid == uid
            branch.radio = true
            branch.selected = true
            branch.visible = true
            # parent
            expanded_parent(branch)
          else
            if !!branch.children && branch.children.length > 0
              for child in branch.children
                do_f(child)

        for root_branch in scope.treeData
          do_f(root_branch)

    
    # 复选框
    if attrs.initCheck? && attrs.treeType == c_tree_type_checkbox && !attrs.lazyLoad
      checkes = scope.$eval(attrs.initCheck)
      if !!checkes && checkes.length > 0
        $timeout ->
          do_f = (branch)->
            for uid in checkes
              if branch.uid == uid
                branch.checked = c_checked
                branch.visible = true
                # parent
                expanded_parent(branch)
                checker_parent(branch)
              else
                if !!branch.children && branch.children.length > 0
                  for child in branch.children
                    do_f(child)

          for root_branch in scope.treeData
            do_f(root_branch)



    # control
    if scope.treeControl? && angular.isObject scope.treeControl
      tree = scope.treeControl
      tree.getCheckes = ()->
        return get_checked()


]
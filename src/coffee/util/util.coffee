###
# 集合工具
###
angular.module 'hm.util', [

]
.factory 'hmUtils', [()->

  _self = this

  # 数组
  _self.array = {
    # 复制
    copy: (datas)->
      _datas = []

      # 如果参数不是数组,退出
      if !angular.isArray datas
        return _datas

      # 循环复制
      for data in datas
        _datas[_datas.length] = _self.object.copy data

      return _datas

    # 排序
    sort: (datas, callback)->
      if !angular.isArray datas
        return datas

      # 排序,冒泡排序
      for d1, i in datas
        for d2, j in datas
          if j > i && callback d1, d2
            _temp = datas[i]
            datas[i] = datas[j]
            datas[j] = _temp

      return datas

    # end array
  }


  # Object
  _self.object = {
    # 复制
    copy: (data)->
      _data = {}

      if !angular.isObject data
        return _data

      for key, value of data
        _data[key] = _self.array.copy value if angular.isArray value
        _data[key] = _self.object.copy value if angular.isObject value
        _data[key] = value

      return _data

    # 替换键
    replace: (data, config)->
      # 创建副本
      _data = _self.object.copy data

      # 配置不合法
      if !!config
        return _data

      _temp = {}

      # 遍历配置 key --> value中的key
      for key, _key of config
        # 获取配置中key对应的名称在_data中的值
        _value = _data[_key]
        # 如果值存在,添加到_temp中
        if !!_value
          _temp[key] = _value
          
          # 从_data中移除
          delete _data _key

      # 将_temp中的值复制到_data中
      for key of _temp
        _data[key] = _temp[key]


      return _data


    # end object
  }


  # tree
  _self.tree = {
    # 解析,返回树列表
    parse: (datas, config)->
      # 默认配置
      defaultConfig = {
        "code": 'code', # 编码
        "pcode": 'pcode', # 父编码
        "sort": "sort", # 排序
        "sorts": (d1, d2)-> # 排序默认方法
          return d1[this.sort] >= d2[this.sort]
      }

      # 数据不合法
      return datas if !angular.isArray datas

      # 设置配置
      _config = angular.extend({}, defaultConfig, config)

      # 副本
      _datas = _self.array.copy datas

      # 添加子节点
      _addChild = (pData)->
        # 所有子集
        _children = []

        for _data in _datas
          if !!_data[_config.pcode] && !!pData[_config.code] && _data[_config.pcode] == pData[_config.code]
            # 子节点
            _children.push(_data)

            # 设置级别
            _data.level = pData.level + 1
            # 添加子节点的子集
            _addChild(_data)

        # 设置children和是否为叶子节点
        pData.leaf = if _children.length > 0 then 'N' else 'Y'
        _children = _self.array.sort _children, _config.sorts
        # 设置sort
        for child, index in _children
          child.sort = index + 1

        pData.children = _children

        return pData

      # 解析
      _parse = ()->
        _result = []
        for _data in _datas
          if !_data[_config.pcode] || _data[_config.pcode] == ''
            # 顶级
            _data.level = 1
            # 添加到数组
            _result.push(_data)
            # 添加子节点
            _addChild(_data)

        _self.array.sort _result, _config.sorts
        for r, index in _result
          r.sort = index + 1

        return _result

      return _parse()

    # 叶子节点
    leaf: (treeDatas)->
      
      _datas = []
      
      return _datas if !angular.isArray treeDatas

      _leaf = (treeDatas)->

        for data in treeDatas
          # 非叶子节点，处理子节点
          _leaf data.children if data.leaf != 'Y'
          # 添加当前节点
          _datas[_datas.length] = data

        return _datas

      return _leaf(treeDatas)


  }

  array: _self.array
  object: _self.object
  tree : _self.tree

]

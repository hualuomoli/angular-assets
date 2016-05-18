angular
.module 'hm'
.provider 'hmProvider',['$timeout', ($timeout)->
  # 服务器项目URL
  _serverUrl = ''
  # 权限token的header信息
  _tokenHeaders = {}

  this.$get = ()->
    serverUrl: _serverUrl
    tokenHeaders: _tokenHeaders

]
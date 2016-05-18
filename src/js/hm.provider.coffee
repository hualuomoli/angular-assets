angular
.module 'hm'
.provider 'hm', [()->

  # 服务器项目URL
  this.serverUrl = ''
  # 权限token的header信息
  this.tokenHeaders = {}

  this.$get = ()->
    serverUrl: this.serverUrl
    tokenHeaders: this.tokenHeaders
  return
]
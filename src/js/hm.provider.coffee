angular
.module 'hm'
.provider 'hm', [()->

  # 服务器项目URL
  this.config = {
    serverUrl: ''
  }
  # 权限token的header信息
  this.tokenHeaders = {}

  this.$get = ()->
    config: this.config
  return
]
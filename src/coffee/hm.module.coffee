angular.module 'hm', [
  # 与angular无关
  'hm.device',
  'hm.ui.load',
  'hm.directive',
  

  # 依赖angular存在
  'hm.log',
  'hm.http',
  'hm.resource'
]
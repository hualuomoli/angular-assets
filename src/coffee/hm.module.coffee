angular.module 'hm', [
  # 与angular无关
  'hm.device',
  'hm.load',

  # 依赖angular存在
  'hm.log',
  'hm.http',
  'hm.resource'
]
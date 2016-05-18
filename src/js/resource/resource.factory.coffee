angular
.module 'hm.resource'
.factory 'hmResource',['$q', '$timeout', ($q, $timeout)->
  # 加载本地资源数据,模拟angular的http请求远程
  load: (datas)->
    deferred = $q.defer()
    promise = deferred.promise
    promise.success = (fn)->
      promise.then(fn)
    promise.error = (fn)->
      promise.then(null,fn)
    $timeout (()->
      deferred.resolve(datas);
      ),100
    return promise;
]
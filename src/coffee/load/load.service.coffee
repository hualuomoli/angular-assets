angular
.module 'hm.load'
.factory 'hmLoad', ['$q', '$timeout', '$document', ($q, $timeout, $document)->

  # 已经加载的数组
  _loaded = []
  # _promise = false
  # _deferred = $q.defer();
  
  # 加载JS
  loadScript: (src)->
    return _loaded[src].promise if _loaded[src]

    deferred = $q.defer();
    script = $document[0].createElement('script')
    script.src = src

    script.onload = (e) ->
      $timeout ()->
        deferred.resolve(e)

    script.onerror = (e) ->
      $timeout ()->
        deferred.reject(e)
    $document[0].body.appendChild(script)
    _loaded[src] = deferred

    return deferred.promise

  # 加载css
  loadCSS: (href) ->
    return _loaded[href].promise if _loaded[href]

    deferred = $q.defer();
    style = $document[0].createElement('link')
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = href;
    
    script.onload = (e) ->
      $timeout ()->
        deferred.resolve(e)
      
    script.onerror = (e) ->
      $timeout ()->
        deferred.reject(e)
    $document[0].body.appendChild(script)
    _loaded[href] = deferred

    return deferred.promise;

  # 加载
  load: (srcs)->
    srcs = if angular.isArray(srcs)  then srcs else srcs.split(/\s+/) 

    self = this;
    
    deferred = $q.defer();
    promise = deferred.promise

    angular.forEach srcs, (src)->
      promise = promise.then ()->
        return if src.indexOf('.css') >=0 then self.loadCSS(src) else self.loadScript(src)

    # 
    deferred.resolve()

    return promise;

]
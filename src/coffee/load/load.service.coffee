angular
.module 'hm.load'
.factory 'hmLoad', ['$q', '$timeout', '$document', ($q, $timeout, $document)->

  # 已经加载的数组
  _loaded = []
  _promise = false
  _deferred = $q.defer();
  
  # 加载JS
  loadScript: (src)->
    return loaded[src].promise if loaded[src]

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
    loaded[src] = deferred

    return deferred.promise

  # 加载css
  loadCSS: (href) ->
    return loaded[href].promise if loaded[href]

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
    loaded[href] = deferred

    return deferred.promise;

  # 加载
  load: (srcs)->
    srcs = if angular.isArray(srcs)  then srcs else srcs.split(/\s+/) 

    self = this;

    promise = deferred.promise if !promise

    angular.forEach srcs, (src)->
      promise = promise.then ()->
        return if src.indexOf('.css') >=0 then self.loadCSS(src) else self.loadScript(src)

    # 
    deferred.resolve()

    return promise;

]
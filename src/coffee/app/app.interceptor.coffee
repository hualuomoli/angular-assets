###
# 
###
angular.module 'hm.app'
.factory 'AppInterceptor', ['$q', 'hmLog', '$rootScope', ($q, hmLog, $rootScope)->

  # 响应错误
  responseError: (res)->
    
    if res.status == 401
      # 用户未登录
      hmLog.warn '用户未登录或已超时(HmAppUnauthorized)', res
      $rootScope.$emit("HmAppUnauthorized", res)

    else if res.status == 500
      # 服务器运行错误
      hmLog.error '服务器运行错误(HmAppServerError)', res
      $rootScope.$emit("HmAppServerError", res)
      
    else
      # 其他错误
       hmLog.error '其他错误(HmAppError)', res
      $rootScope.$emit("HmAppError", res)


    return $q.reject(res);


]
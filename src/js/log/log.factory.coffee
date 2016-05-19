angular
.module 'hm.log'
.factory 'hmLog', ['$log', ($log)->
  debug: ()->
    $log.debug(arguments) if $log.isDebugEnabled()
  info: ()->
    $log.info(arguments) if $log.isInfoEnabled()
  warn: ()->
    $log.warn(arguments) if $log.isWarnEnabled()
  error: ()->
    $log.error(arguments)
  log: ()->
    $log.debug(arguments) if $log.isDebugEnabled()

]
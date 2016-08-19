###
# 
###
angular.module 'hm.log'
.factory 'hmLog', ['$log', ($log)->

  # debug
  debug: ()->
    $log.debug(arguments)

  # debug
  info: ()->
    $log.info(arguments)

  # debug
  warn: ()->
    $log.warn(arguments)

  # debug
  error: ()->
    $log.error(arguments)

  # debug
  log: ()->
    $log.debug(arguments)

]
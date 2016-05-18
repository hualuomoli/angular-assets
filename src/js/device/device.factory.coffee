angular
.module 'hm.device'
.factory 'hmDevice',['$window', ($window)->
  isIE: ()->
    return !!navigator.userAgent.match(/MSIE/i)
  isSmartDevice: ()->
    # Adapted from http://www.detectmobilebrowsers.com
    ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera']
    # Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
    return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua)
]
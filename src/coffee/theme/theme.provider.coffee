angular.module 'hm.theme'
.provider 'hmTheme', [()->
  this.config = {
    theme: ''
  }
  this.$get = ()->
    config: this.config
    
]
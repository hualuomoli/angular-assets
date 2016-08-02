angular.module 'app', [
  'hm.ui.nav.tree'
]
.controller 'appCtrl', ['$scope', ($scope)->

  $scope.selectBranch = (branch)->
    console.log 'scope funciton select branch ' + branch.label

  $scope.radioBranch = (branch)->
    console.log 'scope funciton radio branch ' + branch.label

  $scope.checkBranch = (branches)->
    content = 'scope funciton check branch '
    arr = []
    for branch in branches
      arr.push(branch.label)
    console.log content + ' ' + arr.join(',')

  $scope.getCheckes = ()->
    branches = tree.getCheckes()
    console.log branches

  $scope.tree = tree = {}

  $scope.getData = (branch, fn)->
    if branch.label == 'Cat'
      return lazyDatas
    else
      return []

  lazyDatas = [
    label: 'Home'
  ,
    label: 'Work'
  ]

  $scope.initSelect = '010401'
  $scope.initRadio = '0102'
  $scope.initChecks = ['010401','0102', '020203']

  $scope.treeData = [
    label:'Animal'
    children:[
      label:'Dog'
      data:
        description:"man's best friend"
    , 
      label:'Cat'
      uid:'0102'
      data:
        description:"Felis catus"
    ,
      label:'Hippopotamus'
      uid:'0103'
      data:
        description:"hungry, hungry"
    ,
      label:'Chicken'
      children:[
        label:'White Leghorn'
        uid: '010401'
        # branch's function
        onSelect: (branch)->
          console.log 'select branch ' + branch.label
        onRadio: (branch)->
          console.log 'radio branch ' + branch.label
        onCheck: (branch)->
          console.log 'check branch ' + branch.label + ' - ' + branch.checked
      ,
        label:'Rhode Island Red'
      ,
        label:'Jersey Giant'
      ]        
    ]
  ,
    label:'Vegetable'
    uid:"2"
    data:
      definition:"A plant or part of a plant used as food, typically as accompaniment to meat or fish, such as a cabbage, potato, carrot, or bean."
      data_can_contain_anything:true
    children:[
      label:'Oranges'
    ,
      label:'Apples'
      children:[
        label:'Granny Smith'
      ,
        label:'Red Delicous'
      ,
        label:'Fuji'
        uid: '020203'
      ]
    ]
  ,
    label:'Mineral'
    children:[
      label:'Rock'
      # children can be simply a list of strings
      # if you are in a hurry
      children:[
        label:'Igneous',
        label:'Sedimentary',
        label:'Metamorphic'
      ]
    ,
      label:'Metal'
      children:[
        label:'Aluminum',
        label:'Steel',
        label:'Copper'
      ]
    ,
      label:'Plastic'
      children:[
        label:'Thermoplastic'
        children:[
          label:'polyethylene', 
          label:'polypropylene', 
          label:'polystyrene',
          label:' polyvinyl chloride'
        ]
      ,
        label:'Thermosetting Polymer'
        children:[
          label:'polyester',
          label:'polyurethane',
          label:'vulcanized rubber',
          label:'bakelite',
          label:'urea-formaldehyde'
        ]
      ,
      ]      
    ]
  ]

]

# 页面加载完成后,再加载模块
angular.element(document).ready ()->
  angular.bootstrap(document,["app"])

###
# http处理
# get
# post --> application/x-www-form-urlencoded
# put  --> application/x-www-form-urlencoded
# delete
# payload --> application/json
###
angular
.module 'hm.http'
.factory 'hmHttp',['$http','hm', ($http, hm)->
	
	# 获取服务端URL
	_getUrl = (url)->
		return hm.defaults.serverUrl + url
	# 序列化
	_seriliz = (params)->
		params = if !!params then params else {}
		return $.param(params) 
	# 获取请求Header
	_getHeaders = ()->
		array = Array.prototype.slice.call(arguments);
		validArray = []
		array.forEach (ele)->
			validArray[validArray.length] = ele if !!ele
		return angular.extend({}, validArray)

	# get请求,获取数据
	get: (url,params)->
		$http({
			method: 'GET',
			url: _getUrl(url),
			params: params
		})

	# post请求,添加数据,由于angular默认使用application/json传输,所以需要设置header
	post: (url, params, headers)->
		$http({
			method: 'POST',
			url: _getUrl(url),
			data: _seriliz(params),
			headers: _getHeaders(headers, {
				'Content-Type': 'application/x-www-form-urlencoded'
			})
		})

	# put请求,修改数据,由于angular默认使用application/json传输,所以需要设置header
	put: (url, params, headers)->
		$http({
			method: 'PUT',
			url: _getUrl(url),
			data: _seriliz(params),
			headers: _getHeaders(headers, {
				'Content-Type': 'application/x-www-form-urlencoded'
			})
		})

	# payload请求,添加/修改数据,传输json数据
	payload: (url, params, headers)->
		$http({
			method: 'POST',
			url: _getUrl(url),
			data: params,
			headers: _getHeaders(headers, {
				'Content-Type': 'application/json'
			})
		})	

	# delete请求,删除数据
	delete: (url)->
		$http({
			method: 'DELETE',
			url: _getUrl(url)
		})	
	
]
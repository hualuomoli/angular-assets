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

	# 权限头信息
	_headers = {}
	
	# 序列化
	getSerilizParams = (params)->
		params = if !!params then params else {}
		return $.param(params) 

	# 获取请求Header
	getHeaders = (httpHeader)->
		if !!httpHeader
			return angular.extend({}, _headers, httpHeader)
		else
			return angular.extend({}, _headers)

	# 初始化URL
	getUrl = (url, params)->
		do_f = (url, fn)->
			s = url.indexOf('{')
			e = url.indexOf('}')
			if s < 0 || e < 0
				fn(url)
			else
				key = url.substring(s + 1, e)
				value = params[key]
				if !key
					throw new Error('can not find param ' + key)
				# remove
				delete params[key]

				u = url.substring(0, s) + value + url.substring(e + 1)
				do_f(u, fn)

		newUrl = url
		if !!params
			do_f url, (n)->
				newUrl = n

		return hm.defaults.serverUrl + newUrl


	# 设置header
	setHeader: (headers)->
		_headers = headers

	# get请求,获取数据
	get: (url, params)->
		url 		= getUrl(url, params)
		headers = getHeaders()

		$http
			method: 	'GET'
			url: 			url
			params: 	params
			headers: 	headers

	# post请求,添加数据,由于angular默认使用application/json传输,所以需要设置header
	post: (url, params)->
		url 		= getUrl(url, params)
		params 	= getSerilizParams(params)
		headers = getHeaders
								'Content-Type': 'application/x-www-form-urlencoded'

		$http
			method: 	'POST'
			url: 			url
			data: 		params
			headers: 	headers

	# put请求,修改数据,由于angular默认使用application/json传输,所以需要设置header
	put: (url, params, headers)->
		url 		= getUrl(url, params)
		params 	= getSerilizParams(params)
		headers = getHeaders
								'Content-Type': 'application/x-www-form-urlencoded'
		$http
			method: 		'PUT'
			url: 				url
			data: 			params
			headers: 		headers

	# payload请求,添加/修改数据,传输json数据
	payload: (url, params, headers)->
		url 		= getUrl(url, params)
		headers = getHeaders
								'Content-Type': 'application/json'

		$http
			method: 	'POST'
			url: 			url
			data: 		params
			headers:	headers

	# delete请求,删除数据
	delete: (url)->
		url 		= getUrl(url, params)
		headers = getHeaders()

		$http
			method: 	'DELETE'
			url: 			url
	
]
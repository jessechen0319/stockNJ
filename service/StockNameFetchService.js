var MySqlService = require("./MySqlService");
var Util = require("./Util");
var logger = require('./LogService');
var JobService = require("../service/JobService");
var jobService = new JobService();

function StockNameFetch(){

	function _generateInitialPaths(){

		var paths = [];
		//shanghai
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sh60${partialCode}`;
			paths.push(URL);
		}
		//shengzheng
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz00${partialCode}`;
			paths.push(URL);
		}

		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz30${partialCode}`;
			paths.push(URL);
		}
		return paths;
	}

	function _storeInformation(code, market){
		MySqlService.query('insert into t_stock_name (code, market) values (?, ?)', [code, market], function(err, result) {
		  if (err) throw err;
		});
	}

	function _checkExistAndStore(data){

		var listInformation = data.split("=");
		var arrayListStr = listInformation[1];
		var stockCode = listInformation[0].slice(listInformation[0].length - 6, listInformation[0].length);
		arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
		var arrayListInfo = arrayListStr.split(",");
		if(arrayListInfo.length != 1){
			var started = stockCode.substr(0, 1);
			var title = 'sh';
			if(started=='6'){
				title = 'sh';
			} else {
				title = 'sz';
			};
			try{
				_storeInformation(stockCode, title);
			} catch(e){
				logger.info(`fail to store ${stockCode}`);
			}
			
			logger.info(`available stock, the code is ${stockCode}`);
		} else {
			logger.info(`not available stock, the code is ${stockCode}`);
		}

	}

	this.fetchName = function(jobId){
		var paths = _generateInitialPaths();
		jobService.updateJobRunning(jobId, function(err, result){
			if(err){
				throw err;
			} else {

				function _fetch(){
					var path = paths.shift();
					Util.fetchPath({"host": 'hq.sinajs.cn', "path": path, "callback": function(data, err){
						_checkExistAndStore(data);
						if(paths.length != 0){
							_fetch();
						} else {
							jobService.updateJobFinished(jobId, function(){});
						}
					}});
				}

				_fetch();
			}
		});
		
	};
}

module.exports = StockNameFetch;
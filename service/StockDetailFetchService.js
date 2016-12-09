var MySqlService = require("./MySqlService");
var Util = require("./Util");
var logger = require('./LogService');
var JobService = require("../service/JobService");
var jobService = new JobService();

var stockDetailService = (function(){

	function _analysisData(data){
		var listInformation = data.split("=");
		var arrayListStr = listInformation[1];
		var stockCode = listInformation[0].slice(listInformation[0].length - 6, listInformation[0].length);
		arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
		var arrayListInfo = arrayListStr.split(",");
		var analysisObject = {'stockCode': stockCode};
		if(arrayListInfo.length == 1){
		} else {
			analysisObject.beginPrice = arrayListInfo[1];
			analysisObject.lastDayPrice = arrayListInfo[2];
			analysisObject.price = arrayListInfo[3];
			analysisObject.topPrice = arrayListInfo[4];
			analysisObject.lowPrice = arrayListInfo[5];
			analysisObject.amountStock = arrayListInfo[8];
			analysisObject.amountMoney = arrayListInfo[9];
			analysisObject.date = arrayListInfo[30];
			stocks.content.push(analysisObject);
		}

		return analysisObject;
	}

	function _fetchData(code, market){
		var URL = `/list=${market}${code}`;
		Util.fetchPath("host": 'hq.sinajs.cn', "path": URL, "callback": function(data, err){

			var analysisObject = _analysisData(data);
			MySqlService.query('insert into t_stock_detail () values ()', [type, 1], function(err, result) {
			  if (err){
			  	callback(err);
			  } else {
			  	callback(null, result.insertId);
			  }
			});
		});
	}

	function _getAllAvailableStocks(){
		MySqlService.query('select * from t_stock_name', function (error, results, fields) {
		
			if(error){
				throw error;
			}

			if(results&&results instanceof Array){
				results.forEach(function(item, index){
					setTimeout(function(){_fetchData(item.code, item.market)}, 2000*index);
				});
			}
		});
	}

	return {};
})();

module.exports = stockDetailService;
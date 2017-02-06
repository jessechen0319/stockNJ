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
			analysisObject.date = Util.generateMySqlDate(new Date(arrayListInfo[30]));
		}

		return analysisObject;
	}

	function _fetchData(code, market, isLast, jobId){
		var URL = `/list=${market}${code}`;
		Util.fetchPath({"host": 'hq.sinajs.cn', "path": URL, "callback": function(data, err){

			var analysisObject = _analysisData(data);
			if(Number(analysisObject.amountStock) != 0 && Number(analysisObject.amountMoney) != 0){
				MySqlService.query('insert into t_stock_detail (stock_code, begin_price, last_day_price, price, top_price, low_price, amount_stock, amount_money, date) values (?, ?,?,?,?,?,?,?,?)', [analysisObject.stockCode, Number(analysisObject.beginPrice), Number(analysisObject.lastDayPrice), Number(analysisObject.price), Number(analysisObject.topPrice), Number(analysisObject.lowPrice), Number(analysisObject.amountStock), Number(analysisObject.amountMoney), analysisObject.date], function(err, result) {
				  if (err){
				  	logger.info(err);
				  } else {
				  	logger.info(`insert record finished ${JSON.stringify(analysisObject)}`);
				  }
				});
			}
		}});

		if(isLast){
			jobService.updateJobFinished(jobId);
		}
	}

	function fetchDetail(jobId){
		MySqlService.query('select * from t_stock_name', function (error, results, fields) {
		
			if(error){
				throw error;
			}

			logger.info(`query finished, ${fields}`);

			jobService.updateJobRunning(jobId);

			if(results&&results instanceof Array){
				results.forEach(function(item, index){
					var isLast = (index == (results.length-1));
					setTimeout(function(){_fetchData(item.code, item.market, isLast, jobId)}, 2000*index);
				});
			}
		});
	}

	function fetchAverage(jobId){

		var averages = [10,13,20,30,34,55,60,120,144];
		MySqlService.query('select * from t_stock_name', function (error, stockNameResults, fields) {
			if(error){
				throw error;
			}
			jobService.updateJobRunning(jobId);
			if(stockNameResults&&stockNameResults instanceof Array){
				stockNameResults.forEach(function(item, index){
					//item.code
					MySqlService.query(`select * from t_stock_detail where stock_code='${item.code}' order by date desc`,
						function (error, results, fields) {
							averages.forEach(function(peroid){
								if(peroid < results.length){
									var sum = 0;
									for( var i = 0; i<peroid; i++){
										sum += results[i].price;
									}
									var average = sum/peroid;
									average = average.toFixed(2);
									logger.info(`${item.code} with ${peroid} average is ${average}`);
								}
							});
					});
					if (index+1==stockNameResults.length) {//finish the job
						jobService.updateJobFinished(jobId);
					}
				});
			}
		});
	}

	return {"fetchDetail": fetchDetail,
			"fetchAverage": fetchAverage};
})();

module.exports = stockDetailService;
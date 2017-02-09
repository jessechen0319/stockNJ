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

	function _fetchInitData(code, callback){

		let URL = `/hisHq?code=cn_${code}&start=19900101&end=20170209&stat=1&order=D&period=d&callback=historySearchHandler&rt=jsonp&r=0.9310515393362175&0.40358688832404455`;
		Util.fetchPath({"host": 'q.stock.sohu.com', "path": URL, "callback": function(data, err){
			if(err){
				logger.error(JSON.stringify(err));			
			} else {
				var data = JSON.parse(data.slice(21, data.length-2));
				var stockCode = data[0].code.slice(3, data[0].code.length)
				data[0]['hq'].forEach(function(item, index){
					var stockObject = {
						'stockCode':stockCode
					}
					var date = new Date(item[0]);
					stockObject.date = Util.generateMySqlDate(date);
					stockObject.beginPrice = Number(item[1]);
					stockObject.price = Number(item[2]);
					stockObject.lowPrice = Number(item[5]);
					stockObject.topPrice = Number(item[6]);
					stockObject.amountStock = Number(item[7])*100;
					stockObject.amountStock = Number(stockObject.amountStock.toFixed(0));
					stockObject.amountMoney = Number(item[8])*10000;
					stockObject.amountMoney = Number(stockObject.amountMoney.toFixed(0));
					stockObject.lastDayPrice = 0;
					MySqlService.query('insert into t_stock_detail (stock_code, begin_price, last_day_price, price, top_price, low_price, amount_stock, amount_money, date) values (?, ?,?,?,?,?,?,?,?)', [stockObject.stockCode, Number(stockObject.beginPrice), Number(stockObject.lastDayPrice), Number(stockObject.price), Number(stockObject.topPrice), Number(stockObject.lowPrice), Number(stockObject.amountStock), Number(stockObject.amountMoney), stockObject.date], function(err, result) {
					  if(index == data[0]['hq'].length-1){
					  	callback();
					  }
					  if (err){
					  	logger.info(err);
					  } else {
					  	logger.info(`insert record finished ${JSON.stringify(stockObject)}`);
					  }
					});
				});
			}
		}});
	}

	function fetchInit(jobId){

		MySqlService.query('select * from t_stock_name', function (error, results, fields) {
		
			if(error){
				throw error;
			}

			logger.info(`query finished, ${fields}`);

			jobService.updateJobRunning(jobId);
			if(results&&results instanceof Array){
				var fetchFlag = true;
				results.forEach(function(item, index){
					let isLast = (index == (results.length-1));
					setTimeout(function(){
						if(fetchFlag){//can raise new http request
							fetchFlag = false; //lock the fetch flag
							_fetchInitData(item.code, function(){
								fetchFlag = true;
							});
						}
					}, 500);
				});
			}
		});
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
			"fetchAverage": fetchAverage,
			"fetchInit": fetchInit};
})();

module.exports = stockDetailService;
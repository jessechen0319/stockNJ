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
			var insertSql = `insert into t_stock_detail (stock_code,
								 begin_price,
								 last_day_price,
								 price,
								 top_price,
								 low_price,
								 amount_stock,
								 amount_money,
								 date) values (
								 ${analysisObject.stockCode},
								 ${analysisObject.beginPrice},
								 ${analysisObject.lastDayPrice},
								 ${analysisObject.price},
								 ${analysisObject.topPrice},
								 ${analysisObject.lowPrice},
								 ${analysisObject.amountStock},
								 ${analysisObject.amountMoney},
								 ${analysisObject.date}
								 )`;
			logger.info(insertSql);
			MySqlService.query( insertSql, function(err, result) {
			  if (err){
			  	logger.info(err);
			  }
			});
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

	return {"fetchDetail": fetchDetail};
})();

module.exports = stockDetailService;
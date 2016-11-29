
var http = require('http');
var deferred = require('deferred');
var dbService = require("../service/DBService");

function StockService(){


	var totalStockes = 30000;

	var currentStockIndex = 0;
	var stocks = {};
	var paths = [];
	var host = 'hq.sinajs.cn';
	var availableStockNames = [];
	var totalAvailabeNumber = 1;
	var currentStockInfoIndex = 0;

	var Util = (function(){

		function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		function _storeNames({names}){
			dbService.readDb(function(err, db){

				if(!db.stockNames){
					db.stockNames = [];
				}
				db.stockNames = availableStockNames;

				dbService.writeDb(db, function(err){
					if(err){
						console.log('store failed');
					} else {
						console.log('store successfully');
					}
				});

			});
		}

		function _analysisData({body}){

			var listInformation = body.split("=");
			var arrayListStr = listInformation[1];
			var stockCode = listInformation[0].slice(listInformation[0].length - 6, listInformation[0].length);
			arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
			var arrayListInfo = arrayListStr.split(",");
			currentStockIndex++;
			if(arrayListInfo.length != 1){
				console.log(`available stock with index : ${currentStockIndex}, the code is ${stockCode}`);
				availableStockNames.push(stockCode);
			}
		}

		function _storeExtractedStockFunction(){

			dbService.readDb(function(err, db){

				if(db[stocks.trackDate]){
					return;
				}

				db[stocks.trackDate] = stocks.content;

				dbService.writeDb(db, function(err){
					if(err){
						console.log('store failed');
					} else {
						console.log('store successfully');
					}
				});

			});
		}

		function _analysisDataDetailInfo({body}){

			var listInformation = body.split("=");
			var arrayListStr = listInformation[1];
			var stockCode = listInformation[0].slice(listInformation[0].length - 6, listInformation[0].length);
			arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
			var arrayListInfo = arrayListStr.split(",");
			
			if(arrayListInfo.length == 1){
			} else {
				if(paths.length == 0){
				}
				var analysisObject = {'stockCode': stockCode};
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
		}

		function analysisDataDetail(){
			dbService.readDb(function(err, db){
				var availableNames = db.stockNames;
				if(!availableNames || availableNames.length == 0) {
					return;
				} else {
					totalAvailabeNumber = availableNames.length;

					function _innerAnalysis(){
						var stockName = availableNames.shift();
						currentStockInfoIndex++;

						if(!stockName){
							//finished extract, store data
							return;
						}

						var started = stockName.substr(0, 1);
						var title = '';

						switch(started){
							case '6':
								title = 'sh';
							default:
								title = 'sz';
						}

						var extractPath = `/list=${title}${stockName}`;
						console.log(`${extractPath} -> stock remind ${availableNames.length}`);

						var options = {
					      host: host,
					      port: 80,
					      path: extractPath
					    };

					    http.get(options, function(response) {
					      var body = "";
					      response.on("data", function(data) {
					          body += data;
					      });
					      response.on("end", function() {
					      	_analysisDataDetailInfo({body:body});
					      	_innerAnalysis();
					      	if(availableNames.length == 0){
					      		console.log('store ----->  ');
					      		_storeExtractedStockFunction();
					      	}
					      });
					    });
					}

					_innerAnalysis();

				}
			});
		}

		function checkEixst({host, paths}){

			var that = this;
			var pathV = paths.shift();
			console.log(pathV);
			var options = {
			      host: host,
			      port: 80,
			      path: pathV
			    };
			if(!pathV){
				//finished extract, store data
				_storeNames(availableStockNames);
				return;
			}

			http.get(options, function(response) {
			  var body = "";
			  response.on("data", function(data) {
			      body += data;
			  });
			  response.on("end", function() {
			  	_analysisData({body:body});
			    checkEixst({host:host, paths:paths});
			  });
			});

		}

		return {
			"pad": pad,
			"checkEixst": checkEixst,
			"analysisDataDetail": analysisDataDetail
		};
	})();

	function _SZNames(){

		var def = deferred();
		
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sh60${partialCode}`;
			paths.push(URL);
			if(i==9999){
				def.resolve();
			}

		}
		return def.promise();
		
	}

	function _CZNames(){

		var def = deferred();
		
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz00${partialCode}`;
			paths.push(URL);
			if(i==9999){
				def.resolve();
			}
		}
		return def.promise();
	}

	function _CYBNames(){

		var def = deferred();
		
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz30${partialCode}`;
			paths.push(URL);
			if(i==9999){
				def.resolve();
			}
		}
		return def.promise();
	}
	var getStockInformation = function(){

		var nowDate = new Date();
		var dayInMonth = nowDate.getDate();
		var month = nowDate.getMonth()+1;
		var year = nowDate.getFullYear();
		var dateFormate = `${year}-${month}-${dayInMonth}`;
		stocks = {};
		stocks.content = [];
		stocks.trackDate = dateFormate;
		currentStockInfoIndex = 0;
		Util.analysisDataDetail();
	};

	var getDetailProcessRate = function(callback){

		dbService.readDb(function(err, db){
			var stockNames = db.stockNames;
			var stockNumber = stockNames.length;
			var processRate = (currentStockInfoIndex/(stockNumber+1))*100;
			processRate = processRate.toFixed(2);
			callback(processRate);
		});
		
	};

	

	var fetchAllNames = function(){
		
		var nowDate = new Date();
		var day = nowDate.getDay();
		//if it is Sat. Sun. do not do any thing.
		if(day == 0 || day == 6){
			return;
		} else {
			var dayInMonth = nowDate.getDate();
			var month = nowDate.getMonth()+1;
			var year = nowDate.getFullYear();
			var dateFormate = `$(year)-$(month)-$(dayInMonth)`;
			availableStockNames = [];
			paths = [];
			currentStockIndex = 0;
			console.log(`jesse1`);
			_SZNames().then(function(){
				console.log(`jesse2`);
				_CZNames().then(function(){
					console.log(`jesse3`);
					_CYBNames().then(function(){
						console.log(`jesse4`);
						var lengthPaths = paths.length;
						console.log(`generate code finished, length = ${lengthPaths}`);
						Util.checkEixst({host:host, paths:paths});
					});
				});
			});
		}
		
	};

	var getProcessRate = function(){
		var processRate = (currentStockIndex/totalStockes)*100;
		processRate = processRate.toFixed(2);
		return processRate;
	};

	return {
		"fetchAllNames": fetchAllNames,
		"getProcessRate": getProcessRate,
		"stocks": stocks,
		"getStockInformation": getStockInformation,
		"getDetailProcessRate": getDetailProcessRate
	};
}

module.exports = StockService;
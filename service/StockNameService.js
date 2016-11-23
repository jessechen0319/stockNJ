
var http = require('http');

function StockService(){


	var totalStockes = 99999*3;

	var currentStockIndex = 0;
	var stocks = {};


	var Util = (function(){

		function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		function _analysisData({body}){

			var listInformation = body.split("=");
			var arrayListStr = listInformation[1];
			var stockCode = listInformation[0].slice(listInformation[0].length - 6, listInformation[0].length);
			arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
			var arrayListInfo = arrayListStr.split(",");
			
			if(arrayListInfo.length == 1){
				currentStockIndex++;
				console.log('stock information is not available');
			} else {
				currentStockIndex++;
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

		function checkIfExsitAndGetInformation({host, paths}){

			var that = this;
			var pathV = paths.shift();
			var options = {
			      host: host,
			      port: 80,
			      path: pathV
			    };

			http.get(options, function(response) {
			  var body = "";
			  response.on("data", function(data) {
			      body += data;
			  });
			  response.on("end", function() {
			  	_analysisData({body:body});
			    checkIfExsitAndGetInformation({host:host, paths:paths});
			  });
			});

		}

		return {
			"pad": pad,
			"checkIfExsitAndGetInformation": checkIfExsitAndGetInformation
		};
	})();

	function _SZNames(){

		var host = 'hq.sinajs.cn';
		var paths = [];
		for (var i = 0; i < 100000; i++) {
			var partialCode = Util.pad(i, 5);
			var URL = `/list=sh6${partialCode}`;
			paths.push(URL);
			
		}
		Util.checkIfExsitAndGetInformation({host:host, paths:paths});
	}

	function _CZNames(){

		var host = 'hq.sinajs.cn';
		var paths = [];
		for (var i = 0; i < 100000; i++) {
			var partialCode = Util.pad(i, 5);
			var URL = `/list=sz0${partialCode}`;
			paths.push(URL);
		}
		Util.checkIfExsitAndGetInformation({host:host, paths:paths});
	}

	function _CYBNames(){

		var host = 'hq.sinajs.cn';
		var paths = [];
		for (var i = 0; i < 100000; i++) {
			var partialCode = Util.pad(i, 5);
			var URL = `/list=sz3${partialCode}`;
			paths.push(URL);
		}
		Util.checkIfExsitAndGetInformation({host:host, paths:paths});
	}

	

	var fetchAllNames = function(){
		
		var nowDate = new Date();
		var day = nowDate.getDay();
		//if it is Sat. Sun. do not do any thing.
		if(day == 0 || day == 6){
			return;
		} else {
			var dayInMonth = nowDate.getDate();
			var month = nowDate.getMonth();
			var year = nowDate.getFullYear();
			var dateFormate = `$(year)-$(month)-$(dayInMonth)`;
			stocks = {};
			stocks.content = [];
			currentStockIndex = 0;
			stocks.trackDate = dateFormate;
			_SZNames();
			_CZNames();
			_CYBNames();
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
		"stocks": stocks
	};
}

module.exports = StockService;
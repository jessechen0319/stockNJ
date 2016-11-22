
var http = require('http');

function StockService(){


	var totalStockes = 99999*3;

	var currentStockIndex = 0;

	var Util = (function(){

		function pad(n, width, z) {
			z = z || '0';
			n = n + '';
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		}

		function _analysisData({body}){

			var listInformation = body.split("=");
			var arrayListStr = listInformation[1];
			arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
			var arrayListInfo = arrayListStr.split(",");
			
			if(arrayListInfo.length == 1){
				console.log('stock information is not available');
			} else {
				console.log('stock information is available');
				console.log(arrayListInfo.length);
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
			currentStockIndex++;
		}
		Util.checkIfExsitAndGetInformation({host:host, paths:paths});
	}

	

	var fetchAllNames = function(){
		_SZNames();
	};

	var getProcessRate = function(){
		var processRate = (currentStockIndex/totalStockes)*100;
		processRate = processRate.toFixed(2);
		return processRate;
	};

	return {
		"fetchAllNames": fetchAllNames,
		"getProcessRate": getProcessRate
	};
}

module.exports = StockService;
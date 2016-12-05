var dbService = require("../service/DBService");

var http = require('http');
//var dbService = require("../service/StockNameService");

console.log(dbService);

var currentStockInfoIndex = 0;

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

			if(started=='6'){
				title = 'sh';
			} else {
				title = 'sz';
			};

			var extractPath = `/list=${title}${stockName}`;

			var options = {
		      host: 'hq.sinajs.cn',
		      port: 80,
		      path: extractPath
		    };

		    http.get(options, function(response) {
		      var body = "";
		      response.on("data", function(data) {
		          body += data;
		      });
		      response.on("end", function() {
		      	console.log(extractPath);
		      	_innerAnalysis();
		      	if(availableNames.length == 0){
		      		console.log('store ----->  ');
		      	}
		      });
		    });
		}

		_innerAnalysis();

	}
});
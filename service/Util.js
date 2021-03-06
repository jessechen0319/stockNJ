var http = require('http');
var fs = require('fs');
var MySqlService = require("./MySqlService");
var Util = (function(){

	function dateToString(date){
		var now = new Date();
		let year = now.getFullYear();
		let month = now.getMonth()+1;
		let day = now.getDate();
		let result = `${year}-${month}-${day}`;
	}

	function yesterday(today){
		var yesterday_milliseconds=today.getTime()-1000*60*60*24;
		var yesterday = new Date(yesterday_milliseconds);
		return yesterday;
	}

	function getPreviousWorkDay(){
		var now = new Date();
		var previousWorkDay = yesterday(now);
		if (now.getDay() == 1){
			previousWorkDay = yesterday(previousWorkDay);
			previousWorkDay = yesterday(previousWorkDay);
		}
		return dateToString(previousWorkDay);
	}

	function generateCurrentDate(){
		var now = new Date();
		let year = now.getFullYear();
		let month = now.getMonth()+1;
		let day = now.getDate();
		let result = `${year}-${month}-${day}`;
		return result;
	}

	function isTodaysRecord(stockCode, callback){
		MySqlService.query(`select * from t_stock_detail t where t.stock_code = ?
		order by t.date desc limit 1`, [stockCode], function(error, results, fields){
			if(results && results.length == 1){
				 var lastRecordDate = results[0]['date'];
				var today = generateCurrentDate();
				today = new Date(today);
				if(today.getFullYear() != lastRecordDate.getFullYear() || today.getMonth() != lastRecordDate.getMonth() || today.getDate() != lastRecordDate.getDate()){
					callback(false);
				} else {
					callback(true);
				}
			} else {
				callback(false);
			}
		});
	}

	function getPriceOfDay(stockCode, dates, callback){
		MySqlService.query(`
			select * from t_stock_detail t where t.stock_code = ?
			and t.date in (?) order by t.date desc
		`, [stockCode, dates], function(error, results, fields){
			if(error){
				callback(0);
			}
			if(results && results.length>0){
				callback(results);
			}else {
				callback(0);
			}
		});
	};

	function isStockTopOrLow(stockCode, callback){
		MySqlService.query(`SELECT 
				1
			FROM
				(SELECT 
					*
				FROM
					t_stock_detail t
				WHERE
					t.stock_code = ?
				ORDER BY t.date DESC
				LIMIT 1) m
			WHERE
				(m.price - m.last_day_price) / m.last_day_price < 0.095
					AND (m.price - m.last_day_price) / m.last_day_price > - 0.095`,[stockCode] ,function (error, results, fields){
						if(results&&results.length>0){
							callback(false);
						}else{
							callback(true);
						}
		});
	}

	function generateMySqlDate(date){

		if(date instanceof Date){
			return date.toISOString().slice(0, 19).replace('T', ' ');
		} else {
			return null;
		}
	}
	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function fetchPath({host, path, callback}){
		var options = {
	      host: host,
	      port: 80,
	      path: path
	    };

	    http.get(options, function(response) {
	      var body = "";
	      response.on("data", function(data) {
	          body += data;
	      });
	      response.on("end", function() {
	      	
	      	callback(body);
	      });
	      response.on("error", function(e) {
	      	callback(null, e);
	      });
	    });
	}

	function removeDir(path) {

    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                removeDir(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

	return {"pad": pad,
			"fetchPath": fetchPath,
			"generateMySqlDate": generateMySqlDate,
			"generateCurrentDate":generateCurrentDate,
			"removeDir":removeDir,
			"isStockTopOrLow":isStockTopOrLow,
			"getPriceOfDay": getPriceOfDay,
			"isTodaysRecord":isTodaysRecord,
			"getPreviousWorkDay": getPreviousWorkDay,
			"dateToString": dateToString
			};
})();

module.exports = Util;
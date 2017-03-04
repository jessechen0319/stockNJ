var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');

function initStockNameJson(callback){

    MySqlService.query('select * from t_stock_name', function (error, results, fields){

        jsonfile.writeFile(__dirname+"//stockName.json", results,  (err)=> {
		  callback(err)
		});
    });
}

function initialAverage(callback){

    jsonfile.readFile(__dirname+"//stockName.json", function(err, obj) {
        if(obj instanceof Array && obj.length>0){
            var stock = obj.shift();
            jsonfile.writeFileSync(__dirname+"//stockName.json", obj);
            var stockCode = stock.code;
            callback(stockCode, function(){
                initialAverage(callback);
            });
        } else {
            console.log('initial finish');
        }
    });
}

function initMACD(code){

    MySqlService.query('select * from t_stock_detail t where t.stock_code=? order by t.date',[code] , function (error, results, fields){
        
        /*results = results.sort(function(e1, e2){
            console.log(e1.date);
            e1.date < e2.date;
        });*/

        console.log(results);

        var cursor = 1;

        
        var MACDs = [];

        var cacheEma12 = results[0].price, cacheEma26=results[0].price, cacheDea=0;

        while(cursor <= results.length-1){

            var cur = results[cursor];
            console.log(`parameter-${cacheEma12}-${cacheEma26}-${cacheDea}`);
            var MACDResult = calculateService.calcMACD({preEma12:cacheEma12, preEma26:cacheEma26, preDea:cacheDea, price:cur.price});
            cacheDea = MACDResult.dea;
            cacheEma12 = MACDResult.ema12;
            cacheEma26 = MACDResult.ema26;
            console.log(`${cur.date} - ${MACDResult.bar} - ${MACDResult.dif} - ${MACDResult.dea}`);

            if(cursor==results.length-1){

            }
            
            cursor++;
        }


    });
}


initMACD('002828');
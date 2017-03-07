var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");

/*function initStockNameJson(callback){

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
}*/

function initialStocks(){

    UTIL.removeDir(__dirname+"//stockDetail");
    fs.mkdir(__dirname+"//stockDetail");

    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//stockName.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//stockName.json");
        var that = this;

        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockName.json", stocks);

            console.log(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                console.log(`processing for ${stock.code} finish---`);
                let dateString = UTIL.generateCurrentDate();
                jsonfile.writeFileSync(`${__dirname}//stockDetail//stock_${stock.code}_${dateString}.json`, results);
                process.call(that);
            });
            stocks = jsonfile.readFileSync(__dirname+"//stockName.json");
        }

        process();

        /*while(stocks && stocks.length>0){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockName.json", stocks);

            //main logic
            console.log(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                console.log(`processing for ${stock.code} finish---`);
                let dateString = UTIL.generateCurrentDate();
                jsonfile.writeFileSync(`${__dirname}//stockDetail//stock_${stock.code}_${dateString}.json`, results);
            });

            //end main logic

            stocks = jsonfile.readFileSync(__dirname+"//stockName.json");
        }*/

    });
}

function init(code, callback){

    MySqlService.query('select * from t_stock_detail t where t.stock_code=? order by t.date',[code] , function (error, results, fields){

        var cursor = 1;

        var MACDs = [];

        if(!results||results.length == 0){
            console.log('no record found for:'+ code);
            callback([]);
        }

        //initial MACD parameter
        var cacheEma12 = results[0].price, cacheEma26=results[0].price, cacheDea=0;

        //cache for average
        var priceCache = [];
        var amountCache = [];
        var averageDefine = [10,20,30,60,120,250,13,34,55,89,144];

        var returnValues = [];


        while(cursor <= results.length-1){

            var analysisObj = {};

            var cur = results[cursor];
            priceCache.push(cur.price);
            amountCache.push(cur.amount_stock);

            //MACD calculate{
            try{
                var MACDResult = calculateService.calcMACD({preEma12:cacheEma12, preEma26:cacheEma26, preDea:cacheDea, price:cur.price});
                cacheDea = MACDResult.dea;
                cacheEma12 = MACDResult.ema12;
                cacheEma26 = MACDResult.ema26;
                analysisObj.dea = MACDResult.dea;
                analysisObj.ema12 = MACDResult.ema12;
                analysisObj.ema26 = MACDResult.ema26;
                analysisObj.bar = MACDResult.bar;
                analysisObj.dif = MACDResult.dif;
            } catch(e){
                console.log('calculate MACD error');
                console.log(e);
            }
            //}MACD calculate

            //average
            try{

                averageDefine.forEach(function(item){
                    if(priceCache.length > item){
                        var priceAverage = 0;
                        for(var i = priceCache.length-item; i<priceCache.length;i++){
                            priceAverage += priceCache[i];
                        }
                        priceAverage = priceAverage/item;
                        priceAverage = priceAverage.toFixed(2);
                        analysisObj[`price_day_${item}`] = priceAverage;
                    }
                });

                averageDefine.forEach(function(item){
                    if(amountCache.length > item){
                        var amountAverage = 0;
                        for(var i = amountCache.length-item; i<amountCache.length;i++){
                            amountAverage += amountCache[i];
                        }
                        amountAverage = amountAverage/item;
                        amountAverage = amountAverage.toFixed(2);
                        analysisObj[`amount_day_${item}`] = amountAverage;
                    }
                });

            }catch(e){
                console.log('calculate average error');
            }
            //average

            //BOLL

            try{
                if(priceCache.length>=20){
                    var average = 0;
                    for(var i = priceCache.length-20;i<priceCache.length;i++){
                        average += priceCache[i];
                    }
                    average = average/20;
                    var averageA = 0;
                    for(var i = priceCache.length-20;i<priceCache.length;i++){
                        averageA += (priceCache[i]-average)*(priceCache[i]-average);
                    }
                    averageA = averageA/20;
                    averageA = Math.sqrt(averageA);
                    var uper = average + 2*averageA;
                    var down = average - 2*averageA;

                    analysisObj.boll_mid = average.toFixed(2);
                    analysisObj.boll_uper = uper.toFixed(2);
                    analysisObj.boll_down = down.toFixed(2);

                }
            }catch(e){
                console.log('calculate BOLL error');
            }

            //BOLL

            analysisObj.code = cur.stock_code;
            analysisObj.date = cur.date;
            returnValues.push(analysisObj);
            cursor++;
        }

        callback(returnValues);
    });
}

initialStocks();
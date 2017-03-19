var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");
var logger = require('./LogService');
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
            logger.info('initial finish');
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

            logger.info(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                logger.info(`processing for ${stock.code} finish---`);
                process.call(that);
            });
            stocks = jsonfile.readFileSync(__dirname+"//stockName.json");
        }

        process();

        /*while(stocks && stocks.length>0){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockName.json", stocks);

            //main logic
            logger.info(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                logger.info(`processing for ${stock.code} finish---`);
                let dateString = UTIL.generateCurrentDate();
                jsonfile.writeFileSync(`${__dirname}//stockDetail//stock_${stock.code}_${dateString}.json`, results);
            });

            //end main logic

            stocks = jsonfile.readFileSync(__dirname+"//stockName.json");
        }*/

    });
}

function initInsertObject(){

    var returnValue = {};
    returnValue.macd_dif = '0';
    returnValue.macd_dea = '0';
    returnValue.macd_bar = '0';
    returnValue.macd_ema12 = '0';
    returnValue.macd_ema26 = '0';
    returnValue.price_day_10 = '0';
    returnValue.price_day_20 = '0';
    returnValue.price_day_30 = '0';
    returnValue.price_day_60 = '0';
    returnValue.price_day_120 = '0';
    returnValue.price_day_250 = '0';
    returnValue.price_day_13 = '0';
    returnValue.price_day_34 = '0';
    returnValue.price_day_55 = '0';
    returnValue.price_day_89 = '0';
    returnValue.amount_day_10 = '0';
    returnValue.price_day_144 = '0';
    returnValue.amount_day_20 = '0';
    returnValue.amount_day_30 = '0';
    returnValue.amount_day_60 = '0';
    returnValue.amount_day_120 = '0';
    returnValue.amount_day_250 = '0';
    returnValue.amount_day_13 = '0';
    returnValue.amount_day_34 = '0';
    returnValue.amount_day_55 = '0';
    returnValue.amount_day_89 = '0';
    returnValue.amount_day_144 = '0';
    returnValue.boll_mid='0';
    returnValue.boll_uper='0';
    returnValue.boll_down='0';
    return returnValue;
}

function makeParameterInOrder(objects){

    var parameters = '';
    objects.forEach(function(item, index){
        var parameters = parameters + ` (\"${item.detail_id}\", \"${item.macd_dif}\", \"${item.macd_dea}\", \"${item.macd_bar}\", \"${item.macd_ema12}\", \"${item.macd_ema26}\", \"${item.price_day_10}\", \"${item.price_day_20}\", \"${item.price_day_30}\", \"${item.price_day_60}\", \"${item.price_day_120}\", \"${item.price_day_250}\", \"${item.price_day_13}\", \"${item.price_day_34}\", \"${item.price_day_55}\", \"${item.price_day_89}\", \"${item.amount_day_10}\", \"${item.price_day_144}\", \"${item.amount_day_20}\", \"${item.amount_day_30}\", \"${item.amount_day_60}\", \"${item.amount_day_120}\", \"${item.amount_day_250}\", \"${item.amount_day_13}\", \"${item.amount_day_34}\", \"${item.amount_day_55}\", \"${item.amount_day_89}\", \"${item.amount_day_144}\", \"${item.boll_mid}\", \"${item.boll_uper}\", \"${item.boll_down}\", \"${item.stock_code}\", \"${item.date}\")`;
        if(index != objects.length-1){
            parameters = parameters + ', ';
        }
    });
    return parameters;
}

function generateValues(objects){
    var parameters = [];
    objects.forEach(function(item){
        var parameterRow = [item.detail_id, item.macd_dif, item.macd_dea, item.macd_bar, item.macd_ema12, item.macd_ema26, item.price_day_10, item.price_day_20, item.price_day_30, item.price_day_60, item.price_day_120, item.price_day_250, item.price_day_13, item.price_day_34, item.price_day_55, item.price_day_89, item.amount_day_10, item.price_day_144, item.amount_day_20, item.amount_day_30, item.amount_day_60, item.amount_day_120, item.amount_day_250, item.amount_day_13, item.amount_day_34, item.amount_day_55, item.amount_day_89, item.amount_day_144, item.boll_mid, item.boll_uper, item.boll_down, item.stock_code, item.date];
        var legal = parameterRow.every(function(value){
            if(!value){
                logger.error(`row for ${item.stocks} at ${item.date} is not correct: ${item}`);
                return false;
            } else {
                return true;
            }
        });
        legal?parameters.push(parameterRow):"";
    });
    return parameters;
}

function init(code, callback){

    MySqlService.query('select * from t_stock_detail t where t.stock_code=? order by t.date',[code] , function (error, results, fields){

        var cursor = 1;

        var MACDs = [];

        if(!results||results.length == 0){
            logger.error('no record found for:'+ code);
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

            var analysisObj = initInsertObject();
            var cur = results[cursor];
            priceCache.push(cur.price);
            amountCache.push(cur.amount_stock);

            //MACD calculate{
            try{
                var MACDResult = calculateService.calcMACD({preEma12:cacheEma12, preEma26:cacheEma26, preDea:cacheDea, price:cur.price});
                cacheDea = MACDResult.dea;
                cacheEma12 = MACDResult.ema12;
                cacheEma26 = MACDResult.ema26;
                analysisObj.macd_dea = MACDResult.dea;
                analysisObj.macd_ema12 = MACDResult.ema12;
                analysisObj.macd_ema26 = MACDResult.ema26;
                analysisObj.macd_bar = MACDResult.bar;
                analysisObj.macd_dif = MACDResult.dif;
            } catch(e){
                logger.info('calculate MACD error');
                logger.info(e);
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
                logger.info('calculate average error');
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
                logger.info('calculate BOLL error');
            }

            //BOLL
            var date1 = new Date(cur.date);
            analysisObj.detail_id = cur.id;
            analysisObj.stock_code = cur.stock_code;
            analysisObj.date = UTIL.generateMySqlDate(date1);
            returnValues.push(analysisObj);
            cursor++;
        }

        var values = makeParameterInOrder(returnValues);

        var valueAarry = generateValues(returnValues);


        var sql = "insert into t_stock_tools (detail_id, macd_dif, macd_dea, macd_bar, macd_ema12, macd_ema26, price_day_10, price_day_20, price_day_30, price_day_60, price_day_120, price_day_250, price_day_13, price_day_34, price_day_55, price_day_89, amount_day_10, price_day_144, amount_day_20, amount_day_30, amount_day_60, amount_day_120, amount_day_250, amount_day_13, amount_day_34, amount_day_55, amount_day_89, amount_day_144, boll_mid, boll_uper, boll_down, stock_code, date) values ? ";
        
        //var item = returnValues[0];

        //var value = ` (\"${item.detail_id}\", \"${item.macd_dif}\", \"${item.macd_dea}\", \"${item.macd_bar}\", \"${item.macd_ema12}\", \"${item.macd_ema26}\", \"${item.price_day_10}\", \"${item.price_day_20}\", \"${item.price_day_30}\", \"${item.price_day_60}\", \"${item.price_day_120}\", \"${item.price_day_250}\", \"${item.price_day_13}\", \"${item.price_day_34}\", \"${item.price_day_55}\", \"${item.price_day_89}\", \"${item.amount_day_10}\", \"${item.price_day_144}\", \"${item.amount_day_20}\", \"${item.amount_day_30}\", \"${item.amount_day_60}\", \"${item.amount_day_120}\", \"${item.amount_day_250}\", \"${item.amount_day_13}\", \"${item.amount_day_34}\", \"${item.amount_day_55}\", \"${item.amount_day_89}\", \"${item.amount_day_144}\", \"${item.boll_mid}\", \"${item.boll_uper}\", \"${item.boll_down}\", \"${item.stock_code}\", \"${item.date}\")`;

        //console.log(sql+value);

        MySqlService.query(sql, [valueAarry], function(err, result) {
            if(err){
                logger.error(sql+value);
                logger.info(err);
            }
            callback();
        });

        /*var that=this;
        function run(callback2){
            var record = returnValues.shift();
            var sql = 'insert into t_stock_tools (';
            var values = 'values (';
            var insertValues = [];
            Object.keys(record).forEach(function(key, index){
                sql += key;
                insertValues.push(record[key]);
                if(index < Object.keys(record).length -1 ){
                    sql += ', ';
                    values += '?, ';
                } else {
                    sql += ') ';
                    values += '?) ';
                }
            });

            MySqlService.query(sql + values, insertValues, function(err, result) {
                if(err){
                    logger.info(err);
                }
                if(returnValues.length == 0){
                    callback2(true);
                } else {
                    run.apply(that, [callback2]);
                }
            });
        }

        run.apply(that, [function(isLastOne){
            if(isLastOne){
                callback();
            }
        }]);*/

        /*returnValues.forEach(function(record, index){
            var sql = 'insert into t_stock_tools (';
            var values = 'values (';
            var insertValues = [];
            Object.keys(record).forEach(function(key, index){
                sql += key;
                insertValues.push(record[key]);
                if(index < Object.keys(record).length -1 ){
                    sql += ', ';
                    values += '?, ';
                } else {
                    sql += ') ';
                    values += '?) ';
                }
            });

            MySqlService.query(sql + values, insertValues, function(err, result) {
                if(err){
                    logger.info(err);
                }
            });

            if(index == returnValues.length-1){
                callback(returnValues);
            }
            //logger.info(`sql is ${sql + values}`);
        });*/

        
    });
}

/*init('002828', function(values){
    //logger.info(values);
    logger.info('fetch finish');
});*/

module.exports.initialStocks = initialStocks;
var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");
var logger = require('./LogService');

var averageDefine = [10,20,30,60,120,250,13,34,55,89,144];

function init(stockCode, callback){
    MySqlService.query('select * from t_stock_detail t where t.stock_code = ? and not exists (select 1 from t_stock_tools m where t.id = m.detail_id)', stockCode, function(err, results, fields){
        if(results.length>0){
            logger.info(`for stock ${stockCode}, there is un-analysised record, length is ${results.length}`);
            
            results.forEach(function(detail, index){
                var toolObject = initInsertObject();
                 // insert normal information
                var date1 = new Date(detail.date);
                toolObject.detail_id = detail.id;
                toolObject.stock_code = detail.stock_code;
                toolObject.date = UTIL.generateMySqlDate(date1);
                var isLastOne = index==(results.length-1);
                var resultList = [];
                // calculate average & BOLL
                MySqlService.query('select * from t_stock_detail t where t.date < ? order by t.date desc limit 250' [detail.date], function(err, detailResult, fields){
                    logger.info(`daily fetch for stock tools, date is ${detail.date}, result length is ${detailResult.length}`);
                    if(err){
                        logger.err(err);
                    }
                    if(detailResult.length>0){
                        averageDefine.forEach((days, index)=>{
                            if(detailResult.length>days){
                                for(var i = detailResult.length-days; i<detailResult.length;i++){
                                    priceAverage += detailResult[i];
                                }
                                priceAverage = priceAverage/days;
                                priceAverage = priceAverage.toFixed(2);
                                toolObject[`price_day_${days}`] = priceAverage;

                                var amountAverage = 0;
                                for(var i = detailResult.length-item; i<detailResult.length;i++){
                                    amountAverage += detailResult[i];
                                }
                                amountAverage = amountAverage/item;
                                amountAverage = amountAverage.toFixed(2);
                                toolObject[`amount_day_${item}`] = amountAverage;
                            }
                            
                        });
                        //BOLL
                        if(detailResult.length>=20){
                            var average = 0;
                            for(var i = detailResult.length-20;i<detailResult.length;i++){
                                average += detailResult[i];
                            }
                            average = average/20;
                            var averageA = 0;
                            for(var i = detailResult.length-20;i<detailResult.length;i++){
                                averageA += (detailResult[i]-average)*(detailResult[i]-average);
                            }
                            averageA = averageA/20;
                            averageA = Math.sqrt(averageA);
                            var uper = average + 2*averageA;
                            var down = average - 2*averageA;

                            toolObject.boll_mid = average.toFixed(2);
                            toolObject.boll_uper = uper.toFixed(2);
                            toolObject.boll_down = down.toFixed(2);

                        }
                        // calculate MACD
                        MySqlService.query(`select * from t_stock_tools m where m.date < ? order by m.date desc limit 1`, [detail.date], function(err, previousResult, fields){
                            if(err){
                                logger.error(err);
                            } else {
                                if(previousResult.length>0){
                                    var previousValue = previousResult[0];
                                    var cacheEma12 = previousValue.macd_ema12, cacheEma26=previousValue.macd_ema26, cacheDea=previousValue.macd_dea;
                                    var MACDResult = calculateService.calcMACD({preEma12:cacheEma12, preEma26:cacheEma26, preDea:cacheDea, price:detail.price});
                                    toolObject.macd_dea = MACDResult.dea;
                                    toolObject.macd_ema12 = MACDResult.ema12;
                                    toolObject.macd_ema26 = MACDResult.ema26;
                                    toolObject.macd_bar = MACDResult.bar;
                                    toolObject.macd_dif = MACDResult.dif;
                                }
                            }

                            resultList.push(toolObject);

                            if(isLastOne){
                                callback(resultList);
                            }
                            
                        });
                    } else {
                        callback([]);
                    } 
                });
            });
        } else {
            callback([]);
        }
    });
}

function refresh(){

    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//stockNameDailyTool.json");
        var that = this;

        var analysisedToolRecords = [];

        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", stocks);

            logger.info(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                analysisedToolRecords.concat(results);
                logger.info(`processing for ${stock.code} finish---`);
                logger.info(JSON.stringify(results));
                process.call(that);
            });
            stocks = jsonfile.readFileSync(__dirname+"//stockNameDailyTool.json");
        }

        process();
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
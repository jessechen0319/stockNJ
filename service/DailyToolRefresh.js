var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");
var logger = require('./LogService');

var averageDefine = [10,20,30,60,120,250,13,34,55,89,144];

function init(stockCode, callback){
    MySqlService.query(`SELECT 
            *
        FROM
            t_stock_detail t
        WHERE
            t.stock_code = ?
            and t.date > (select min(u.date) from t_stock_detail u where u.stock_code=?)
                AND NOT EXISTS( SELECT 
                    1
                FROM
                    t_stock_tools m
                WHERE
                    t.id = m.detail_id)
        ORDER BY t.date`, [stockCode, stockCode], function(err, results, fields){

        var that = this;
        function process(){
            if(results.length > 0){
                var unAnalysisedRecord = results.shift();
                var analysisObj = initInsertObject();
                var date1 = new Date(unAnalysisedRecord.date);
                analysisObj.detail_id = unAnalysisedRecord.id;
                analysisObj.stock_code = unAnalysisedRecord.stock_code;
                analysisObj.date = UTIL.generateMySqlDate(date1);

                MySqlService.query(`SELECT 
                        *
                    FROM
                        t_stock_detail t
                    WHERE
                        t.stock_code = ?
                            AND t.id < ?
                    ORDER BY t.date DESC
                    LIMIT 249;`, [unAnalysisedRecord.stock_code, unAnalysisedRecord.id], function(err, results, fields){
                        
                        if(!results||results.length==0){
                            process.call(that);
                            return;
                        }

                        //calculate Average
                        averageDefine.forEach(function(item){
                            var priceAverage = unAnalysisedRecord.price;
                            var amountAverage = unAnalysisedRecord.amount_stock;
                            if(results.length >= item-1){
                                for(var i = results.length-item+1; i<results.length;i++){
                                    priceAverage += results[i].price;
                                    amountAverage += results[i].amount_stock;
                                }
                                priceAverage = priceAverage/item;
                                priceAverage = priceAverage.toFixed(2);
                                analysisObj[`price_day_${item}`] = priceAverage;
                                amountAverage = amountAverage/item;
                                amountAverage = amountAverage.toFixed(2);
                                analysisObj[`amount_day_${item}`] = amountAverage;
                            }
                        });
                        //calculate BOLL
                        if(results.length>=19){
                            var average = unAnalysisedRecord.price;
                            for(var i = results.length-19;i<results.length;i++){
                                average += results[i].price;
                            }
                            average = average/20;
                            var averageA = (unAnalysisedRecord.price-average)*(unAnalysisedRecord.price-average);
                            for(var i = results.length-19;i<results.length;i++){
                                averageA += (results[i].price-average)*(results[i].price-average);
                            }
                            averageA = averageA/20;
                            averageA = Math.sqrt(averageA);
                            var uper = average + 2*averageA;
                            var down = average - 2*averageA;

                            analysisObj.boll_mid = average.toFixed(2);
                            analysisObj.boll_uper = uper.toFixed(2);
                            analysisObj.boll_down = down.toFixed(2);
                        }
                        //MACD
                        MySqlService.query(`select * from t_stock_tools s
                            where s.detail_id = ?`, [results[0].id], (err, results, fields)=>{
                            if(results && results.length>0){
                                let previousResult = results[0];
                                var MACDResult = calculateService.calcMACD({preEma12:previousResult.macd_ema12, preEma26:previousResult.macd_ema26, preDea:previousResult.macd_dea, price:unAnalysisedRecord.price});
                                analysisObj.macd_dea = MACDResult.dea;
                                analysisObj.macd_ema12 = MACDResult.ema12;
                                analysisObj.macd_ema26 = MACDResult.ema26;
                                analysisObj.macd_bar = MACDResult.bar;
                                analysisObj.macd_dif = MACDResult.dif;
                            }

                            var sql = "insert into t_stock_tools (detail_id, macd_dif, macd_dea, macd_bar, macd_ema12, macd_ema26, price_day_10, price_day_20, price_day_30, price_day_60, price_day_120, price_day_250, price_day_13, price_day_34, price_day_55, price_day_89, amount_day_10, price_day_144, amount_day_20, amount_day_30, amount_day_60, amount_day_120, amount_day_250, amount_day_13, amount_day_34, amount_day_55, amount_day_89, amount_day_144, boll_mid, boll_uper, boll_down, stock_code, date) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
                            var parameter = [analysisObj.detail_id, analysisObj.macd_dif, analysisObj.macd_dea, analysisObj.macd_bar, analysisObj.macd_ema12, analysisObj.macd_ema26, analysisObj.price_day_10, analysisObj.price_day_20, analysisObj.price_day_30, analysisObj.price_day_60, analysisObj.price_day_120, analysisObj.price_day_250, analysisObj.price_day_13, analysisObj.price_day_34, analysisObj.price_day_55, analysisObj.price_day_89, analysisObj.amount_day_10, analysisObj.price_day_144, analysisObj.amount_day_20, analysisObj.amount_day_30, analysisObj.amount_day_60, analysisObj.amount_day_120, analysisObj.amount_day_250, analysisObj.amount_day_13, analysisObj.amount_day_34, analysisObj.amount_day_55, analysisObj.amount_day_89, analysisObj.amount_day_144, analysisObj.boll_mid, analysisObj.boll_uper, analysisObj.boll_down, analysisObj.stock_code, analysisObj.date];
                            MySqlService.query(sql, parameter, function(err, result) {
                                if(err){
                                    logger.info(`problem -> ${sql} ${JSON.stringify(parameter)}`);
                                    logger.info(err);
                                }
                                process.call(that);
                            });
                        });
                    });
            } else {
                callback();
            }
        }
        process();
    });
}

function refresh(callback){

    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//stockNameDailyTool.json");
        var that = this;

        var analysisedToolRecords = [];

        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", stocks);

            logger.info(`processing for ${stock.code} start+++`);
            if(stocks.length == 0){
                callback();
            } else {
                init(stock.code, function(){
                    logger.info(`processing for ${stock.code} finish---`);
                    process.call(that);
                });
            }
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

module.exports.refresh = refresh;
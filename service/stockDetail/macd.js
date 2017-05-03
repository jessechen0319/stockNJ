var MySqlService = require("../MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var logger = require('../LogService');
var UTIL = require('../Util');

function macdDifStrong1(stockCode, callBack) {
    MySqlService.query('select * from t_stock_tools t where t.stock_code=? order by t.date desc limit 3',[stockCode] ,function (error, results, fields){
        
        if(results&&results.length==3){
            var lastRecordDate = results[0]['date'];
            var today = UTIL.generateCurrentDate();
            today = new Date(today);
            if(today.getFullYear() != lastRecordDate.getFullYear() || today.getMonth() != lastRecordDate.getMonth() || today.getDate() != lastRecordDate.getDate()){
                logger.info(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()+1} not equals ${lastRecordDate.getFullYear()}-${lastRecordDate.getMonth()+1}-${lastRecordDate.getDate()+1}`);
                callBack();
                return;
            }

            var amountIncreate = results[0]

            if(results[1].macd_dif<results[0].macd_dif && results[1].macd_dif<=results[2].macd_dif){
                var value1 = 0;
                
                if(results[1].macd_dif!=results[2].macd_dif){
                    value1 = results[0].macd_dif - results[1].macd_dif;
                    let value2 = results[2].macd_dif - results[1].macd_dif;
                    value1 = value1/value2;
                }

                UTIL.getPriceOfDay(stockCode, [results[0].date, results[1].date, results[2].date], (priceObjects)=>{
                    let insertParam = [];
                    insertParam.push(2);
                    insertParam.push(stockCode);
                    insertParam.push(priceObject[0].price);
                    insertParam.push(results[0].date);
                    insertParam.push(value1);
                    if(9>value1>2&&results.length==3&&results[0].amount_stock>results[1].amount_stock&&results[0].amount_stock>results[2].amount_stock){
                        logger.info(`${stockCode} -> macd dif is good! with price -> ${priceObject[0].price}`);
                        MySqlService.query('INSERT INTO t_strategy_tester (strategy_id, stock_code, price, date, v1) VALUES (?, ?, ?, ?, ?)', insertParam, function(err){
                            if(err){
                                logger.info(err);
                            }
                            callBack();
                        });
                    }
                });
            } else {
                callBack();
            }
        } else {
            callBack();
        };
    });
}

function init(stockCode, callBack){
    macdDifStrong1(stockCode, callBack);
}

function macd(callBack){
    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//macd.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//macd.json");
        var that = this;

        var analysisedToolRecords = [];
        logger.info(`processing start+++`);
        function process(){
            var stock = stocks.shift();
            logger.info(`macd process ${stock.code}, remind -> ${stocks.length}`);
            jsonfile.writeFileSync(__dirname+"//macd.json", stocks);
            if(stocks.length == 0){
                callBack();
                logger.info('finished process-------');
            } else {
                init(stock.code, function(){
                    process.call(that);
                });
            }
            stocks = jsonfile.readFileSync(__dirname+"//macd.json");
        }

        process();
    });
}

module.exports.macd = macd;
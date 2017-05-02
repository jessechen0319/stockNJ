var MySqlService = require("../MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var logger = require('../LogService');
var UTIL = require('../Util');

// amount shunk strategy 1
//strategy id---->1
function shunkStrategy1(stockCode, callBack){
    MySqlService.query('select * from t_stock_detail t where t.stock_code=? order by t.date desc limit 60',[stockCode] ,function (error, results, fields){
        
        var totalSum = 0;
        var beginSum = 0;
        var endSum = 0;
       if(results&&results.length>0){

            var lastRecordDate = results[0]['date'];
            var today = UTIL.generateCurrentDate();
            today = new Date(today);
            if(today.getFullYear() == lastRecordDate.getFullYear() && today.getMonth() == lastRecordDate.getMonth() && today.getDate() == lastRecordDate.getDate()){
                logger.info(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()+1} not equals ${lastRecordDate.getFullYear()}-${lastRecordDate.getMonth()+1}-${lastRecordDate.getDate()+1}`);
                callBack();
                return;
            }
            results.forEach(function(element, index) {
                totalSum += element.amount_stock;
                totalSum = totalSum/2;
                if(index<5){
                    endSum += element.amount_stock;
                    endSum = endSum/2;
                }
                if(results.length-5<index<results.length){
                    beginSum += element.amount_stock;
                    beginSum = beginSum/2;
                }
            }, this);

            if(endSum<totalSum/3&&endSum<beginSum/8){
                if(results[0]['top_price']!=results[0]['low_price']){
                    logger.info(`${stockCode} -> macd dif is good! with price -> ${results[0].price}`);
                    let insertParam = [];
                    insertParam.push(1);
                    insertParam.push(stockCode);
                    insertParam.push(results[0].price);
                    insertParam.push(results[0].date);
                    MySqlService.query('INSERT INTO t_strategy_tester (strategy_id, stock_code, price, date) VALUES (?, ?, ?, ?)', insertParam, function(err){
                        if(err){
                            logger.error(err);
                        }
                        callBack();
                    } );
                } else {
                    callBack();
                }
            } else {
                    callBack();
            }
       }
    });
}

function init(stockCode, callBack){
    shunkStrategy1(stockCode, callBack);
}

function anountShrunk(callBack){
    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//amountShrunk.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//amountShrunk.json");
        var that = this;

        var analysisedToolRecords = [];
        logger.info(`processing start+++`);
        function process(){
            var stock = stocks.shift();
            logger.info(`shunk process ${stock.code}, remind -> ${stocks.length}`);
            jsonfile.writeFileSync(__dirname+"//amountShrunk.json", stocks);
            if(stocks.length == 0){
                callBack();
                logger.info('finished process-------');
            } else {
                init(stock.code, function(){
                    process.call(that);
                });
            }
            stocks = jsonfile.readFileSync(__dirname+"//amountShrunk.json");
        }

        process();
    });
}

module.exports.anountShrunk = anountShrunk;
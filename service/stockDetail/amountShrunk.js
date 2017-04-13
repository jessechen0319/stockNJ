var MySqlService = require("../MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var logger = require('../LogService');
var UTIL = require('../Util');

function init(stockCode, callBack){
    MySqlService.query('select * from t_stock_detail t where t.stock_code=? order by t.date desc limit 60',[stockCode] ,function (error, results, fields){
        
        var totalSum = 0;
        var beginSum = 0;
        var endSum = 0;
       if(results&&results.length>0){
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
       }

       if(endSum<totalSum/3&&endSum<beginSum/8){
           UTIL.isStockTopOrLow(stockCode, function(isLowOrHigh){
               if(!isLowOrHigh){
                    logger.info(`${stockCode} shrunk its amount !!!!!!!!!!!!!!`);
               }
               callBack();
           });
       } else {
            callBack();
       }
       
    });
}

function anountShrunk(){
    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//amountShrunk.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//amountShrunk.json");
        var that = this;

        var analysisedToolRecords = [];
        logger.info(`processing start+++`);
        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//amountShrunk.json", stocks);
            if(stocks.length == 0){
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
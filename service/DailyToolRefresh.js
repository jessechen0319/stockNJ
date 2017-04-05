var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");
var logger = require('./LogService');


function init(stockCode, callback){
    MySqlService.query('select * from t_stock_detail t where t.stock_code = ? and not exists (select 1 from t_stock_tools m where t.id = m.detail_id)', stockCode, function(err, results, fields){
        if(results.length>0){
            logger.info(`for stock ${stockCode}, there is un-analysised record, length is ${results.length}`);
            results.forEach(function(detail){
                MySqlService.query('select * from t_stock_detail t where t.date < ? order by t.date desc limit 250' [detail.date], function(err, results, fields){
                    logger.info(`daily fetch for stock tools, date is ${detail.date}, result length is ${results.length}`);
                    if(results.length>0){
                        
                    }
                });
            });
        }
    });
}

function refresh(){

    MySqlService.query('select * from t_stock_name', function (error, results, fields){
        jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//stockNameDailyTool.json");
        var that = this;

        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//stockNameDailyTool.json", stocks);

            logger.info(`processing for ${stock.code} start+++`);
            init(stock.code, function(results){
                logger.info(`processing for ${stock.code} finish---`);
                process.call(that);
            });
            stocks = jsonfile.readFileSync(__dirname+"//stockNameDailyTool.json");
        }

        process();
    });
}
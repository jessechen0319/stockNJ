var MySqlService = require("./MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var calculateService = require('./CalculateService');
var UTIL = require("./Util");
var logger = require('./LogService');

function init(id, stockCode, price, date, callBack){

    var fetchDefine=[5, 10, 30, 60, 180, 360];

    MySqlService.query('select * from t_stock_detail t where t.stock_code = ? and t.date > ? order by t.date', [stockCode, date], function (error, results, fields){
        if(error){
            logger.error(error);
        }

        if(results && results.length>=5){
            var sql = "update t_strategy_tester t set ";
            var updateParam = [];
            fetchDefine.forEach(function(days, index){
                if(results.length>=days){
                    var change = results[days-1].price - price;
                    change = change*100/price;
                   if(index != 0){
                       sql += ` , `;
                   }
                    sql += ` t.price_${days} =  ?`;
                    updateParam.push(change);
                }
            });
            sql += ` where t.id=${id}`;
            logger.info(sql);
            
            MySqlService.query(sql, updateParam, (err)=>{
                if(err){logger.error(err)}
                callBack();
            });
        } else {
            callBack();
        }

    })
}

function fetch(callBack){
    MySqlService.query('SELECT * FROM stock.t_strategy_tester t where t.price_5 is NULL or t.price_10 is NULL or t.price_30 is NULL or t.price_60 is NULL or t.price_180 is NULL or t.price_360 is NULL;', function (error, results, fields){
        if(error){
            logger.error(error);
        }
        jsonfile.writeFileSync(__dirname+"//strategyFetch.json", results);
        var stocks = jsonfile.readFileSync(__dirname+"//strategyFetch.json");
        var that = this;

        logger.info(`processing start+++`);
        function process(){
            var stock = stocks.shift();
            jsonfile.writeFileSync(__dirname+"//strategyFetch.json", stocks);
            if(stocks.length == 0){
                callBack();
                logger.info('finished process-------');
            } else {
                init(stock.id, stock.stock_code, stock.price, stock.date, function(){
                    process.call(that);
                });
            }
            stocks = jsonfile.readFileSync(__dirname+"//strategyFetch.json");
        }

        process();
    });
}

module.exports.fetch = fetch;

//SELECT * FROM stock.t_strategy_tester t wheret.price_5 is NULL ort.price_10 is NULL ort.price_30 is NULL ort.price_60 is NULL ort.price_180 is NULL ort.price_360 is NULL;
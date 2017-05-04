var MySqlService = require("../MySqlService");
var fs = require('fs');
var jsonfile = require('jsonfile');
var logger = require('../LogService');
var UTIL = require('../Util');

function macdGold1(callBack){


    var todayDate = UTIL.generateCurrentDate();
    todayDate = new Date(todayDate);
    var lastWorkDay = UTIL.getPreviousWorkDay(todayDate);
    todayDate = UTIL.generateMySqlDate(todayDate);
    lastWorkDay = UTIL.generateMySqlDate(lastWorkDay);
    logger.info(`today->${todayDate}, last day->${lastWorkDay}`);
    MySqlService.query(`
        SELECT 
            d.stock_code, d.price
        FROM
            t_stock_tools t, t_stock_detail d
        WHERE
        t.macd_bar > 0
                AND t.date = ?
                and t.date = d.date
                and t.stock_code = d.stock_code
                AND EXISTS( SELECT 
                    1
                FROM
                    t_stock_tools m
                WHERE
                    t.stock_code = m.stock_code
                        AND m.date = ?
                        AND m.macd_bar <= 0)
    `, [todayDate, lastWorkDay], (error, results, fields)=>{
        logger.info(JSON.stringify(results));
        if(results && results.length > 1){
            var parameters = [];
            results.forEach(function(record, index){
                let insertParam = [];
                insertParam.push(3);
                insertParam.push(record.stock_code);
                insertParam.push(record.price);
                insertParam.push(todayDate);
                parameters.push(insertParam);
            });
            logger.info(JSON.stringify(insertParam));
            MySqlService.query(`INSERT INTO t_strategy_tester (strategy_id, stock_code, price, date) VALUES ?`, [parameters], (err)=>{
                if(err){
                    logger.info(err);
                }
                callBack();
            });

        } else {
            callBack();
        }
    });
/*
    UTIL.isTodaysRecord(stockCode, (isTodayRecord)=>{
        var todayDate = UTIL.generateCurrentDate();
        todayDate = new Date(todayDate);
        todayDate = UTIL.generateMySqlDate(todayDate);
        if(isTodayRecord){
            logger.info(`${stockCode} -> has today record`);
            var lastWorkDay = UTIL.getPreviousWorkDay();

            
            MySqlService.query(`
                SELECT 
                    m.date
                FROM
                    t_stock_tools m
                WHERE
                    m.date < ?
                    and m.stock_code = ?
                ORDER BY m.date DESC
                LIMIT 1
            `,[todayDate, stockCode] ,function (error, results, fields){
                if(error){
                    logger.error(error);
                }
                if(results && results.length == 1 && results[0].macd_dif<=results[0].macd_dea) {
                    
                    MySqlService.query(`
                        SELECT 
                            m.macd_dif, m.macd_dea, t.price
                        FROM
                            t_stock_tools m,
                            t_stock_detail t
                        WHERE
                            m.date = ?
                            and m.stock_code = ?
                            and t.date = m.date
                            and t.stock_code = m.stock_code
                            and m.macd_dif > m.macd_dea
                        ORDER BY m.date DESC
                        LIMIT 1
                    `, [todayDate, stockCode] , (error, results2, fields)=>{
                        if(results2&&results2.length>0){

                            var value1 = 0;
                            if (results2[0].macd_dea != results[0].macd_dea) {
                                let value2 =  results2[0].macd_dea - results[0].macd_dea;
                                value1 = results2[0].macd_dif - results[0].macd_dif;
                                value1 = value1/value2;
                            }

                            let insertParam = [];
                            insertParam.push(3);
                            insertParam.push(stockCode);
                            insertParam.push(results2[0].price);
                            insertParam.push(todayDate);
                            insertParam.push(value1);
                            MySqlService.query('INSERT INTO t_strategy_tester (strategy_id, stock_code, price, date, v1) VALUES (?, ?, ?, ?, ?)', insertParam, function(err){
                                if(err){
                                    logger.info(err);
                                }
                                callBack();
                            });
                        } else {
                            callBack();
                        }
                    });
                    
                } else {
                    callBack();
                }
            });
            
        } else {
            callBack();
        }
    });
*/
    
}

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
                    insertParam.push(priceObjects[0].price);
                    insertParam.push(results[0].date);
                    insertParam.push(value1);
                    let increaseRate = priceObjects[0].price - priceObjects[0].last_day_price;
                    increaseRate = increaseRate/priceObjects[0].last_day_price;
                    let isOk = false;
                    isOk = increaseRate<0.095;
                    isOk = isOk || priceObjects[0].price != priceObjects[0].top_price;
                    if(priceObjects.length==3&& isOk && priceObjects[0].amount_stock>priceObjects[1].amount_stock&&priceObjects[0].amount_stock>priceObjects[2].amount_stock){
                        logger.info(`${stockCode} -> macd dif is good! with price -> ${priceObjects[0].price}`);
                        MySqlService.query('INSERT INTO t_strategy_tester (strategy_id, stock_code, price, date, v1) VALUES (?, ?, ?, ?, ?)', insertParam, function(err){
                            if(err){
                                logger.info(err);
                            }
                            callBack();
                        });
                    }else {
                        callBack();
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
                macdGold1(callBack);
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
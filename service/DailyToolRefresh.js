function refresh(){

    MySqlService.query('select * from t_stock_name where code>"600706"', function (error, results, fields){
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
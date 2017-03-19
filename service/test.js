 var MySqlService = require("./MySqlService");
 
 MySqlService.query('select * from t_stock_detail where stock_code = "002828"',[] , function (error, results, fields){
    console.log(typeof(results[0].date));
    var date = new Date(results[0].date);
    console.log(date.toLocaleString());
 });
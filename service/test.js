 var MySqlService = require("./MySqlService");
 
 MySqlService.query('select * from t_stock_tools t ',[] , function (error, results, fields){
    console.log(results);
 });
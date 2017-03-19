var mysql = require('mysql');

var pool  = mysql.createPool({
  connectionLimit : 15,
  host            : '115.159.68.208',
  user            : 'root',
  password        : 'christianjesse',
  database        : 'stock',
  timezone: 'utc'
});
 
/*connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
 
  console.log('The solution is: ', rows[0].solution);
});
 
connection.end();*/



/*pool.query('insert into t_stock_name (code, market) values (?, ?)', ["000002", "sh"], function(err, result) {
  if (err) throw err;

  console.log(result);
 
});*/

/*pool.query('insert into t_job (job_type_id, job_status_id) values (?, ?)', [1, 1], function(err, result) {
  if (err) throw err;

  console.log(result.insertId);
 
});*/
 

module.exports = pool;
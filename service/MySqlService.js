var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : '115.159.68.208',
  user     : 'root',
  password : 'christianjesse',
  database : 'stock'
});
 
/*connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
 
  console.log('The solution is: ', rows[0].solution);
});
 
connection.end();*/

module.exports = connection;
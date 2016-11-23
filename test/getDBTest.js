
var http = require('http');
var options = {
      host: 'jesse-10068897.cos.myqcloud.com',
      port: 80,
      path: '/db.json'
    };

http.get(options, function(response) {
  var body = "";
  response.on("data", function(data) {
      body += data;
  });
  response.on("end", function() {
  	
  	var db = JSON.parse(body);
  	console.log(db);
  });
});
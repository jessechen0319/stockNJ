var http = require('http');

var options = {
      host: 'hq.sinajs.cn',
      port: 80,
      path: "/list=sh601677"
    };

http.get(options, function(response) {
  var body = "";
  response.on("data", function(data) {
      body += data;
  });
  response.on("end", function() {
      console.log(body);
  });
});

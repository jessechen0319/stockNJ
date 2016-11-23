
var http = require('http');
var postData = require('querystring').stringify({
  'op':'upload',
  'filecontent': JSON.stringify({'name': 'jesse'}),
  'sha': 'BF21A9E8FBC5A3846FB05B4FA0859E0917B2202F'
});

var options = {
  hostname: 'jesse-10068897.cos.myqcloud.com',
  port: 80,
  path: '/jesse/db.json',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data',
    'Content-Length': Buffer.byteLength(postData),
    'Host': 'web.file.myqcloud.com'
  }
};

var req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
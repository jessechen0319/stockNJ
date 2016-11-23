//https://www.qcloud.com/doc/api/264/5993#.E5.B0.86.E6.98.8E.E6.96.87.E5.AD.97.E7.AC.A6.E4.B8.B2.E8.BD.AC.E5.8C.96.E4.B8.BA.E7.AD.BE.E5.90.8D
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
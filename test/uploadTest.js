


/*var Capi = require('qcloudapi-sdk');

var capi = new Capi({
    SecretId: 'AKIDX0JRPRyTNCsUBlJvGZionbP6czCELy53',
    SecretKey: 'whKn5xb8VgiYDxY5UileQ3WovrbAZnpg',
    serviceType: 'account'
});

capi.request({
    Region: 'gz',
    Action: 'DescribeProject',
    otherParam: 'otherParam'
}, function(error, data) {
    console.log(data)
});

capi.request({
    Region: 'gz',
    Action: 'DescribeInstances',
    otherParam: 'otherParam'
}, {
    serviceType: 'cvm'
}, function(error, data) {
    console.log(data)
});

// 生成 querystring
var qs = capi.generateQueryString({
    Region: 'gz',
    Action: 'DescribeInstances',
    otherParam: 'otherParam'
}, {
    serviceType: 'cvm'
});

console.log(qs);*/


// //https://www.qcloud.com/doc/api/264/5993#.E5.B0.86.E6.98.8E.E6.96.87.E5.AD.97.E7.AC.A6.E4.B8.B2.E8.BD.AC.E5.8C.96.E4.B8.BA.E7.AD.BE.E5.90.8D
// var http = require('http');
// var postData = require('querystring').stringify({
//   'op':'upload',
//   'filecontent': JSON.stringify({'name': 'jesse'}),
//   'sha': 'BF21A9E8FBC5A3846FB05B4FA0859E0917B2202F'
// });

// var options = {
//   hostname: 'jesse-10068897.cos.myqcloud.com',
//   port: 80,
//   path: '/jesse/db.json',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'multipart/form-data',
//     'Content-Length': Buffer.byteLength(postData),
//     'Host': 'web.file.myqcloud.com'
//   }
// };

// var req = http.request(options, (res) => {
//   console.log(`STATUS: ${res.statusCode}`);
//   console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//   res.setEncoding('utf8');
//   res.on('data', (chunk) => {
//     console.log(`BODY: ${chunk}`);
//   });
//   res.on('end', () => {
//     console.log('No more data in response.');
//   });
// });

// req.on('error', (e) => {
//   console.log(`problem with request: ${e.message}`);
// });

// // write data to request body
// req.write(postData);
// req.end();

/*var crypto = require('crypto');
var now = new Date();
var seconds = now.getTime();
var remoteOrigin = `a=10068897&b=jesse&k=AKIDX0JRPRyTNCsUBlJvGZionbP6czCELy53&e=7776000&t=${seconds}&r=0303030303&f=`;
var hash = crypto.createHmac('sha1', 'whKn5xb8VgiYDxY5UileQ3WovrbAZnpg').update(remoteOrigin).digest('hex');
console.log(hash);
var finalKey = new Buffer(hash+remoteOrigin).toString('base64');
console.log(finalKey);*/

var qcloud = require('qcloud_cos');
// console.log(qcloud.conf.setAppInfo.toString());
qcloud.conf.setAppInfo('10068897','AKIDX0JRPRyTNCsUBlJvGZionbP6czCELy53','whKn5xb8VgiYDxY5UileQ3WovrbAZnpg'); 
// console.log(qcloud.auth.signOnce.toString());
var sign  = qcloud.auth.signOnce('jesse',         '/10068897/jesse/db.json');
console.log(sign);



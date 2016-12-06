var log4js = require('log4js');
log4js.configure(`${__dirname}/LogConfig.json`);
var logger = log4js.getLogger("relative-logger");
module.exports = logger;
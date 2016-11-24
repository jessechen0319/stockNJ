var DBPath = "../db/db.json";
var jsonfile = require('jsonfile');
jsonfile.readFile(DBPath, function(err, obj) {
  console.dir(obj)
})
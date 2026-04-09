const fs = require('fs');
let v = JSON.parse(fs.readFileSync('version.json', 'utf8'));
v.timestamp = Date.now();
fs.writeFileSync('version.json', JSON.stringify(v, null, 2));
console.log("Version Cache BUMPED a: " + v.timestamp);

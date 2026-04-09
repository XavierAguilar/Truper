const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');
txt = txt.replace(/\\`/g, '`');
fs.writeFileSync('index.html', txt, 'utf8');

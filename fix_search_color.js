const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The inline style has `color:#333;`
let searchRegex = /color:\s*#333\s*;/;
if(searchRegex.test(txt)) {
    txt = txt.replace(searchRegex, 'color: #fff;');
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Color del texto corregido a blanco.");
} else {
    console.log("No se pudo encontrar el color #333");
}

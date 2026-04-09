const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The inline style in btSuggestions (scanner results) uses color:#333
let searchRegex = /color:\s*#333\s*;/g;
if(searchRegex.test(txt)) {
    txt = txt.replace(searchRegex, 'color: #fff;');
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Color del texto (blanco) aplicado de forma MASIVA A TODOS los buscadores.");
} else {
    // If it was already replaced or written differently
    console.log("Ningun color #333 hallado. (Ya estaban todos parcheados).");
}

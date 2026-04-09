const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. Aumentar Barcode de 3.0cm a 3.2cm
let oldBarcode = /\.bktag-barcode\s*\{\s*position:\s*absolute;\s*bottom:\s*2px;\s*left:\s*0;\s*width:\s*3\.0cm;/;
let newBarcode = `.bktag-barcode {
                              position: absolute; bottom: 2px; left: 0; width: 3.2cm;`;
if (oldBarcode.test(txt)) {
    txt = txt.replace(oldBarcode, newBarcode);
}

// 2. Aumentar Tigre 5% extra (de 2.2cm a 2.3cm)
let oldTiger = /\.bktag-tigre\s*\{\s*position:\s*absolute;\s*bottom:\s*0px;\s*right:\s*-2px;\s*width:\s*2\.2cm;/;
let newTiger = `.bktag-tigre {
                              position: absolute; bottom: 0px; right: -2px; width: 2.3cm;`;
if (oldTiger.test(txt)) {
    txt = txt.replace(oldTiger, newTiger);
}

// 3. Reemplazar "âœ…" (corrupción del check) a Entity &#9989;
// Just generic replace anywhere we see the check mark corruption or something indicating "agregado"
// If it is hardcoded "âœ…" or "✅"
txt = txt.replace(/âœ…/g, '&#9989;');
txt = txt.replace(/Ã¢Å“â€¦/g, '&#9989;');
txt = txt.replace(/✅/g, '&#9989;');

fs.writeFileSync('index.html', txt, 'utf8');
console.log("Ajustes visuales de tigre, barcode y notificaciones aplicados.");

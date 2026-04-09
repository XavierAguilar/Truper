const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The CSS rule currently has `width: 3.5cm;` for .bktag-barcode
let oldBarcode = /\.bktag-barcode\s*\{\s*position:\s*absolute;\s*bottom:\s*2px;\s*left:\s*0;\s*width:\s*3\.5cm;\s*display:\s*flex;\s*justify-content:\s*flex-start;\s*\}/;

let newBarcode = `.bktag-barcode {
                              position: absolute; bottom: 2px; left: 0; width: 3.0cm;
                              display: flex; justify-content: flex-start;
                          }`;

if (oldBarcode.test(txt)) {
    txt = txt.replace(oldBarcode, newBarcode);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Barcode reducido a 3.0cm exitosamente.");
} else {
    console.log("Fallback regex...");
    let fallbackRegex = /\.bktag-barcode\s*\{\s*position:\s*absolute;\s*bottom:\s*2px;\s*left:\s*0;\s*width:\s*[0-9.]+cm;\s*display:\s*flex;\s*justify-content:\s*[a-z-]+\s*;\s*\}/;
    txt = txt.replace(fallbackRegex, newBarcode);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Barcode reducido mediante fallback.");
}

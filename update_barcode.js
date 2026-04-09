const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let oldBcode = `.bktag-barcode {
                              position: absolute; bottom: 2px; left: 0; width: 100%;
                              display: flex; justify-content: center;
                          }`;

let newBcode = `.bktag-barcode {
                              position: absolute; bottom: 2px; left: 0; width: 3.5cm;
                              display: flex; justify-content: flex-start;
                          }
                          .bktag-barcode svg { width: 100% !important; height: auto !important; }`;

if (txt.includes(oldBcode)) {
    txt = txt.replace(oldBcode, newBcode);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("CSS Barcode actualizado!");
} else {
    console.log("Fallo SVG Barcode update. Regex fallback...");
    let regex = /\.bktag-barcode\s*\{\s*position:\s*absolute;\s*bottom:\s*2px;\s*left:\s*0;\s*width:\s*100%;\s*display:\s*flex;\s*justify-content:\s*center;\s*\}/;
    txt = txt.replace(regex, newBcode);
    fs.writeFileSync('index.html', txt, 'utf8');
}

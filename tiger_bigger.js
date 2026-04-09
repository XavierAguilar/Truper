const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// Replace the width of the Tiger from 1.65cm to 2.2cm (roughly 30% larger)
let oldTigerPattern = /\.bktag-tigre\s*\{\s*position:\s*absolute;\s*bottom:\s*0px;\s*right:\s*-2px;\s*width:\s*1\.65cm;\s*height:\s*auto\s*!important;\s*object-fit:\s*contain\s*!important;\s*opacity:\s*1\s*!important;\s*z-index:\s*11;\s*\}/;

let newTiger = `.bktag-tigre {
                              position: absolute; bottom: 0px; right: -2px; width: 2.2cm; height: auto !important; object-fit: contain !important;
                              opacity: 1 !important; z-index: 11;
                          }`;

if(oldTigerPattern.test(txt)) {
    txt = txt.replace(oldTigerPattern, newTiger);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Tigre Crecido 30% exitosamente.");
} else {
    // regex fallback 
    let fallback = /\.bktag-tigre\s*\{[^}]+\}/;
    txt = txt.replace(fallback, newTiger);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Tigre Crecido (Fallback).");
}

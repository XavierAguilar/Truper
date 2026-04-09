const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let regexTigre = /\.bktag-tigre\s*\{\s*position:\s*absolute;\s*bottom:\s*-2px;\s*right:\s*2px;\s*width:\s*45px;\s*opacity:\s*1\s*!important;\s*z-index:\s*11;\s*\}/;
let newTigre = `.bktag-tigre {
                              position: absolute; bottom: 0px; right: -2px; width: 1.65cm; height: auto !important; object-fit: contain !important;
                              opacity: 1 !important; z-index: 11;
                          }`;

if(regexTigre.test(txt)) {
    txt = txt.replace(regexTigre, newTigre);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Tigre ensanchado al remanente matemático exitosamente.");
} else {
    console.log("No encontré la firma del tigre exactamante. Tratando regex laxo...");
    let regexLaxo = /\.bktag-tigre\s*\{[^}]+\}/;
    if(regexLaxo.test(txt)) {
        txt = txt.replace(regexLaxo, newTigre);
        fs.writeFileSync('index.html', txt, 'utf8');
        console.log("Tigre ensanchado (REGEX LAXO).");
    } else {
        console.log("Fallo total al encontrar tigre.");
    }
}

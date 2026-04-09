const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let target = `window.importRelatedBt = function(index, e) {`;
let patch = `window.importRelatedBt = function(index, e) {
              window.playBeep('success'); // Feedback audial instantaneo
              alert("DEBUG ALERTA: Boton Clickeado en index " + index);`;

if(txt.includes(target) && !txt.includes("DEBUG ALERTA")) {
    txt = txt.replace(target, patch);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Alerta de debug inyectada.");
} else {
    console.log("La alerta ya estaba o no se halló la firma.");
}

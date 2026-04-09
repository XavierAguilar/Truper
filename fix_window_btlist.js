const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let badCode = 'const item = window.btList[index];';
let goodCode = 'const item = btList[index];';

if (txt.includes(badCode)) {
    txt = txt.replace(badCode, goodCode);
    console.log("Namespace global removido (window.btList -> btList). Error Tipo 2 prevenido.");
} else {
    console.log("Firma no hallada. Tal vez ya estaba solucionado.");
}

// Remover también el Alert Inyectado de DEBUG
let alertCode = 'alert("DEBUG ALERTA: Boton Clickeado en index " + index);';
if (txt.includes(alertCode)) {
    txt = txt.replace(alertCode, "");
    console.log("Alerta de debug retirada de la interfaz.");
}

fs.writeFileSync('index.html', txt, 'utf8');

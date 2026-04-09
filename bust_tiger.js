const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let badTiger = "'images/tigre_esquina_inferiror_derecha.png'";
let goodTiger = "'images/tigre_esquina_inferiror_derecha.png?v=' + Date.now()";

if (txt.includes(badTiger)) {
    // Replace all globally
    txt = txt.split(badTiger).join(goodTiger);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Anti-cache (Date.now()) insertado en la imagen del Tigre.");
} else {
    // Check if it already has it
    if (txt.includes('?v=')) {
        console.log("El caché-buster ya estaba implementado.");
    } else {
        console.log("No se pudo localizar el tigreSrc original o ya fue modificado.");
    }
}

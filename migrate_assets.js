const fs = require('fs');

// 1. Move the files physically
try {
    fs.renameSync('images/pija_blanca.png', 'imagenes/pija_blanca.png');
} catch(e) { console.log('pija ya movido o no encontrado'); }

try {
    fs.renameSync('images/tigre_final.png', 'imagenes/tigre_final.png');
} catch(e) { console.log('tigre ya movido o no encontrado'); }

// 2. Patch index.html
let txt = fs.readFileSync('index.html', 'utf8');

txt = txt.split('images/pija_blanca.png').join('imagenes/pija_blanca.png');
txt = txt.split('images/tigre_final.png').join('imagenes/tigre_final.png');

fs.writeFileSync('index.html', txt, 'utf8');
console.log('Migración completa.');

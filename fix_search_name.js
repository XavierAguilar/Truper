const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// Replace the invalid property key 'p.descripcion' with 'p.nombre' in the btSuggestions renderer
let oldKey = /\$\{esc\(p\.descripcion\)\}/g;
let newKey = '${esc(p.nombre)}';

if (oldKey.test(txt)) {
    txt = txt.replace(oldKey, newKey);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Llave de producto corregida a 'nombre' exitosamente.");
} else {
    // If it's already nombre or not found
    console.log("Fallback, buscando p.descripcion sin literal literal template...");
    txt = txt.replace(/p\.descripcion/g, 'p.nombre');
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Reemplazo masivo de descripcion a nombre aplicado.");
}

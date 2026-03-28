const fs = require('fs');
const data = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));
console.log(`Total productos: ${data.length}\n`);

let totalCaract = 0, totalSpecs = 0, totalImgs = 0, totalCerts = 0;

data.forEach((p, i) => {
    console.log(`══════════════════════════════════════════`);
    console.log(`PRODUCTO ${i + 1}`);
    console.log(`══════════════════════════════════════════`);
    console.log(`  Código:          ${p.codigo}`);
    console.log(`  Clave:           ${p.clave}`);
    console.log(`  Nombre:          ${p.nombre || '❌ VACÍO'}`);
    console.log(`  Marca:           ${p.marca || '-'}`);
    console.log(`  Desc CSV:        ${(p.descripcion_csv || '').substring(0, 80)}`);
    console.log(`  Fabricación:     ${p.fabricacion || '-'}`);

    console.log(`  Características: (${p.caracteristicas.length})`);
    p.caracteristicas.forEach(c => console.log(`    • ${c}`));
    totalCaract += p.caracteristicas.length;

    console.log(`  Especificaciones: (${Object.keys(p.especificaciones).length})`);
    Object.entries(p.especificaciones).forEach(([k, v]) => console.log(`    ${k}: ${v}`));
    totalSpecs += Object.keys(p.especificaciones).length;

    console.log(`  Certificaciones: (${p.certificaciones.length})`);
    p.certificaciones.forEach(c => console.log(`    [${c.icono}] ${c.texto}`));
    totalCerts += p.certificaciones.length;

    console.log(`  Empaque:`);
    Object.entries(p.empaque).forEach(([k, v]) => console.log(`    ${k}: ${v}`));

    console.log(`  Imágenes:        (${p.imagenes.length})`);
    p.imagenes.forEach(img => console.log(`    📷 ${img}`));
    totalImgs += p.imagenes.length;

    console.log(`  PDF:             ${p.ficha_tecnica_pdf || '❌'}`);
    console.log(`  Banco fotos:     ${p.banco_fotos_url || '❌'}`);
    console.log(`  Catálogo:        ${p.catalogo_url || '-'}`);
    console.log('');
});

console.log('══════════════════════════════════════════');
console.log('RESUMEN GENERAL');
console.log('══════════════════════════════════════════');
console.log(`  Productos:       ${data.length}`);
console.log(`  Con nombre:      ${data.filter(p => p.nombre).length}`);
console.log(`  Características: ${totalCaract} (prom ${(totalCaract / data.length).toFixed(1)}/prod)`);
console.log(`  Specs:           ${totalSpecs} (prom ${(totalSpecs / data.length).toFixed(1)}/prod)`);
console.log(`  Certificaciones: ${totalCerts}`);
console.log(`  Imágenes:        ${totalImgs} (prom ${(totalImgs / data.length).toFixed(1)}/prod)`);
console.log(`  Con PDF:         ${data.filter(p => p.ficha_tecnica_pdf).length}`);
console.log(`  Con banco fotos: ${data.filter(p => p.banco_fotos_url).length}`);

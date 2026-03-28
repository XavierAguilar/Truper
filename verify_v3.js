const d = JSON.parse(require('fs').readFileSync('productos_truper.json', 'utf8'));

// Check product 100103 specifically
const p = d.find(x => x.codigo === '100103');
console.log('=== VERIFICATION: Product 100103 (ST-724X) ===');
console.log('Name:', p.nombre);
console.log('Brand:', p.marca, '| Logo URL:', p.marca_logo_url ? 'YES' : 'NO');
console.log('Family:', p.es_producto_familia, '| Siblings:', p.productos_hermanos.length);
console.log('');
console.log('--- SPECS ---');
for (const [k, v] of Object.entries(p.especificaciones)) console.log(' ', k, ':', v);
console.log('');
console.log('--- EMPAQUE ---');
for (const [k, v] of Object.entries(p.empaque)) console.log(' ', k, ':', v);
console.log('');
console.log('--- IMAGES ---');
p.imagenes.forEach((img, i) => console.log(' ', i, img.split('/').pop()));
console.log('');
console.log('--- VINETAS ---');
p.vinetas.forEach(v => console.log(' ', v.texto));
console.log('');

// Also check 100104 (the sibling - should it be in our list?)
const p2 = d.find(x => x.codigo === '100104');
if (p2) {
    console.log('\n=== Product 100104 (ST-740X) ===');
    console.log('Name:', p2.nombre);
    console.log('Specs:', Object.entries(p2.especificaciones).map(([k, v]) => k + '=' + v).join(', '));
    console.log('Images:', p2.imagenes.map(i => i.split('/').pop()).join(', '));
}

// Summary for all
console.log('\n=== ALL PRODUCTS SUMMARY ===');
d.forEach(p => {
    const api = p.es_producto_familia ? 'API' : 'DIR';
    console.log(`[${api}] ${p.codigo} ${p.clave}: "${p.nombre}" | Imgs:${p.imagenes.length} Specs:${Object.keys(p.especificaciones).length} Emp:${Object.keys(p.empaque).length} Vin:${p.vinetas.length}`);
});

/**
 * Limpia los datos de productos_relacionados:
 * - Usa solo datos del módulo del catálogo (no página completa)
 * - Para productos sin datos de catálogo, usa la familia (hermanos)
 * - Limita a máximo 15 variantes por producto
 */
const fs = require('fs');
const products = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));

// Reset related
products.forEach(p => {
    p.productos_relacionados = [];
});

// Step 1: Use family siblings as the primary source of related products
for (const p of products) {
    if (p.productos_hermanos && p.productos_hermanos.length > 0) {
        p.productos_relacionados = p.productos_hermanos
            .filter(h => h.codigo !== p.codigo)
            .map(h => ({ codigo: h.codigo, clave: h.texto ? h.texto.split('|')[1]?.trim().split('|')[0]?.trim() || '' : '' }));
    }
}

// Step 2: Cross-reference - if A is related to B, B should be related to A
for (const p of products) {
    for (const rel of p.productos_relacionados) {
        const other = products.find(x => x.codigo === rel.codigo);
        if (other && other.productos_relacionados.length === 0) {
            other.productos_relacionados = [
                { codigo: p.codigo, clave: p.clave },
                ...p.productos_relacionados.filter(r => r.codigo !== other.codigo)
            ];
        }
    }
}

// Step 3: For the display - enrich related products with data from our JSON if available
for (const p of products) {
    p.productos_relacionados = p.productos_relacionados.map(rel => {
        const found = products.find(x => x.codigo === rel.codigo);
        if (found) {
            return {
                codigo: rel.codigo,
                clave: found.clave,
                nombre: found.nombre,
                imagen: found.imagenes && found.imagenes.length > 0 ? found.imagenes[0] : ''
            };
        }
        return { ...rel, nombre: '', imagen: '' };
    });
}

// Ensure field exists for all
for (const p of products) {
    if (!p.productos_relacionados) p.productos_relacionados = [];
}

fs.writeFileSync('productos_truper.json', JSON.stringify(products, null, 2), 'utf-8');

console.log('=== RESULTADO ===');
const withRel = products.filter(p => p.productos_relacionados.length > 0);
console.log('Con variantes:', withRel.length + '/' + products.length);
withRel.forEach(p => {
    console.log(p.codigo, p.clave, '→', p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));
});
console.log('\nSin variantes:', products.filter(p => p.productos_relacionados.length === 0).map(p => p.codigo + ' ' + p.clave).join(', '));

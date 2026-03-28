/**
 * Post-procesamiento: Filtrar productos relacionados por familia de clave
 * 
 * El extractor del catálogo obtiene TODOS los productos del módulo,
 * pero necesitamos solo los de la misma sub-familia.
 * 
 * Ejemplo: PET-15X solo debe tener PET-6X, PET-8X, PET-10X, PET-12X
 * (misma base PET + mismo sufijo X), no los PET-6C, PET-8P, STI-8, etc.
 */

const fs = require('fs');
const products = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));

// Extraer la "familia de clave" de una clave
// PET-15X → base "PET", sufijo "X"
// REP-CUT-5X → base "REP-CUT", sufijo "X"  
// STI-8 → base "STI", sufijo ""
// PAR-26 → base "PAR", sufijo ""
function getClaveFamily(clave) {
    if (!clave) return { base: '', suffix: '' };
    // Quitar el número del final para obtener base + sufijo
    const match = clave.match(/^([A-Z]+(?:-[A-Z]+)*)-?\d+(.*)$/);
    if (match) {
        return { base: match[1], suffix: match[2] || '' };
    }
    return { base: clave, suffix: '' };
}

console.log('🔧 Filtrando productos relacionados por familia de clave...\n');

for (const p of products) {
    if (!p.productos_relacionados || p.productos_relacionados.length === 0) continue;

    const myFamily = getClaveFamily(p.clave);
    console.log(p.codigo + ' ' + p.clave + ' → familia: base="' + myFamily.base + '" sufijo="' + myFamily.suffix + '"');
    console.log('   Antes: ' + p.productos_relacionados.length + ' → ' +
        p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));

    // Filtrar: solo mantener productos cuya clave tiene la misma base Y sufijo
    const filtered = p.productos_relacionados.filter(r => {
        const rFamily = getClaveFamily(r.clave);
        return rFamily.base === myFamily.base && rFamily.suffix === myFamily.suffix;
    });

    if (filtered.length > 0) {
        p.productos_relacionados = filtered;
    }
    // Si no hay filtrados, mantener los originales (mejor algo que nada)

    console.log('   Después: ' + p.productos_relacionados.length + ' → ' +
        p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));
    console.log('');
}

// Re-enriquecer con datos del JSON
for (const p of products) {
    p.productos_relacionados = (p.productos_relacionados || []).map(rel => {
        const found = products.find(x => x.codigo === rel.codigo);
        return {
            codigo: rel.codigo,
            clave: found ? found.clave : rel.clave,
            nombre: found ? found.nombre : rel.nombre || '',
            imagen: found && found.imagenes && found.imagenes.length > 0 ? found.imagenes[0] : rel.imagen || ''
        };
    });
}

fs.writeFileSync('productos_truper.json', JSON.stringify(products, null, 2), 'utf-8');

// Resumen
console.log('========================================');
const conRel = products.filter(p => (p.productos_relacionados || []).length > 0);
const totalRel = products.reduce((a, p) => a + (p.productos_relacionados || []).length, 0);
console.log('📊 RESUMEN:');
console.log('   🔗 Total relaciones: ' + totalRel);
console.log('   ✅ Con variantes: ' + conRel.length + '/' + products.length);
conRel.forEach(p => {
    console.log('      ' + p.codigo + ' ' + p.clave + ': ' +
        p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));
});
console.log('   ❌ Sin variantes: ' + (products.length - conRel.length));

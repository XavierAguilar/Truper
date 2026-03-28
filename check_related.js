const d = JSON.parse(require('fs').readFileSync('productos_truper.json', 'utf8'));
d.forEach(p => {
    const rel = p.productos_relacionados || [];
    if (rel.length > 0) {
        console.log(p.codigo + ' ' + p.clave + ': ' + rel.length + ' variantes → ' + rel.map(r => r.codigo + ' ' + r.clave).join(', '));
    } else {
        console.log(p.codigo + ' ' + p.clave + ': ❌ sin variantes');
    }
});

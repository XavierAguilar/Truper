const d = JSON.parse(require('fs').readFileSync('productos_truper.json', 'utf8'));
const p = d.find(x => x.codigo === '100103');
const out = {
    nombre: p.nombre,
    marca: p.marca,
    marca_logo: p.marca_logo_url ? 'YES' : 'NO',
    familia: p.es_producto_familia,
    hermanos: p.productos_hermanos,
    specs: p.especificaciones,
    empaque: p.empaque,
    imagenes: p.imagenes.map(i => i.split('/').pop()),
    vinetas: p.vinetas.map(v => v.texto),
    pdf: p.ficha_tecnica_pdf ? 'YES' : 'NO',
    fab: p.fabricacion
};
require('fs').writeFileSync('verify_100103.json', JSON.stringify(out, null, 2), 'utf8');
console.log(JSON.stringify(out, null, 2));

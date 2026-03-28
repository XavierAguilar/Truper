const fs = require('fs');
const data = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));
data.forEach((p, i) => {
    const n = p.nombre ? p.nombre.substring(0, 55) : '-';
    const c = p.caracteristicas.length;
    const s = Object.keys(p.especificaciones).length;
    const m = p.imagenes.length;
    console.log(`${p.codigo} | ${p.clave.padEnd(12)} | ${n.padEnd(55)} | C:${c} S:${s} I:${m}`);
});

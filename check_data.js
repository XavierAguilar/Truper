const d = JSON.parse(require('fs').readFileSync('productos_truper.json', 'utf8'));
d.forEach(p => {
    const pageMatch = p.catalogo_url ? p.catalogo_url.match(/-(\d+)\.html/) : null;
    const pageNum = pageMatch ? pageMatch[1] : 'N/A';
    console.log([
        p.codigo, p.clave,
        'logo=' + (p.marca_logo_url || 'NONE'),
        'page=' + pageNum,
        'catURL=' + (p.catalogo_url || 'NONE'),
        'certs=' + p.certificaciones.length,
        'certIcons=' + p.certificaciones.map(c => c.icono_url || 'none').join('|')
    ].join(' | '));
});

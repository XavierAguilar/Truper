const fs = require('fs');
let data = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));
let p = data.find(x => x.codigo === "40056");
if(p) {
    if(p.productos_relacionados) {
        console.log("Tiene relacionados: " + p.productos_relacionados.length);
    } else {
        console.log("NO TIENE LA PROPIEDAD productos_relacionados");
        console.log(Object.keys(p));
    }
} else {
    console.log("No existe 40056");
}

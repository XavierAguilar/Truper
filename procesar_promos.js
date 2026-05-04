const fs = require('fs');
const xlsx = require('xlsx');

console.log("Leyendo archivo Excel de promociones...");
const workbook = xlsx.readFile('promos_mayo.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Parsear de JSON
const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

console.log(`Se encontraron ${data.length} filas en el Excel.`);

// Leer base de datos principal
console.log("Cargando productos_truper.json (esto puede tardar unos segundos)...");
const productosStr = fs.readFileSync('productos_truper.json', 'utf8');
const productos = JSON.parse(productosStr);

let actualizados = 0;

// Construir un mapa por clave y codigo para busqueda rapida
const prodMap = new Map();
productos.forEach(p => {
    prodMap.set(p.codigo.toString(), p);
    if (p.clave) prodMap.set(p.clave.toString(), p);
});

console.log("Procesando promociones...");
data.slice(1).forEach(row => {
    // Las claves reales en row:
    // __EMPTY -> codigo
    // __EMPTY_1 -> clave
    // Distr. -> distr
    // mayoreo -> mayoreo
    // medio may -> medio_mayoreo
    // Publico -> publico
    
    const codigo = row['__EMPTY'];
    const clave = row['__EMPTY_1'];
    
    if (!codigo && !clave) return;

    let p = null;
    if (codigo && prodMap.has(codigo.toString())) p = prodMap.get(codigo.toString());
    else if (clave && prodMap.has(clave.toString())) p = prodMap.get(clave.toString());

    if (p) {
        // Encontramos el producto. Vamos a inyectar la promo.
        const dist = parseFloat(row['Distr.']);
        const may = parseFloat(row['mayoreo']);
        const med = parseFloat(row['medio may']);
        const pub = parseFloat(row['Publico']);

        if (!isNaN(dist) && !isNaN(pub)) {
            // Calcular porcentaje de descuento basado en el precio público
            // original vs nuevo.
            // Asumiendo que el JSON tiene precios con o sin IVA, Truper promos usualmente incluyen IVA o no.
            // Los promos de Truper dicen "10%", "20%", "30%".
            // Comparemos el precio normal de p.precios con los nuevos.
            let porc = 0;
            if (p.precios && p.precios.publico) {
                const oldPub = parseFloat(p.precios.publico);
                if (oldPub > pub) {
                    porc = Math.round(((oldPub - pub) / oldPub) * 100);
                    // Redondear a multiplos de 5 o 10 (ej. 9.8 -> 10)
                    porc = Math.round(porc / 5) * 5; 
                }
            }
            if (porc === 0) porc = 10; // Fallback si no hay precio previo

            p.promocion = {
                porcentaje: porc,
                precios: {
                    distribuidor: dist,
                    mayoreo: may,
                    medio_mayoreo: med,
                    publico: pub
                }
            };
            actualizados++;
        }
    }
});

console.log(`\nSe inyectaron promociones a ${actualizados} productos.`);

if (actualizados > 0) {
    console.log("Guardando productos_truper.json...");
    fs.writeFileSync('productos_truper.json', JSON.stringify(productos, null, 2));
    console.log("¡Listo!");
} else {
    console.log("No se encontraron coincidencias o hubo un error al leer las columnas.");
}

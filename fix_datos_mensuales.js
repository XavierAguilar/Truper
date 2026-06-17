const fs = require('fs');
const { execSync } = require('child_process');

console.log("Regenerating datos_mensuales.json using Git split parts...");

// 1. Obtener base de datos original combinando las 4 partes de git HEAD
let gitProducts = [];
try {
    for (let i = 1; i <= 4; i++) {
        const partPath = `productos_truper_min_part${i}.json`;
        const gitData = execSync(`git show HEAD:${partPath}`, { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
        const partProducts = JSON.parse(gitData);
        gitProducts = gitProducts.concat(partProducts);
        console.log(`Loaded ${partProducts.length} products from HEAD:${partPath}`);
    }
    console.log(`Total original products loaded: ${gitProducts.length}`);
} catch (e) {
    console.error("Error reading from git:", e.message);
    process.exit(1);
}

// 2. Obtener base de datos actual
const currentProducts = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));
console.log(`Loaded ${currentProducts.length} current products.`);

const gitMap = new Map();
gitProducts.forEach(p => gitMap.set(p.codigo, p));

const currentMap = new Map();
currentProducts.forEach(p => currentMap.set(p.codigo, p));

const nuevos = [];
const descontinuados = [];
const subieron = [];
const bajaron = [];

// Encontrar nuevos y variaciones de precio
currentProducts.forEach(p => {
    const prev = gitMap.get(p.codigo);
    if (!prev) {
        nuevos.push(p.codigo);
    } else {
        if (p.descontinuado && !prev.descontinuado) {
            descontinuados.push(p.codigo);
        } else if (p.precios && prev.precios) {
            const oldPub = prev.precios.publico;
            const newPub = p.precios.publico;
            if (oldPub && newPub) {
                if (newPub > oldPub) {
                    subieron.push({
                        codigo: p.codigo,
                        anterior: oldPub,
                        actual: newPub
                    });
                } else if (newPub < oldPub) {
                    bajaron.push({
                        codigo: p.codigo,
                        anterior: oldPub,
                        actual: newPub
                    });
                }
            }
        }
    }
});

// Encontrar descontinuados (en git pero no en current, o marcados descontinuados)
gitProducts.forEach(p => {
    const curr = currentMap.get(p.codigo);
    if ((!curr || curr.descontinuado) && !p.descontinuado) {
        if (!descontinuados.includes(p.codigo)) {
            descontinuados.push(p.codigo);
        }
    }
});

// Obtener los que tienen descuentos activos
const descuentos = currentProducts.filter(p => p.promocion).map(p => p.codigo);

const result = {
    fechaActualizacion: new Date().toISOString().split('T')[0],
    archivoCSV: "catalogo040626.csv",
    nuevos: nuevos,
    descontinuados: descontinuados,
    volatiles: {
        subieron: subieron,
        bajaron: bajaron
    },
    descuentos: descuentos
};

fs.writeFileSync('datos_mensuales.json', JSON.stringify(result, null, 2), 'utf8');

console.log("\nRegenerated successfully:");
console.log(`  Nuevos:         ${nuevos.length}`);
console.log(`  Descontinuados: ${descontinuados.length}`);
console.log(`  Subieron:       ${subieron.length}`);
console.log(`  Bajaron:        ${bajaron.length}`);
console.log(`  Descuentos:     ${descuentos.length}`);
console.log("Saved to datos_mensuales.json.");

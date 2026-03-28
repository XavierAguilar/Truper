const fs = require('fs');
const path = require('path');

const inputPath = 'productos_truper.json';
const chunkSize = 15 * 1024 * 1024; // 15MB chunks
const outputDir = 'chunks';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const data = fs.readFileSync(inputPath);
let offset = 0;
let part = 0;

while (offset < data.length) {
    const chunk = data.slice(offset, offset + chunkSize);
    fs.writeFileSync(path.join(outputDir, `part_${part}.json`), chunk);
    console.log(`Guardado part_${part}.json (${(chunk.length / 1024 / 1024).toFixed(2)} MB)`);
    offset += chunkSize;
    part++;
}

console.log(`\nDivision completada: ${part} archivos creados.`);

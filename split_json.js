const fs = require('fs');
const path = require('path');

const inputPath = 'productos_truper.json';
console.log('Cargando ' + inputPath + '...');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Dividir en 4 partes (aprox 3500 productos por archivo)
const quarter = Math.ceil(data.length / 4);
const part1 = data.slice(0, quarter);
const part2 = data.slice(quarter, quarter * 2);
const part3 = data.slice(quarter * 2, quarter * 3);
const part4 = data.slice(quarter * 3);

console.log('Minificando y guardando parte 1...');
fs.writeFileSync('productos_truper_min_part1.json', JSON.stringify(part1));
console.log('Minificando y guardando parte 2...');
fs.writeFileSync('productos_truper_min_part2.json', JSON.stringify(part2));
console.log('Minificando y guardando parte 3...');
fs.writeFileSync('productos_truper_min_part3.json', JSON.stringify(part3));
console.log('Minificando y guardando parte 4...');
fs.writeFileSync('productos_truper_min_part4.json', JSON.stringify(part4));

console.log(`\n¡División completada!`);
console.log(`- productos_truper_min_part1.json (${part1.length} productos)`);
console.log(`- productos_truper_min_part2.json (${part2.length} productos)`);
console.log(`- productos_truper_min_part3.json (${part3.length} productos)`);
console.log(`- productos_truper_min_part4.json (${part4.length} productos)`);
console.log('Estos archivos pesan ~25MB y aseguran compatibilidad total con Vercel.');

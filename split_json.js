const fs = require('fs');
const path = require('path');

const inputPath = 'productos_truper.json';
console.log('Cargando ' + inputPath + '...');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Dividir a la mitad (aprox 7500 productos por archivo)
const half = Math.ceil(data.length / 2);
const part1 = data.slice(0, half);
const part2 = data.slice(half);

console.log('Minificando y guardando parte 1...');
fs.writeFileSync('productos_truper_min_part1.json', JSON.stringify(part1));
console.log('Minificando y guardando parte 2...');
fs.writeFileSync('productos_truper_min_part2.json', JSON.stringify(part2));

console.log(`\n¡División completada!`);
console.log(`- productos_truper_min_part1.json (${part1.length} productos)`);
console.log(`- productos_truper_min_part2.json (${part2.length} productos)`);
console.log('Estos archivos pesan menos de 50MB y pueden subirse a GitHub/Vercel.');

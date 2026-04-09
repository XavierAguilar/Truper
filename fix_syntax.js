const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// Reparación de la Línea Mutilada
let regex = /var icon = e\.tipo === 'timeout'.*?\)\);/g;
let safeLine = "var icon = e.tipo === 'timeout' ? 'â ±ï¸ ' : (e.tipo === 'http' ? 'GLB' : (e.tipo === 'conexion' ? '🔌' : 'â “'));";
txt = txt.replace(regex, safeLine);

// Just in case it got completely unrecoverable, we'll brute force match around "conexion"
let regex2 = /\(e\.tipo === 'http' \? '&#127991;&#65039; : \(e\.tipo === 'conexion' \? '&#127991;&#65039; : 'â “'\)\)/g;
txt = txt.replace(regex2, "(e.tipo === 'http' ? 'WEB' : (e.tipo === 'conexion' ? 'CON' : 'ERR'))");

fs.writeFileSync('index.html', txt, 'utf8');
console.log("SyntaxError parcheado.");

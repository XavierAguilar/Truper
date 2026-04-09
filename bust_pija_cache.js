const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let target = 'src="images/pija_blanca.png"';
let patch = `src="images/pija_blanca.png?v=' + Date.now() + '"`;

if (txt.includes(target)) {
    txt = txt.replace(target, patch);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Anti-caché insertado en pija_blanca.png");
} else {
    console.log("No se pudo hallar el origin de la pija blanca o ya fue parcheado.");
}

const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// 1. Fix ES6 Template String syntax for pija_blanca.png
let badPija = `src="images/pija_blanca.png?v=' + Date.now() + '"`;
let goodPija = 'src="images/pija_blanca.png?v=${Date.now()}"';
if(txt.includes(badPija)) {
    txt = txt.replace(badPija, goodPija);
    console.log("Pija Blanca syntax resolved.");
} else {
    // maybe it is single quotes
    txt = txt.replace(/src="images\/pija_blanca\.png\?[^"]*"/g, goodPija);
}

// 2. Rename the PNG file fundamentally to instantly bust all possible CDN, Node, or Vercel Caches
const oldTigerPath = 'images/tigre_esquina_inferiror_derecha.png';
const newTigerPath = 'images/tigre_final.png';

if (fs.existsSync(oldTigerPath)) {
    fs.renameSync(oldTigerPath, newTigerPath);
    console.log("Tiger file physically renamed to tigre_final.png to guarantee 100% fresh hash.");
}

txt = txt.split('tigre_esquina_inferiror_derecha.png').join('tigre_final.png');

fs.writeFileSync('index.html', txt, 'utf8');

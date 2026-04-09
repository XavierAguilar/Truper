const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let oldSub = `flex: 0 0 ' + tpl.width + ' !important;`;
let newSub = `flex: 0 0 ' + tpl.width + ' !important; min-width: 0 !important;`;

if (txt.includes(oldSub) && !txt.includes("min-width: 0 !important")) {
    txt = txt.replace(oldSub, newSub);
    
    // Also inject the SVG scale logic into the same style tag
    let oldStyleEnd = `overflow: hidden !important; } } ' + tpl.css`;
    let newStyleEnd = `overflow: hidden !important; } .bt-print-container svg { max-width: 100% !important; height: auto !important; } } ' + tpl.css`;
    
    if (txt.includes(oldStyleEnd)) {
        txt = txt.replace(oldStyleEnd, newStyleEnd);
        fs.writeFileSync('index.html', txt, 'utf8');
        console.log("Inyección SVG y Min-Width exitosa.");
    } else {
        console.log("Fallo buscando el cierre del estilo.");
    }
} else {
    console.log("Fallo buscando el flex basis. O ya está aplicado.");
}

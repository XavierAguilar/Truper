const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let hoverDivTarget = `<div class="bt-item-hover-overlay">`;
let hoverDivRep = `<div class="bt-item-hover-overlay" oncontextmenu="importRelatedBt(\${i}, event)">`;

if (txt.includes(hoverDivTarget)) {
    txt = txt.replace(hoverDivTarget, hoverDivRep);
    console.log("Overlay modificado.");
} else {
    // maybe it is already replaced
    console.log("Ya existía o no se localizó la capa overlay.");
}

fs.writeFileSync('index.html', txt, 'utf8');

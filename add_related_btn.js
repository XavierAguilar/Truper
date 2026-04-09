const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The original line is:
// <button class="bt-item-remove" onclick="removeBt(${i})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>

let btnRemoveStr = `<button class="bt-item-remove" onclick="removeBt(\${i})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`;
let newBtns = `
                            <button class="bt-item-remove" style="background:var(--primary); margin-right: 8px;" onclick="importRelatedBt(\${i}, event)" title="Importar Hermandad (Relacionados)"><i class="fas fa-sitemap"></i></button>
                            ${btnRemoveStr}`;

if (txt.includes(btnRemoveStr) && !txt.includes("fa-sitemap")) {
    txt = txt.replace(btnRemoveStr, newBtns);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Botón explícito de Importar Relacionados inyectado.");
} else if (txt.includes("fa-sitemap")) {
    console.log("El botón ya había sido inyectado.");
} else {
    console.log("Fallo al localizar el ancla del botón eliminar.");
}

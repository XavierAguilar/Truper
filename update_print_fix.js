const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The string currently injected in triggerPrint()
let oldStr = `printArea.innerHTML = '<style>@media print { .bt-print-container { grid-template-columns: repeat(auto-fit, ' + tpl.width + ') !important; justify-content: center; gap: 0.5cm; } } ' + tpl.css + '</style>';`;

let newStr = `
                    // Calculate columns perfectly based on 20cm usable A4 width
                    let cols = Math.floor(20 / parseFloat(tpl.width));
                    if(cols < 1) cols = 1;
                    printArea.style.setProperty('grid-template-columns', 'repeat(' + cols + ', ' + tpl.width + ')', 'important');
                    printArea.style.setProperty('gap', '0.5cm', 'important');
                    printArea.innerHTML = '<style>' + tpl.css + '</style>';
`;

if(txt.includes(oldStr)) {
    txt = txt.replace(oldStr, newStr);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Calculador JS Inyectado Correctamente.");
} else {
    console.log("No se pudo encontrar el string antiguo. Revisar archivo.");
}

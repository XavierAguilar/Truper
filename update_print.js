const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// Replace the style injection in triggerPrint
let oldStr = `printArea.innerHTML = '<style>' + tpl.css + '</style>';`;
let newStr = `printArea.innerHTML = '<style>@media print { .bt-print-container { grid-template-columns: repeat(auto-fit, minmax(' + tpl.width + ', 1fr)) !important; justify-content: center; gap: 0.5cm; } } ' + tpl.css + '</style>';`;

// Wait, minmax(10cm, 1fr) might make the columns grow larger than 10cm.
// We want exactly 10cm columns.
newStr = `printArea.innerHTML = '<style>@media print { .bt-print-container { grid-template-columns: repeat(auto-fit, ' + tpl.width + ') !important; justify-content: center; gap: 0.5cm; } } ' + tpl.css + '</style>';`;

if(txt.includes(oldStr)) {
    txt = txt.replace(oldStr, newStr);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Print Grid Auto-Fit Inyectado");
} else {
    console.log("No se pudo encontrar el string:", oldStr);
}

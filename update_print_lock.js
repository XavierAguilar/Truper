const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let oldStr = `printArea.innerHTML = '<style>' + tpl.css + '</style>';`;
let newStr = `printArea.innerHTML = '<style>@media print { .bt-print-container > div { flex: 0 0 ' + tpl.width + ' !important; max-width: ' + tpl.width + ' !important; overflow: hidden !important; } } ' + tpl.css + '</style>';`;

if(txt.includes(oldStr)) {
    txt = txt.replace(oldStr, newStr);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Flex Lock inyectado correctamente.");
} else {
    // maybe it has other characters around it
    console.log("No encontrado. Buscando por Expresión Regular...");
    let regex = /printArea\.innerHTML\s*=\s*['"`]<style>['"`]\s*\+\s*tpl\.css\s*\+\s*['"`]<\/style>['"`];/;
    if(regex.test(txt)) {
        txt = txt.replace(regex, newStr);
        fs.writeFileSync('index.html', txt, 'utf8');
        console.log("Flex Lock inyectado correctamente vía REGEX.");
    } else {
        console.log("Definitivamente error");
    }
}

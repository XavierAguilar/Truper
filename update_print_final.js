const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. Update the grid styling inject script to include align-content
let oldJsLine = `printArea.style.setProperty('gap', '0.5cm', 'important');`;
let newJsLines = `
printArea.style.setProperty('gap', '0.5cm', 'important');
printArea.style.setProperty('align-content', 'start', 'important');
printArea.style.setProperty('justify-content', 'center', 'important');
`;

if(txt.includes(oldJsLine) && !txt.includes("align-content', 'start'")) {
    txt = txt.replace(oldJsLine, newJsLines);
}

// 2. Add page-break-inside to .pija-bktag
let oldCss = `.pija-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                        }`;
let newCss = `.pija-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }`;

if(txt.includes(oldCss)) {
    txt = txt.replace(oldCss, newCss);
} else {
    // If exact whitespace matching fails, use generic fast replace
    txt = txt.replace(/border:\s*1px dashed #000;/g, "border: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;");
}

fs.writeFileSync('index.html', txt, 'utf8');
console.log("Fixes inyectados exitosamente.");

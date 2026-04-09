const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// I will completely overwrite the grid injection in triggerPrint with pure Flexbox
// I need to find the block of Javascript I injected:
let startIdx = txt.indexOf('let cols = Math.floor(20 / parseFloat(tpl.width));');
let endIdx = txt.indexOf("printArea.innerHTML = '<style>' + tpl.css + '</style>';");

if(startIdx !== -1 && endIdx !== -1) {
    let before = txt.substring(0, startIdx);
    let after = txt.substring(endIdx);
    
    // Switch to Flexbox approach for safe auto-flowing and pagination
    let newLogic = `
                      // Override CSS Grid safely with Flexbox Wrapper to avoid Chrome multi-page grid stretching 
                      printArea.style.setProperty('display', 'flex', 'important');
                      printArea.style.setProperty('flex-wrap', 'wrap', 'important');
                      printArea.style.setProperty('justify-content', 'center', 'important');
                      printArea.style.setProperty('gap', '2mm', 'important');
                      
                      `;
    
    fs.writeFileSync('index.html', before + newLogic + after, 'utf8');
    console.log("Flexbox wrapper inyectado exitosamente.");
} else {
    console.log("Error intentando buscar inyección anterior.");
}

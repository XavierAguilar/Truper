const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let signature = `// Inyección Masiva por comas desde tipeo manual`;

let newCode = `// Extractor Automático por Módulo / Página
                  const moduloMatch = val.match(/^(?:módulo|modulo|mod|m)\\s*(\\d+)$/i);
                  if (moduloMatch) {
                      const pageNum = parseInt(moduloMatch[1], 10);
                      const modProducts = (window.productos || []).filter(p => p.pagina_catalogo === pageNum);
                      if (modProducts.length > 0) {
                          let added = 0;
                          modProducts.forEach(p => { addMatchedBt(p); added++; });
                          window.playBeep('success');
                          showBtToast('&#9989; Módulo ' + pageNum + ' extraído: ' + added + ' gafetes', '#10b981');
                          suggBox.classList.remove('show');
                          input.value = '';
                      } else {
                          window.playBeep('error');
                          showBtToast('Ã¢ÂÅ’ Vacío: Ningún artículo en Modulo ' + pageNum, '#ef4444');
                      }
                      return;
                  }

                  // Inyección Masiva por comas desde tipeo manual`;

if (txt.includes(signature) && !txt.includes("Extractor Automático por Módulo")) {
    txt = txt.replace(signature, newCode);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("Comando Módulo/Página inyectado exitosamente.");
} else {
    console.log("No se pudo detectar el punto de inyección o ya estaba parchado.");
}

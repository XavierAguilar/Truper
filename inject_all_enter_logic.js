const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The generic, whitespace-agnostic regex to find the start of the Enter block in handleBtScannerInput
// It looks for: if (e.key === 'Enter') { if(e.preventDefault) e.preventDefault(); if(btSugActiveIdx >= 0
let regex = /if\s*\(\s*e\.key\s*===\s*'Enter'\s*\)\s*\{\s*if\s*\(\s*e\.preventDefault\s*\)\s*e\.preventDefault\(\);\s*if\s*\(\s*btSugActiveIdx\s*>=\s*0\s*&&\s*btSuggestions\[btSugActiveIdx\]\s*\)\s*\{/g;

let newLogic = `if (e.key === 'Enter') {
                  if(e.preventDefault) e.preventDefault();
                  
                  // Extractor Automático por Módulo / Página
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

                  // Inyección Masiva por comas desde tipeo manual
                  if (val.includes(',')) {
                      let tokens = val.split(',').map(t => t.trim()).filter(Boolean);
                      let added = 0;
                      tokens.forEach(tok => {
                          const p = getProductByClaveOrCodigo(tok);
                          if(p) { addMatchedBt(p); added++; }
                      });
                      if(added > 0) {
                          suggBox.classList.remove('show');
                          input.value = '';
                          window.playBeep('success');
                          showBtToast('&#9989; Lote manual: ' + added + ' agregados', '#10b981');
                      } else {
                          window.playBeep('error');
                          showBtToast('Ã¢ÂÅ’ Textos no encontrados', '#ef4444');
                      }
                      return;
                  }
                  
                  if(btSugActiveIdx >= 0 && btSuggestions[btSugActiveIdx]) {`;

let matchCount = (txt.match(regex) || []).length;
console.log("Matches found:", matchCount);

if (matchCount > 0) {
    if (!txt.includes("Extractor Automático por Módulo")) {
        txt = txt.replace(regex, newLogic);
        fs.writeFileSync('index.html', txt, 'utf8');
        console.log("Lógicas de Enter inyectadas al 100%");
    } else {
        console.log("El código ya está presente en el archivo.");
    }
} else {
    console.log("FATAL: No se encontró el bloque exacto con la regex.");
}

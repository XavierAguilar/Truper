const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The event listener logic for paste
let pasteInterceptor = `
          // Interceptor de Pegado Masivo (Batch-Scan Paste)
          document.addEventListener('DOMContentLoaded', () => {
              const btInput = document.getElementById('btScannerInput');
              if(btInput) {
                  btInput.addEventListener('paste', function(e) {
                      let paste = (e.clipboardData || window.clipboardData).getData('text');
                      if (paste.includes('\\n') || paste.includes(',') || paste.includes('\\t')) {
                          e.preventDefault();
                          // Separar por saltos de línea, comas o tabulaciones
                          let tokens = paste.split(/[\\n,\\t]+/).map(t => t.trim()).filter(Boolean);
                          if(tokens.length > 1) {
                              let added = 0;
                              tokens.forEach(tok => {
                                  const p = getProductByClaveOrCodigo(tok);
                                  if(p) { addMatchedBt(p); added++; }
                              });
                              if(added > 0) {
                                  window.playBeep('success');
                                  showBtToast('&#9989; Lote: ' + added + ' agregados masivamente', '#10b981');
                              } else {
                                  window.playBeep('error');
                                  showBtToast('Ã¢ÂÅ’ Ninguno encontrado en lote', '#ef4444');
                              }
                              this.value = '';
                          } else {
                              this.value = paste; // comportamiento normal
                          }
                      }
                  });
              }
          });
`;

let targetHandle = `window.handleBtScannerInput = function(e) {`;
if (txt.includes(targetHandle) && !txt.includes("Interceptor de Pegado Masivo")) {
    txt = txt.replace(targetHandle, pasteInterceptor + "\n          " + targetHandle);
}

// Modify Enter key logic for commas
let oldEnter = `              if (e.key === 'Enter') {
                  if(e.preventDefault) e.preventDefault();
                  if(btSugActiveIdx >= 0 && btSuggestions[btSugActiveIdx]) {`;

let newEnter = `              if (e.key === 'Enter') {
                  if(e.preventDefault) e.preventDefault();
                  
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

if (txt.includes(oldEnter)) {
    txt = txt.replace(oldEnter, newEnter);
}

// Write the file
fs.writeFileSync('index.html', txt, 'utf8');
console.log("Batch logic injected");

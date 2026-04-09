const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. Rename Modulo to Pagina in the Scanner Logic
// Instead of complex regex string matching, just replace the exact raw string:
let str1 = "const moduloMatch = val.match(/^(?:módulo|modulo|mod|m)\\s*(\\d+)$/i);";
let str2 = "const moduloMatch = val.match(/^(?:página|pagina|pag|p)\\s*(\\d+)$/i);";

if (txt.includes(str1)) {
    txt = txt.replace(str1, str2);
} else {
    // maybe it got encoded?
    txt = txt.replace(/const moduloMatch = val\.match\(\/\^\(\?:módulo\|modulo\|mod\|m\)\\s\*\(\\d\+\)\$\/i\);/, str2);
}

txt = txt.replace(/Módulo '\s*\+\s*pageNum\s*\+\s*' extraído/g, "PÃ¡gina ' + pageNum + ' extraÃ­da");
txt = txt.replace(/Ningún artículo en Modulo/g, "NingÃºn artÃ­culo en PÃ¡gina");

// 2. Add ContextMenu to bt-item
let btItemRegex = /<div class="bt-item">/g;
// Because there is exactly one place where it makes sense inside backtags generator renderer:
txt = txt.replace(/<div class="bt-item">/, `<div class="bt-item" oncontextmenu="importRelatedBt(\${i}, event)" title="Clic Derecho para Importar Relacionados">`);

// 3. Inject the importRelatedBt function at the end of the script block (before </body>)
let relatedFunc = `
          // Extraer Productos Relacionados vía Click Derecho
          window.importRelatedBt = function(index, e) {
              e.preventDefault();
              const item = window.btList[index];
              if(!item || !item.p || !item.p.productos_relacionados || item.p.productos_relacionados.length === 0) {
                  window.playBeep('error');
                  showBtToast('Ã¢ÂÅ’ Sin relacionados', '#ef4444');
                  return;
              }
              let added = 0;
              item.p.productos_relacionados.forEach(rel => {
                  const pMatch = getProductByClaveOrCodigo(rel.codigo);
                  if (pMatch) {
                      addMatchedBt(pMatch);
                      added++;
                  }
              });
              if(added > 0) {
                  window.playBeep('success');
                  showBtToast('&#9989; Importados ' + added + ' hermanos de ' + item.p.clave, '#10b981');
              } else {
                  window.playBeep('error');
                  showBtToast('Ã¢ÂÅ’ Hermanos no hallados', '#ef4444');
              }
          };
`;
if(!txt.includes("importRelatedBt")) {
    txt = txt.replace('</script>\\n  </body>', relatedFunc + '\\n      </script>\\n  </body>');
    txt = txt.replace('</script>\\r\\n  </body>', relatedFunc + '\\n      </script>\\n  </body>');
    // If it fails to find the literal </body> due to escaping:
    txt = txt.replace(/<\/script>\s*<\/body>/, relatedFunc + '\\n</script>\\n</body>');
}

fs.writeFileSync('index.html', txt, 'utf8');
console.log("Renombrado y Clic-Derecho inyectados!");

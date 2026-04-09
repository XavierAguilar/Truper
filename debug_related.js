const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let oldScript = `          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p) return;
              
              const freshP = getProductByClaveOrCodigo(item.p.codigo) || item.p;
              const rels = freshP.productos_relacionados || [];
              
              if(rels.length === 0) {
                  window.playBeep('error');
                  showBtToast('❌ Sin relacionados en BD', '#ef4444');
                  return;
              }`;

let newScript = `          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p) return;
              
              const freshP = getProductByClaveOrCodigo(item.p.codigo) || item.p;
              const rels = freshP.productos_relacionados || [];
              
              if(rels.length === 0) {
                  window.playBeep('error');
                  // DEBUG ALERT:
                  // alert("DEBUG: Keys in freshP = " + Object.keys(freshP).join(", "));
                  
                  // REPARACIÓN INMEDIATA: Revisar también rels en item.p por si acaso
                  if (item.p.productos_relacionados && item.p.productos_relacionados.length > 0) {
                      // Usar los de item.p
                      window.playBeep('success');
                      var forceRels = item.p.productos_relacionados;
                      let fAdd = 0;
                      forceRels.forEach(function(rel){
                          var pm = getProductByClaveOrCodigo(rel.codigo);
                          if(pm) { addMatchedBt(pm); fAdd++; }
                      });
                      if(fAdd>0){
                          showBtToast('✅ Importados ' + fAdd + ' hermanos de cache', '#10b981');
                          return;
                      }
                  } else if (freshP.relacionados && Array.isArray(freshP.relacionados)) {
                      // Tal vez se llaman relacionados ?
                  }

                  showBtToast('❌ Debug: No. de Llaves: ' + Object.keys(freshP).length + '. Tiene_relacionados_str: ' + Object.keys(freshP).includes('productos_relacionados'), '#ef4444');
                  return;
              }`;

if (txt.includes(oldScript)) {
    txt = txt.replace(oldScript, newScript);
    console.log("Inyección de volcado alertada exitosamente.");
} else {
    console.log("No se pudo interceptar el script original.");
}
fs.writeFileSync('index.html', txt, 'utf8');

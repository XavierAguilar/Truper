const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. REPAIR importRelatedBt (Bypass localStorage Cache delay)
let oldFunc = `          // Extraer Productos Relacionados vía Click Propio
          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p || !item.p.productos_relacionados || item.p.productos_relacionados.length === 0) {
                  window.playBeep('error');
                  showBtToast('❌ Sin relacionados en BD', '#ef4444');
                  return;
              }
              let added = 0;
              item.p.productos_relacionados.forEach(rel => {`;

let newFunc = `          // Extraer Productos Relacionados vía Click Propio
          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p) return;
              
              const freshP = getProductByClaveOrCodigo(item.p.codigo) || item.p;
              const rels = freshP.productos_relacionados || [];
              
              if(rels.length === 0) {
                  window.playBeep('error');
                  showBtToast('❌ Sin relacionados en BD', '#ef4444');
                  return;
              }
              let added = 0;
              rels.forEach(rel => {`;

if (txt.includes(oldFunc)) {
    txt = txt.replace(oldFunc, newFunc);
    console.log("Caché puenteada. Usando Base de Datos viva para relaciones.");
} else {
    console.log("No se pudo reemplazar importRelatedBt, tal vez la firma cambió.");
}

// 2. RESTORE Main Search Box text color to #333 while keeping Backtags white!
let mainSearchStr = `<div class="result-list-name" style="font-size:13px; font-weight:700; color: #fff; max-width:100%; white-space:normal;">\${esc(p.nombre)}</div>`;
let mainSearchFixed = `<div class="result-list-name" style="font-size:13px; font-weight:700; color: #333; max-width:100%; white-space:normal;">\${esc(p.nombre)}</div>`;

if(txt.includes(mainSearchStr)) {
    txt = txt.replace(mainSearchStr, mainSearchFixed);
    console.log("Color Main Search restaurado a #333");
} else {
    console.log("No se localizó result-list-name con color: #fff");
    // Fallback: Just regex it
    txt = txt.replace(/<div class="result-list-name"\s+style="([^"]+)color:\s*#fff/g, '<div class="result-list-name" style="$1color: #333');
}

// Also, the btSug template inside BackTags:
// let html = '<div class="bt-sug-item' ... '<div class="sug-name" style="color: #fff;">'
// The regex in the previous pass should have hit this. If not, let's explicitly make sure .sug-name is #fff
txt = txt.replace(/<div class="sug-name"\s+style="color:\s*#333;?/g, '<div class="sug-name" style="color:#fff;');

fs.writeFileSync('index.html', txt, 'utf8');

const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. Inject the Javascript Function
let relatedFunc = `
          // Extraer Productos Relacionados vía Click Propio
          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p || !item.p.productos_relacionados || item.p.productos_relacionados.length === 0) {
                  window.playBeep('error');
                  showBtToast('❌ Sin relacionados en BD', '#ef4444');
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
                  showBtToast('✅ Importados ' + added + ' hermanos de ' + item.p.clave, '#10b981');
              } else {
                  window.playBeep('error');
                  showBtToast('❌ Hermanos no hallados', '#ef4444');
              }
          };
`;
if (!txt.includes("window.importRelatedBt = function")) {
    // Just place it safely before the closing script tag of the app
    let lastScriptTag = "window.printBackTags = function() {";
    txt = txt.replace(lastScriptTag, relatedFunc + "\n\n          " + lastScriptTag);
    console.log("Motor JS window.importRelatedBt inyectado.");
} else {
    console.log("El motor JS ya estaba inyectado.");
}

// 2. Put white text on the button
let sitemapBtnStr = `<button class="bt-item-remove" style="background:var(--primary); margin-right: 8px;" onclick="importRelatedBt(`;
let whiteBtnStr = `<button class="bt-item-remove" style="background:var(--primary); color: #fff !important; margin-right: 8px;" onclick="importRelatedBt(`;

if (txt.includes(sitemapBtnStr)) {
    txt = txt.replace(sitemapBtnStr, whiteBtnStr);
    console.log("Color del icono de Sitemap forzado a blanco puro.");
}

fs.writeFileSync('index.html', txt, 'utf8');

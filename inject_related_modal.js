const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The new HTML for the Modal Overlay
const modalHtml = `
  <!-- MODAL PARA IMPORTAR PRODUCTOS RELACIONADOS -->
  <div id="btRelatedModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
      <div style="background:var(--surface); border: 1px solid var(--border); border-radius: 12px; width:400px; max-width:90%; padding:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align:center;">
          
          <!-- Estado de Carga -->
          <div id="btRelLoading" style="display:none;">
              <i class="fas fa-circle-notch fa-spin" style="font-size: 40px; color: var(--primary); margin-bottom: 16px;"></i>
              <h3 style="color:#fff; margin:0; font-size:18px;">Buscando en Base de Datos...</h3>
              <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">Rastreando árbol genealógico del producto.</p>
          </div>

          <!-- Estado de Pregunta/Confirmación -->
          <div id="btRelConfirm" style="display:none;">
              <div style="width: 50px; height: 50px; background: rgba(16,185,129,0.15); border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 16px auto;">
                  <i class="fas fa-sitemap" style="color: #10b981; font-size: 24px;"></i>
              </div>
              <h3 style="color:#fff; margin:0; font-size:20px; line-height:1.2;">Artículos Relacionados<br>Encontrados</h3>
              <p style="color:var(--text-muted); font-size:14px; margin-top:12px;">Se localizaron <strong id="btRelQty" style="color:#fff;">x</strong> productos vinculados a este artículo.</p>
              <h4 style="color:#10b981; font-size: 15px; margin: 16px 0;">¿Deseas agregarlos a la lista?</h4>
              
              <div style="display:flex; gap:12px; margin-top:20px;">
                  <button id="btRelCancelBtn" style="flex:1; background:var(--bg); border:1px solid var(--border); color:#fff; padding:12px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="closeRelatedModal()">Cancelar</button>
                  <button id="btRelAcceptBtn" style="flex:1; background:var(--primary); border:none; color:#fff; padding:12px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="commitRelatedImport()">SÍ, Agregar Todos</button>
              </div>
          </div>
          
      </div>
  </div>
`;

// Insert the HTML just before the closing body tag
if (!txt.includes('id="btRelatedModal"')) {
    txt = txt.replace('</body>', modalHtml + '\n</body>');
}

// Modify the old window.importRelatedBt code!
// I'll regex out the entire old function block and replace it with the new logic.

const oldFuncRegex = /window\.importRelatedBt\s*=\s*function\(index,\s*e\)\s*\{[\s\S]*?(?=window\.printBackTags\s*=\s*function)/m;
const newScript = `
          // Extractor de Productos Relacionados vía Modal Flujo
          let pendingRelImports = [];
          
          window.closeRelatedModal = function() {
              document.getElementById('btRelatedModal').style.display = 'none';
          };
          
          window.commitRelatedImport = function() {
              if(!pendingRelImports || pendingRelImports.length === 0) return;
              let added = 0;
              const scannerInput = document.getElementById('btScannerInput');
              
              pendingRelImports.forEach(rel => {
                  const pm = getProductByClaveOrCodigo(rel.codigo);
                  if (pm) { addMatchedBt(pm); added++; }
              });
              
              window.closeRelatedModal();
              
              if(added > 0) {
                  window.playBeep('success');
                  showBtToast('✅ ¡Importación masiva exitosa! (' + added + ')', '#10b981');
              }
              pendingRelImports = [];
          };

          window.importRelatedBt = function(index, e) {
              if (e) { e.preventDefault(); e.stopPropagation(); }
              const item = window.btList[index];
              if(!item || !item.p) return;
              
              // 1. Mostrar modal con estado de carga
              const modal = document.getElementById('btRelatedModal');
              const loadUI = document.getElementById('btRelLoading');
              const confirmUI = document.getElementById('btRelConfirm');
              
              modal.style.display = 'flex';
              loadUI.style.display = 'block';
              confirmUI.style.display = 'none';
              
              // Simular un poco de busqueda (Delay UX para que vean que trabaja)
              setTimeout(function() {
                  // Bypass Cache 
                  const freshP = getProductByClaveOrCodigo(item.p.codigo) || item.p;
                  
                  // Agresivo: Buscar tanto en .productos_relacionados como local
                  const rels = freshP.productos_relacionados || item.p.productos_relacionados || freshP.relacionados || [];
                  
                  loadUI.style.display = 'none';
                  
                  if(rels.length === 0) {
                      window.playBeep('error');
                      modal.style.display = 'none';
                      showBtToast('❌ Sin registros hermanos en BD', '#ef4444');
                      return;
                  }
                  
                  // Tiene hijos! Preparamos el Modal UI de confirmacion
                  document.getElementById('btRelQty').textContent = rels.length;
                  pendingRelImports = rels; // Guardar estado
                  confirmUI.style.display = 'block';
                  window.playBeep('success');
                  
              }, 600); // 600ms de spinner animado
          };

          `;

if (oldFuncRegex.test(txt)) {
    txt = txt.replace(oldFuncRegex, newScript);
    console.log("Nueva lógica asíncrona de Modal integrada al 100%.");
} else {
    // maybe it couldn't match the regex. We'll append it manually and pray, or overwrite.
    console.log("No se pudo aplicar el Regex para reemplazar importRelatedBt.");
}

fs.writeFileSync('index.html', txt, 'utf8');

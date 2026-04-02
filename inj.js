const fs = require('fs');
let f = fs.readFileSync('index.html', 'utf8');

f = f.replace(
    `.bt-item-qty { width: 60px; font-size: 16px; text-align: center; border: 2px solid var(--border); border-radius: 6px; padding: 6px; font-weight: 700; margin-right: 8px;}
        .bt-item-qty:focus { border-color: var(--primary); outline: none; }
        .bt-item-remove { color: #ef4444; cursor: pointer; background: rgba(239, 68, 68, 0.1); border: none; font-size: 18px; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .bt-item-remove:hover { background: #ef4444; color: white; }`,
    `.qty-controls { display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-right: 8px; }
        .qty-btn { background: transparent; border: none; color: var(--text); padding: 8px 12px; cursor: pointer; font-weight: 900; transition: background 0.2s; }
        .qty-btn:hover { background: rgba(255,255,255,0.1); }
        .bt-item-qty { width: 40px; text-align: center; background: transparent; border: none; color: var(--text); font-weight: 700; font-size: 15px; -moz-appearance: textfield; }
        .bt-item-qty::-webkit-outer-spin-button, .bt-item-qty::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .bt-item-qty:focus { outline: none; }
        .bt-item-remove { color: #f43f5e; cursor: pointer; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); font-size: 16px; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .bt-item-remove:hover { background: #f43f5e; color: white; box-shadow: 0 0 10px rgba(244,63,94,0.4); border-color: transparent; transform: scale(1.05); }
        #btToast { position: fixed; bottom: 20px; right: 20px; background: #10b981; color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; z-index: 9999; transform: translateY(100px); opacity: 0; transition: all 0.3s; box-shadow: 0 4px 12px rgba(16,185,129,0.3); pointer-events: none; }
        .bktag-total-badge { color: var(--text-muted); font-size: 14px; font-weight: 600; flex: 1; margin-left: 20px; text-align: right; }`
);

f = f.replace(
    `<h2 style="margin:0; font-size:24px; font-weight:800; display:flex; align-items:center; gap:12px;">
                    <i class="fas fa-tags" style="color:var(--primary);"></i> Generador de Back Tags
                </h2>
                <div style="display:flex; gap:12px;">`,
    `<h2 style="margin:0; font-size:24px; font-weight:800; display:flex; align-items:center; gap:12px;">
                    <i class="fas fa-tags" style="color:var(--primary);"></i> Generador de Back Tags
                </h2>
                <div class="bktag-total-badge"></div>
                <div style="display:flex; gap:12px;">`
);

f = f.replace(
    `let btSelectedIdx = -1;`,
    `let btSelectedIdx = -1;
        document.body.insertAdjacentHTML('beforeend', '<div id="btToast"><i class="fas fa-check-circle"></i> <span id="btToastMsg">Producto Agregado</span></div>');
        function saveBtList() { localStorage.setItem('truper_btlist', JSON.stringify(btList)); }
        function showBtToast(msg) { const t = document.getElementById('btToast'); document.getElementById('btToastMsg').innerText=msg; t.style.transform='translateY(0)'; t.style.opacity='1'; setTimeout(()=>{t.style.transform='translateY(100px)';t.style.opacity='0';},2000); }`
);

f = f.replace(
    `document.getElementById('btScannerSuggestions').classList.remove('show');
            btSuggestions = [];
            btSelectedIdx = -1;
            renderBtList();
        }`,
    `saveBtList();
            document.getElementById('btScannerSuggestions').classList.remove('show');
            btSuggestions = [];
            btSelectedIdx = -1;
            renderBtList();
            showBtToast("Agregado " + p.clave);
        }`
);

f = f.replace(
    `window.removeBt = function(idx) {
            btList.splice(idx, 1);
            renderBtList();
        }`,
    `window.removeBt = function(idx) {
            btList.splice(idx, 1);
            saveBtList();
            renderBtList();
        }`
);

f = f.replace(
    `window.changeBtQty = function(idx, val) {
            val = parseInt(val);
            if (val > 0) {
                btList[idx].qty = val;
            }
        }`,
    `window.changeBtQty = function(idx, val) {
            val = parseInt(val);
            if (val > 0) {
                btList[idx].qty = val;
                saveBtList();
                renderBtList();
            }
        }
        window.changeBtQtyBtn = function(idx, mod) {
            let n = btList[idx].qty + mod;
            if (n > 0) {
                btList[idx].qty = n;
                saveBtList();
                renderBtList();
            }
        }`
);

f = f.replace(
    `window.clearAllBt = function() {
            btList = [];
            renderBtList();
        }`,
    `window.clearAllBt = function() {
            btList = [];
            saveBtList();
            renderBtList();
        }`
);

f = f.replace(
    `buildFilterUI();
            showView('welcome');`,
    `buildFilterUI();
            try { let saved=localStorage.getItem('truper_btlist'); if(saved){btList=JSON.parse(saved);renderBtList();} }catch(e){}
            showView('welcome');`
);

f = f.replace(
    `<input type="number" class="bt-item-qty" value="\${item.qty}" min="1" onchange="changeBtQty(\${i}, this.value)">`,
    `<div class="qty-controls">
                            <button class="qty-btn" onclick="changeBtQtyBtn(\${i}, -1)"><i class="fas fa-minus"></i></button>
                            <input type="number" class="bt-item-qty" value="\${item.qty}" min="1" onchange="changeBtQty(\${i}, this.value)">
                            <button class="qty-btn" onclick="changeBtQtyBtn(\${i}, 1)"><i class="fas fa-plus"></i></button>
                        </div>`
);

f = f.replace(
    `let headerText = nombre;`,
    `// Render Counts
            setTimeout(() => {
                let totalTags = btList.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);
                let totalPages = Math.ceil(totalTags / 12);
                let badge = document.querySelector('.bktag-total-badge');
                if(badge) badge.innerHTML = \`📦 Total: <span style="color:#fff">\${totalTags}</span> Gafetes &nbsp;|&nbsp; 🖨️ Hojas estimadas: <span style="color:#fff">\${totalPages}</span>\`;
            }, 10);
            
            let headerText = nombre;`
);

f = f.replace(
    `setTimeout(() => {
                document.querySelector('.backtags-header .primary-btn').innerHTML = oldText;
                window.print();
            }, 3500);`,
    `setTimeout(() => {
                document.querySelector('.backtags-header .primary-btn').innerHTML = oldText;
                window.print();
                
                setTimeout(() => {
                    if (window.Swal) {
                        Swal.fire({
                            title: '¿Impresión procesada?',
                            text: "¿Deseas vaciar la mesa de trabajo para escanear nuevos productos?",
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#475569',
                            confirmButtonText: 'Sí, vaciar mesa',
                            cancelButtonText: 'No, conservar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                clearAllBt();
                            }
                        });
                    }
                }, 1000);
            }, 3500);`
);

fs.writeFileSync('index.html', f);
console.log('Inj success');

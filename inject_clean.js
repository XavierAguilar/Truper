const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Re-apply Cuerda Fina Color
html = html.replace('.pija-mid {\n                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #13a650;', 
                    '.pija-mid {\n                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #1cd468;');

// 2. Inject CSS
let cssInject = `
        .bktpl-btn-print:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.5); }
        
        /* COLOR PICKER STYLES */
        .bktpl-color-picker { margin: 15px 24px; }
        .bktpl-color-picker > summary { font-size: 13px; font-weight: 700; color: #475569; padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
        .bktpl-color-picker > summary::-webkit-details-marker { display: none; }
        .bktpl-color-picker > summary:hover { background: #f8fafc; }
        .bktpl-color-picker[open] > summary { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none; }
        .cp-panel { background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; padding: 15px; }
        .bktpl-color-picker button.cp-reset { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 11px; font-weight: bold; }
        .bktpl-color-picker button.cp-reset:hover { text-decoration: underline; }
        .bktpl-color-picker .cp-controls { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .cp-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; }
        .cp-item input[type="color"] { -webkit-appearance: none; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; padding: 0; background: none; }
        .cp-item input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        .cp-item input[type="color"]::-webkit-color-swatch { border: 2px solid #cbd5e1; border-radius: 50%; }
        .cp-item input[type="text"] { width: 70px; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 12px; text-transform: uppercase; }
        /* END COLOR PICKER STYLES */
`;
html = html.replace('.bktpl-btn-print:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.5); }', cssInject);

// 3. Inject HTML UI safely bypassing indentation discrepancies
let searchWrapper = '<div class="bktpl-preview-canvas" id="bktplCanvasWrapper">';
let i1 = html.indexOf(searchWrapper);
if(i1 !== -1) {
    let innerCanvas = html.indexOf('<div id="bktplLiveCanvas"></div>', i1);
    let closeDiv = html.indexOf('</div>', innerCanvas);
    let i2 = html.indexOf('</div>', closeDiv + 1) + 6; // closes bktplCanvasWrapper

    let oldBlock = html.substring(i1, i2);
    let injectedHtml = oldBlock + `
                    
                    <details class="bktpl-color-picker" id="bktplColorPicker" style="display:none;">
                        <summary>
                            <span><i class="fas fa-palette"></i> Personalizar Plantilla</span>
                            <i class="fas fa-chevron-down" style="color:#94a3b8; font-size:12px;"></i>
                        </summary>
                        <div class="cp-panel">
                            <div style="text-align: right; margin-bottom: 15px;">
                                 <button class="cp-reset" onclick="window.bkGallery.resetColors()"><i class="fas fa-undo"></i> Restaurar Defecto</button>
                            </div>
                            <div class="cp-controls" id="bktplColorControls"></div>
                        </div>
                    </details>
                    <style id="bktplDynamicCSS"></style>`;

    html = html.substring(0, i1) + injectedHtml + html.substring(i2);
}

// 4. Update bkGallery definition
let galleryScriptInject = `
        window.bkGallery = {
            activeTemplateId: null,
            colorConfig: {
                'pija-10x4': [
                    { label: 'Fondo Medio', target: '.pija-mid', prop: 'background-color', def: '#1cd468' },
                    { label: 'Fondo Código', target: '.pija-bot-code', prop: 'background-color', def: '#1e5a26' },
                    { label: 'Top Header', target: '.pija-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-abierta-10x4': [
                    { label: 'Fondo Medio', target: '.pija-ab-mid', prop: 'background-color', def: '#1b5e30' },
                    { label: 'Fondo Código', target: '.pija-ab-bot-code', prop: 'background-color', def: '#0d3318' },
                    { label: 'Top Header', target: '.pija-ab-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-abierta-12x6': [
                    { label: 'Fondo Medio', target: '.pija-ab-lg-mid', prop: 'background-color', def: '#1b5e30' },
                    { label: 'Fondo Código', target: '.pija-ab-lg-bot-code', prop: 'background-color', def: '#0d3318' },
                    { label: 'Top Header', target: '.pija-ab-lg-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-lamina-10x4': [
                    { label: 'Fondo Medio', target: '.pija-lam-mid', prop: 'background-color', def: '#56B4E9' },
                    { label: 'Fondo Código', target: '.pija-lam-bot-code', prop: 'background-color', def: '#1A6B8A' },
                    { label: 'Top Header', target: '.pija-lam-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-lamina-12x6': [
                    { label: 'Fondo Medio', target: '.pija-lam-lg-mid', prop: 'background-color', def: '#56B4E9' },
                    { label: 'Fondo Código', target: '.pija-lam-lg-bot-code', prop: 'background-color', def: '#1A6B8A' },
                    { label: 'Top Header', target: '.pija-lam-lg-top', prop: 'background-color', def: '#000000' }
                ],
                'std-5x8': [
                    { label: 'Encabezado', target: '.bktag-redhead', prop: 'background-color', def: '#ff0000' }
                ]
            },
            
            getSavedColors(tplId) {
                try {
                    let saved = localStorage.getItem('trpr_tpl_colors');
                    if(saved) {
                        let parsed = JSON.parse(saved);
                        return parsed[tplId] || {};
                    }
                } catch(e){}
                return {};
            },
            
            saveColor(tplId, targetIndex, hexVal) {
                try {
                    let saved = localStorage.getItem('trpr_tpl_colors');
                    let parsed = saved ? JSON.parse(saved) : {};
                    if(!parsed[tplId]) parsed[tplId] = {};
                    parsed[tplId][targetIndex] = hexVal;
                    localStorage.setItem('trpr_tpl_colors', JSON.stringify(parsed));
                    
                    let hexInput = document.getElementById('cp_hex_' + targetIndex);
                    if(hexInput) hexInput.value = hexVal.toUpperCase();
                    
                    this.applyColorOverrides();
                } catch(e){}
            },
            
            resetColors() {
                if(!this.activeTemplateId) return;
                try {
                    let saved = localStorage.getItem('trpr_tpl_colors');
                    if(saved) {
                        let parsed = JSON.parse(saved);
                        delete parsed[this.activeTemplateId];
                        localStorage.setItem('trpr_tpl_colors', JSON.stringify(parsed));
                    }
                } catch(e){}
                this.renderColorPicker();
                this.applyColorOverrides();
            },
            
            applyColorOverrides() {
                const conf = this.colorConfig[this.activeTemplateId];
                const dynamicCss = document.getElementById('bktplDynamicCSS');
                if(!conf || !dynamicCss) {
                    if(dynamicCss) dynamicCss.innerHTML = '';
                    return;
                }
                
                let saved = this.getSavedColors(this.activeTemplateId);
                let cssString = '';
                
                conf.forEach((item, idx) => {
                    let val = saved[idx] || item.def;
                    cssString += '#bktplLiveCanvas ' + item.target + ' { ' + item.prop + ': ' + val + ' !important; }\\n';
                    cssString += '#btPrintArea ' + item.target + ' { ' + item.prop + ': ' + val + ' !important; }\\n';
                });
                
                dynamicCss.innerHTML = cssString;
                
                const printContainer = document.getElementById('btPrintArea');
                if(printContainer) {
                    let existing = printContainer.querySelector('#printDynamicColors');
                    if(!existing) {
                        existing = document.createElement('style');
                        existing.id = 'printDynamicColors';
                        printContainer.appendChild(existing);
                    }
                    existing.innerHTML = cssString;
                }
            },
            
            renderColorPicker() {
                const conf = this.colorConfig[this.activeTemplateId];
                const panel = document.getElementById('bktplColorPicker');
                const controls = document.getElementById('bktplColorControls');
                
                if(!conf || conf.length === 0) {
                    if(panel) panel.style.display = 'none';
                    return;
                }
                
                if(panel) panel.style.display = 'block';
                if(controls) controls.innerHTML = '';
                
                let saved = this.getSavedColors(this.activeTemplateId);
                
                conf.forEach((item, idx) => {
                    let currentVal = saved[idx] || item.def;
                    
                    let div = document.createElement('div');
                    div.className = 'cp-item';
                    
                    let colorInp = document.createElement('input');
                    colorInp.type = 'color';
                    colorInp.value = currentVal;
                    
                    let hexInp = document.createElement('input');
                    hexInp.type = 'text';
                    hexInp.id = 'cp_hex_' + idx;
                    hexInp.value = currentVal.toUpperCase();
                    
                    colorInp.addEventListener('input', (e) => {
                        this.saveColor(this.activeTemplateId, idx, e.target.value);
                    });
                    
                    hexInp.addEventListener('change', (e) => {
                        let val = e.target.value.trim();
                        if(/^#[0-9A-Fa-f]{6}$/.test(val) || val.match(/^#[0-9A-Fa-f]{3}$/)) {
                            if(val.length === 4) val = '#' + val[1]+val[1]+val[2]+val[2]+val[3]+val[3];
                            colorInp.value = val;
                            this.saveColor(this.activeTemplateId, idx, val);
                        } else {
                            hexInp.value = colorInp.value.toUpperCase();
                        }
                    });
                    
                    let lblSpan = document.createElement('span');
                    lblSpan.innerText = item.label + ':';
                    
                    div.appendChild(lblSpan);
                    div.appendChild(colorInp);
                    div.appendChild(hexInp);
                    controls.appendChild(div);
                });
            },
`;
html = html.replace('window.bkGallery = {', galleryScriptInject);

// 5. Inject hook into selectTemplate
let barcodeInitSearch = `                    setTimeout(() => {
                        if(window.JsBarcode) {
                            JsBarcode("#"+idBarcode, ean, {
                                format: "CODE128", displayValue: true, fontSize: 13, fontOptions: "bold",
                                textMargin: 1, textPosition: "bottom", textAlign: "center", margin: 0, height: 26, width: 1.5
                            });
                        }
                    }, 50);`;
let barcodeInitReplace = `                    setTimeout(() => {
                        if(window.JsBarcode) {
                            JsBarcode("#"+idBarcode, ean, {
                                format: "CODE128", displayValue: true, fontSize: 13, fontOptions: "bold",
                                textMargin: 1, textPosition: "bottom", textAlign: "center", margin: 0, height: 26, width: 1.5
                            });
                        }
                        this.renderColorPicker();
                        this.applyColorOverrides();
                    }, 50);`;
html = html.replace(barcodeInitSearch, barcodeInitReplace);

// 6. Inject hook into print trigger
let printSearch = "printArea.innerHTML = '<style>@media print { .bt-print-container > div { flex: 0 0 ' + tpl.width + ' !important; min-width: 0 !important; max-width: ' + tpl.width + ' !important; overflow: hidden !important; } .bt-print-container svg { max-width: 100% !important; height: auto !important; } } ' + tpl.css + '</style>';";
let printReplace = printSearch + "\n                      this.applyColorOverrides();"; // Using \n safely here!
html = html.replace(printSearch, printReplace);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Details UI successfully applied!");


        
        window.bkGallery = {
            activeTemplateId: null,
            colorConfig: {
                'pija-10x4': [
                    { label: 'Fondo Medio', target: '.pija-mid', prop: 'background-color', def: '#1cd468' },
                    { label: 'Fondo Código', target: '.pija-bot-code', prop: 'background-color', def: '#1e5a26' },
                    { label: 'Top Header', target: '.pija-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-fina-12x6': [
                    { label: 'Fondo Medio', target: '.pija-lg-mid', prop: 'background-color', def: '#13a650' },
                    { label: 'Fondo Código', target: '.pija-lg-bot-code', prop: 'background-color', def: '#1e5a26' },
                    { label: 'Top Header', target: '.pija-lg-top', prop: 'background-color', def: '#000000' }
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
                'lamina-hex-10x4': [
                    { label: 'Fondo Medio', target: '.pija-hex-mid', prop: 'background-color', def: '#1890C4' },
                    { label: 'Fondo Código', target: '.pija-hex-bot-code', prop: 'background-color', def: '#0D5A75' },
                    { label: 'Top Header', target: '.pija-hex-top', prop: 'background-color', def: '#000000' }
                ],
                'lamina-hex-12x6': [
                    { label: 'Fondo Medio', target: '.pija-hex-lg-mid', prop: 'background-color', def: '#1890C4' },
                    { label: 'Fondo Código', target: '.pija-hex-lg-bot-code', prop: 'background-color', def: '#0D5A75' },
                    { label: 'Top Header', target: '.pija-hex-lg-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-broca-10x4': [
                    { label: 'Fondo Medio', target: '.pija-broca-mid', prop: 'background-color', def: '#FF0090' },
                    { label: 'Fondo Código', target: '.pija-broca-bot-code', prop: 'background-color', def: '#900060' },
                    { label: 'Top Header', target: '.pija-broca-top', prop: 'background-color', def: '#000000' }
                ],
                'pija-broca-12x6': [
                    { label: 'Fondo Medio', target: '.pija-broca-lg-mid', prop: 'background-color', def: '#FF0090' },
                    { label: 'Fondo Código', target: '.pija-broca-lg-bot-code', prop: 'background-color', def: '#900060' },
                    { label: 'Top Header', target: '.pija-broca-lg-top', prop: 'background-color', def: '#000000' }
                ],
                'broca8-10x4': [
                    { label: 'Fondo Medio', target: '.pija-b8-mid', prop: 'background-color', def: '#F0C800' },
                    { label: 'Fondo Código', target: '.pija-b8-bot-code', prop: 'background-color', def: '#C8A500' },
                    { label: 'Top Header', target: '.pija-b8-top', prop: 'background-color', def: '#000000' }
                ],
                'broca8-12x6': [
                    { label: 'Fondo Medio', target: '.pija-b8-lg-mid', prop: 'background-color', def: '#F0C800' },
                    { label: 'Fondo Código', target: '.pija-b8-lg-bot-code', prop: 'background-color', def: '#C8A500' },
                    { label: 'Top Header', target: '.pija-b8-lg-top', prop: 'background-color', def: '#000000' }
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
                    cssString += '#bktplLiveCanvas ' + item.target + ' { ' + item.prop + ': ' + val + ' !important; }\n';
                    cssString += '#btPrintArea ' + item.target + ' { ' + item.prop + ': ' + val + ' !important; }\n';
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

            activeTemplateId: null,
            templates: [
                {
                    id: 'std-5x8',
                    group: 'backtag',
                    name: 'BackTag 5 x 8 cm',
                    description: 'Formato vertical clásico. Texto adaptativo y código de barra inferior. Ideal para exhibidores estándar.',
                    width: '5cm',
                    height: '8cm',
                    css: `
                        .bktag {
                            width: 5cm; height: 8cm; border: 2px solid #000; box-sizing: border-box;
                            position: relative; background: #fff; overflow: hidden;
                            font-family: 'Inter', sans-serif; color: #000;
                        }
                        .bktag-redhead {
                            background: #ff0000; height: 1.25cm; width: 100%; padding: 4px 6px;
                            box-sizing: border-box; display: flex; align-items: center; justify-content: center;
                        }
                        .bktag-redhead span {
                            color: #fff; text-align: center; font-weight: 800; font-size: 13.5px;
                            line-height: 1.15; display: -webkit-box; -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;
                        }
                        .bktag-clave {
                            position: absolute; top: 1.25cm; right: 4px; color: #ff0000;
                            font-weight: 900; font-size: 15px; z-index: 10;
                            text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
                        }
                        .bktag-img {
                            position: absolute; top: 1.25cm; left: 0; right: 0; height: 5.1cm; width: 100%;
                            display: flex; align-items: center; justify-content: center;
                        }
                        .bktag-img img { max-width: 90%; max-height: 90%; object-fit: contain; }
                        .bktag-codigo {
                            position: absolute; bottom: 1.3cm; left: 4px; border: 1.5px solid #000;
                            border-radius: 4px; background: #fff; padding: 2px 5px;
                            font-size: 13px; font-weight: 800; z-index: 10; color: #000;
                        }
                        .bktag-codigo span { color: #ff0000; }
                        .bktag-barcode {
                              position: absolute; bottom: 2px; left: 0; width: 3.2cm;
                              display: flex; justify-content: flex-start;
                          }
                          .bktag-barcode svg { width: 100% !important; height: auto !important; }
                        .bktag-tigre {
                              position: absolute; bottom: 0px; right: -2px; width: 2.3cm; height: auto !important; object-fit: contain !important;
                              opacity: 1 !important; z-index: 11;
                          }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let tigreSrc = 'imagenes/tigre_final.png?v=' + Date.now();
                        let flb = "https://www.truper.com/media/import/imagenes/" + item.p.clave + ".jpg";
                        let nombre = (item.p.nombre || '').toUpperCase();
                        let marca = (item.p.marca || 'TRUPER').toUpperCase();      
                        let headerText = nombre;
                        if(headerText.indexOf(marca) === -1) headerText += ', ' + marca;

                        return `
                        <div class="bktag">
                            <div class="bktag-redhead"><span>${esc(headerText)}</span></div>
                            <div class="bktag-clave">${item.p.clave}</div>
                            <div class="bktag-img"><img src="${imgSrc}" style="transform:scale(1.05);" onerror="this.src='${flb}'"></div>
                            <div class="bktag-codigo">Código: <span>${item.p.codigo}</span></div>
                            <div class="bktag-barcode"><svg id="${idBarcode}"></svg></div>
                            <img class="bktag-tigre" src="${tigreSrc}" onerror="this.src='imagenes/tigre3.png'">
                        </div>`;
                    }
                },
                {
                    id: 'pija-10x4',
                    group: 'pija-fina',
                    name: 'Pija Cuerda Fina (10x4 cm)',
                    description: 'Formato apaisado, incluye extracción automática de grosor y medida y cruz Phillips.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        /* Franja Superior Negra (10x1) */
                        .pija-top { 
                            position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; 
                        }
                        /* Zona Media Verde (7x2) */
                        .pija-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #13a650;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-screw-box {
                            width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-text-col {
                            width: 6cm; height: 2cm; display: flex; flex-direction: column;
                        }
                        /* Caja Subtitulo: 6x0.5 */
                        .pija-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        /* Caja Titulo: 6x1.5 */
                        .pija-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-title-box.normal { font-size: 48px; }
                        .pija-title-box.small { font-size: 34px; letter-spacing: -1px; }

                        /* Zona Inferior (7x1) */
                        .pija-bot {
                            position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5;
                        }
                        .pija-bot-code {
                            width: 3.5cm; background: #1e5a26; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        /* Zona Imagen Derecha (3x3) Blanca */
                        .pija-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-phillips { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let cruzSvg = '<svg viewBox="0 0 100 100" class="pija-phillips"><circle cx="50" cy="50" r="45" fill="#000"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#fff" stroke-width="20" stroke-linecap="square"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-bktag">
                            <div class="pija-top"></div>
                            
                            <div class="pija-mid">
                                <div class="pija-screw-box">
                                    <img src="imagenes/pija_blanca.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-text-col">
                                    <div class="pija-subtitle-box">CUERDA FINA</div>
                                    <div class="pija-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-bot">
                                <div class="pija-bot-code">${item.p.codigo}</div>
                                <div class="pija-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-img-area">
                                ${cruzSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-abierta-10x4',
                    group: 'pija-abierta',
                    name: 'Pija Cuerda Abierta (10x4 cm)',
                    description: 'Formato apaisado, incluye extracción automática de grosor y medida y cruz Phillips. Cuerda abierta.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-ab-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        /* Franja Superior Negra (10x1) */
                        .pija-ab-top { 
                            position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; 
                        }
                        /* Zona Media Verde (7x2) */
                        .pija-ab-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #1b5e30;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-ab-screw-box {
                            width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-ab-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-ab-text-col {
                            width: 6cm; height: 2cm; display: flex; flex-direction: column;
                        }
                        /* Caja Subtitulo: 6x0.5 */
                        .pija-ab-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        /* Caja Titulo: 6x1.5 */
                        .pija-ab-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-ab-title-box.normal { font-size: 48px; }
                        .pija-ab-title-box.small { font-size: 34px; letter-spacing: -1px; }

                        /* Zona Inferior (7x1) */
                        .pija-ab-bot {
                            position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5;
                        }
                        .pija-ab-bot-code {
                            width: 3.5cm; background: #0d3318; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-ab-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        /* Zona Imagen Derecha (3x3) Blanca */
                        .pija-ab-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-ab-phillips { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-ab-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let cruzSvg = '<svg viewBox="0 0 100 100" class="pija-ab-phillips"><circle cx="50" cy="50" r="45" fill="#000"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#fff" stroke-width="20" stroke-linecap="square"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-ab-bktag">
                            <div class="pija-ab-top"></div>
                            
                            <div class="pija-ab-mid">
                                <div class="pija-ab-screw-box">
                                    <img src="imagenes/rosca_abierta.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-ab-text-col">
                                    <div class="pija-ab-subtitle-box">CUERDA ABIERTA</div>
                                    <div class="pija-ab-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-ab-bot">
                                <div class="pija-ab-bot-code">${item.p.codigo}</div>
                                <div class="pija-ab-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-ab-img-area">
                                ${cruzSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-fina-12x6',
                    group: 'pija-fina',
                    name: 'Pija Cuerda Fina (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida y cruz Phillips. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-lg-top { 
                            position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; 
                        }
                        .pija-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #13a650;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-lg-screw-box {
                            width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-lg-text-col {
                            width: 7.2cm; height: 3cm; display: flex; flex-direction: column;
                        }
                        .pija-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-lg-title-box.normal { font-size: 58px; }
                        .pija-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }

                        .pija-lg-bot {
                            position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5;
                        }
                        .pija-lg-bot-code {
                            width: 4.2cm; background: #1e5a26; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-lg-phillips { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let cruzSvg = '<svg viewBox="0 0 100 100" class="pija-lg-phillips"><circle cx="50" cy="50" r="45" fill="#000"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#fff" stroke-width="20" stroke-linecap="square"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-lg-bktag">
                            <div class="pija-lg-top"></div>
                            
                            <div class="pija-lg-mid">
                                <div class="pija-lg-screw-box">
                                    <img src="imagenes/pija_blanca.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-lg-text-col">
                                    <div class="pija-lg-subtitle-box">CUERDA FINA</div>
                                    <div class="pija-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-lg-bot">
                                <div class="pija-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-lg-img-area">
                                ${cruzSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-abierta-12x6',
                    group: 'pija-abierta',
                    name: 'Pija Cuerda Abierta (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida y cruz Phillips. Cuerda abierta. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-ab-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-ab-lg-top { 
                            position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; 
                        }
                        .pija-ab-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #1b5e30;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-ab-lg-screw-box {
                            width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-ab-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-ab-lg-text-col {
                            width: 7.2cm; height: 3cm; display: flex; flex-direction: column;
                        }
                        .pija-ab-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-ab-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-ab-lg-title-box.normal { font-size: 58px; }
                        .pija-ab-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }

                        .pija-ab-lg-bot {
                            position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5;
                        }
                        .pija-ab-lg-bot-code {
                            width: 4.2cm; background: #0d3318; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-ab-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-ab-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-ab-lg-phillips { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-ab-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let cruzSvg = '<svg viewBox="0 0 100 100" class="pija-ab-lg-phillips"><circle cx="50" cy="50" r="45" fill="#000"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#fff" stroke-width="20" stroke-linecap="square"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-ab-lg-bktag">
                            <div class="pija-ab-lg-top"></div>
                            
                            <div class="pija-ab-lg-mid">
                                <div class="pija-ab-lg-screw-box">
                                    <img src="imagenes/rosca_abierta.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-ab-lg-text-col">
                                    <div class="pija-ab-lg-subtitle-box">CUERDA ABIERTA</div>
                                    <div class="pija-ab-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-ab-lg-bot">
                                <div class="pija-ab-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-ab-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-ab-lg-img-area">
                                ${cruzSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-lamina-10x4',
                    group: 'pija-lamina',
                    name: 'Pija Para Lámina (10x4 cm)',
                    description: 'Formato apaisado, extracción automática de grosor y medida. Tornillo de ranura.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-lam-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-lam-top { 
                            position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; 
                        }
                        .pija-lam-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #56B4E9;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-lam-screw-box {
                            width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-lam-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-lam-text-col {
                            width: 6cm; height: 2cm; display: flex; flex-direction: column;
                        }
                        .pija-lam-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 11px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-lam-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-lam-title-box.normal { font-size: 48px; }
                        .pija-lam-title-box.small { font-size: 34px; letter-spacing: -1px; }

                        .pija-lam-bot {
                            position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5;
                        }
                        .pija-lam-bot-code {
                            width: 3.5cm; background: #1A6B8A; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-lam-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-lam-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-lam-slothead { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-lam-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let slotSvg = '<svg viewBox="0 0 100 100" class="pija-lam-slothead"><circle cx="50" cy="50" r="45" fill="#000"/><rect x="0" y="35" width="100" height="30" fill="#fff"/><rect x="37" y="18" width="26" height="64" fill="#fff"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-lam-bktag">
                            <div class="pija-lam-top"></div>
                            
                            <div class="pija-lam-mid">
                                <div class="pija-lam-screw-box">
                                    <img src="imagenes/pija_lamina.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-lam-text-col">
                                    <div class="pija-lam-subtitle-box">PIJA PARA LÁMINA</div>
                                    <div class="pija-lam-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-lam-bot">
                                <div class="pija-lam-bot-code">${item.p.codigo}</div>
                                <div class="pija-lam-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-lam-img-area">
                                ${slotSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-lamina-12x6',
                    group: 'pija-lamina',
                    name: 'Pija Para Lámina (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida. Tornillo de ranura. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-lam-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-lam-lg-top { 
                            position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; 
                        }
                        .pija-lam-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #56B4E9;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-lam-lg-screw-box {
                            width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-lam-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-lam-lg-text-col {
                            width: 7.2cm; height: 3cm; display: flex; flex-direction: column;
                        }
                        .pija-lam-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 14px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-lam-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-lam-lg-title-box.normal { font-size: 58px; }
                        .pija-lam-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }

                        .pija-lam-lg-bot {
                            position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5;
                        }
                        .pija-lam-lg-bot-code {
                            width: 4.2cm; background: #1A6B8A; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-lam-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-lam-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-lam-lg-slothead { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-lam-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let slotSvg = '<svg viewBox="0 0 100 100" class="pija-lam-lg-slothead"><circle cx="50" cy="50" r="45" fill="#000"/><rect x="0" y="35" width="100" height="30" fill="#fff"/><rect x="37" y="18" width="26" height="64" fill="#fff"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-lam-lg-bktag">
                            <div class="pija-lam-lg-top"></div>
                            
                            <div class="pija-lam-lg-mid">
                                <div class="pija-lam-lg-screw-box">
                                    <img src="imagenes/pija_lamina.png?v=${Date.now()}" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-lam-lg-text-col">
                                    <div class="pija-lam-lg-subtitle-box">PIJA PARA LÁMINA</div>
                                    <div class="pija-lam-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-lam-lg-bot">
                                <div class="pija-lam-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-lam-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-lam-lg-img-area">
                                ${slotSvg}
                                <img src="${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'lamina-hex-10x4',
                    group: 'lamina-hex',
                    name: 'Lámina Cabeza Hexagonal (10x4 cm)',
                    description: 'Formato apaisado, extracción automática de grosor y medida. Cabeza hexagonal.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-hex-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-hex-top { 
                            position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; 
                        }
                        .pija-hex-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #1890C4;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-hex-screw-box {
                            width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-hex-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-hex-text-col {
                            width: 6cm; height: 2cm; display: flex; flex-direction: column;
                        }
                        .pija-hex-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 10px; font-weight: 800; color: #fff; letter-spacing: 0.3px;
                        }
                        .pija-hex-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-hex-title-box.normal { font-size: 48px; }
                        .pija-hex-title-box.small { font-size: 34px; letter-spacing: -1px; }

                        .pija-hex-bot {
                            position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5;
                        }
                        .pija-hex-bot-code {
                            width: 3.5cm; background: #0D5A75; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-hex-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-hex-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-hex-symbol { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-hex-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let hexSvg = '<svg viewBox="0 0 100 100" class="pija-hex-symbol"><polygon points="50,3 97,27 97,73 50,97 3,73 3,27" fill="#000"/><circle cx="50" cy="50" r="35" fill="#fff"/><circle cx="50" cy="50" r="27" fill="#000"/><rect x="5" y="45" width="90" height="10" fill="#fff"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-hex-bktag">
                            <div class="pija-hex-top"></div>
                            
                            <div class="pija-hex-mid">
                                <div class="pija-hex-screw-box">
                                    <img src="imagenes/lamina_hexagonal.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-hex-text-col">
                                    <div class="pija-hex-subtitle-box">LÁMINA CABEZA HEXAGONAL</div>
                                    <div class="pija-hex-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-hex-bot">
                                <div class="pija-hex-bot-code">${item.p.codigo}</div>
                                <div class="pija-hex-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-hex-img-area">
                                ${hexSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'lamina-hex-12x6',
                    group: 'lamina-hex',
                    name: 'Lámina Cabeza Hexagonal (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida. Cabeza hexagonal. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-hex-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .pija-hex-lg-top { 
                            position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; 
                        }
                        .pija-hex-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #1890C4;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-hex-lg-screw-box {
                            width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end;
                        }
                        .pija-hex-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        
                        .pija-hex-lg-text-col {
                            width: 7.2cm; height: 3cm; display: flex; flex-direction: column;
                        }
                        .pija-hex-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.3px;
                        }
                        .pija-hex-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-hex-lg-title-box.normal { font-size: 58px; }
                        .pija-hex-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }

                        .pija-hex-lg-bot {
                            position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5;
                        }
                        .pija-hex-lg-bot-code {
                            width: 4.2cm; background: #0D5A75; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-hex-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }

                        .pija-hex-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-hex-lg-symbol { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-hex-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let hexSvg = '<svg viewBox="0 0 100 100" class="pija-hex-lg-symbol"><polygon points="50,3 97,27 97,73 50,97 3,73 3,27" fill="#000"/><circle cx="50" cy="50" r="35" fill="#fff"/><circle cx="50" cy="50" r="27" fill="#000"/><rect x="5" y="45" width="90" height="10" fill="#fff"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-hex-lg-bktag">
                            <div class="pija-hex-lg-top"></div>
                            
                            <div class="pija-hex-lg-mid">
                                <div class="pija-hex-lg-screw-box">
                                    <img src="imagenes/lamina_hexagonal.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-hex-lg-text-col">
                                    <div class="pija-hex-lg-subtitle-box">LÁMINA CABEZA HEXAGONAL</div>
                                    <div class="pija-hex-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-hex-lg-bot">
                                <div class="pija-hex-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-hex-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-hex-lg-img-area">
                                ${hexSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-broca-10x4',
                    group: 'pija-broca',
                    name: 'Pija Punta de Broca (10x4 cm)',
                    description: 'Formato apaisado, extracción automática de grosor y medida. Punta de broca.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-broca-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;
                        }
                        .pija-broca-top { position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; }
                        .pija-broca-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #FF0090;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-broca-screw-box { width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end; }
                        .pija-broca-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        .pija-broca-text-col { width: 6cm; height: 2cm; display: flex; flex-direction: column; }
                        .pija-broca-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-broca-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-broca-title-box.normal { font-size: 48px; }
                        .pija-broca-title-box.small { font-size: 34px; letter-spacing: -1px; }
                        .pija-broca-bot { position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5; }
                        .pija-broca-bot-code {
                            width: 3.5cm; background: #900060; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-broca-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }
                        .pija-broca-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-broca-symbol { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-broca-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let brocaSvg = '<svg viewBox="0 0 100 100" class="pija-broca-symbol"><polygon points="50,3 97,27 97,73 50,97 3,73 3,27" fill="#000"/><circle cx="50" cy="50" r="35" fill="#fff"/><circle cx="50" cy="50" r="27" fill="#000"/></svg>';
                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-broca-bktag">
                            <div class="pija-broca-top"></div>
                            <div class="pija-broca-mid">
                                <div class="pija-broca-screw-box">
                                    <img src="imagenes/pija_broca.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-broca-text-col">
                                    <div class="pija-broca-subtitle-box">PUNTA DE BROCA</div>
                                    <div class="pija-broca-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            <div class="pija-broca-bot">
                                <div class="pija-broca-bot-code">${item.p.codigo}</div>
                                <div class="pija-broca-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            <div class="pija-broca-img-area">
                                ${brocaSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'pija-broca-12x6',
                    group: 'pija-broca',
                    name: 'Pija Punta de Broca (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida. Punta de broca. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-broca-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;
                        }
                        .pija-broca-lg-top { position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; }
                        .pija-broca-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #FF0090;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-broca-lg-screw-box { width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end; }
                        .pija-broca-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        .pija-broca-lg-text-col { width: 7.2cm; height: 3cm; display: flex; flex-direction: column; }
                        .pija-broca-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-broca-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-broca-lg-title-box.normal { font-size: 58px; }
                        .pija-broca-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }
                        .pija-broca-lg-bot { position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5; }
                        .pija-broca-lg-bot-code {
                            width: 4.2cm; background: #900060; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-broca-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }
                        .pija-broca-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-broca-lg-symbol { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-broca-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let brocaSvg = '<svg viewBox="0 0 100 100" class="pija-broca-lg-symbol"><polygon points="50,3 97,27 97,73 50,97 3,73 3,27" fill="#000"/><circle cx="50" cy="50" r="35" fill="#fff"/><circle cx="50" cy="50" r="27" fill="#000"/></svg>';
                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-broca-lg-bktag">
                            <div class="pija-broca-lg-top"></div>
                            <div class="pija-broca-lg-mid">
                                <div class="pija-broca-lg-screw-box">
                                    <img src="imagenes/pija_broca.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-broca-lg-text-col">
                                    <div class="pija-broca-lg-subtitle-box">PUNTA DE BROCA</div>
                                    <div class="pija-broca-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            <div class="pija-broca-lg-bot">
                                <div class="pija-broca-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-broca-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            <div class="pija-broca-lg-img-area">
                                ${brocaSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'broca8-10x4',
                    group: 'broca8',
                    name: 'Punta de Broca #8 (10x4 cm)',
                    description: 'Formato apaisado, extracción automática de grosor y medida. Punta de broca #8.',
                    width: '10cm',
                    height: '4cm',
                    css: `
                        .pija-b8-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;
                        }
                        .pija-b8-top { position: absolute; top:0; left:0; width: 10cm; height: 1cm; background: #000; z-index: 10; }
                        .pija-b8-mid {
                            position: absolute; top: 1cm; left: 0; width: 7cm; height: 2cm; background: #F0C800;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-b8-screw-box { width: 1cm; height: 2cm; display: flex; align-items: center; justify-content: flex-end; }
                        .pija-b8-screw-box img { max-height: 1.8cm; max-width: 100%; object-fit: contain; }
                        .pija-b8-text-col { width: 6cm; height: 2cm; display: flex; flex-direction: column; }
                        .pija-b8-subtitle-box {
                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-b8-title-box {
                            width: 6cm; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-b8-title-box.normal { font-size: 48px; }
                        .pija-b8-title-box.small { font-size: 34px; letter-spacing: -1px; }
                        .pija-b8-bot { position: absolute; top: 3cm; left: 0; width: 7cm; height: 1cm; display: flex; z-index: 5; }
                        .pija-b8-bot-code {
                            width: 3.5cm; background: #C8A500; height: 1cm; display: flex; align-items: center; justify-content: center;
                            font-size: 36px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-b8-bot-br {
                            width: 3.5cm; background: #fff; height: 1cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }
                        .pija-b8-img-area {
                            position: absolute; top: 1cm; right: 0; width: 3cm; height: 3cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-b8-symbol { position: absolute; right: 0.1cm; top: 0.1cm; width: 0.6cm; height: 0.6cm; z-index:10; }
                        .pija-b8-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let pSvg = '<svg viewBox="0 0 100 100" class="pija-b8-symbol"><circle cx="50" cy="50" r="45" fill="#000"/><rect x="20" y="38" width="60" height="24" fill="#fff"/><rect x="38" y="15" width="24" height="70" fill="#fff"/></svg>';
                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-b8-bktag">
                            <div class="pija-b8-top"></div>
                            <div class="pija-b8-mid">
                                <div class="pija-b8-screw-box">
                                    <img src="imagenes/broca.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-b8-text-col">
                                    <div class="pija-b8-subtitle-box">PUNTA DE BROCA</div>
                                    <div class="pija-b8-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            <div class="pija-b8-bot">
                                <div class="pija-b8-bot-code">${item.p.codigo}</div>
                                <div class="pija-b8-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            <div class="pija-b8-img-area">
                                ${pSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                },
                {
                    id: 'broca8-12x6',
                    group: 'broca8',
                    name: 'Punta de Broca #8 (12x6 cm)',
                    description: 'Formato apaisado GRANDE. Extracción automática de grosor y medida. Punta de broca #8. Escala 120%.',
                    width: '12cm',
                    height: '6cm',
                    css: `
                        .pija-b8-lg-bktag {
                            width: 12cm; height: 6cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;
                        }
                        .pija-b8-lg-top { position: absolute; top:0; left:0; width: 12cm; height: 1.5cm; background: #000; z-index: 10; }
                        .pija-b8-lg-mid {
                            position: absolute; top: 1.5cm; left: 0; width: 8.4cm; height: 3cm; background: #F0C800;
                            display: flex; overflow: hidden; z-index: 5;
                        }
                        .pija-b8-lg-screw-box { width: 1.2cm; height: 3cm; display: flex; align-items: center; justify-content: flex-end; }
                        .pija-b8-lg-screw-box img { max-height: 2.7cm; max-width: 100%; object-fit: contain; }
                        .pija-b8-lg-text-col { width: 7.2cm; height: 3cm; display: flex; flex-direction: column; }
                        .pija-b8-lg-subtitle-box {
                            width: 7.2cm; height: 0.75cm; display: flex; align-items: center; justify-content: center;
                            font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 0.5px;
                        }
                        .pija-b8-lg-title-box {
                            width: 7.2cm; height: 2.25cm; display: flex; align-items: center; justify-content: center;
                            color: #fff; white-space: nowrap; font-weight: 900; letter-spacing: -1.5px;
                        }
                        .pija-b8-lg-title-box.normal { font-size: 58px; }
                        .pija-b8-lg-title-box.small { font-size: 41px; letter-spacing: -1px; }
                        .pija-b8-lg-bot { position: absolute; top: 4.5cm; left: 0; width: 8.4cm; height: 1.5cm; display: flex; z-index: 5; }
                        .pija-b8-lg-bot-code {
                            width: 4.2cm; background: #C8A500; height: 1.5cm; display: flex; align-items: center; justify-content: center;
                            font-size: 43px; font-weight: 900; color: #fff; padding-bottom: 2px; box-sizing: border-box;
                        }
                        .pija-b8-lg-bot-br {
                            width: 4.2cm; background: #fff; height: 1.5cm; display: flex; align-items: flex-end; justify-content: center;
                            overflow: hidden; padding-bottom: 2px; box-sizing: border-box; border-top: 1px solid #fff;
                        }
                        .pija-b8-lg-img-area {
                            position: absolute; top: 1.5cm; right: 0; width: 3.6cm; height: 4.5cm; background: #fff;
                            display: flex; align-items: center; justify-content: center; z-index: 5; border-left: 1px solid rgba(0,0,0,0.1);
                        }
                        .pija-b8-lg-symbol { position: absolute; right: 0.12cm; top: 0.12cm; width: 0.72cm; height: 0.72cm; z-index:10; }
                        .pija-b8-lg-img-area img { max-width: 95%; max-height: 95%; object-fit: contain; }
                    `,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\s*|NUM\.\s*|NÚM\.\s*)(\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\d+(?:-\d+\/\d+|\/\d+)?\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\s+/g,'');
                        
                        let pSvg = '<svg viewBox="0 0 100 100" class="pija-b8-lg-symbol"><circle cx="50" cy="50" r="45" fill="#000"/><rect x="20" y="38" width="60" height="24" fill="#fff"/><rect x="38" y="15" width="24" height="70" fill="#fff"/></svg>';
                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return `
                        <div class="pija-b8-lg-bktag">
                            <div class="pija-b8-lg-top"></div>
                            <div class="pija-b8-lg-mid">
                                <div class="pija-b8-lg-screw-box">
                                    <img src="imagenes/broca.png?v=${Date.now()}" onerror="this.style.display=\'none\'">
                                </div>
                                <div class="pija-b8-lg-text-col">
                                    <div class="pija-b8-lg-subtitle-box">PUNTA DE BROCA</div>
                                    <div class="pija-b8-lg-title-box ${sizeClass}">${fullText}</div>
                                </div>
                            </div>
                            <div class="pija-b8-lg-bot">
                                <div class="pija-b8-lg-bot-code">${item.p.codigo}</div>
                                <div class="pija-b8-lg-bot-br"><svg id="${idBarcode}"></svg></div>
                            </div>
                            <div class="pija-b8-lg-img-area">
                                ${pSvg}
                                <img src="${imgSrc}" onerror="this.style.display=\'none\'">
                            </div>
                        </div>`;
                    }
                }
            ],
            
            initUI() {
                const listEl = document.getElementById('bktplList');
                listEl.innerHTML = '';
                
                // Agrupar plantillas por familia
                const groups = [];
                const groupMap = {};
                this.templates.forEach(t => {
                    const g = t.group || t.id;
                    if(!groupMap[g]) {
                        groupMap[g] = { key: g, variants: [] };
                        groups.push(groupMap[g]);
                    }
                    groupMap[g].variants.push(t);
                });
                
                let isFirst = true;
                groups.forEach(group => {
                    const first = group.variants[0];
                    const hasMultiple = group.variants.length > 1;
                    
                    // Nombre base sin el tamaño
                    let baseName = first.name.replace(/\s*\(.*?\)\s*/g, '').trim();
                    if(!hasMultiple) baseName = first.name;
                    
                    let div = document.createElement('div');
                    div.className = 'bktpl-item' + (isFirst ? ' active' : '');
                    div.dataset.group = group.key;
                    
                    let sizeBtns = '';
                    if(hasMultiple) {
                        sizeBtns = '<div class="bktpl-size-row">';
                        group.variants.forEach((v, vi) => {
                            const sizeLabel = v.width + ' x ' + v.height;
                            const activeClass = vi === 0 ? ' bktpl-size-active' : '';
                            sizeBtns += '<button class="bktpl-size-btn' + activeClass + '" data-tpl-id="' + v.id + '" onclick="event.stopPropagation(); window.bkGallery.selectVariant(this, \'' + v.id + '\')">' + sizeLabel + '</button>';
                        });
                        sizeBtns += '</div>';
                    }
                    
                    div.innerHTML = '<div class="bktpl-item-title">' + baseName + '</div>' +
                                    '<div class="bktpl-item-desc">' + first.description + '</div>' +
                                    sizeBtns;
                    
                    div.onclick = () => {
                        document.querySelectorAll('.bktpl-item').forEach(e => e.classList.remove('active'));
                        div.classList.add('active');
                        // Seleccionar la variante activa dentro de este grupo
                        const activeBtn = div.querySelector('.bktpl-size-active');
                        const tplId = activeBtn ? activeBtn.dataset.tplId : first.id;
                        this.selectTemplate(tplId);
                    };
                    listEl.appendChild(div);
                    
                    if(isFirst) this.selectTemplate(first.id);
                    isFirst = false;
                });
            },
            
            selectVariant(btn, tplId) {
                // Activar el grupo padre
                const groupItem = btn.closest('.bktpl-item');
                document.querySelectorAll('.bktpl-item').forEach(e => e.classList.remove('active'));
                groupItem.classList.add('active');
                
                // Activar el botón de tamaño
                groupItem.querySelectorAll('.bktpl-size-btn').forEach(b => b.classList.remove('bktpl-size-active'));
                btn.classList.add('bktpl-size-active');
                
                // Actualizar descripción
                const tpl = this.templates.find(t => t.id === tplId);
                if(tpl) {
                    const descEl = groupItem.querySelector('.bktpl-item-desc');
                    if(descEl) descEl.textContent = tpl.description;
                }
                
                this.selectTemplate(tplId);
            },

            selectTemplate(id) {
                this.activeTemplateId = id;
                const tpl = this.templates.find(t => t.id === id);
                if(!tpl) return;
                
                document.getElementById('bktplPreviewDims').innerText = `Tamaño Físico: ${tpl.width} x ${tpl.height}`;
                
                if(typeof btList !== 'undefined' && btList && btList.length > 0) {
                    const sample = btList[0];
                    let img = sample.p.imagenes && sample.p.imagenes.length ? sample.p.imagenes[0] : '';
                    if(!img) img = sample.p.imagenes_local && sample.p.imagenes_local.length ? sample.p.imagenes_local[0] : '';
                    let baseSrc = img;
                    let imgSrc = baseSrc;
                    if(baseSrc && baseSrc.indexOf('http') === 0) {
                        imgSrc = 'https://wsrv.nl/?url=' + encodeURIComponent(baseSrc) + '&w=400&trim=12';
                    }
                    let ean = sample.p.ean ? sample.p.ean : ('10' + sample.p.codigo);
                    let idBarcode = 'bktpl-preview-barcode';
                    
                    const canvas = document.getElementById('bktplLiveCanvas');
                    canvas.innerHTML = '<style>' + tpl.css + '</style>' + tpl.render(sample, ean, imgSrc, idBarcode);
                    
                    const bk = canvas.querySelector('.bktag'); if(bk) bk.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
                    if(bk) bk.style.margin = "0 auto";
                    
                    setTimeout(() => {
                        if(window.JsBarcode) {
                            JsBarcode("#"+idBarcode, ean, {
                                format: "CODE128", displayValue: true, fontSize: 13, fontOptions: "bold",
                                textMargin: 1, textPosition: "bottom", textAlign: "center", margin: 0, height: 26, width: 1.5
                            });
                        }
                    }, 50);
                } else {
                    document.getElementById('bktplLiveCanvas').innerHTML = '<div style="color:#64748b; text-align:center; padding:20px;">Escanea al menos un producto en tu mesa de trabajo para ver la previsualización.</div>';
                }
            },

            openModal() {
                if(typeof btList !== 'undefined' && !btList.length) {
                    alert("Por favor, agrega productos primero a tu listado."); return;
                }
                this.initUI();
                document.getElementById('bktplModalWrap').style.display = 'flex';
            },
            
            closeModal() {
                document.getElementById('bktplModalWrap').style.display = 'none';
            },

            triggerPrint() {
                const tpl = this.templates.find(t => t.id === this.activeTemplateId);
                if(!tpl || typeof btList === 'undefined') return;
                
                const btn = document.getElementById('bktplPrintBtn');
                const oldText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando...';
                
                const printArea = document.getElementById('btPrintArea');
                
                    // Calculate columns perfectly based on 20cm usable A4 width
                    
                      // Override CSS Grid safely with Flexbox Wrapper to avoid Chrome multi-page grid stretching 
                      printArea.style.setProperty('display', 'flex', 'important');
                      printArea.style.setProperty('flex-wrap', 'wrap', 'important');
                      printArea.style.setProperty('justify-content', 'center', 'important');
                      printArea.style.setProperty('gap', '2mm', 'important');
                      
                      printArea.innerHTML = '<style>@media print { .bt-print-container > div { flex: 0 0 ' + tpl.width + ' !important; min-width: 0 !important; max-width: ' + tpl.width + ' !important; overflow: hidden !important; } .bt-print-container svg { max-width: 100% !important; height: auto !important; } } ' + tpl.css + '</style>';\n                      this.applyColorOverrides();

                
                btList.forEach(item => {
                    for(let i=0; i<item.qty; i++) {
                        let img = item.p.imagenes && item.p.imagenes.length ? item.p.imagenes[0] : '';
                        if(!img) img = item.p.imagenes_local && item.p.imagenes_local.length ? item.p.imagenes_local[0] : '';
                        
                        let baseSrc = img;
                        let imgSrc = baseSrc;
                        if(baseSrc && baseSrc.indexOf('http') === 0) {
                            imgSrc = 'https://wsrv.nl/?url=' + encodeURIComponent(baseSrc) + '&w=400&trim=12';
                        }
                        
                        let ean = item.p.ean ? item.p.ean : ('10' + item.p.codigo);
                        let idBarcode = 'barcode-' + Math.random().toString(36).substr(2, 9);
                        
                        printArea.insertAdjacentHTML('beforeend', tpl.render(item, ean, imgSrc, idBarcode));
                        
                        setTimeout(() => {
                            if(window.JsBarcode) {
                                JsBarcode("#"+idBarcode, ean, {
                                    format: "CODE128", displayValue: true, fontSize: 13, fontOptions: "bold",
                                    textMargin: 1, textPosition: "bottom", textAlign: "center", margin: 0, height: 26, width: 1.5
                                });
                            }
                        }, 50);
                    }
                });

                setTimeout(() => {
                    btn.innerHTML = oldText;
                    this.closeModal();
                    window.print();

                    setTimeout(() => {
                        if (window.Swal) {
                            Swal.fire({
                                title: '¿Impresión procesada?',
                                text: "¿Deseas vaciar la mesa de trabajo para escanear nuevos productos?",
                                icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#475569',
                                confirmButtonText: 'Sí, vaciar mesa', cancelButtonText: 'No, conservarlos'
                            }).then((result) => {
                                if (result.isConfirmed && typeof window.clearAllBt === 'function') window.clearAllBt();
                            });
                        }
                    }, 1000);
                }, 3000);
            }
        };

        // Sobrescribir llamada legacy
        window.printBackTags = function() {
            window.bkGallery.openModal();
        };
    
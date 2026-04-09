const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

let startStr = `id: 'pija-10x4'`;
let startIdx = txt.indexOf(startStr);
let endStr = `            ],`;
let endIdx = txt.indexOf(endStr, startIdx);

if(startIdx !== -1 && endIdx !== -1) {
    let cutStart = txt.lastIndexOf('{', startIdx);
    let before = txt.substring(0, cutStart);
    let after = txt.substring(endIdx);
    
    let newTpl = `{
                    id: 'pija-10x4',
                    name: 'Pija Cuerda Fina (10x4 cm)',
                    description: 'Formato apaisado, incluye extracción automática de grosor y medida y cruz Phillips.',
                    width: '10cm',
                    height: '4cm',
                    css: \`
                        .pija-bktag {
                            width: 10cm; height: 4cm; box-sizing: border-box; background: #fff;
                            position: relative; overflow: hidden; font-family: 'Helvetica', Arial, sans-serif;
                            border: 1px dashed #000;
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
                            width: 6cm; height: 0.5cm; display: flex; align-items: flex-end; justify-content: center;
                            font-size: 15px; font-weight: 700; color: #fff; padding-bottom: 2px; box-sizing: border-box;
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
                    \`,
                    render: function(item, ean, imgSrc, idBarcode) {
                        let combined = ((item.p.nombre||'') + " " + (item.p.especificaciones ? Object.values(item.p.especificaciones).join(' ') : '')).toUpperCase();
                        let grosor = "#?";
                        let matchG = combined.match(/(?:#|NÚMERO\\s*|NUM\\.\\s*|NÚM\\.\\s*)(\\d+)/i);
                        if(matchG) grosor = "#" + matchG[1];
                        let largo = '??"';
                        let matchL = combined.match(/(\\d+(?:-\\d+\\/\\d+|\\/\\d+)?\\s*(?:"|''|PULG|IN))/i);
                        if(matchL) largo = matchL[1].replace(/''/g, '"').replace(/\\s+/g,'');
                        
                        let cruzSvg = '<svg viewBox="0 0 100 100" class="pija-phillips"><circle cx="50" cy="50" r="45" fill="#000"/><path d="M50 20 L50 80 M20 50 L80 50" stroke="#fff" stroke-width="20" stroke-linecap="square"/></svg>';

                        let fullText = grosor + " x " + largo;
                        let sizeClass = fullText.length > 10 ? 'small' : 'normal';

                        return \`
                        <div class="pija-bktag">
                            <div class="pija-top"></div>
                            
                            <div class="pija-mid">
                                <div class="pija-screw-box">
                                    <img src="images/pija_blanca.png" onerror="this.style.display='none'">
                                </div>
                                <div class="pija-text-col">
                                    <div class="pija-subtitle-box">CUERDA FINA</div>
                                    <div class="pija-title-box \${sizeClass}">\${fullText}</div>
                                </div>
                            </div>
                            
                            <div class="pija-bot">
                                <div class="pija-bot-code">\${item.p.codigo}</div>
                                <div class="pija-bot-br"><svg id="\${idBarcode}"></svg></div>
                            </div>
                            
                            <div class="pija-img-area">
                                \${cruzSvg}
                                <img src="\${imgSrc}" onerror="this.style.display='none'">
                            </div>
                        </div>\`;
                    }
                }
`;
    fs.writeFileSync('index.html', before + newTpl + after, 'utf8');
}

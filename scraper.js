const fs = require('fs');
const { parse } = require('node-html-parser');

// ============================================================================
// CONFIGURACIÓN (CLI: node scraper.js [--start N] [--end N] [--resume] [--concurrency N])
// ============================================================================
const CSV_PATH = './catalogo.csv';
const OUTPUT_PATH = './productos_truper.json';
const BASE_URL = 'https://www.truper.com/ficha_tecnica/controllers/index.php';
const API_URL = 'https://www.truper.com/ficha_tecnica/findProductsCod';
const TRUPER_BASE = 'https://www.truper.com';
const DELAY_MS = 500;
const SAVE_EVERY = 25;

// Args CLI
const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf('--' + name);
  return idx >= 0 && args[idx + 1] ? parseInt(args[idx + 1]) : def;
}
const START = getArg('start', 0);
const END = getArg('end', Infinity);
const CONCURRENCY = getArg('concurrency', 3);
const RESUME = args.includes('--resume');

// ============================================================================
// UTILITIES
// ============================================================================
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function resolveUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.replace(/__DIR__\/(\.\.\/)*/g, `${TRUPER_BASE}/`);
  url = url.replace(/([^:])\/\//g, '$1/');
  if (!url.startsWith('http')) url = `${TRUPER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  return url;
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ').replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

function cleanText(str) { return decodeEntities(str).replace(/\s+/g, ' ').trim(); }

// ============================================================================
// FETCH
// ============================================================================
async function fetchWithRetry(url, options = {}, retries = 5) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-MX,es;q=0.9'
  };
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
      const response = await fetch(url, {
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        method: options.method || 'GET',
        body: options.body || undefined,
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (err) {
      if (attempt < retries) {
        const wait = Math.min(2000 * Math.pow(1.5, attempt), 15000);
        console.log(`  ⚠ Intento ${attempt}/${retries}: ${err.message} (espera ${(wait / 1000).toFixed(0)}s)`);
        await sleep(wait);
      } else throw err;
    }
  }
}

// ============================================================================
// READ CSV
// ============================================================================
function readCatalogCSV(filePath) {
  const data = fs.readFileSync(filePath, 'latin1');
  const products = [];
  const regex = /^(\d{4,}),([^,]+),(.*)/gm;
  let match;
  while ((match = regex.exec(data)) !== null) {
    products.push({
      codigo: match[1].trim(),
      clave: match[2].trim(),
      descripcion_csv: match[3].replace(/^"|"$/g, '').trim()
    });
  }
  return products;
}

// ============================================================================
// FAMILY PRODUCT HELPERS
// ============================================================================
function isFamilyProduct(html) {
  return html.includes('id="select_hijos"');
}

function extractCSRFToken(html) {
  const match = html.match(/csrf-token.*?content="([^"]+)"/);
  return match ? match[1] : null;
}

async function fetchIndividualProduct(codigo, csrfToken, cookies) {
  console.log(`  🔄 Producto familia: llamando API para código ${codigo}...`);
  const resp = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
      'Cookie': cookies,
      'Referer': 'https://www.truper.com/ficha_tecnica/'
    },
    body: JSON.stringify({ producto: codigo })
  });
  const text = await resp.text();
  const fragments = JSON.parse(text);
  const combinedHtml = `<div id="desktop"><div id="informacion_prod">${fragments[0]}${fragments[1]}</div><div id="especs_mas_producto">${fragments[2]}</div></div>`;
  return combinedHtml;
}

// ============================================================================
// EXTRACT CATALOG PAGE NUMBER
// ============================================================================
function extractCatalogPage(url) {
  if (!url) return null;
  // Pattern: -142.html or -142.html#image-4
  const match = url.match(/-(\d+)\.html/);
  return match ? parseInt(match[1]) : null;
}

// ============================================================================
// PARSE PRODUCT HTML (ENHANCED v4)
// ============================================================================
function parseProductPage(html, codigo, clave) {
  const root = parse(html);
  const desktopSection = root.querySelector('#desktop') || root;

  // --- Nombre ---
  const titleEl = desktopSection.querySelector('.tamanio_text_titulo p.text-break') ||
    desktopSection.querySelector('.tamanio_text_titulo p') ||
    desktopSection.querySelector('.tamanio_text_titulo');
  const nombre = titleEl ? cleanText(titleEl.text) : '';

  // --- Brand Logo ---
  const brandImg = desktopSection.querySelector('[class*="mark_id"]') ||
    desktopSection.querySelector('.tamanio_mark');
  let marca = '', marca_logo_url = '';
  if (brandImg) {
    const src = brandImg.getAttribute('src') || '';
    marca_logo_url = resolveUrl(src);
    const m = src.match(/\/([^/]+)\.svg$/i);
    if (m) marca = m[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // --- Dropdown / Family ---
  const esProductoFamilia = !!desktopSection.querySelector('#select_hijos');
  const productosHermanos = [];
  const selectEl = desktopSection.querySelector('#select_hijos');
  if (selectEl) {
    for (const opt of selectEl.querySelectorAll('option[value]')) {
      const val = opt.getAttribute('value');
      if (val && val.length > 0) productosHermanos.push({ codigo: val, texto: cleanText(opt.text) });
    }
  }

  // --- Características ---
  const caracteristicas = [];
  for (const el of desktopSection.querySelectorAll('.body_especs .especs_margen p, .body_especs_text .especs_margen p')) {
    const text = cleanText(el.text);
    if (text && text.length > 3 && !caracteristicas.includes(text)) caracteristicas.push(text);
  }

  // --- Viñetas ---
  const vinetas = [];
  for (const vin of desktopSection.querySelectorAll('.vinieta_class')) {
    const img = vin.querySelector('.img_vinietas');
    const labelEl = vin.querySelector('.text_vin span') || vin.querySelector('.text_vin');
    const imgSrc = img ? resolveUrl(img.getAttribute('src') || '') : '';
    const label = labelEl ? cleanText(labelEl.text) : '';
    if (imgSrc || label) vinetas.push({ imagen: imgSrc, texto: label });
  }

  // --- Especificaciones ---
  const especificaciones = {};
  const specPanel = root.querySelector('#fill-tabpanel-1');
  if (specPanel) {
    const thead = specPanel.querySelector('thead');
    if (thead) {
      // FAMILY DataTable
      const headers = [];
      thead.querySelectorAll('th').forEach(th => headers.push(cleanText(th.text)));
      for (const row of specPanel.querySelectorAll('tbody tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2 && cleanText(cells[0].text) === codigo) {
          for (let i = 0; i < cells.length && i < headers.length; i++) {
            const key = headers[i], val = cleanText(cells[i].text);
            if (key && val && !['Código', 'Clave'].includes(key)) especificaciones[key] = val;
          }
          break;
        }
      }
    } else {
      // Individual spec tables (th/td pairs)
      for (const row of specPanel.querySelectorAll('tr')) {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) {
          const key = cleanText(th.text), val = cleanText(td.text);
          if (key && val && key.length > 1 && val.length > 0) especificaciones[key] = val;
        }
      }
    }
  }

  // --- Certificaciones (ENHANCED: now captures images) ---
  const certificaciones = [];
  const certPanel = root.querySelector('#fill-tabpanel-2');
  if (certPanel) {
    for (const row of certPanel.querySelectorAll('tr')) {
      const th = row.querySelector('th');
      const td = row.querySelector('td');
      const text = td ? cleanText(td.text) : '';
      const img = th ? th.querySelector('img') : null;
      if (!img && th) {
        // Check for image directly on the th
        const thImg = row.querySelector('img');
        if (thImg) {
          certificaciones.push({
            texto: text || '',
            icono: thImg.getAttribute('alt') || '',
            icono_url: resolveUrl(thImg.getAttribute('src') || '')
          });
          continue;
        }
      }
      if (text && text.length > 3) {
        certificaciones.push({
          texto: text,
          icono: img ? (img.getAttribute('alt') || '') : '',
          icono_url: img ? resolveUrl(img.getAttribute('src') || '') : ''
        });
      } else if (img) {
        certificaciones.push({
          texto: '',
          icono: img.getAttribute('alt') || '',
          icono_url: resolveUrl(img.getAttribute('src') || '')
        });
      }
    }
    // Also check for standalone images in cert panel (not in rows)
    const allCertImgs = certPanel.querySelectorAll('img');
    for (const img of allCertImgs) {
      const src = resolveUrl(img.getAttribute('src') || '');
      if (src && !certificaciones.some(c => c.icono_url === src)) {
        certificaciones.push({
          texto: img.getAttribute('alt') || '',
          icono: img.getAttribute('alt') || '',
          icono_url: src
        });
      }
    }
  }

  // --- Empaque ---
  const empaque = {};
  if (specPanel && specPanel.querySelector('thead')) {
    const headers = [];
    specPanel.querySelectorAll('thead th').forEach(th => headers.push(cleanText(th.text)));
    for (const row of specPanel.querySelectorAll('tbody tr')) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2 && cleanText(cells[0].text) === codigo) {
        for (let i = 0; i < cells.length && i < headers.length; i++) {
          const key = headers[i], val = cleanText(cells[i].text);
          if (key && val && ['Empaque individual', 'Pallet', 'Inner', 'Master'].some(k => key.includes(k)))
            empaque[key] = val;
        }
        break;
      }
    }
  }
  const packPanel = root.querySelector('#fill-tabpanel-3');
  if (packPanel) {
    for (const row of packPanel.querySelectorAll('tr')) {
      const cells = row.querySelectorAll('th, td');
      if (cells.length >= 2) {
        const key = cleanText(cells[0].text), val = cleanText(cells[1].text);
        if (key && val && !['Empaque', 'TIPO DE EMPAQUE', 'Cantidad'].includes(key))
          empaque[key] = val;
      }
    }
  }

  // --- Imágenes ---
  const imagenes = [];
  const skipPatterns = ['lupa', 'favicon', 'logo.svg', 'contactanos', 'ficha_tecnica.svg', 'banco.svg', 'banco_icon', 'pdf.svg', 'ver_mas', 'ver_menos', 'lupa.svg'];
  const addImg = (url) => {
    if (url && !imagenes.includes(url) && !skipPatterns.some(p => url.includes(p))) imagenes.push(url);
  };
  desktopSection.querySelectorAll('img.img_carrusel').forEach(img =>
    addImg(resolveUrl(img.getAttribute('src') || img.getAttribute('data-zoom-image') || '')));
  const principalImg = desktopSection.querySelector('#principal_img');
  if (principalImg) addImg(resolveUrl(principalImg.getAttribute('src') || ''));
  desktopSection.querySelectorAll('.galery-images').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href) addImg(resolveUrl(href));
  });

  // --- Catalog URL + Page Number ---
  let catalogoURL = '', paginaCatalogo = null;
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || '';
    if (href.includes('CatVigente') && !href.includes('buscador')) {
      catalogoURL = resolveUrl(href);
      paginaCatalogo = extractCatalogPage(catalogoURL);
      break;
    }
  }

  // --- PDF / Banco ---
  let fichaTecnicaPDF = '', bancoFotosURL = '';
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || '';
    if (!fichaTecnicaPDF && (href.includes('ficha-print') || href.includes('ficha_tecnica_pdf'))) fichaTecnicaPDF = resolveUrl(href);
    if (!bancoFotosURL && href.includes('BancoContenidoDigital')) bancoFotosURL = resolveUrl(href);
  }

  // --- Fabricación ---
  const fabEl = root.querySelector('.text_fabricado');
  const fabricacion = fabEl ? cleanText(fabEl.text) : '';

  // --- Videos (YouTube links) ---
  const videos = [];
  root.querySelectorAll('[onclick*="pruebavideo"]').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    const m = onclick.match(/pruebavideo\(['"]([^'"]+)['"]\)/);
    if (m) videos.push({ youtube_id: m[1], url: `https://www.youtube.com/watch?v=${m[1]}` });
  });

  // --- Refacciones / Accesorios ---
  const refacciones = [];
  const refPanel = root.querySelector('#fill-tabpanel-0');
  if (refPanel) {
    for (const row of refPanel.querySelectorAll('tbody tr')) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 3) {
        const code = cleanText(cells[0].text);
        const key = cleanText(cells[1].text);
        const desc = cleanText(cells[2].text);
        if (code) refacciones.push({ codigo: code, clave: key, descripcion: desc });
      }
    }
  }

  // --- Incluye (some products show what's included) ---
  const incluye = [];
  root.querySelectorAll('.fila-incluye').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const item = cleanText(cells[0].text);
      const qty = cleanText(cells[1].text);
      if (item) incluye.push({ item, cantidad: qty });
    }
  });

  // --- Content discovery (log new elements we haven't parsed) ---
  const newContent = [];
  const allTabs = root.querySelectorAll('.nav-link');
  const knownTabs = ['ESPECIFICACIONES', 'CERTIFICACIONES', 'GARANTÍA', 'INFORMACIÓN DE EMPAQUE', 'INCLUYE', 'REFACCIONES'];
  for (const tab of allTabs) {
    const tabText = cleanText(tab.text).toUpperCase();
    if (!knownTabs.some(k => tabText.includes(k))) {
      newContent.push('NEW TAB: ' + tabText);
    }
  }

  return {
    codigo, clave, nombre, marca, marca_logo_url,
    es_producto_familia: esProductoFamilia,
    productos_hermanos: productosHermanos,
    caracteristicas, vinetas, especificaciones, certificaciones, empaque,
    pagina_catalogo: paginaCatalogo,
    catalogo_url: catalogoURL,
    ficha_tecnica_pdf: fichaTecnicaPDF,
    banco_fotos_url: bancoFotosURL,
    fabricacion, imagenes,
    videos, refacciones, incluye,
    url_ficha: `${BASE_URL}?codigo=${codigo}&origen=nal`,
    _new_content: newContent.length > 0 ? newContent : undefined
  };
}


// ============================================================================
// SEMÁFORO para concurrencia limitada
// ============================================================================
class Semaphore {
  constructor(max) { this.max = max; this.count = 0; this.queue = []; }
  async acquire() {
    if (this.count < this.max) { this.count++; return; }
    await new Promise(resolve => this.queue.push(resolve));
    this.count++;
  }
  release() {
    this.count--;
    if (this.queue.length > 0) this.queue.shift()();
  }
}

// Procesar UN producto
async function processProduct(product) {
  const url = `${BASE_URL}?codigo=${product.codigo}&origen=nal`;
  const pageResp = await fetchWithRetry(url);

  let csrfToken = null, sessionCookies = '';
  const setCookies = pageResp.headers.getSetCookie ? pageResp.headers.getSetCookie() : [];
  if (setCookies.length > 0) sessionCookies = setCookies.map(c => c.split(';')[0]).join('; ');

  const pageHtml = await pageResp.text();
  csrfToken = extractCSRFToken(pageHtml);

  let htmlToParse, usedApi = false;

  if (isFamilyProduct(pageHtml) && csrfToken && sessionCookies) {
    try {
      htmlToParse = await fetchIndividualProduct(product.codigo, csrfToken, sessionCookies);
      usedApi = true;
    } catch (apiErr) {
      htmlToParse = pageHtml;
    }
  } else {
    htmlToParse = pageHtml;
  }

  const productData = parseProductPage(htmlToParse, product.codigo, product.clave);
  productData.descripcion_csv = product.descripcion_csv;
  return { productData, usedApi };
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('🔧 TRUPER — Extracción de Fichas Técnicas (v5 — Paralelo)');
  console.log('============================================================');
  console.log(`   Concurrencia: ${CONCURRENCY} | Rango: ${START}-${END === Infinity ? 'fin' : END} | Resume: ${RESUME}`);
  console.log('============================================================\n');

  // Leer CSV completo
  const allProducts = readCatalogCSV(CSV_PATH);
  console.log(`📂 ${allProducts.length} productos en catálogo`);

  // Aplicar rango
  const endIdx = Math.min(END, allProducts.length);
  const catalogProducts = allProducts.slice(START, endIdx);
  console.log(`🎯 Procesando rango [${START}..${endIdx - 1}] → ${catalogProducts.length} productos\n`);

  if (catalogProducts.length === 0) { console.log('❌ No hay productos en el rango'); return; }

  let existingResults = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    existingResults = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  }

  // Si missingImages está activo, procesamos los del JSON que no tengan fotos.
  const missingImages = getArg('missing-images', 0);
  
  let toProcess = [];
  if (missingImages) {
      console.log('🔍 Modo rescate activo: Escaneando toda la base instalada...');
      toProcess = existingResults.filter(p => !p.imagenes || p.imagenes.length === 0);
  } else {
      // Flujo normal CSV -> JSON
      const processedCodes = new Set(existingResults.map(r => r.codigo));
      toProcess = catalogProducts.filter(p => !processedCodes.has(p.codigo));
  }
  console.log(`🔄 ${toProcess.length} productos nuevos por procesar\n`);
  if (toProcess.length === 0) { console.log('✅ Todos ya procesados'); return; }

  const results = [...existingResults];
  const errors = [];
  const retryQueue = []; // Productos fallidos para reintentar al final
  const startTime = Date.now();
  const sem = new Semaphore(CONCURRENCY);
  let completed = 0;

  // Función para guardar resultados + progreso
  function save() {
    const clean = results.map(r => { const c = { ...r }; delete c._new_content; return c; });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(clean, null, 2), 'utf-8');

    // Calcular % correcto del lote
    const nuevos = results.length - existingResults.length;
    const totalLote = toProcess.length;
    const pctLote = totalLote > 0 ? ((completed / totalLote) * 100).toFixed(1) : 100;

    // Salud: si hay muchos errores seguidos → warning/critical
    const errorRate = completed > 0 ? (errors.length / completed * 100) : 0;
    let salud = 'healthy';
    if (errorRate > 20) salud = 'critical';
    else if (errorRate > 5 || retryQueue.length > 5) salud = 'warning';

    // Último producto exitoso
    const ultimo = results.length > 0 ? results[results.length - 1] : null;

    const progress = {
      estado: completed >= totalLote ? 'completado' : 'procesando',
      salud,
      total_catalogo: allProducts.length,
      rango: { start: START, end: endIdx },
      procesados: results.length,
      nuevos_en_lote: nuevos,
      total_lote: totalLote,
      pct_lote: parseFloat(pctLote),
      errores: errors.length,
      reintentando: retryQueue.length,
      pendientes: Math.max(0, totalLote - completed),
      tiempo_s: ((Date.now() - startTime) / 1000).toFixed(0),
      prod_por_min: ((completed / ((Date.now() - startTime) / 60000)) || 0).toFixed(1),
      ultima_actualizacion: new Date().toISOString(),
      ultimo_producto: ultimo ? { codigo: ultimo.codigo, clave: ultimo.clave, nombre: (ultimo.nombre || '').substring(0, 60) } : null,
      errores_detalle: errors.slice(-10).map(e => ({
        codigo: e.codigo,
        clave: e.clave,
        error: e.error,
        tipo: e.error.includes('timeout') || e.error.includes('abort') ? 'timeout'
          : e.error.includes('HTTP') ? 'http'
            : e.error.includes('ECONNR') ? 'conexion'
              : 'otro'
      })),
      problemas: []
    };

    // Detectar problemas activos
    if (errorRate > 20) progress.problemas.push('⚠️ Tasa de error alta (' + errorRate.toFixed(0) + '%) — posible bloqueo del servidor');
    if (retryQueue.length > 10) progress.problemas.push('♻️ ' + retryQueue.length + ' productos en cola de reintento');
    if (parseFloat(progress.prod_por_min) < 5 && completed > 10) progress.problemas.push('🐢 Velocidad baja (' + progress.prod_por_min + ' prod/min)');

    fs.writeFileSync('./progreso_scraper.json', JSON.stringify(progress, null, 2), 'utf-8');
  }

  // Procesar un producto con manejo de errores
  async function processOne(product, isRetry) {
    await sem.acquire();
    try {
      const { productData, usedApi } = await processProduct(product);
      const existingIdx = results.findIndex(r => r.codigo === productData.codigo);
      if (existingIdx >= 0) {
          results[existingIdx] = productData;
      } else {
          results.push(productData);
      }
      completed++;

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = completed / ((Date.now() - startTime) / 60000);
      const remaining = toProcess.length - completed;
      const eta = rate > 0 ? (remaining / rate).toFixed(1) : '?';
      const src = usedApi ? '🔄' : '📄';
      const page = productData.pagina_catalogo ? ` P.${productData.pagina_catalogo}` : '';
      const retryTag = isRetry ? ' ♻️' : '';
      console.log(`[${completed}/${toProcess.length}] ${src} ${product.codigo} ${product.clave}${page}${retryTag} (${elapsed}s, ~${eta}min rest.)`);

      // Guardado incremental
      if (completed % SAVE_EVERY === 0) {
        save();
        console.log(`   💾 ${results.length} guardados`);
      }

      await sleep(DELAY_MS);
    } catch (err) {
      completed++;
      console.log(`[${completed}/${toProcess.length}] ❌ ${product.codigo} ${product.clave}: ${err.message}`);
      if (!isRetry) {
        retryQueue.push(product); // Reintentar al final
      } else {
        errors.push({ codigo: product.codigo, clave: product.clave, error: err.message });
      }
    } finally {
      sem.release();
    }
  }

  // Primera pasada: procesar todos
  console.log('━━━ PASADA 1: Procesamiento principal ━━━\n');
  const tasks = toProcess.map(product => processOne(product, false));
  await Promise.all(tasks);

  // Segunda pasada: reintentar fallidos
  if (retryQueue.length > 0) {
    console.log(`\n━━━ PASADA 2: Reintentando ${retryQueue.length} fallidos ━━━\n`);
    completed = toProcess.length - retryQueue.length; // Reset counter for display
    const retryTasks = retryQueue.map(product => processOne(product, true));
    await Promise.all(retryTasks);
  }

  // Guardado final
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n============================================================');
  console.log(`💾 Guardando ${results.length} productos en ${OUTPUT_PATH}`);
  console.log(`⏱️  Tiempo total: ${totalTime}s (${(results.length / (totalTime / 60)).toFixed(0)} prod/min)`);
  save();

  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Exitosos: ${results.length} (${existingResults.length} previos + ${results.length - existingResults.length} nuevos)`);
  console.log(`   ❌ Errores: ${errors.length}`);
  console.log(`   ♻️  Reintentados: ${retryQueue.length}`);
  console.log(`   🔄 Via API: ${results.filter(r => r.es_producto_familia).length}`);
  console.log(`   📖 Con catálogo: ${results.filter(r => r.pagina_catalogo).length}`);
  console.log(`   📐 Specs: ${results.reduce((a, r) => a + (r.especificaciones ? Object.keys(r.especificaciones).length : 0), 0)}`);
  console.log(`   📷 Imágenes: ${results.reduce((a, r) => a + (r.imagenes ? r.imagenes.length : 0), 0)}`);
  console.log(`   🏅 Certificaciones: ${results.reduce((a, r) => a + (r.certificaciones ? r.certificaciones.length : 0), 0)}`);

  if (errors.length > 0) {
    console.log('\n   Con error:');
    errors.forEach(e => console.log(`   - ${e.codigo}: ${e.error}`));
  }
  console.log('\n🏁 ¡Proceso completado!');
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });

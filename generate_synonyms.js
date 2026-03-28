/**
 * TRUPER — Generador de Sinónimos/Alias de Búsqueda
 * 
 * Analiza el nombre, descripción y características de cada producto
 * y genera alias de búsqueda basados en un diccionario local de sinónimos
 * por categoría de herramienta + jerga ferretera mexicana.
 * 
 * Uso: node generate_synonyms.js
 */

const fs = require('fs');
const JSON_PATH = './productos_truper.json';

// ======================================================
// DICCIONARIO DE SINÓNIMOS POR PALABRA CLAVE
// Cada entrada: si el nombre/desc contiene la KEY, agrega los VALUES como alias
// ======================================================
const SYNONYM_DICT = {
    // --- LLAVES / PERICOS ---
    'perico': ['llave inglesa', 'llave ajustable', 'perica', 'adjustable wrench', 'llave de tuercas', 'herramienta plomero'],
    'llave ajustable': ['perico', 'perica', 'llave inglesa', 'wrench'],
    'stilson': ['llave stilson', 'llave de tubo', 'pipe wrench', 'llave fontanero', 'llave plomero', 'grifa'],

    // --- DISCOS / SIERRAS ---
    'disco': ['hoja', 'blade', 'disco de corte'],
    'disco sierra': ['hoja de sierra', 'sierra circular', 'saw blade', 'disco de sierra'],
    'sierra': ['serrucho', 'segueta', 'sierra circular', 'saw'],
    'madera': ['mdf', 'triplay', 'tablon', 'tabla', 'wood', 'melamina', 'aglomerado'],
    'aluminio': ['metal ligero', 'aluminum', 'perfil aluminio'],
    'multimaterial': ['multiusos', 'uso general', 'universal', 'varios materiales'],

    // --- CUCHILLAS / CUTTERS ---
    'cuchilla': ['navaja', 'repuesto cutter', 'hoja de corte', 'blade', 'filo', 'cuchillo'],
    'cutter': ['cortador', 'exacto', 'navaja', 'cuchilla', 'box cutter', 'cortapluma'],
    'estuche': ['set', 'kit', 'juego', 'paquete'],

    // --- LIJAS / ABRASIVOS ---
    'lija': ['papel lija', 'abrasivo', 'sandpaper', 'disco abrasivo', 'disco lija'],
    'disco flap': ['disco laminado', 'lija flap', 'disco abrasivo', 'disco de lija'],
    'grano': ['grit', 'abrasividad'],

    // --- PRENSAS / SARGENTOS ---
    'prensa': ['sargento', 'clamp', 'mordaza', 'pinza de sujecion'],
    'sargento': ['prensa', 'clamp', 'mordaza'],
    'mordaza': ['prensa', 'sargento', 'clamp', 'vise'],
    'nylon': ['plastico', 'polimero'],

    // --- PALAS ---
    'pala': ['lampa', 'shovel', 'pala de jardin', 'pala de construccion'],
    'lampa': ['pala', 'shovel'],
    'recta': ['cuadrada', 'plana'],

    // --- MATERIALES ---
    'acero al carbono': ['carbon steel', 'acero carbono', 'acero templado'],
    'acero sk2': ['acero japones', 'sk2 steel', 'acero de alta dureza'],
    'cromo vanadio': ['chrome vanadium', 'cr-v', 'acero crv'],
    'cromado': ['cromada', 'chrome', 'acabado cromo', 'niquelado'],
    'forjado': ['forjada', 'forged', 'acero forjado'],

    // --- MEDIDAS (patrones comunes) ---
    'pulgadas': ['\"', 'inches', 'pulg'],
    'milimetros': ['mm', 'milimetro'],

    // --- MARCAS ---
    'truper': ['grupo truper'],
    'expert': ['truper expert', 'linea expert', 'profesional'],

    // --- CARACTERÍSTICAS GENERALES ---
    'comfort grip': ['mango ergonomico', 'grip antideslizante', 'mango comodo', 'agarre comodo'],
    'mango': ['empuñadura', 'handle', 'grip'],
    'profesional': ['industrial', 'uso rudo', 'heavy duty', 'trabajo pesado'],
    'cromada': ['cromado', 'chrome', 'acabado brillante'],

    // --- USOS ---
    'corte': ['cortar', 'cutting', 'rebanar'],
    'plomero': ['plomeria', 'fontanero', 'fontaneria', 'tuberia'],
    'carpintero': ['carpinteria', 'ebanista', 'woodworking'],
    'electricista': ['electricidad', 'electrico'],
    'construccion': ['obra', 'albañil', 'albañileria'],
    'jardin': ['jardín', 'jardineria', 'landscaping'],
    'desmalezadora': ['desbrozadora', 'guadaña', 'trimmer', 'desmalezado'],

    // --- JERGA MEXICANA ---
    'perica': ['perico', 'llave ajustable', 'llave inglesa'],
    'segueta': ['sierra', 'arco de sierra', 'hacksaw'],
    'pinzas': ['alicates', 'pliers', 'tenazas'],
    'desarmador': ['destornillador', 'screwdriver', 'atornillador'],
    'martillo': ['mazo', 'hammer', 'marro'],
    'taladro': ['drill', 'berbiqui', 'perforadora'],
    'esmeril': ['amoladora', 'grinder', 'pulidora'],
};

// ======================================================
// SINÓNIMOS POR PATRÓN DE MEDIDA
// ======================================================
function generateMeasureSynonyms(text) {
    var aliases = [];
    var t = text.toLowerCase();

    // 15" → quince pulgadas, 15 pulgadas
    var inchMatch = t.match(/(\d+)[\s"'″]/);
    if (inchMatch) {
        var n = inchMatch[1];
        aliases.push(n + ' pulgadas');
    }

    // 9 mm → nueve milimetros
    var mmMatch = t.match(/(\d+)\s*mm/);
    if (mmMatch) {
        aliases.push(mmMatch[1] + ' milimetros');
    }

    // 7-1/4" → 7 1/4, 184mm
    var fracMatch = t.match(/(\d+)-(\d+)\/(\d+)/);
    if (fracMatch) {
        aliases.push(fracMatch[1] + ' ' + fracMatch[2] + '/' + fracMatch[3]);
    }

    return aliases;
}

// ======================================================
// NORMALIZAR TEXTO
// ======================================================
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[áàâä]/g, 'a').replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i').replace(/[óòôö]/g, 'o')
        .replace(/[úùûü]/g, 'u').replace(/[ñ]/g, 'n');
}

// ======================================================
// GENERAR ALIAS PARA UN PRODUCTO
// ======================================================
function generateAliases(product) {
    var aliases = new Set();

    // Texto completo del producto para buscar matches
    var fullText = normalize([
        product.nombre || '',
        product.descripcion_csv || '',
        (product.caracteristicas || []).join(' '),
    ].join(' '));

    // También incluir specs como texto
    var specText = normalize(
        Object.keys(product.especificaciones || {}).concat(
            Object.values(product.especificaciones || {})
        ).join(' ')
    );

    var allText = fullText + ' ' + specText;

    // Buscar coincidencias en el diccionario
    var keys = Object.keys(SYNONYM_DICT);
    for (var k = 0; k < keys.length; k++) {
        var keyword = keys[k];
        var normalizedKey = normalize(keyword);

        if (allText.indexOf(normalizedKey) !== -1) {
            var synonyms = SYNONYM_DICT[keyword];
            for (var s = 0; s < synonyms.length; s++) {
                aliases.add(synonyms[s].toLowerCase());
            }
        }
    }

    // Agregar sinónimos por medida
    var measureAliases = generateMeasureSynonyms(product.nombre || '');
    measureAliases.forEach(function (a) { aliases.add(a); });

    // Agregar partes del nombre como alias individuales
    var nameParts = normalize(product.nombre || '').split(/[\s,\-\(\)\"\/]+/);
    nameParts.forEach(function (p) {
        if (p.length > 3) aliases.add(p);
    });

    // Agregar la clave sin guiones como alias
    if (product.clave) {
        aliases.add(normalize(product.clave.replace(/-/g, ' ')));
        aliases.add(normalize(product.clave));
    }

    // Quitar duplicados con el nombre/código del producto
    aliases.delete(normalize(product.nombre || ''));
    aliases.delete(normalize(product.codigo || ''));

    return Array.from(aliases).sort();
}

// ======================================================
// MAIN
// ======================================================
function main() {
    console.log('🔤 TRUPER — Generador de Sinónimos de Búsqueda');
    console.log('================================================\n');

    var products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log('📂 ' + products.length + ' productos cargados\n');

    var totalAliases = 0;
    var startTime = Date.now();

    function saveProgress(completed, estado) {
        var progress = {
            script: 'generate_synonyms',
            estado: estado || 'procesando',
            salud: 'healthy',
            total: products.length,
            procesados: completed,
            pendientes: products.length - completed,
            aliases_generados: totalAliases,
            promedio: completed > 0 ? Math.round(totalAliases / completed) : 0,
            tiempo_s: ((Date.now() - startTime) / 1000).toFixed(0),
            prod_por_min: ((completed / ((Date.now() - startTime) / 60000)) || 0).toFixed(1),
            ultima_actualizacion: new Date().toISOString(),
            errores: 0,
            problemas: []
        };
        fs.writeFileSync('./progreso_synonyms.json', JSON.stringify(progress, null, 2), 'utf-8');
    }

    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var aliases = generateAliases(p);
        p.alias_busqueda = aliases;
        totalAliases += aliases.length;

        if ((i + 1) % 100 === 0 || i === products.length - 1) {
            console.log('[' + (i + 1) + '/' + products.length + '] ' + totalAliases + ' alias totales');
            saveProgress(i + 1, 'procesando');
        }
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
    saveProgress(products.length, 'completado');

    console.log('\n================================================');
    console.log('📊 RESUMEN:');
    console.log('   📝 Total alias generados: ' + totalAliases);
    console.log('   📦 Promedio por producto: ' + Math.round(totalAliases / products.length));
    console.log('   ✅ Guardado en ' + JSON_PATH);
    console.log('\n🏁 ¡Completado!');
}

main();

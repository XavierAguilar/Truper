/**
 * TRUPER — Generador de Atributos de Filtro v2
 * 
 * Extrae atributos de ESPECIFICACIONES (fuente primaria) + nombre (fallback)
 * para generar filtros dinámicos en la búsqueda.
 * 
 * Fuentes en orden de prioridad:
 *   1. especificaciones (tabla de specs estructurada)
 *   2. nombre del producto (regex)
 *   3. viñetas (cuando tienen texto útil)
 */

const fs = require('fs');
const INPUT = './productos_truper.json';

// ============================================================
// NORMALIZACIÓN: limpia valores de specs para usar como filtros
// ============================================================
function normCuadro(v) {
    if (!v) return null;
    // "3/4\" (19 mm)" → "3/4 pulg"
    // "1/2\"" → "1/2 pulg"
    const m = v.match(/(\d[\d\s\/\-]*\d*)\s*["″]/);
    if (m) return m[1].trim() + ' pulg';
    // "19 mm" (solo mm sin pulgadas)
    const mm = v.match(/^(\d+)\s*mm$/i);
    if (mm) return mm[1] + ' mm';
    return null;
}

function normMedida(v) {
    if (!v) return null;
    // "1 5/16\" (33 mm)" → "1-5/16 pulg"
    const m = v.match(/([\d\s\/\-]+)\s*["″]/);
    if (m) return m[1].trim().replace(/\s+/g, '-') + ' pulg';
    const mm = v.match(/(\d+[\.\d]*)\s*mm/i);
    if (mm) return mm[1] + ' mm';
    return null;
}

function normPuntas(v) {
    if (!v) return null;
    const m = v.toString().match(/(\d+)/);
    if (m) return m[1] + ' puntas';
    return null;
}

function normTamano(v) {
    if (!v) return null;
    const m = v.match(/([\d\s\/\-]+)\s*["″]/);
    if (m) return m[1].trim() + ' pulg';
    const mm = v.match(/(\d+[\.\d]*)\s*mm/i);
    if (mm) return mm[1] + ' mm';
    return v.trim();
}

// ============================================================
// SPEC EXTRACTORS: extraen atributos directamente de especificaciones
// ============================================================
const SPEC_EXTRACTORS = {
    'Cuadro': {
        specKeys: ['Cuadro', 'Cuadro de entrada'],
        normalize: normCuadro
    },
    'Puntas': {
        specKeys: ['Número de Puntas', 'Numero de Puntas', 'Puntas', 'No. de puntas'],
        normalize: normPuntas
    },
    'Medida': {
        specKeys: ['Medida', 'Medida nominal', 'Diámetro', 'Diametro'],
        normalize: normMedida
    },
    'Largo': {
        specKeys: ['Largo', 'Longitud', 'Longitud total'],
        normalize: (v) => {
            if (!v) return null;
            const mm = v.match(/(\d+[\.\d]*)\s*mm/i);
            if (mm) return mm[1] + ' mm';
            const m = v.match(/([\d\/]+)\s*["″]/);
            if (m) return m[1] + ' pulg';
            return null;
        }
    },
    'Material': {
        specKeys: ['Material', 'Material del cuerpo', 'Material de la hoja'],
        normalize: (v) => v ? v.trim() : null
    },
    'Potencia': {
        specKeys: ['Potencia', 'Watts'],
        normalize: (v) => {
            if (!v) return null;
            const w = v.match(/(\d+)\s*[wW]/);
            if (w) return w[1] + 'W';
            return v.trim();
        }
    },
    'Voltaje': {
        specKeys: ['Voltaje', 'Tensión'],
        normalize: (v) => {
            if (!v) return null;
            const m = v.match(/(\d+)\s*[vV]/);
            if (m) return m[1] + 'V';
            return v.trim();
        }
    }
};

// ============================================================
// REGLAS DE TIPO POR NOMBRE (fallback para atributos no en specs)
// ============================================================
function detectTipo(nombre) {
    const n = nombre.toLowerCase();

    // Dados
    if (/^dado\b/.test(n)) {
        if (n.includes('largo') && n.includes('impacto')) return 'Largo Impacto';
        if (n.includes('largo')) return 'Largo';
        if (n.includes('articulado')) return 'Articulado';
        if (n.includes('impacto')) return 'Impacto';
        if (/buj[ií]a/.test(n)) return 'Bujía';
        return 'Estándar';
    }
    // Discos
    if (/^disco\b/.test(n)) {
        if (n.includes('sierra')) return 'Sierra';
        if (n.includes('laminado')) return 'Laminado';
        if (n.includes('desbaste')) return 'Desbaste';
        if (n.includes('corte')) return 'Corte';
        if (n.includes('flap')) return 'Flap';
        if (n.includes('diamante')) return 'Diamante';
        if (n.includes('pulir') || n.includes('pulido')) return 'Pulido';
        if (n.includes('lija')) return 'Lija';
        return 'Otro';
    }
    // Llaves
    if (/^llave\b/.test(n)) {
        if (n.includes('combinada')) return 'Combinada';
        if (n.includes('ajustable') || n.includes('perico')) return 'Ajustable';
        if (n.includes('allen') || n.includes('hexagonal')) return 'Allen';
        if (n.includes('estriada')) return 'Estriada';
        if (n.includes('stillson') || n.includes('tubo')) return 'Stillson';
        if (n.includes('torx')) return 'Torx';
        if (n.includes('esfera') || n.includes('bola')) return 'Esfera';
        if (n.includes('ratch')) return 'Ratchet';
        if (n.includes('inglesa')) return 'Inglesa';
        if (n.includes('estrella')) return 'Estrella';
        return 'Otra';
    }
    // Brocas
    if (/^broca\b/.test(n)) {
        if (n.includes('sds')) return 'SDS';
        if (n.includes('copa') || n.includes('sierra')) return 'Copa/Sierra';
        if (n.includes('plana') || n.includes('spade')) return 'Plana/Spade';
        if (n.includes('forstner')) return 'Forstner';
        if (n.includes('concreto') || n.includes('mampost')) return 'Concreto';
        return 'Estándar';
    }
    // Desarmadores
    if (/^desarmador|^destornillador|^atornillador/i.test(n)) {
        if (n.includes('cruz') || n.includes('phillips')) return 'Cruz/Phillips';
        if (n.includes('plana') || n.includes('ranurada')) return 'Plano';
        if (n.includes('torx')) return 'Torx';
        if (n.includes('hex')) return 'Hexagonal';
        return 'Otro';
    }
    // Martillos
    if (/^martillo|^marro\b/i.test(n)) {
        if (n.includes('bola')) return 'Bola';
        if (n.includes('goma') || n.includes('hule')) return 'Goma/Hule';
        if (/marro\b/.test(n)) return 'Marro';
        if (n.includes('carpintero')) return 'Carpintero';
        return 'Otro';
    }
    // Pinzas
    if (/^pinza\b/.test(n)) {
        if (n.includes('electricista')) return 'Electricista';
        if (n.includes('punta') || n.includes('nariz')) return 'Punta/Nariz';
        if (n.includes('corte') || n.includes('diagonal')) return 'Corte';
        if (n.includes('presi')) return 'Presión';
        if (n.includes('pela') || n.includes('cable')) return 'Pelacables';
        return 'Otra';
    }
    // Sierras
    if (/^sierra|^segueta|^serrucho/i.test(n)) {
        if (n.includes('circular')) return 'Circular';
        if (n.includes('caladora') || n.includes('calar')) return 'Caladora';
        if (n.includes('sable') || n.includes('recip')) return 'Sable';
        if (n.includes('segueta')) return 'Segueta';
        if (n.includes('serrucho')) return 'Serrucho';
        return 'Otra';
    }
    // Cintas
    if (/^cinta\b/i.test(n)) {
        if (n.includes('aislar') || n.includes('aislante')) return 'Aislante';
        if (n.includes('duct') || n.includes('tela')) return 'Duct Tape';
        if (n.includes('masking') || n.includes('enmascarar')) return 'Masking';
        if (n.includes('empaque') || n.includes('embalaje')) return 'Empaque';
        return 'Otra';
    }
    // Iluminación
    if (/^foco|^l[aá]mpara|^luminario|^linterna|^reflector/i.test(n)) {
        if (n.includes('led')) return 'LED';
        if (n.includes('solar')) return 'Solar';
        if (n.includes('linterna')) return 'Linterna';
        if (n.includes('reflector')) return 'Reflector';
        return 'Otro';
    }
    return null;
}

// Categorías que reciben Tipo
const TIPO_CATEGORIES = /^(dado|disco|llave|broca|desarmador|destornillador|atornillador|martillo|marro|pinza|sierra|segueta|serrucho|cinta|foco|l[aá]mpara|luminario|linterna|reflector)\b/i;

// Material desde nombre (fallback)
function detectMaterialFromName(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes('madera')) return 'Madera';
    if (n.includes('metal') || n.includes('acero')) return 'Metal';
    if (n.includes('concreto') || n.includes('mampost')) return 'Concreto';
    if (n.includes('aluminio')) return 'Aluminio';
    return null;
}

// Viñetas map
const VINETA_MAP = {
    'Madera': { attr: 'Material', value: 'Madera' },
    'Metal ferroso': { attr: 'Material', value: 'Metal' },
    'Metal': { attr: 'Material', value: 'Metal' },
    'Concreto': { attr: 'Material', value: 'Concreto' },
    'Aluminio': { attr: 'Material', value: 'Aluminio' },
    'Piedra': { attr: 'Material', value: 'Piedra' },
};

// ============================================================
// PROCESAMIENTO PRINCIPAL
// ============================================================
function main() {
    const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
    console.log(`🔧 TRUPER — Generador de Atributos v2 (Specs + Nombre)`);
    console.log(`   📦 ${data.length} productos\n`);

    let fromSpecs = 0, fromName = 0, fromVinetas = 0;
    let totalAttrs = 0;
    let categorized = 0;

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const nombre = p.nombre || p.descripcion_csv || '';
        const specs = p.especificaciones || {};
        const attrs = {};

        // 1. Extraer TIPO del nombre (no está en specs)
        if (TIPO_CATEGORIES.test(nombre)) {
            const tipo = detectTipo(nombre);
            if (tipo) {
                attrs['Tipo'] = tipo;
                fromName++;
                totalAttrs++;
            }
        }

        // 2. Extraer atributos de ESPECIFICACIONES (fuente primaria)
        for (const [attrName, extractor] of Object.entries(SPEC_EXTRACTORS)) {
            for (const specKey of extractor.specKeys) {
                if (specs[specKey] !== undefined && specs[specKey] !== null && specs[specKey] !== '') {
                    const normalized = extractor.normalize(specs[specKey]);
                    if (normalized && !attrs[attrName]) {
                        attrs[attrName] = normalized;
                        fromSpecs++;
                        totalAttrs++;
                    }
                    break;
                }
            }
        }

        // 3. Fallback: extraer Cuadro/Medida del nombre si no vino de specs
        if (!attrs['Cuadro'] && nombre) {
            const cm = nombre.match(/cuadro\s*(\d\/\d+)/i);
            if (cm) { attrs['Cuadro'] = cm[1] + ' pulg'; fromName++; totalAttrs++; }
        }
        if (!attrs['Puntas'] && nombre) {
            const pm = nombre.match(/(\d+)\s*punta/i);
            if (pm) { attrs['Puntas'] = pm[1] + ' puntas'; fromName++; totalAttrs++; }
        }
        if (!attrs['Material']) {
            const mat = detectMaterialFromName(nombre);
            if (mat) { attrs['Material'] = mat; fromName++; totalAttrs++; }
        }

        // 4. Enriquecer con viñetas
        if (p.vinetas && p.vinetas.length > 0) {
            for (const v of p.vinetas) {
                if (v.texto && VINETA_MAP[v.texto] && !attrs[VINETA_MAP[v.texto].attr]) {
                    attrs[VINETA_MAP[v.texto].attr] = VINETA_MAP[v.texto].value;
                    fromVinetas++;
                    totalAttrs++;
                }
            }
        }

        if (Object.keys(attrs).length > 0) categorized++;
        p.atributos_filtro = attrs;
    }

    fs.writeFileSync(INPUT, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Resultados:`);
    console.log(`   📊 ${categorized} productos con atributos (${(categorized / data.length * 100).toFixed(1)}%)`);
    console.log(`   🏷️  ${totalAttrs} atributos totales`);
    console.log(`   📋 Desde specs: ${fromSpecs}`);
    console.log(`   📝 Desde nombre: ${fromName}`);
    console.log(`   🔖 Desde viñetas: ${fromVinetas}`);

    // Verify dados cuadro
    const dados = data.filter(p => (p.nombre || '').toLowerCase().startsWith('dado '));
    const cuadros = {};
    dados.forEach(p => {
        if (p.atributos_filtro && p.atributos_filtro.Cuadro) {
            cuadros[p.atributos_filtro.Cuadro] = (cuadros[p.atributos_filtro.Cuadro] || 0) + 1;
        }
    });
    console.log(`\n   🔧 Verificación DADOS (${dados.length}):`);
    Object.entries(cuadros).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`      Cuadro ${k}: ${v}`));

    console.log(`\n🏁 Guardado en ${INPUT}`);
}

main();

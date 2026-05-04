const https = require('https');

// Suffixes we noticed in Truper's Banco de Fotos
const suffixes = [
    '',        // Principal
    '+FC1',    // Fotos detalle
    '+FC2',
    '+FC3',
    '+E1',     // Empaque
    '+E2',
    '+EIND1',  // Empaque Individual
    '+EIND2',
    '+EI1',    // Empaque Inner
    '+D1',     // Detalle general
    '+D2',
    '+M1'      // Muestra
];

async function checkImageUrl(url) {
    return new Promise((resolve) => {
        https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => resolve(false)).end();
    });
}

async function findAllImages(clave) {
    console.log(`Buscando todas las imágenes posibles para la clave: ${clave}...\n`);
    const baseUrl = 'https://www.truper.com/media/import/imagenes/';
    const foundImages = [];

    for (const suffix of suffixes) {
        // En Truper las imágenes a veces son .jpg y a veces .JPG, pero el servidor suele ser sensible a mayúsculas
        const url = `${baseUrl}${clave}${suffix}.jpg`;
        const exists = await checkImageUrl(url);
        
        if (exists) {
            console.log(`[EXITO] Imagen encontrada: ${url}`);
            foundImages.push(url);
        } else {
            console.log(`[FALLO] No existe: ${url}`);
        }
    }
    
    console.log(`\nResumen: Se encontraron ${foundImages.length} imágenes para ${clave}.`);
    return foundImages;
}

// Probando con la clave de la antena (ANDO-4)
findAllImages('ANDO-4');

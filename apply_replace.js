const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldFnStr = html.substring(html.indexOf('function renderNuevosCarousel() {'), html.indexOf('function searchFromHint(query)') - 9);
const newFnStr = fs.readFileSync('replace_carousel.js', 'utf8');

html = html.replace(oldFnStr, newFnStr + '\n\n');
html = html.replace('renderNuevosCarousel();', 'renderWelcomeCarousels();');

const oldContainer = '<!-- Carrusel de Novedades (3 hileras) -->\n            <div class="welcome-carousel-container" id="nuevosCarouselContainer"';
const newContainer = `<!-- Carruseles de Promociones (3 hileras) -->
            <div class="welcome-carousel-container" id="promosCarouselContainer" style="display: none; flex-direction: column; gap: 4px; margin-bottom: 30px;">
            </div>

            <!-- Carrusel de Novedades (3 hileras) -->
            <div class="welcome-carousel-container" id="nuevosCarouselContainer"`;

// Since it might have \r\n
const oldContainerCRLF = '<!-- Carrusel de Novedades (3 hileras) -->\r\n            <div class="welcome-carousel-container" id="nuevosCarouselContainer"';
if (html.includes(oldContainerCRLF)) {
    html = html.replace(oldContainerCRLF, newContainer);
} else if (html.includes(oldContainer)) {
    html = html.replace(oldContainer, newContainer);
} else {
    // try partial
    html = html.replace('<div class="welcome-carousel-container" id="nuevosCarouselContainer"', '<div class="welcome-carousel-container" id="promosCarouselContainer" style="display: none; flex-direction: column; gap: 4px; margin-bottom: 30px;"></div>\n            <div class="welcome-carousel-container" id="nuevosCarouselContainer"');
}

fs.writeFileSync('index.html', html);
console.log('Done!');

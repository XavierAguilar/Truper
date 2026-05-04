function renderWelcomeCarousels() {
    var promosContainer = document.getElementById('promosCarouselContainer');
    var nuevosContainer = document.getElementById('nuevosCarouselContainer');
    
    // Promos
    var promos = productos.filter(function(p) { 
        return p.promocion && p.imagenes && p.imagenes.length > 0; 
    });
    // Nuevos
    var nuevos = productos.filter(function(p) { 
        return p.es_nuevo === true && p.imagenes && p.imagenes.length > 0; 
    });

    renderCarouselGroup(promosContainer, promos, {
        iconHtml: '<i class="fas fa-fire" style="color:#ea580c;font-size:28px;filter:drop-shadow(0 0 10px rgba(234,88,12,0.4));"></i>',
        title: 'Ofertas y Promociones del Mes',
        btnAction: 'searchPromos()',
        btnStyle: 'background:rgba(234,88,12,0.1);border:1px solid #ea580c;color:#ea580c;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;',
        btnText: 'Ver Todas las Ofertas (' + promos.length.toLocaleString() + ')',
        rowPrefix: 'prm'
    });

    renderCarouselGroup(nuevosContainer, nuevos, {
        iconHtml: '<i class="fas fa-sparkles" style="color:#22c55e;font-size:28px;filter:drop-shadow(0 0 10px rgba(34,197,94,0.4));"></i>',
        title: 'Descubre lo Nuevo en Truper',
        btnAction: 'searchNuevos()',
        btnStyle: 'background:rgba(34,197,94,0.1);border:1px solid #22c55e;color:#22c55e;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;',
        btnText: 'Ver Catálogo de Novedades (' + nuevos.length.toLocaleString() + ')',
        rowPrefix: 'nvo'
    });
}

function searchPromos() {
    document.getElementById('searchInput').value = ':promos:';
    document.getElementById('searchResults').classList.remove('show');
    doSearch();
}

function renderCarouselGroup(mainContainer, items, options) {
    if (!mainContainer) return;
    if (items.length === 0) {
        mainContainer.style.display = 'none';
        return;
    }
    mainContainer.innerHTML = '';
    
    var ROWS_COUNT = 3;
    var ITEMS_PER_ROW = 30;
    
    var pool = items.slice().sort(function() { return 0.5 - Math.random() });
    var headerHtml = '<div class="carousel-header" style="justify-content:space-between; width:100%; max-width:1400px; margin:0 auto; margin-bottom: 8px;">' +
                     '<div style="display:flex;align-items:center;gap:12px;">' +
                     options.iconHtml +
                     '<div class="carousel-title" style="margin:0;">' + options.title + '</div>' +
                     '</div>' +
                     '<button onclick="' + options.btnAction + '" style="' + options.btnStyle + '">' +
                     options.btnText + ' <i class="fas fa-arrow-right" style="margin-left:4px;"></i>' +
                     '</button>' +
                     '</div>';
    mainContainer.insertAdjacentHTML('afterbegin', headerHtml);

    for (var row = 1; row <= ROWS_COUNT; row++) {
        var rowId = options.rowPrefix + '-row-' + row;
        var startIdx = (row - 1) * ITEMS_PER_ROW;
        var shuffled = pool.slice(startIdx, startIdx + ITEMS_PER_ROW);
        
        if (shuffled.length < ITEMS_PER_ROW) {
            shuffled = pool.sort(function() { return 0.5 - Math.random() }).slice(0, ITEMS_PER_ROW);
        }
        
        var displayList = shuffled.concat(shuffled);
        
        var rowHtml = '<div class="carousel-wrapper" style="max-width:100%;">' +
                      '<button class="carousel-nav prev" id="prev-' + rowId + '"><i class="fas fa-chevron-left"></i></button>' +
                      '<div class="carousel-track" id="track-' + rowId + '" style="scroll-snap-type: none;">';
        
        displayList.forEach(function(p) {
            var locals = p.imagenes_local || [], remots = p.imagenes || [];
            var primarySrcs = [], fallbacks = [];
            for(var i=0; i<Math.max(locals.length, remots.length); i++) {
                var l = locals[i], r = remots[i];
                if (l) { primarySrcs.push(l); fallbacks.push(r ? (r.startsWith('http') ? r : 'https://www.truper.com' + (r.startsWith('/') ? r : '/' + r)) : ''); }
                else if (r) { primarySrcs.push(r.startsWith('http') ? r : 'https://www.truper.com' + (r.startsWith('/') ? r : '/' + r)); fallbacks.push(''); }
            }
            if (primarySrcs.length === 0) return;
            var imgSrc = primarySrcs[0];
            var fStr = fallbacks[0] ? "this.onerror=null; this.src='" + fallbacks[0] + "';" : "this.onerror=null; this.src='https://www.truper.com/build/imgs/logo-truper.svg';";
            var hasMulti = primarySrcs.length > 1;
            var arrows = '', dots = '';
            if (hasMulti) {
                var imgJson = JSON.stringify(primarySrcs).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                var fbJson = JSON.stringify(fallbacks).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                arrows = '<button class="card-arrow card-arrow-left has-multi" onclick="event.stopPropagation();cardSlide(this,-1)" data-imgs="' + imgJson + '" data-fb="' + fbJson + '" data-idx="0"><i class="fas fa-chevron-left"></i></button>' +
                         '<button class="card-arrow card-arrow-right has-multi" onclick="event.stopPropagation();cardSlide(this,1)"><i class="fas fa-chevron-right"></i></button>';
                dots = '<div class="card-dots has-multi">';
                for (var di = 0; di < Math.min(primarySrcs.length, 6); di++) dots += '<span class="card-dot' + (di === 0 ? ' active' : '') + '"></span>';
                dots += '</div>';
            }

            var ribbonNuevo = p.es_nuevo ? '<div class="ribbon-nuevo"><i class="fas fa-star" style="margin-right:4px;"></i>Nuevo</div>' : '';
            var promoBg = '';
            if (p.promocion) {
                var pct = p.promocion.porcentaje;
                if (pct >= 30) promoBg = 'linear-gradient(90deg, #e11d48, #be123c)';
                else if (pct >= 20) promoBg = 'linear-gradient(90deg, #f97316, #ea580c)';
                else promoBg = 'linear-gradient(90deg, #f59e0b, #d97706)';
            }
            var ribbonPromo = p.promocion ? '<div class="ribbon-promo" style="background:' + promoBg + ';font-size:10px;padding:3px 20px;left:-20px;text-align:center;">-' + p.promocion.porcentaje + '%</div>' : '';

            rowHtml += '<div class="carousel-card" onclick="showProduct(' + productos.indexOf(p) + ')" title="' + p.clave + '">' +
                       '<div class="carousel-card-img-wrapper">' + arrows +
                       '<img src="' + imgSrc + '" class="carousel-card-img" alt="' + p.clave + '" loading="lazy" onmouseover="autoCrop(this)" onload="autoCrop(this)" onerror="' + fStr + '">' +
                       dots + ribbonNuevo + ribbonPromo + '</div>' +
                       '<div class="carousel-card-category">' + (p.marca || 'TRUPER') + '</div>' +
                       '<div class="carousel-card-code">' + p.codigo + '</div>' +
                       '<div class="carousel-card-name">' + (p.nombre ? p.nombre.substring(0,35) + '...' : 'Sin nombre') + '</div>' +
                       '</div>';
        });

        rowHtml += '</div><button class="carousel-nav next" id="next-' + rowId + '"><i class="fas fa-chevron-right"></i></button></div>';
        mainContainer.insertAdjacentHTML('beforeend', rowHtml);

        (function(rId, rIndex) {
            var t = document.getElementById('track-' + rId);
            var isPaused = false;
            var speed = 0.5 + (rIndex * 0.2);
            
            t.onmouseover = function() { isPaused = true; };
            t.onmouseout = function() { isPaused = false; };
            
            function step() {
                if (!isPaused) {
                    t.scrollLeft += speed;
                    if (t.scrollLeft >= t.scrollWidth / 2) {
                        t.scrollLeft = 0;
                    }
                }
                requestAnimationFrame(step);
            }
            requestAnimationFrame(step);

            document.getElementById('prev-' + rId).onclick = function() { t.scrollBy({ left: -400, behavior: 'smooth' }); };
            document.getElementById('next-' + rId).onclick = function() { t.scrollBy({ left: 400, behavior: 'smooth' }); };
        })(rowId, row);
    }
    mainContainer.style.display = 'flex';
}

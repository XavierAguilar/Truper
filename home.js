var scroll_n = 0;
var move = 100;
let ultimaImage;
let checkScroll = true;
const webServiceProducts = "https://www.truper.com/restDataSheet/api/search/products_ficha_new.php";

let constructor = new functions();
if(document.getElementById('thumbnails')){
    const div = document.getElementById('thumbnails');
    const imagenes = div.getElementsByTagName('img');
    const numeroDeImagenes = imagenes.length;
    if(numeroDeImagenes <= 6){
        console.log("No hay suficientes imagenes para el carrusel");
        up = document.getElementById('up');
        $(up).addClass('up_hidden');
        down = document.getElementById('down');
        $(down).addClass('up_hidden');
        prevImg = document.getElementById('prevImg');
        $(prevImg).addClass('hidden');
        nextImg = document.getElementById('nextImg');
        $(nextImg).addClass('hidden');
    }
}


$(document).ready(function(){
    var url = window.location.toString();
    let codigo_prod = 0;
    const version = document.getElementById("version") ? document.getElementById("version").value : '1';

    if(url.includes('?code=') == true){
        codigo_prod = getParameterByName('code');
        if(version == '1'){
            cargar_codigo(codigo_prod);
        }
    }

    $('#principal_zoom').zoom();

    $(".sliderMobile").slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: false
    });

    const checkTable = document.getElementById("example_table");
    
    if(checkTable !== null){
        new DataTable('#example_table', {
            language: {
                info: 'Mostrando página _PAGE_ de _PAGES_',
                infoEmpty: 'Ningún registro disponible',
                infoFiltered: '(Filtrado de _MAX_ registros totales)',
                lengthMenu: 'Mostrando _MENU_ resultados por página',
                zeroRecords: 'Sin resultados'
            },
            infoCallback: function (settings, start, end, max, total, pre) {
                return pre + ' de ' + max + " resultados ";
            },
            searching: false,
            layout: {
                top2Start: null,
                top2End: 'search',
                topStart: 'info',
                topEnd: 'paging',
                bottomStart: null,
                bottomEnd: 'search',
                bottom2Start: 'info',
                bottom2End: 'paging'
            },
            pageLength: 25,

        });
    }

});




//Encargado de obtener el scroll y deshabilitar los botones de arriba o abajo

$(document).on('click', '.arrow', function(e){
    e.preventDefault();
    let limit = document.getElementById("contentImgs").scrollHeight;
    let mainImgSize = document.getElementById("thumbnails").scrollHeight;
    limit = limit - mainImgSize - move;
    if ($(this).hasClass('down'))
    {
        $('.up').removeClass('disabled');
        $('#prevImg').removeClass('disabled');
        if (!$(this).hasClass('disabled')) {
            if(limit <= (0)){
                scroll_n = scroll_n - move;
                $('#thumbnails').css({ transform: 'translateY(' + scroll_n + 'px)' });
                if (checkScroll)
                    revGallery();
            }   
        }else{
            $('#nextImg').addClass('disabled');
        }
        
    }else {

        if(limit <= (-110)){
            $('#prevImg').removeClass('disabled');
            $('#nextImg').removeClass('disabled');
            checkScroll = true;
            $('.down').removeClass('disabled');
            scroll_n = scroll_n + move;
            $('#thumbnails').css({ transform: 'translateY(' + scroll_n + 'px)' });
        }else{
            $('#prevImg').addClass('disabled');
            $('.up').addClass('disabled');
        }
    }
});

//creamos observador para scroll hacia abajo
let observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {        
        if(entrada.isIntersecting) {
            $('.down').addClass('disabled');
            //console.log('termina observar');                
            // stop observing the button
            observador.unobserve(ultimaImage);
        }
    }); 
}, {
    rootMargin: '0px 0px 200px 0px',
    threshold: 1.0
});

const revGallery = () => {
    const imagesEnPantalla = document.querySelectorAll('.thumbnail');
    ultimaImage = imagesEnPantalla[imagesEnPantalla.length-1];
    observador.observe(ultimaImage);
    checkScroll = false;
}

$(document).on('mouseover', '.img_carrusel', function(e)
{
    console.log($(this).attr('src'));
    $('.thumbnail.mini').removeClass('selected');
    let src = $(this).attr('src');
    let order = $(this).attr('order');
    let div = $(this).parent('div');
    let img = $("#principal_img");
    $(div).addClass('selected');

    /* Update img in zoom */
    $('.zoomContainer').remove();
    //img.removeData('elevateZoom');
    img.attr('src', src);
    img.data('zoom-image', src);
    $('#principal_zoom').zoom();
    $('#img1').attr('data-fancybox-index', order);
});

$(document).on('click','.galery-images', function(e){
    e.preventDefault();
});

$("[data-fancybox=galeria-mobile]").fancybox({
    protect: !1,
    loop: !1,
    transitionEffect: "slide",
    animationEffect: "fade",
    toolbar: false,
    clickOutside: "close",
    mobile: {
        clickOutside: "close",
        clickSlide: "close"
    }
});

$("a#single_image").fancybox({
    protect: !1,
    loop: !1,
    animationEffect: "fade",
    toolbar: false,
    clickOutside: "close",
    mobile: {
        clickOutside: "close",
        clickSlide: "close"
    }
});

$("a#curva_image").fancybox({
    protect: !1,
    loop: !1,
    animationEffect: "fade",
    toolbar: false,
    clickOutside: "close",
    mobile: {
        clickOutside: "close",
        clickSlide: "close"
    }
});

$("a#videos").fancybox({
    protect: !1,
    loop: !1,
    animationEffect: "fade",
    toolbar: !1,
    clickOutside: "close",
    mobile: {
        clickOutside: "close",
        clickSlide: "close"
    }
});

$(document).on('keyup','#buscador', function(e)
{
    let word = $(this).val();
    if (word === '') {
        $('#modulesDesk').html('');
        $('.containerLiveSearchDesk').fadeOut();
        return false;
    }else{
        addProducts(word);
    }
});

function addProducts(word)
{
    let output = '';
    word = singularize(word);
    if(word.length >= 4){
        $.ajax({
            type: "POST",
            cache: false,
            url: webServiceProducts,
            dataType: "json",
            data: { 'word':word },
            ContentType:"application/json",

            success: function (response){
                $.each(response, function(key, val)
                {
                    let code = val.code.toString();
                    output += '<div><a class="live-search hover" href="' + val.url + '" >';
                    output += '<div><img src="' + val.imgUrl + '" height="32" ></div>';
                    output += '<div class="descrip">';
                    output += '<div><div><p>' + getMatch(val.name, word) + '</p>';
                    output += '<p>' + getMatch(code, word) + '<span class="blank">|</span>' + getMatch(val.sku, word) + '</p></div></div>';
                    output += '</div></a>';
                    output += '</div>';
                });
                /* paints the output to the livesearch div */
                $('#modulesDesk').html(output);
                $('.containerLiveSearchDesk').fadeIn();
            },
            error: function (response){
                console.log('Ups something is not working properly');
            }
        });
    }
}

function singularize(word)
{
    const endings = { es: '', s: '' };
    return word.replace(
        new RegExp(`(${Object.keys(endings).join('|')})$`),
        r => endings[r]
    );
}

function getMatch(text, word)
{
    let word1 = text.toLowerCase();
    let word2 = word.toLowerCase();
    let start = word1.indexOf(word2);
    let end = word.length + start;
    let ellipses = (start > 0) ? '... ' : '';
    let match = (start >= 0) ? ellipses + text.substring(start, end) : '';
    let leftOver = (start >= 0) ? text.substring(end): text;

    return '<span class="highlight">' + match + '</span>' + leftOver;
}

$(document).on('click, focus','.div_buscador form', function(e){
    $('.containerLiveSearchMob').fadeIn();
    $('.containerLiveSearchDesk').fadeIn();
});

$(document).on('click','html , .containerLiveSearchMob , .containerLiveSearchDesk', function(e){
    $('.containerLiveSearchMob').fadeOut();
    $('.containerLiveSearchDesk').fadeOut();
});

$(document).on('click','.div_buscador form , .liveSearchMob , .liveSearchDesk', function(e){
    e.stopPropagation();
});


$(document).on('change', '#select_hijos', async function(e){
    //alert("Entro aqui paps -> "+e.target.value);
    //element.remove(); 
    /*const getProduct = await constructor.findProducts(e.target.value);
    //Elimina las imagenes del carrusel
    constructor = new functions(document.getElementById("img_carrusel"));
    constructor.removeElement();
    //Elimina la Imagen principal
    constructor = new functions(document.getElementById("img_principal"));
    constructor.removeElement();

    //Elimina la Informacion Prod
    constructor = new functions(document.getElementById("info_producto"));
    constructor.removeElement();

    //Elimina la Epecificaciones y más Prod
    constructor = new functions(document.getElementById("tabla_especs"));
    constructor.removeElement();

    //Elimina todo el estilo de Mobil
    constructor = new functions(document.getElementById("mobile"));
    constructor.removeElement();
    //console.log(getProduct[1]);
    $('#informacion_prod').append(getProduct[0]);
    $('#informacion_prod').append(getProduct[1]);
    $('#especs_mas_producto').append(getProduct[2]);

    $('#content_ficha').append(getProduct[3]);
    $(".sliderMobile").slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true
    });

    constructor.verificador_imagenes();
    $('#principal_zoom').zoom();
    $("#principal_zoom").on('mouseover',function(){
        $('.lupa_prin').addClass('opacity_btnlupa');
        $('.zoom').addClass('border-zoom');
    });
    
    $("#principal_zoom").on('mouseout',function(){
        $('.lupa_prin').removeClass('opacity_btnlupa');
        $('.zoom').removeClass('border-zoom');
    
    });*/
    location.href = location.origin+location.pathname+'?code='+e.target.value;
});

function info_producto(clase){
    for (let index = 1; index <= 6; index++) {
        if(clase == index){
            if(document.getElementById("btn_info_"+index)){
                var vararia = document.getElementById("btn_info_"+index);
                if(vararia.getAttribute('aria-expanded') == "true"){
                    var clase_div = document.getElementById("up_mobile_ad_"+index);
                    vararia.classList.add("orange");
                    vararia.classList.add("color_normal");
                    clase_div.style.display = "block";
                    var clase_div = document.getElementById("down_mobile_ad_"+index);
                    clase_div.style.display = "none";
                    vararia.classList.remove("color_btn");
                    vararia.classList.add("border_botones_desp");

                }else{
                    var clase_div = document.getElementById("up_mobile_ad_"+index);
                    vararia.classList.remove("orange");
                    vararia.classList.remove("color_normal");
                    clase_div.style.display = "none";
                    var clase_div = document.getElementById("down_mobile_ad_"+index);
                    clase_div.style.display = "block";
                    vararia.classList.add("color_btn");
                    vararia.classList.remove("border_botones_desp");
                }
            }
        }else{
            if(document.getElementById("btn_info_"+index)){
                var vararia = document.getElementById("btn_info_"+index);
                var drop = document.getElementById("dropd_"+index);
                if(vararia.getAttribute('aria-expanded') == "true"){
                    var clase_div = document.getElementById("up_mobile_ad_"+index);
                    vararia.classList.remove("orange");
                    vararia.classList.remove("color_normal")
                    clase_div.style.display = "none";
                    var clase_div = document.getElementById("down_mobile_ad_"+index);
                    clase_div.style.display = "block";
                    vararia.classList.add("color_btn");
                    vararia.classList.remove("border_botones_desp");
                    drop.classList.remove("show");
                }
            }
        }
    }
}

function pruebavideo(id_video){
    
    const modal = document.getElementById("videoModalGlobal");
    const frame = document.getElementById("globalVideoFrame");

    if(!modal || !frame) return;
    frame.src = "";
    frame.src = "https://www.youtube-nocookie.com/embed/" + id_video + "?autoplay=1";

    modal.classList.add("active");
}

function closeModal(){

    const modal = document.getElementById("videoModalGlobal");
    const frame = document.getElementById("globalVideoFrame");

    if(!modal || !frame) return;
    frame.src = "";
    modal.classList.remove("active");
}
        
$("#principal_zoom").on('mouseover',function(){
    $('.lupa_prin').addClass('opacity_btnlupa');
    $('.zoom').addClass('border-zoom');
});

$("#principal_zoom").on('mouseout',function(){
    $('.lupa_prin').removeClass('opacity_btnlupa');
    $('.zoom').removeClass('border-zoom');
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function cargar_codigo(codigo){
    //console.log("Codigo -> "+codigo);
    //alert("Entro aqui paps -> "+e.target.value);
    //element.remove(); 
    const getProduct = await constructor.findProductsCod(codigo);
    //Elimina las imagenes del carrusel
    
    constructor = new functions(document.getElementById("img_carrusel"));
    constructor.removeElement();

    //Elimina la Imagen principal
    constructor = new functions(document.getElementById("img_principal"));
    constructor.removeElement();

    //Elimina la Informacion Prod
    constructor = new functions(document.getElementById("info_producto"));
    constructor.removeElement();

    //Elimina la Epecificaciones y más Prod
    constructor = new functions(document.getElementById("tabla_especs"));
    constructor.removeElement();

    //Elimina todo el estilo de Mobil
    constructor = new functions(document.getElementById("mobile"));
    constructor.removeElement();
    //console.log(getProduct[1]);
    $('#informacion_prod').append(getProduct[0]);
    $('#informacion_prod').append(getProduct[1]);
    $('#especs_mas_producto').append(getProduct[2]);

    $('#content_ficha').append(getProduct[3]);
    $('#content_ficha').append(getProduct[4]);

    $(".sliderMobile").slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true
    });

    constructor.verificador_imagenes();
    $('#principal_zoom').zoom();
    $("#principal_zoom").on('mouseover',function(){
        $('.lupa_prin').addClass('opacity_btnlupa');
        $('.zoom').addClass('border-zoom');
    });
    
    $("#principal_zoom").on('mouseout',function(){
        $('.lupa_prin').removeClass('opacity_btnlupa');
        $('.zoom').removeClass('border-zoom');
    
    });
}

function addManual(id_producto)
{
    const getProduct = constructor.agregarManuales(id_producto);
}

function addDiagrama(id_producto)
{
    const getProduct = constructor.agregarDiagramas(id_producto);
}

function cerrar_modal_espec() {
    document.getElementById("modal_expecf").classList.remove("show");
}

function abrir_modal_diagrama(){
    document.getElementById("modalPDF").classList.add("show");
}

function cerrar_modal_diagrama(){
    document.getElementById("modalPDF").classList.remove("show");
}


$('#curva_image').hover(
  function() {
    $('.overlay').addClass('hover'); 
  }, 
  function() {
    $('.overlay').removeClass('hover');
  }
);

/*------------ Modal inclye ------------*/
function cerrar_modal_incluye() {
    const modal = document.getElementById("modal_incluye");
    const overlay = document.querySelector(".overlay-incluye");

    if (!modal || !overlay) return;

    modal.classList.remove("show");
    overlay.classList.remove("visible");
    document.body.classList.remove("no-scroll");
}

function tab_mobile(tipo) {
    const espec = document.getElementById('tab-espec');
    const incluye = document.getElementById('tab-incluye');
    const tabs = document.querySelectorAll('.ft-tab');

    tabs.forEach(tab => tab.classList.remove('active'));

    if (tipo === 'espec') {
        espec.classList.remove('d-none');
        incluye && incluye.classList.add('d-none');
        tabs[0].classList.add('active');
    } else {
        incluye.classList.remove('d-none');
        espec.classList.add('d-none');
        tabs[1].classList.add('active');
    }
}

/* =========================
   MOBILE - INCLUYE
========================= */
function toggle_incluye_mobile() {

    const extras = document.querySelectorAll('.extra-mobile');
    const icono = document.getElementById('icono-incluye-mobile');

    if (!extras.length) return;

    const estaExpandido = !extras[0].classList.contains('d-none');

    extras.forEach(fila => {
        fila.classList.toggle('d-none');
    });

    if (estaExpandido) {
        icono.src = "{{ asset('img/ver_mas.svg') }}";
    } else {
        icono.src = "{{ asset('img/ver_menos.svg') }}";
    }
}

/* =========================
   DESKTOP - INCLUYE
========================= */
function ver_mas_incluye() {

    if (window.innerWidth < 768) return;

    const modal = document.getElementById("modal_incluye");
    const overlay = document.querySelector(".overlay-incluye");

    if (!modal || !overlay) return;

    modal.classList.add("show");
    overlay.classList.add("visible");
    document.body.classList.add("no-scroll");
}

/* =========================
   MOBILE - ESPECIFICACIONES
========================= */
function ver_mas_espec_mobile(boton) {

    const tabla = boton.closest("table");
    const extras = tabla.querySelectorAll(".extra-espec-mobile");

    const iconoMas = boton.querySelector(".ver-mas");
    const iconoMenos = boton.querySelector(".ver-menos");

    const expandido = extras[0].classList.contains("d-none") === false;

    if (!expandido) {

        extras.forEach(f => f.classList.remove("d-none"));
        iconoMas.classList.add("d-none");
        iconoMenos.classList.remove("d-none");

    } else {

        extras.forEach(f => f.classList.add("d-none"));
        iconoMas.classList.remove("d-none");
        iconoMenos.classList.add("d-none");
    }
}

/* =========================
   DESKTOP - ESPECIFICACIONES
========================= */
function ver_mas_espec_desktop() {

    const modal = document.getElementById("modal_expecf");
    if (modal) modal.classList.add("show");
}

/* =========================
   DESKTOP - CALCULAR ALTURA- ESPECIFICACIONES
========================= */
window.addEventListener("load", function() {

    if (window.innerWidth >= 768) {

        const contenedor = document.querySelector('.tabla-especificaciones-desktop');
        if (!contenedor) return;

        const tbody = contenedor.querySelector('tbody');
        const filas = tbody.querySelectorAll('tr:not(#fila-ver-mas-espec)');
        const boton = document.getElementById('fila-ver-mas-espec');

        if (!boton) return;

        const alturaContenedor = contenedor.clientHeight;
        const alturaBoton = boton.offsetHeight;
        const limite = alturaContenedor - alturaBoton;

        let alturaAcumulada = 0;
        let overflowDetectado = false;

        filas.forEach(fila => {

            const alturaFila = fila.offsetHeight;

            if (alturaAcumulada + alturaFila <= limite) {
                alturaAcumulada += alturaFila;
            } else {
                fila.style.display = "none";
                overflowDetectado = true;
            }

        });

        if (!overflowDetectado) {
            boton.style.display = "none";
        }

    }

});

/* =========================
   DESKTOP - CALCULAR ALTURA
========================= */
function controlarIncluye() {

    if (window.innerWidth < 768) return;

    const contenedor = document.querySelector(".tabla-incluye");
    const filas = Array.from(
        contenedor.querySelectorAll("tbody tr.fila-incluye")
    );

    if (!contenedor || !filas.length) return;

    // Reset
    filas.forEach(f => f.style.display = "table-row");

    const alturaMax = 300 - 40; 
    let alturaAcumulada = 0;

    for (let fila of filas) {

        const alturaFila = fila.offsetHeight;

        if (alturaAcumulada + alturaFila <= alturaMax) {
            alturaAcumulada += alturaFila;
        } else {
            fila.style.display = "none";
        }
    }
}

document.addEventListener("shown.bs.tab", function (e) {
    if (e.target.getAttribute("data-bs-target") === "#incluye") {

        setTimeout(function() {
            controlarIncluye();
        }, 50);

    }
});

window.addEventListener("resize", function () {
    setTimeout(function() {
        controlarIncluye();
    }, 50);
});


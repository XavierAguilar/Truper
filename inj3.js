const fs = require('fs');
let f = fs.readFileSync('index.html', 'utf8');

// Remover badge de printBackTags()
let search1 =             // Render Counts
            setTimeout(() => {
                let totalTags = btList.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);
                let totalPages = Math.ceil(totalTags / 12);
                let badge = document.querySelector('.bktag-total-badge');
                if(badge) badge.innerHTML = \?? Total: <span style="color:#fff">\</span> Gafetes &nbsp;|&nbsp; ??? Hojas estimadas: <span style="color:#fff">\</span>\;
            }, 10);
            
            let headerText = nombre;;
f = f.split(search1).join('            let headerText = nombre;');

// Insertar badge al final de renderBtList()
let search2 =             // Render Counts
            let totalTags = btList.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);
            let totalPages = Math.ceil(totalTags / 12);
            document.querySelector('.bktag-total-badge').innerHTML = \?? Total: <span style="color:#fff">\</span> Gafetes &nbsp;|&nbsp; ??? Hojas estimadas: <span style="color:#fff">\</span>\;;

let search3 =     function renderBtList() {;

// Si el inj anterior no funciono bien en renderBtList, aseguramos reinyectarlo manual
f = f.split('        // Render Counts\n            let totalTags').join('// removed');

let repFinal =     function renderBtList() {
        setTimeout(() => {
            let t = btList.reduce((a, it) => a + (parseInt(it.qty) || 0), 0);
            let p = Math.ceil(t / 12);
            let b = document.querySelector('.bktag-total-badge');
            if(b) b.innerHTML = \?? Total: <span style="color:#fff">\</span> Gafetes &nbsp;|&nbsp; ??? Hojas estimadas: <span style="color:#fff">\</span>\;
        }, 10);
;
f = f.replace(search3, repFinal);

fs.writeFileSync('index.html', f);
console.log('Inj3 fixed badge location');

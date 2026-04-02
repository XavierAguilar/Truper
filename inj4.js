const fs = require('fs');
let f = fs.readFileSync('index.html', 'utf8');
f = f.split('function renderBtList() {').join(unction renderBtList() {
            setTimeout(() => {
                let btns = document.querySelector('.bktag-total-badge');
                if(btns) {
                    let tags = btList.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);
                    let hojas = Math.ceil(tags / 12);
                    btns.innerHTML = \\\?? Total: <span style="color:#fff">\</span> Gafetes &nbsp;|&nbsp; ??? Hojas estimadas: <span style="color:#fff">\</span>\\\;
                }
            }, 10););
fs.writeFileSync('index.html', f);
console.log('Fixed Render List function injection');

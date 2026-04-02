const fs = require('fs');
let f = fs.readFileSync('index.html', 'utf8');
f = f.replace(
    'function renderBtList() {',
    'function renderBtList() {\n            setTimeout(() => {\n                let badge = document.querySelector(' + "'" + '.bktag-total-badge' + "'" + ');\n                if(badge) {\n                    let totalTags = btList.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);\n                    let totalPages = Math.ceil(totalTags / 12);\n                    badge.innerHTML = ?? Total: <span style=\"color:#fff\"></span> Gafetes &nbsp;|&nbsp; ??? Hojas estimadas: <span style=\"color:#fff\"></span>;\n                }\n            }, 10);\n'
);
fs.writeFileSync('index.html', f);
console.log('Fixed render list entry point!');

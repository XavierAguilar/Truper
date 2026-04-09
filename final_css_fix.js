const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// 1. Fix TypeError null on .style
let badCode1 = 'canvas.querySelector(\'.bktag\').style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";';
let badCode2 = 'canvas.querySelector(\'.bktag\').style.margin = "0 auto";';

let goodCode1 = 'const bk = canvas.querySelector(\'.bktag\'); if(bk) bk.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";';
let goodCode2 = 'if(bk) bk.style.margin = "0 auto";';

txt = txt.replace(badCode1, goodCode1).replace(badCode2, goodCode2);

// 2. Fix result-list-name back to White (#fff)
let oldResultList = /<div class="result-list-name"([^>]+)color:\s*#333;/g;
txt = txt.replace(oldResultList, '<div class="result-list-name"$1color: #fff;');

// 3. Add .search-box input { color: #000; }
let styleInjection = `
        .search-box input {
            color: #000 !important;
        }
        /* Fin Inyeccion CSS final */
        </style>
`;
if (!txt.includes('.search-box input {')) {
    txt = txt.replace('</style>', styleInjection);
}

fs.writeFileSync('index.html', txt, 'utf8');
console.log("CSS Final y Bug Fix (TypeError) aplicados exitosamente.");

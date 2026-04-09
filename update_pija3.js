const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// The line we want to replace is exactly the pija-subtitle-box CSS
let oldCss = ".pija-subtitle-box {\n                            width: 6cm; height: 0.5cm; display: flex; align-items: flex-end; justify-content: center;\n                            font-size: 15px; font-weight: 700; color: #fff; padding-bottom: 2px; box-sizing: border-box;\n                        }";
let newCss = ".pija-subtitle-box {\n                            width: 6cm; height: 0.5cm; display: flex; align-items: center; justify-content: center;\n                            font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px;\n                        }";

if(txt.includes(oldCss)) {
    txt = txt.replace(oldCss, newCss);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("CSS actualizado exitosamente");
} else {
    // try a more generic regex match
    txt = txt.replace(/\.pija-subtitle-box\s*\{[^}]+\}/g, newCss);
    fs.writeFileSync('index.html', txt, 'utf8');
    console.log("CSS actualizado usando Regex");
}

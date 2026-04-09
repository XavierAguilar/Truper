const fs = require('fs');
let txt = fs.readFileSync('index.html', 'utf8');

// Replace the mojibake with an HTML entity
txt = txt.replace(/ðŸ·ï¸ /g, "&#127991;&#65039;");
// Just in case it's currently represented as actual weird characters
txt = txt.replace(/Ã°Å¸Â·Ã¯Â¸Â/g, "&#127991;&#65039;"); 
txt = txt.replace(/ð[^\s]+ /g, "&#127991;&#65039; ");

// Make sure CatÃ¡logo or whatever is Catálogo
txt = txt.replace(/CatÃ¡logo/g, "Catálogo");

fs.writeFileSync('index.html', txt, 'utf8');
console.log("Emoji parcheado con HTML Entities.");

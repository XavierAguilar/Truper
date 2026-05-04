const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacements = {
    'â€”': '—',
    'â†’': '→',
    'âœ•': '✕',
    'âš ï¸ ': '⚠️',
    'â Œ': '❌',
    'â ±ï¸ ': '⏱️',
    'â “': '❓',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã': 'Í',
    'Â¿': '¿',
    'Â¡': '¡'
};

for (const [bad, good] of Object.entries(replacements)) {
    html = html.split(bad).join(good);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Mojibake limpiado');

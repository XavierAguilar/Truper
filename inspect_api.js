const fs = require('fs');
const data = JSON.parse(fs.readFileSync('api_response_100103.json', 'utf8'));
console.log('Array length:', data.length);
data.forEach((frag, i) => {
    console.log('\n=== Fragment [' + i + '] (' + frag.length + ' chars) ===');
    console.log(frag.substring(0, 800));
    console.log('...\n');
});

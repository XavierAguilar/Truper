const fs = require('fs');
const data = JSON.parse(fs.readFileSync('api_response_100103.json', 'utf8'));

// Save each fragment to a separate file for easy viewing
data.forEach((frag, i) => {
    const filename = 'api_frag_' + i + '.html';
    fs.writeFileSync(filename, frag, 'utf-8');
    console.log('Fragment [' + i + ']: ' + frag.length + ' chars -> ' + filename);
});

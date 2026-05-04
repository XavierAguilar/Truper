const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\hp\\Documents\\TRUPER\\index.html', 'utf8');

const target1 = `                var totalScore = 0;
                var allWordsMatch = true;

                for (var w = 0; w < words.length; w++) {`;
const replacement1 = `                var totalScore = 0;
                var allWordsMatch = true;
                var matchedWordsCount = 0;

                for (var w = 0; w < words.length; w++) {`;
content = content.replace(target1, replacement1);
if(!content.includes('matchedWordsCount = 0')){
    console.log("Failed to substitute target1");
    // Probamos con regex que quite problemas de \r
    content = content.replace(/var totalScore = 0;\s*var allWordsMatch = true;\s*for \(var w = 0; w < words.length; w\+\+\) \{/, 'var totalScore = 0;\r\n                var allWordsMatch = true;\r\n                var matchedWordsCount = 0;\r\n\r\n                for (var w = 0; w < words.length; w++) {');
}

const target2 = `                    if (wordScore === 0) { allWordsMatch = false; }
                    totalScore += wordScore;
                }`;
const replacement2 = `                    if (wordScore === 0) { allWordsMatch = false; }
                    else { matchedWordsCount++; }
                    totalScore += wordScore;
                }`;
content = content.replace(target2, replacement2);
if(!content.includes('matchedWordsCount++')){
    content = content.replace(/if \(wordScore === 0\) \{ allWordsMatch = false; \}\s*totalScore \+= wordScore;\s*\}/, 'if (wordScore === 0) { allWordsMatch = false; }\r\n                    else { matchedWordsCount++; }\r\n                    totalScore += wordScore;\r\n                }');
}

const target3 = `                // Matching parcial: si 2/3+ palabras coinciden, incluir con penalización
                var matchedWords = 0;
                for (var mw = 0; mw < words.length; mw++) {
                    // Contar cuántas palabras tuvieron score > 0
                    // (ya sumadas en totalScore, estimamos por el promedio)
                }
                if (!allWordsMatch && words.length >= 3 && totalScore > 0) {`;
const replacement3 = `                // Matching parcial: si 2/3+ palabras coinciden, incluir con penalización
                var nonStopWords = words.filter(w => !['de', 'para', 'con', 'sin', 'en', 'el', 'la', 'los', 'las', 'y', 'o'].includes(w));
                var reqMatches = Math.ceil(nonStopWords.length * 0.66);
                if (reqMatches === 0) reqMatches = 1;

                if (!allWordsMatch && words.length >= 3 && matchedWordsCount >= reqMatches) {`;
content = content.replace(target3, replacement3);
if(!content.includes('nonStopWords')){
    content = content.replace(/\/\/ Matching parcial: si 2\/3\+ palabras coinciden, incluir con penalización\s*var matchedWords = 0;\s*for \(var mw = 0; mw < words.length; mw\+\+\) \{\s*\/\/ Contar cuántas palabras tuvieron score > 0\s*\/\/ \(ya sumadas en totalScore, estimamos por el promedio\)\s*\}\s*if \(!allWordsMatch && words.length >= 3 && totalScore > 0\) \{/, '// Matching parcial: si 2/3+ palabras coinciden, incluir con penalización\r\n                var nonStopWords = words.filter(w => ![\'de\', \'para\', \'con\', \'sin\', \'en\', \'el\', \'la\', \'los\', \'las\', \'y\', \'o\'].includes(w));\r\n                var reqMatches = Math.ceil(nonStopWords.length * 0.66);\r\n                if (reqMatches === 0) reqMatches = 1;\r\n\r\n                if (!allWordsMatch && words.length >= 3 && matchedWordsCount >= reqMatches) {');
}

fs.writeFileSync('c:\\Users\\hp\\Documents\\TRUPER\\index.html', content);
console.log("Fix aplicado!");

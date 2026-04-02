const fs = require('fs');
let f = fs.readFileSync('index.html', 'utf8');
let search = '<input type="number" class="bt-item-qty" value="" min="1" onchange="changeBtQty(, this.value)">';
let rep = '<div class="qty-controls"><button class="qty-btn" onclick="changeBtQtyBtn(, -1)"><i class="fas fa-minus"></i></button><input type="number" class="bt-item-qty" value="" min="1" onchange="changeBtQty(, this.value)"><button class="qty-btn" onclick="changeBtQtyBtn(, 1)"><i class="fas fa-plus"></i></button></div>';
f = f.split(search).join(rep);
fs.writeFileSync('index.html', f);
console.log('Inj2 applied. found qty-btn?: ', f.includes('qty-controls'));

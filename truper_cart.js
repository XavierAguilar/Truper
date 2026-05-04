window.quoteCart = {
    items: [],
    init() {
        try {
            const saved = localStorage.getItem('trpr_quote_cart');
            if(saved) this.items = JSON.parse(saved);
        } catch(e) {}
        
        // Inyectar el DOM flotante al body si no existe
        if(!document.getElementById('quoteCartFloat')) {
            const floatHTML = `
                <div id="quoteCartFloat" onclick="window.quoteCart.openQuoter()" style="position:fixed; bottom:30px; right:30px; background:var(--primary); color:white; padding:12px 24px; border-radius:30px; box-shadow:0 10px 25px rgba(242, 101, 34, 0.4); cursor:pointer; z-index:9999; display:none; align-items:center; gap:10px; font-weight:600; font-size:15px; transition:transform 0.2s;">
                    <i class="fas fa-shopping-cart" style="font-size:18px;"></i>
                    <span>Ver Cotización (<span id="quoteCartCount">0</span>)</span>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', floatHTML);
        }
        
        this.updateUI();
    },
    
    add(codigo, e) {
        if(e) { e.preventDefault(); e.stopPropagation(); }
        
        if(!this.items.includes(codigo)) {
            this.items.push(codigo);
            localStorage.setItem('trpr_quote_cart', JSON.stringify(this.items));
            this.updateUI();
            
            if(window.Swal) {
                Swal.fire({ title: 'Agregado', text:'Producto enviado al cotizador', icon: 'success', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 });
            } else alert('Agregado');
            
            // Animación pop del botón flotante
            const btn = document.getElementById('quoteCartFloat');
            if(btn) {
                btn.style.transform = 'scale(1.1)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);
            }
        } else {
            if(window.Swal) Swal.fire({ title: 'Ya está', text:'El producto ya estaba en la cotización', icon: 'info', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 });
        }
    },
    
    updateUI() {
        let fl = document.getElementById('quoteCartFloat');
        let ct = document.getElementById('quoteCartCount');
        if(!fl) return;
        if(this.items.length > 0) {
            fl.style.display = 'flex';
            if(ct) ct.innerText = this.items.length;
        } else {
            fl.style.display = 'none';
        }
    },
    
    openQuoter() {
        window.open('cotizador.html', '_blank');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.quoteCart.init();
});

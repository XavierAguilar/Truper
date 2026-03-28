class functions {

    /**
     *
     */
    constructor(element) {
        this.element = element;
    }

    findProducts(id_producto){
        return new Promise( async (resolve) => {
            const ejecuta = await fetch("findProducts", {
                method:"POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({producto: id_producto})
            }).then(respuesta => respuesta.json())
            .then(data => {
                resolve(data);
            })
        });
    }

    findProductsCod(id_producto){
        return new Promise( async (resolve) => {
            const ejecuta = await fetch("findProductsCod", {
                method:"POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({producto: id_producto})
            }).then(respuesta => respuesta.json())
            .then(data => {
                resolve(data);
            })
        });
    }

    agregarManuales(id_producto){
        return new Promise( async (resolve) => {
            const ejecuta = await fetch("agregarManuales", {
                method:"POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id_producto: id_producto})
            }).then(respuesta => respuesta.json())
            .then(data => {
                resolve(data);
            })
        });
    }

    agregarDiagramas(id_producto){
        return new Promise( async (resolve) => {
            const ejecuta = await fetch("agregarDiagramas", {
                method:"POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id_producto: id_producto})
            }).then(respuesta => respuesta.json())
            .then(data => {
                resolve(data);
            })
        });
    }

    removeElement(){
        if(this.element)
            this.element.remove();
        else
       console.log("No Elimina elemento,no existe",this.element);
    }

    verificador_imagenes(){
        console.log("Verificador de imagenes");
        if(document.getElementById('thumbnails')){
            const div = document.getElementById('thumbnails');
            const imagenes = div.getElementsByTagName('img');
            const numeroDeImagenes = imagenes.length;
            if(numeroDeImagenes <= 4){
                up = document.getElementById('up');
                $(up).addClass('up_hidden');
                down = document.getElementById('down');
                $(down).addClass('up_hidden');
                prevImg = document.getElementById('prevImg');
                $(prevImg).addClass('hidden');
                nextImg = document.getElementById('nextImg');
                $(nextImg).addClass('hidden');
            }
        }
    }
}
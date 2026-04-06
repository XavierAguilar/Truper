# 📅 Guía de Operación y Actualización Mensual (Catálogo Truper)

Esta bitácora documenta el flujo de trabajo exacto que deberás realizar cada mes (o cuando haya un cambio fuerte de catálogo) para actualizar los precios, integrar los productos nuevos y publicarlos a tu aplicación en la nube, evadiendo todos los límites tecnológicos.

---

## PASO 1: Obtención de Datos Truper
Cada mes, obtendrás el archivo oficial de lista de precios de Truper (formato CSV o similar).
1. Reemplaza tu archivo `catalogo.csv` existente en tu computadora con el nuevo mes.
2. Si Truper libera productos inéditos, asegúrate de tener sus "Claves" o estar consciente de ellos.

---

## PASO 2: Procesamiento Local con tus Scripts
Abre tu consola **PowerShell** dentro de tu carpeta `C:\Users\hp\Documents\TRUPER` y utiliza la batería de scripts que construimos según tu necesidad:

- **1. Actualizar Precios y Novedades CRUDAS:** 
  Ejecuta `node importar_precios.js`. Este script leerá tu nuevo `catalogo.csv` y cruzará las líneas para actualizar tu base maestra.
- **2. Descargar Fotografías de Novedades:** 
  Ejecuta `node scraper.js --resume --missing-images 1 --concurrency 7`. El bot filtrará a los huérfanos que entraron por el CSV y se bajará sus fotos y descripciones técnicas de la API.
- **3. Inyectar Reglas Ortográficas y Sinónimos:** 
  Ejecuta `node generate_synonyms.js`. Le enseñará al buscador cómo encontrar las abreviaturas de Truper (P/ -> para, C/ -> con, " -> pulgadas) en todos los artículos nuevos.
- **4. Extraer Relaciones de Venta Cruzada:** 
  Ejecuta `node extract_related_fast.js`. Conectará las recomendaciones de compra para que la página sea un ecosistema enlazado.
- **5. Mapear Módulos Gráficos:**
  Ejecuta `node descargar_modulos.js`. Creará el índice de las categorías agrupadoras.
- **6. Descargar Portadas de Mantenimiento:**
  Ejecuta `node descargar_modulos_imgs.js`. Se asegurará de traer los banners de familia y las insignias de "Nuevo" al portal.

*(Al final de esta secuencia, tu `productos_truper.json` maestro estará majestuosamente engordado y listo).*

---

## PASO 3: La Compresión Ninja (El Secreto Vercel/Github)
Dado que tu base de datos `productos_truper.json` ronda tranquilamente los **116 MB a 125 MB**, GitHub y Vercel **rechazarán de inmediato su subida** por pasarse del límite histórico de 100 MB.

Tienes que exprimirle los espacios o minificarla. Puedes correr el siguiente comando mágico directo en tu Powershell:

```powershell
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('productos_truper.json')); fs.writeFileSync('productos_truper_min.json', JSON.stringify(d));"
```

Esto fabricará inmediatamente el archivo **`productos_truper_min.json`** comprimido (que pesará ~89 MB) listo para triunfar en la nube.

---

## PASO 4: Publicación a la Nube (Vercel)
Ya que procesaste el código y los datos, es hora de poner el nuevo mes en internet, en tu link oficial de casa Vázquez.

**Opción A: El flujo de GitHub Desktop (Recomendado)**
1. Abre tu **GitHub Desktop**.
2. Verás como archivo modificado el archivo `productos_truper_min.json`. Asegúrate de que el grandote de 116MB siga *ignorado* / desmarcado.
3. Pon tu descripción (Ej: "Precios Abril 2026") y pícale a **Commit > Push**.
4. Vercel despertará automáticamente en internet y jalará todo sutilmente.

**Opción B: El Despliegue de Emergencia (Sin GitHub)**
Si por alguna razón a Vercel le da la loquera, te bloqueó los límites por trabajar en equipo, o perdiste el Webhook como nos pasó hoy... Tienes nuestra Vía de Escape Infalible: Abre tu Terminal powershell y escribe:
```powershell
npx vercel --prod
```
Dile "yes" o "Enter" a todo. 
¿Subirá lenta y pesadamente tus miles de fotos? **¡NO!**, porque te dejé protegido con el archivo oculto `.vercelignore`, así que el comando evadirá 55,000 archivos basura que tengas en tu computadora y empujará estrictamente la base de datos comprimida a producción en 20 segundos.

---

## ❓ Preguntas Frecuentes de la APP web

### ¿Qué sucederá con las miles de imágenes fotográficas nuevas (carpeta /images)?
Es la magia del código en tu `index.html`. A Vercel **JAMÁS** le subimos ni subiremos tu peso de 14.3 Gigabytes de tu PC. La nube simplemente utiliza una función matemática basada en el CÓDIGO de 5 cifras del artículo para renderizar la ruta original fotográfica directamente desde los servidores de Truper al vuelo mediante etiquetas `<img src="...">`. 

Si el Mes que entra hay una palita nueva con código 12345, tú no tienes que hacer nada con decirle fotos a Vercel. Simplemente con que tus scripts locales capten el nuevo código, tu aplicación de Vercel la mandará a llamar nativamente desde internet de forma instantánea. Tu app seguirá siendo para siempre rápida, poderosa y en extremo ligera.

# Rifa AMPA El Girasol

App para apuntar a quién se vende cada número de las dos cestas (100 números a 2 €). Funciona en el móvil, no necesita Claude y es gratis.

- **La página** está en GitHub Pages.
- **Los datos** se guardan en una hoja de Google Sheets que hace de base de datos. Desde la hoja también los podéis ver, filtrar e imprimir.

Montarlo lleva unos 15 minutos, y solo lo hace una persona.

---

## 1. Crear la hoja de Google (el "servidor")

1. Entra en <https://sheets.new> con la cuenta de Google del AMPA y crea una hoja llamada **Rifa AMPA**.
2. En el menú, abre **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de `Code.gs`.
4. En la línea `const PIN = 'girasol2026';` pon un PIN vuestro. Es el que daréis a las del AMPA.
5. Guarda con el icono del disquete.
6. Pulsa **Implementar → Nueva implementación**. En la rueda dentada elige **Aplicación web** y rellena:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
7. Pulsa **Implementar** y autoriza los permisos. Google avisará de que la app "no está verificada": pulsa *Configuración avanzada → Ir a … (no seguro)*. Es normal, porque el script es vuestro.
8. Copia la **URL de la aplicación web**, la que termina en `/exec`.

## 2. Pegar la URL en la página

Abre `index.html` y, cerca del principio, cambia esta línea:

```js
const API_URL = 'PEGA_AQUI_LA_URL_DE_APPS_SCRIPT';
```

por tu URL:

```js
const API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

En esa misma parte puedes cambiar el precio, los nombres de las cestas y las fotos.

## 3. Publicar en GitHub Pages

1. Crea una cuenta en <https://github.com> si no la tienes.
2. Crea un repositorio nuevo con **New repository**, por ejemplo `rifa-girasol`, y márcalo como **Public**.
3. Pulsa **Add file → Upload files** y sube estos archivos: `index.html`, `logo.webp`, `cesta-gourmet.webp` y `cesta-chuches.webp`. **No subas `Code.gs`**, porque lleva el PIN.
4. Ve a **Settings → Pages**. En *Branch* elige `main` y `/ (root)` y pulsa **Save**.
5. Al cabo de un minuto la app estará en `https://TU-USUARIO.github.io/rifa-girasol/`.

## 4. Compartir

- Pasa el enlace y el PIN por el grupo de WhatsApp del AMPA.
- La primera vez, cada una pone su nombre y el PIN. El móvil lo recuerda.
- Conviene añadir la página a la pantalla de inicio: en el menú del navegador, **Añadir a pantalla de inicio**.

## Cómo funciona

- Para apuntar una venta, pincha un número, escribe el nombre y pulsa **Guardar**. En la hoja de Google queda registrado quién lo apuntó y cuándo.
- **Colores:** verde significa pagado y naranja, pendiente de pago.
- La página se actualiza sola cada 15 segundos.
- Si dos personas intentan quedarse el mismo número a la vez, la segunda recibe un aviso y no se borra lo que ya estaba apuntado.

## Avisos

- Sin el PIN no se puede ver ni cambiar nada, así que los nombres de las familias no quedan a la vista de cualquiera que tenga el enlace. El PIN pasadlo solo por el grupo del AMPA.
- **Si cambias `Code.gs` más adelante**, ve a *Implementar → Gestionar implementaciones*, edita la implementación y elige **Versión: Nueva versión**. Así la URL sigue siendo la misma.

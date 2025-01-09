# Porfolio — Pedro José Riquelme Guerrero

Portfolio personal. Sitio estático, sin frameworks ni dependencias: HTML, CSS y JavaScript.

## Estructura

```
index.html          Toda la página. Cada sección va marcada con comentarios ══ SECCIÓN ══
css/styles.css      Estilos. Los colores están en :root, al principio del archivo
js/main.js          Ruta interactiva, aparición al hacer scroll y año del pie
assets/img/         Foto de perfil (perfil.jpg, cuadrada)
assets/favicon.ico  Icono de la pestaña
```

## Qué se edita y dónde

| Quiero cambiar… | Archivo | Busca |
|---|---|---|
| Colores | `css/styles.css` | bloque `:root` |
| Foto | `assets/img/` | sustituir `perfil.jpg` |
| Texto de portada | `index.html` | `PORTADA` |
| Tecnologías de cada área | `index.html` | bloque `.areas` |
| Añadir un proyecto | `index.html` | `PLANTILLA PARA UN PROYECTO NUEVO` |
| Formación | `index.html` | `FORMACIÓN` |
| Datos de contacto | `index.html` | `CONTACTO` |

## Publicar en GitHub Pages

Settings → Pages → Source: `Deploy from a branch` → rama `main`, carpeta `/ (root)`.

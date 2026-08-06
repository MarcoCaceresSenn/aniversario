# 💕 5 Años Contigo, Ángela

Sitio web de aniversario con minijuegos románticos.

---

## 📁 Estructura del proyecto

```
Angela/
├── index.html       ← Estructura de la página
├── styles.css       ← Todo el diseño visual
├── app.js           ← Lógica de los minijuegos
├── vercel.json      ← Configuración para Vercel
└── photos/          ← 📸 TUS FOTOS VAN AQUÍ
    ├── photo1.jpg        ← Foto recompensa Capítulo I
    ├── photo2.jpg        ← Foto usada en el puzzle (Capítulo II)
    ├── photo2a.jpg       ← Foto mosaico izquierda (Capítulo II)
    ├── photo2b.jpg       ← Foto mosaico arriba derecha (Capítulo II)
    ├── photo2c.jpg       ← Foto mosaico abajo derecha (Capítulo II)
    ├── photo_travel.jpg  ← Foto del viaje (Capítulo III)
    ├── photo3a.jpg       ← Foto círculo grande (Final)
    └── photo3b.jpg       ← Foto círculo pequeño (Final)
```

---

## ✏️ Cómo personalizar

### 1. Agrega tus fotos
Crea la carpeta `photos/` y sube las 7 fotos con esos nombres exactos.
- Formato recomendado: JPG o WebP
- Tamaño recomendado: al menos 600x600px

### 2. Edita los mensajes
Abre `index.html` y busca los comentarios `✏️ MENSAJE X`.
Reemplaza el texto entre las etiquetas `<p class="reward-message">` con tus palabras.

### 3. Cambia la palabra secreta del Wordle
Abre `app.js` y busca:
```js
const WORDLE_SECRET = 'AMARTE'; // ✏️ CAMBIA ESTA PALABRA
const WORDLE_HINT   = 'Pista: es lo que siento cada día 💕';
```
Cámbiala por cualquier palabra de 6 letras (sin tildes, sin espacios).
Ejemplos: BESAME, JUNTOS, ETERNO, AMIGOS, SUENOS

---

## 🚀 Subir a Vercel

1. Crea cuenta en [vercel.com](https://vercel.com) (gratis)
2. Instala Vercel CLI: `npm i -g vercel`
3. En la carpeta del proyecto, ejecuta: `vercel`
4. Sigue los pasos (confirma configuración por defecto)
5. ¡Listo! Te dará un link como `https://angela-anniversario.vercel.app`

**O sin CLI:**
1. Ve a vercel.com → "New Project"
2. Sube la carpeta completa (incluyendo `photos/`)
3. Deploy

---

## 🎮 Los cuatro minijuegos

| # | Nombre | Descripción |
|---|--------|-------------|
| I | Memory de corazones | Encuentra los 8 pares. Mouse o teclado (flechas + Enter) |
| II | Puzzle deslizante | Ordena las 16 piezas de tu foto. Click o flechas de teclado |
| III | Nuestro mejor viaje | Adivina el destino con 5 pistas. Escribe y presiona Enter |
| IV | La palabra secreta | Wordle de 6 letras. Teclado físico o virtual en pantalla |

---

Hecho con amor 💕

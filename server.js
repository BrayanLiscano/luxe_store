const express = require('express');
const path = require('path');
const app = express();

// Puerto preferido
const PORT = process.env.PORT || 4000;

// Archivos estáticos (public)
app.use(express.static(path.join(__dirname, 'public')));

// Importar productos.json con manejo de error
let productos = [];
try {
  productos = require('./productos.json');
} catch (err) {
  console.error("❌ Error al cargar productos.json:", err.message);
}

// API para productos
app.get('/api/productos', (req, res) => {
  res.json(productos);
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor con manejo de error de puerto ocupado
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${server.address().port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ El puerto ${PORT} está en uso. Probando con uno libre...`);
    const altServer = app.listen(0, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${altServer.address().port}`);
    });
  } else {
    console.error("❌ Error del servidor:", err);
  }
});

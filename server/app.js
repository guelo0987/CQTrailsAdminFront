const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const proxyRoutes = require('./routes/proxy');
// Aquí importarías tus demás rutas

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir archivos estáticos si es necesario
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/api', proxyRoutes);
// Aquí añadirías tus demás rutas

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app; 
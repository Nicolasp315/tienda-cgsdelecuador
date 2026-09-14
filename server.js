const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname));

// Abrir la base de datos catalogo.db
const db = new Database(path.join(__dirname, 'catalogo.db'));

// Endpoint API para entregar los datos a script.js
app.get('/api/productos', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM "Catalogo Web - Productos"').all();

    const productos = rows.map((row, index) => {
      let precioRaw = String(row['PVP'] || '0').replace('$', '').replace(',', '.').trim();
      let precioNum = parseFloat(precioRaw) || 0;

      return {
        rowId: row['ID'] || `ROW-${index}`,
        nombre: row['Descripcion'] || '',
        precio: precioNum,
        presentacion: row['Presentacion'] || '',
        categoria: row['Categoria'] || '', // <-- NUEVA COLUMNA MAPEADA
        detalleAdicional: row['Detalle Adicional'] || '',
        imagen: row['Foto'] || 'https://via.placeholder.com/300x220?text=Sin+Imagen'
      };
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al consultar SQLite:', error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Servidor local activo en: http://localhost:${PORT}`);
});
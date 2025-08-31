const express = require('express')
const cors = require('cors')
const db = require('./db')
const app = express();

app.use(cors())//solicitudes desde otro origenes
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.json({ 
        message: '¡Backend funcionando correctamente!',
        status: 'OK',
        puerto: 5000,
        rutas_disponibles: [
            'GET /productos',
            'POST /productos', 
            'PUT /productos/:id',
            'DELETE /productos/:id',
            'GET /categorias',
            'GET /estadisticas'
        ]
    });
});

// Ruta para obtener todos los productos con filtros opcionales
app.get('/productos', (req, res) => {
    const { categoria, precio_min, precio_max, nombre } = req.query;
    let sql = 'SELECT * FROM productos WHERE 1=1';
    let params = [];

    // Filtro por nombre (búsqueda)
    if (nombre) {
        sql += ' AND nombre LIKE ?';
        params.push(`%${nombre}%`);
    }

    // Filtro por categoría
    if (categoria) {
        sql += ' AND categoria = ?';
        params.push(categoria);
    }

    // Filtro por precio mínimo
    if (precio_min) {
        sql += ' AND precio >= ?';
        params.push(parseFloat(precio_min));
    }

    // Filtro por precio máximo
    if (precio_max) {
        sql += ' AND precio <= ?';
        params.push(parseFloat(precio_max));
    }

    sql += ' ORDER BY nombre ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.json(results);
    });
});

// Ruta para obtener categorías únicas
app.get('/categorias', (req, res) => {
    const sql = 'SELECT DISTINCT categoria FROM productos ORDER BY categoria';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las categorías' });
        }
        res.json(results.map(row => row.categoria));
    });
});

// Ruta para agregar productos
app.post('/productos', (req, res) => {
    const { nombre, descripcion, precio, categoria, stock, proveedor } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!nombre || !precio || !categoria || !stock) {
        return res.status(400).json({ error: 'Los campos nombre, precio, categoría y stock son requeridos' });
    }

    // Validar que el precio sea un número positivo
    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    // Validar que el stock sea un número entero positivo
    if (!Number.isInteger(Number(stock)) || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
    }

    const sql = 'INSERT INTO productos (nombre, descripcion, precio, categoria, stock, proveedor, fecha_creacion) VALUES(?, ?, ?, ?, ?, ?, NOW())';

    db.query(sql, [nombre, descripcion, precio, categoria, stock, proveedor], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar el producto' });
        }

        res.json({
            message: 'Producto guardado correctamente',
            id: result.insertId,
            nombre,
            descripcion,
            precio,
            categoria,
            stock,
            proveedor
        });
    });
});

// Ruta para actualizar productos
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, stock, proveedor } = req.body;

    // Validaciones similares a la creación
    if (!nombre || !precio || !categoria || !stock) {
        return res.status(400).json({ error: 'Los campos nombre, precio, categoría y stock son requeridos' });
    }

    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    if (!Number.isInteger(Number(stock)) || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
    }

    const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, stock = ?, proveedor = ?, fecha_actualizacion = NOW() WHERE id = ?';

    db.query(sql, [nombre, descripcion, precio, categoria, stock, proveedor, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar el producto' });
        }
        return res.json({ message: 'Producto actualizado correctamente' });
    });
});

// Ruta para eliminar productos
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM productos WHERE id = ?';

    db.query(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        return res.json({ message: 'Producto eliminado correctamente' });
    });
});

// Ruta para obtener estadísticas básicas
app.get('/estadisticas', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_productos,
            SUM(stock) as stock_total,
            AVG(precio) as precio_promedio,
            COUNT(DISTINCT categoria) as total_categorias
        FROM productos
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        res.json(results[0]);
    });
});

app.listen(5000, () => {
    console.log('Servidor del backend corriendo desde el puerto 5000');
    console.log('Sistema de Gestión de Productos - Backend');
})


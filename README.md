# 🏢 Sistema de Gestión de Productos

Sistema web completo para la gestión de inventario, productos y categorías desarrollado como actividad académica.

## ✨ Características Principales

- **Gestión completa de productos** (CRUD)
- **Sistema de categorías inteligente**
- **Filtros de búsqueda avanzados**
- **Dashboard con estadísticas**
- **Interfaz moderna y responsive**

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React.js + Material-UI
- **Backend**: Node.js + Express.js
- **Base de Datos**: MySQL
- **Lenguaje**: JavaScript

## 🚀 Instalación

### Requisitos
- Node.js 18+
- MySQL 8.0+

### Pasos
1. **Clonar repositorio**
   ```bash
   git clone https://github.com/GabrielSanchez73/ACTIVIDAD-1.-Analicemos-y-dise-emos-un-software-para-a-gesti-n-gerencial-de-organizaciones.git
   cd ACTIVIDAD-1.-Analicemos-y-dise-emos-un-software-para-a-gesti-n-gerencial-de-organizaciones
   ```

2. **Instalar dependencias del servidor**
   ```bash
   cd server
   npm install
   ```

3. **Instalar dependencias del cliente**
   ```bash
   cd ../client
   npm install
   ```

4. **Configurar base de datos**
   - Crear base de datos MySQL: `sistema_productos`
   - Ejecutar script: `database.sql`

5. **Iniciar sistema**
   ```bash
   # Terminal 1 - Servidor
   cd server && npm start
   
   # Terminal 2 - Cliente
   cd client && npm start
   ```

## 📱 Acceso

- **Frontend**: http://localhost:4000
- **Backend**: http://localhost:5000

## 📊 Funcionalidades

### Gestión de Productos
- Agregar, editar, eliminar productos
- Campos: nombre, descripción, precio, categoría, stock, proveedor
- Validaciones de formulario

### Sistema de Categorías
- Selector desplegable de categorías existentes
- Creación de nuevas categorías en tiempo real
- Sincronización automática

### Filtros de Búsqueda
- Filtro por nombre
- Filtro por categoría
- Filtros de precio (mínimo y máximo)
- Filtros combinados

### Dashboard
- Contador de productos totales
- Stock disponible
- Precio promedio
- Número de categorías

## 🏗️ Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.js         # Componente principal
│   │   ├── config.js      # Configuración
│   │   └── ProductTable.js
│   └── package.json
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor Express
│   ├── db.js              # Conexión MySQL
│   └── database.sql       # Script de base de datos
├── README.md
└── iniciar-sistema.bat    # Script de inicio para Windows
```

## 🧪 Pruebas

```bash
# Pruebas generales del sistema
node test-system.js

# Pruebas específicas de filtros
node test-filtros-precio.js
```

## 📚 Documentación Adicional

- `README_MEJORAS.md` - Detalles de implementación
- `SISTEMA_FILTROS.md` - Guía de filtros
- `iniciar-sistema.bat` - Script de inicio automático

## 👨‍💻 Desarrollador

**Gabriel Sánchez** - Estudiante de Ingeniería de Software

## 📅 Fecha

31/08/2025

## �� Licencia

Proyecto académico - Universidad

---

**Desarrollado con ❤️ para el aprendizaje y desarrollo profesional**

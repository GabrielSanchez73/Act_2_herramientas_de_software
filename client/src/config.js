// Configuración del sistema
export const CONFIG = {
  // URLs de la API
  API_BASE_URL: 'http://localhost:5000',
  
  // Endpoints
  ENDPOINTS: {
    PRODUCTOS: '/productos',
    CATEGORIAS: '/categorias',
    ESTADISTICAS: '/estadisticas'
  },
  
  // Configuración de la aplicación
  APP: {
    NOMBRE: 'Sistema de Gestión de Productos',
    DESCRIPCION: 'Control completo de inventario, precios y proveedores',
    VERSION: '1.0.0'
  },
  
  // Configuración de la base de datos
  DB: {
    NOMBRE: 'sistema_productos',
    TABLA: 'productos'
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
};

// Función helper para obtener la URL completa de un endpoint
export const getApiUrl = (endpointName) => {
  return buildApiUrl(CONFIG.ENDPOINTS[endpointName]);
};


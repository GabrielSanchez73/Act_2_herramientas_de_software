import React, { useState, useEffect } from 'react';
import { CONFIG, getApiUrl } from './config';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import './App.css';

function App() {
  // Estados para el formulario de productos
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [stock, setStock] = useState('');
  const [proveedor, setProveedor] = useState('');

  // Estados para la gestión de datos
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [estadisticas, setEstadisticas] = useState({});

  // Estados para filtros y búsqueda
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarEstadisticas();
  }, []);

  // Función para cargar productos con filtros
  const cargarProductos = async () => {
    try {
      let url = getApiUrl('PRODUCTOS');
      const params = new URLSearchParams();
      
      if (filtroNombre) params.append('nombre', filtroNombre);
      if (filtroCategoria) params.append('categoria', filtroCategoria);
      if (filtroPrecioMin && filtroPrecioMin.trim() !== '') params.append('precio_min', filtroPrecioMin);
      if (filtroPrecioMax && filtroPrecioMax.trim() !== '') params.append('precio_max', filtroPrecioMax);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      mostrarNotificacion('Error al cargar los productos', 'error');
    }
  };

  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch(getApiUrl('CATEGORIAS'));
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      // Error silencioso para categorías
    }
  };

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(getApiUrl('ESTADISTICAS'));
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      // Error silencioso para estadísticas
    }
  };

  // Función para mostrar notificaciones
  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Función para cerrar notificaciones
  const cerrarNotificacion = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Función para abrir/cerrar el diálogo
  const toggleDialog = () => {
    setOpenDialog(!openDialog);
    if (!openDialog) {
      limpiarFormulario();
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('');
    setNuevaCategoria('');
    setStock('');
    setProveedor('');
    setEditIndex(null);
  };

  // Función para guardar o actualizar producto
  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!nombre || !precio || !stock) {
      mostrarNotificacion('Los campos nombre, precio y stock son requeridos', 'error');
      return;
    }

    // Determinar la categoría final
    let categoriaFinal = categoria;
    if (categoria === '__nueva__') {
      if (!nuevaCategoria.trim()) {
        mostrarNotificacion('Debe especificar el nombre de la nueva categoría', 'error');
        return;
      }
      categoriaFinal = nuevaCategoria.trim();
    } else if (!categoria) {
      mostrarNotificacion('Debe seleccionar o crear una categoría', 'error');
      return;
    }

    try {
      if (editIndex !== null) {
        // Actualizar producto existente
        const producto = productos[editIndex];
        const response = await fetch(`${getApiUrl('PRODUCTOS')}/${producto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, descripcion, precio, categoria: categoriaFinal, stock, proveedor })
        });

        if (response.ok) {
          const nuevosProductos = [...productos];
          nuevosProductos[editIndex] = { ...producto, nombre, descripcion, precio, categoria, stock, proveedor };
          setProductos(nuevosProductos);
          setEditIndex(null);
          mostrarNotificacion('Producto actualizado correctamente');
        } else {
          const errorData = await response.json();
          mostrarNotificacion(errorData.error || 'Error al actualizar el producto', 'error');
        }
      } else {
        // Crear nuevo producto
        const response = await fetch(getApiUrl('PRODUCTOS'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, descripcion, precio, categoria: categoriaFinal, stock, proveedor })
        });

        const data = await response.json();
        if (response.ok) {
          setProductos([...productos, data]);
          mostrarNotificacion('Producto guardado correctamente');
        } else {
          mostrarNotificacion(data.error || 'Error al guardar el producto', 'error');
        }
      }

      toggleDialog();
      cargarEstadisticas();
      cargarCategorias(); // Recargar categorías para incluir las nuevas
    } catch (error) {
      mostrarNotificacion('Error de conexión', 'error');
    }
  };

  // Función para eliminar producto
  const eliminarProducto = async (idx) => {
    const producto = productos[idx];
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`)) {
      try {
        const response = await fetch(`${getApiUrl('PRODUCTOS')}/${producto.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProductos(productos.filter((_, i) => i !== idx));
          if (editIndex === idx) {
            setEditIndex(null);
            limpiarFormulario();
          }
          mostrarNotificacion('Producto eliminado correctamente');
          cargarEstadisticas();
        } else {
          mostrarNotificacion('Error al eliminar el producto', 'error');
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al eliminar', 'error');
      }
    }
  };

  // Función para editar producto
  const editarProducto = (idx) => {
    const producto = productos[idx];
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio);
    setCategoria(producto.categoria);
    setNuevaCategoria('');
    setStock(producto.stock);
    setProveedor(producto.proveedor || '');
    setEditIndex(idx);
    setOpenDialog(true);
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    cargarProductos();
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroCategoria('');
    setFiltroPrecioMin('');
    setFiltroPrecioMax('');
    cargarProductos();
  };

  // Función para verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return filtroNombre || filtroCategoria || 
           (filtroPrecioMin && filtroPrecioMin.trim() !== '') || 
           (filtroPrecioMax && filtroPrecioMax.trim() !== '');
  };

  // Función para obtener el resumen de filtros activos
  const obtenerResumenFiltros = () => {
    const filtros = [];
    if (filtroNombre) filtros.push(`Nombre: "${filtroNombre}"`);
    if (filtroCategoria) filtros.push(`Categoría: "${filtroCategoria}"`);
    if (filtroPrecioMin && filtroPrecioMin.trim() !== '') filtros.push(`Precio ≥ $${filtroPrecioMin}`);
    if (filtroPrecioMax && filtroPrecioMax.trim() !== '') filtros.push(`Precio ≤ $${filtroPrecioMax}`);
    return filtros.join(', ');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          🏢 {CONFIG.APP.NOMBRE}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {CONFIG.APP.DESCRIPCION}
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{estadisticas.total_productos || 0}</Typography>
                  <Typography variant="body2">Total Productos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{estadisticas.stock_total || 0}</Typography>
                  <Typography variant="body2">Stock Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    ${Number(estadisticas.precio_promedio || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Precio Promedio</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{estadisticas.total_categorias || 0}</Typography>
                  <Typography variant="body2">Categorías</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            color: '#2c3e50',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FilterIcon sx={{ color: '#3498db' }} />
            Filtros de Búsqueda
          </Typography>
          {hayFiltrosActivos() && (
            <Chip
              label={`Filtros activos: ${obtenerResumenFiltros()}`}
              color="primary"
              variant="outlined"
              onDelete={limpiarFiltros}
              deleteIcon={<FilterIcon />}
              sx={{ 
                background: 'rgba(52, 152, 219, 0.1)',
                borderColor: '#3498db',
                color: '#2c3e50',
                fontWeight: 500
              }}
            />
          )}
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar por nombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#3498db' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3498db',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3498db',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3498db',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoría"
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                  // Aplicar filtro automáticamente al cambiar categoría
                  setTimeout(() => aplicarFiltros(), 100);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#3498db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3498db',
                  },
                }}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Precio mínimo"
              type="number"
              value={filtroPrecioMin}
              onChange={(e) => setFiltroPrecioMin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#27ae60',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#27ae60',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#27ae60',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Precio máximo"
              type="number"
              value={filtroPrecioMax}
              onChange={(e) => setFiltroPrecioMax(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#e74c3c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e74c3c',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e74c3c',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1.5, height: '100%' }}>
              <Button 
                variant="contained" 
                onClick={aplicarFiltros} 
                sx={{ 
                  flex: 1,
                  minHeight: '56px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<SearchIcon />}
              >
                Buscar
              </Button>
              <Button 
                variant="outlined" 
                onClick={limpiarFiltros} 
                sx={{ 
                  flex: 1,
                  minHeight: '56px',
                  borderColor: '#FF9800',
                  color: '#FF9800',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#F57C00',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<FilterIcon />}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Indicador de resultados filtrados */}
        {hayFiltrosActivos() && (
          <Box sx={{ 
            mt: 3, 
            p: 2.5, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
          }}>
            <SearchIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              🔍 Mostrando {productos.length} producto(s) con los filtros aplicados
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Botón para agregar producto */}
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={toggleDialog}
          size="large"
          sx={{ 
            background: 'linear-gradient(45deg, #27ae60 30%, #2ecc71 90%)',
            boxShadow: '0 3px 5px 2px rgba(46, 204, 113, .3)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(45deg, #229954 30%, #27ae60 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px 2px rgba(46, 204, 113, .4)',
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          Agregar Producto
        </Button>
      </Box>

      {/* Tabla de productos */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header de la tabla con información de filtros */}
        {hayFiltrosActivos() && (
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 2px 10px rgba(243, 156, 18, 0.3)'
          }}>
            <FilterIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              ⚠️ Tabla filtrada: {obtenerResumenFiltros()}
            </Typography>
          </Box>
        )}
        
        <Table>
          <TableHead>
            <TableRow sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '& th': {
                borderBottom: '2px solid #5a6fd8'
              }
            }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                Productos {hayFiltrosActivos() && `(${productos.length} encontrados)`}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Precio</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Categoría</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Stock</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Proveedor</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  {hayFiltrosActivos() ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No se encontraron productos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No hay productos que coincidan con los filtros aplicados:
                      </Typography>
                      <Chip
                        label={obtenerResumenFiltros()}
                        color="warning"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={limpiarFiltros}
                          startIcon={<FilterIcon />}
                        >
                          Limpiar filtros
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay productos registrados
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Comienza agregando tu primer producto
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={toggleDialog}
                        startIcon={<AddIcon />}
                      >
                        Agregar Producto
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto, idx) => (
                <TableRow 
                  key={idx} 
                  hover
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                      {producto.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {producto.descripcion || 'Sin descripción'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={`$${parseFloat(producto.precio).toFixed(2)}`}
                      color="success"
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={producto.categoria}
                      color="primary"
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(33, 150, 243, 0.2)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={producto.stock}
                      color={producto.stock > 10 ? 'success' : producto.stock > 5 ? 'warning' : 'error'}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {producto.proveedor || 'No especificado'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        color="primary"
                        onClick={() => editarProducto(idx)}
                        size="small"
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => eliminarProducto(idx)}
                        size="small"
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para agregar/editar producto */}
      <Dialog open={openDialog} onClose={toggleDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIndex !== null ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </DialogTitle>
        <form onSubmit={guardarProducto}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del producto"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={categoria}
                    label="Categoría"
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      if (e.target.value === '__nueva__') {
                        setNuevaCategoria('');
                      }
                    }}
                    onOpen={() => {}}
                  >
                    <MenuItem value="">
                      <em>Seleccionar categoría</em>
                    </MenuItem>
                    {categorias.map((cat, index) => (
                      <MenuItem key={index} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                    <MenuItem value="__nueva__">
                      <em>➕ Agregar nueva categoría</em>
                    </MenuItem>
                  </Select>
                </FormControl>
                {categoria === '__nueva__' && (
                  <TextField
                    fullWidth
                    label="Nueva categoría"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    margin="dense"
                    size="small"
                    placeholder="Escribe el nombre de la nueva categoría"
                  />
                )}
                {categoria && categoria !== '__nueva__' && !categorias.includes(categoria) && (
                  <Typography variant="caption" color="info.main" sx={{ mt: 1, display: 'block' }}>
                    Nueva categoría: "{categoria}" será agregada automáticamente
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proveedor"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editIndex !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={cerrarNotificacion}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
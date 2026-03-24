# DragStore Toska - Sistema de Gestión para Minimercado

Sistema de gestión integral para **Minimercado Toska** ubicado en Calilegua, Jujuy, Argentina.

## Características

- **Dashboard**: Estadísticas de ventas en tiempo real
- **Punto de Venta (POS)**: Sistema rápido de ventas con carrito de compras
- **Gestión de Productos**: CRUD completo con control de stock
- **Categorías**: Organización de productos por categorías
- **Órdenes/Ventas**: Historial completo de transacciones
- **Reportes**: Gráficos y estadísticas de ventas

## Stack Tecnológico

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express.js
- **Base de Datos**: MongoDB
- **Estado**: Zustand + React Query
- **Gráficos**: Recharts

## Requisitos Previos

- Node.js 18+
- MongoDB (local o Atlas)
- npm o yarn

## Instalación

### 1. Clonar el proyecto
```bash
cd C:\Users\tsoft\proyectos\dragstore-toska
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dragstore_toska
JWT_SECRET=tu-secret-key-segura
JWT_EXPIRES_IN=7d
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=DragStore Toska
```

### 5. Crear base de datos en MongoDB
```bash
# Opción 1: Usando mongosh
mongosh
> use dragstore_toska
> exit

# Opción 2: Usando MongoDB Compass
# Crear nueva conexión con URI: mongodb://localhost:27017/dragstore_toska
```

### 6. Poblar datos de prueba (Opcional)
```bash
cd backend
npm run seed
```

Esto creará:
- Usuario admin: `admin@toska.com` / `admin123`
- Usuario cajero: `cajero@toska.com` / `cajero123`
- 8 categorías de ejemplo
- 15 productos de ejemplo
- 1 proveedor de ejemplo

## Ejecución

### Desarrollo ( ambos en terminal separada)

**Backend**:
```bash
cd backend
npm run dev
```
Servidor en: http://localhost:5000

**Frontend**:
```bash
cd frontend
npm run dev
```
Aplicación en: http://localhost:3000

### Producción
```bash
# Build frontend
cd frontend
npm run build

# El build se servirá desde el backend en modo producción
```

## Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@toska.com | admin123 |
| Cajero | cajero@toska.com | cajero123 |

## Estructura del Proyecto

```
dragstore-toska/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de DB
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, errores
│   │   ├── models/         # Schemas de MongoDB
│   │   ├── routes/         # Rutas de API
│   │   ├── services/       # Servicios reutilizables
│   │   └── utils/          # Helpers, seed data
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales
│   │   ├── stores/         # Estado global (Zustand)
│   │   ├── services/       # Cliente API (Axios)
│   │   └── styles/         # TailwindCSS
│   └── App.jsx
├── SPEC.md                 # Especificación técnica
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Usuario actual

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden/venta
- `PUT /api/orders/:id/cancel` - Cancelar orden

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/sales` - Ventas por período
- `GET /api/dashboard/top-products` - Productos más vendidos

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| admin | Todos los permisos |
| cashier | Punto de venta, ver ventas |
| stock | Gestionar productos, ver inventario |

## Comandos Útiles

```bash
# Desarrollo
npm run dev          # Ejecutar con hot-reload

# Seed data
npm run seed         # Poblar base de datos con datos de prueba

# Limpiar base de datos
# (Desde mongosh o Compass)
db.users.drop()
db.products.drop()
db.categories.drop()
```

## Solución de Problemas

### MongoDB no conecta
1. Verificar que MongoDB esté corriendo: `mongod`
2. Verificar URI en `.env`
3. Crear database manualmente

### CORS errors
Verificar que el frontend tiene el proxy configurado en `vite.config.js` apuntando al backend.

### Token expira
El token JWT expira según `JWT_EXPIRES_IN`. Por defecto 7 días. Hacer logout/login para renovar.

## Próximos Pasos

- [ ] Módulo de proveedores
- [ ] Registro de gastos
- [ ] Alertas por email/WhatsApp
- [ ] App móvil (React Native)
- [ ] Modo offline para zonas sin internet
- [ ] Impresión de tickets
- [ ] Gestión de caja (apertura/cierre)

---

**DragStore Toska** - Calilegua, Jujuy, Argentina © 2026

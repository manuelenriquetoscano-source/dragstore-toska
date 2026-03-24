# SPEC.md - Sistema Minimercado-Toska (MERN Stack)

## 1. Concepto y Visión

Sistema de gestión integral para minimercado de barrio en Calilegua, Jujuy. Diseñado para simplificar la gestión de inventario, ventas y relación con clientes en un entorno con conectividad limitada. Interfaz simple, rápida y accesible para propietarios con conocimiento técnico básico.

**Tono visual**: Profesional pero cercano, inspirado en la calidez norteña argentina.

---

## 2. Stack Tecnológico

```
Frontend:    React 18 + Vite + TailwindCSS
Backend:     Node.js + Express.js
Database:    MongoDB (Atlas para producción, local para desarrollo)
Auth:        JWT + bcrypt
State:       Zustand (frontend) + React Query
Mobile:      React Native (futura expansión)
```

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE (React)                     │
│   Admin Dashboard │ Punto de Venta │ App Cliente       │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (Express)                      │
│   Routes → Controllers → Services → Models (Mongoose)   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  MONGODB ATLAS                          │
│   collections: users, products, orders, suppliers       │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Estructura del Proyecto

```
dragstore-toska/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión MongoDB
│   │   │   └── config.js            # Variables entorno
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── categoryController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # Verificación JWT
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── Supplier.js
│   │   │   └── Expense.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   └── dashboard.js
│   │   ├── services/
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   └── reportService.js
│   │   └── utils/
│   │       ├── helpers.js
│   │       └── constants.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── DataTable.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductCard.jsx
│   │   │   ├── orders/
│   │   │   │   ├── POS.jsx              # Punto de venta
│   │   │   │   ├── OrderList.jsx
│   │   │   │   └── Cart.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCards.jsx
│   │   │       └── SalesChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── POS.jsx                 # Punto de venta
│   │   │   ├── Suppliers.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   └── useOrders.js
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance
│   │   ├── stores/
│   │   │   ├── authStore.js
│   │   │   └── cartStore.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 5. Modelos de Base de Datos (MongoDB)

### 5.1 User (Usuarios/Empleados)

```javascript
// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'cashier', 'stock'], 
    default: 'cashier' 
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 5.2 Category (Categorías)

```javascript
// backend/src/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: '#6366f1' },
  icon: { type: String },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
```

### 5.3 Product (Productos)

```javascript
// backend/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barCode: { type: String },
  description: { type: String },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  purchasePrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 5 },
  unit: { 
    type: String, 
    enum: ['unidad', 'kg', 'litro', 'paquete', 'botella', 'lata'],
    default: 'unidad' 
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  expirationDate: { type: Date },
  image: { type: String },  // URL o base64
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = 'SKU-' + Date.now().toString(36).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  return ((this.salePrice - this.purchasePrice) / this.salePrice * 100).toFixed(2);
});

module.exports = mongoose.model('Product', productSchema);
```

### 5.4 Order (Pedidos/Ventas)

```javascript
// backend/src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },  // Snapshot del nombre
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['sale', 'order', 'return'], 
    default: 'sale' 
  },
  customer: {
    name: { type: String },
    phone: { type: String }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'transfer', 'debt'], 
    default: 'cash' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed' 
  },
  notes: { type: String },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'VT' + date.getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = prefix + random;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
```

### 5.5 Supplier (Proveedores)

```javascript
// backend/src/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema);
```

### 5.6 Expense (Gastos)

```javascript
// backend/src/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { 
    type: String,
    enum: ['services', 'rent', 'supplies', 'salaries', 'maintenance', 'other'],
    required: true 
  },
  date: { type: Date, default: Date.now },
  receipt: { type: String },  // URL o nota
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Expense', expenseSchema);
```

---

## 6. API Endpoints

### 6.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |
| PUT | `/api/auth/profile` | Actualizar perfil |

### 6.2 Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos (con filtros) |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/products/barcode/:barcode` | Buscar por código de barras |
| GET | `/api/products/low-stock` | Productos con stock bajo |
| PUT | `/api/products/:id/stock` | Actualizar stock (entrada/salida) |

### 6.3 Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/:id` | Actualizar categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

### 6.4 Órdenes/Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders` | Listar ventas |
| GET | `/api/orders/:id` | Detalle de venta |
| POST | `/api/orders` | Crear venta |
| POST | `/api/orders/return` | Registrar devolución |
| DELETE | `/api/orders/:id` | Anular venta |

### 6.5 Proveedores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/suppliers` | Listar proveedores |
| POST | `/api/suppliers` | Crear proveedor |
| PUT | `/api/suppliers/:id` | Actualizar proveedor |
| DELETE | `/api/suppliers/:id` | Eliminar proveedor |

### 6.6 Dashboard/Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Estadísticas generales |
| GET | `/api/dashboard/sales?range=week` | Ventas por período |
| GET | `/api/dashboard/top-products` | Productos más vendidos |
| GET | `/api/dashboard/inventory-value` | Valor del inventario |

---

## 7. Formato de Respuesta API

```javascript
// Éxito
{
  success: true,
  data: { ... },
  message: 'Operación exitosa'
}

// Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'El campo nombre es requerido',
    details: [...]
  }
}

// Paginación
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

---

## 8. Flujos Principales

### 8.1 Flujo de Venta (POS)

```
1. Cajero abre módulo POS
2. Busca producto por: nombre, SKU o escanea código de barras
3. Agrega items al carrito
4. Ajusta cantidades si es necesario
5. Aplica descuento (opcional)
6. Selecciona método de pago
7. Confirma venta
8. Sistema:
   - Genera número de orden
   - Actualiza stock de productos
   - Registra movimiento en historial
   - Muestra ticket/impresión
```

### 8.2 Flujo de Inventario

```
1. Administrador accede a módulo de productos
2. Puede: Agregar, editar, eliminar productos
3. Registro de entrada de stock:
   - Seleccionar proveedor
   - Ingresar productos recibidos
   - Sistema actualiza precios y stock
4. Alertas de stock mínimo
5. Reporte de productos próximos a vencer
```

### 8.3 Flujo de Reportes

```
1. Administrador selecciona tipo de reporte
2. Define período (día, semana, mes, personalizado)
3. Sistema genera:
   - Ventas por período
   - Productos más vendidos
   - Margen de ganancia
   - Resumen de gastos
   - Valorización de inventario
4. Exportación a PDF/Excel (futuro)
```

---

## 9. Variables de Entorno

```env
# Backend (.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dragstore_toska
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=DragStore Toska
```

---

## 10. Funcionalidades MVP (Versión 1.0)

### Módulo Administrador
- [ ] Dashboard con estadísticas de ventas
- [ ] CRUD completo de productos
- [ ] CRUD de categorías
- [ ] CRUD de proveedores
- [ ] Gestión de usuarios (admin/cajero)
- [ ] Registro de gastos
- [ ] Reportes básicos de ventas

### Módulo Punto de Venta
- [ ] Búsqueda rápida de productos
- [ ] Carrito de compras
- [ ] Métodos de pago (efectivo, transferencia)
- [ ] Aplicación de descuentos
- [ ] Generación de ticket
- [ ] Apertura/cierre de caja

### Módulo Inventario
- [ ] Entrada de mercancía
- [ ] Control de stock mínimo
- [ ] Alertas de productos próximos a vencer
- [ ] Historial de movimientos

---

## 11. Consideraciones Técnicas

### 11.1 Offline-First (Futuro)
Para zonas con conectividad limitada, considerar:
- IndexedDB para cache local
- Sync automático cuando haya conexión
- Cola de operaciones pendientes

### 11.2 Seguridad
- Validación de inputs en backend y frontend
- Rate limiting en APIs
- Sanitización de datos
- HTTPS obligatorio en producción

### 11.3 Escalabilidad
- Diseño de API RESTful para futura integración móvil
- Estructura preparada para microservicios

---

## 12. Dependencias

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.8.4",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.3",
    "sonner": "^1.2.2"
  }
}
```

---

*Documento creado para el proyecto Minimercado-Toska - Calilegua, Jujuy*
*Versión: 1.0 - 2026*

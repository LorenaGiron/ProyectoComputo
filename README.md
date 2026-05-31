# AURA Boutique — Sistema ERP

Sistema de gestión empresarial (ERP) para una boutique de moda, desarrollado como proyecto académico. Incluye un panel administrativo completo para la gestión interna del negocio y una tienda en línea para clientes.

---

## Tecnologías utilizadas

### Frontend
| Tecnología | Uso |
|---|---|
| **React 19** | Librería principal de UI con componentes funcionales y hooks |
| **Vite** | Bundler y servidor de desarrollo rápido |
| **TailwindCSS v4** | Estilos utilitarios y diseño responsivo |
| **React Router v6** | Navegación y rutas protegidas |
| **Lucide React** | Íconos del panel administrativo |
| **Bootstrap Icons** | Íconos de la tienda en línea |
| **jsPDF + jspdf-autotable** | Exportación y generación de tickets de compra en PDF |

### Backend
| Tecnología | Uso |
|---|---|
| **Node.js + Express** | Servidor HTTP y API REST |
| **Firebase Firestore** | Base de datos NoSQL en la nube |
| **JWT** | Autenticación stateless con tokens de acceso y refresco |
| **Zod** | Validación y tipado de datos en endpoints |
| **bcryptjs** | Hash seguro de contraseñas |
| **Nodemailer** | Envío de correos para recuperación de contraseña |

---

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Cuenta de Firebase con proyecto creado y Firestore habilitado
- Service Account de Firebase (archivo JSON con credenciales)

---

## Variables de entorno

### Backend — `backend-computo-ej2026/.env`

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=tu_secreto_refresh
JWT_REFRESH_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY=tu_private_key

# Correo (recuperación de contraseña)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASSWORD=tu_password_de_aplicacion
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/LorenaGiron/ProyectoComputo.git
cd ProyectoComputo
```

### 2. Configurar el Backend

```bash
cd backend-computo-ej2026
npm install
# Crear el archivo .env con las variables listadas arriba
npm run dev
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
# Crear el archivo .env con VITE_API_URL
npm run dev
```

### 4. Inicializar la base de datos (primer uso)

Ejecutar el seed para crear el usuario administrador, los permisos base y el rol ADMIN:

```bash
cd backend-computo-ej2026
node src/seeds/create-first-user.js
```

> **Nota:** Este comando también debe ejecutarse en cada nueva computadora que use el proyecto por primera vez.

---

## Credenciales de prueba

| Campo | Valor |
|---|---|
| **Usuario** | `proyecto` |
| **Contraseña** | `Hello2U` |
| **Rol** | ADMIN (acceso total) |

---

## Módulos del sistema

### Panel Administrativo

#### Dashboard
- **Tarjetas de métricas generales:**
  - Total de productos (activos vs inactivos)
  - Total de clientes (activos vs inactivos)
  - Total de proveedores (activos vs inactivos)
  - Recepciones registradas con valor total reciente
  - Productos con bajo stock que requieren reorden
- **Gráficas interactivas** con toggle entre vista de tabla y gráfica:
  - Distribución de productos por categoría (gráfica de barras)
  - Composición de clientes activos/inactivos (gráfica de pastel)
  - Tendencia de recepciones (gráfica de área)
  - Comparativa de métricas (gráfica compuesta con líneas y barras)
- Actividad reciente del sistema con eventos de auditoría
- Recepciones recientes con estado y proveedor

#### Productos
- Listar productos con paginación, búsqueda por nombre/SKU y filtros por categoría, departamento y estado
- **Crear producto** con los siguientes campos:
  - Nombre, SKU, categoría (Playeras, Blusas, Camisas, Suéteres, Sudaderas, Chamarras, Abrigos, Vestidos, Faldas, Shorts, Pantalones, Calzado, Accesorios)
  - Departamento (Dama, Caballero, Unisex)
  - Precio de compra y precio de venta
  - Descripción e imagen
  - Inventario inicial por talla (según categoría: tallas superiores `XXS-3XL`, inferiores `22-44`, calzado `22-31` o `Unitalla` para accesorios)
- Editar producto y su inventario
- Activar / desactivar producto (los inactivos no aparecen en la tienda)
- Eliminar producto
- Vista de detalle con imagen, inventario por talla y movimientos recientes

#### Inventario
- Listar todos los productos con su stock actual
- **Tarjetas de resumen:** total de productos, en stock, con bajo stock y sin stock
- Filtros por tipo de movimiento (Entradas, Ajustes, Salidas) y rango de fecha (hoy, semana, mes)
- Identificar productos con stock crítico
- **Realizar ajuste manual de inventario:**
  - Seleccionar producto
  - Tipo de movimiento: ENTRADA o SALIDA
  - Cantidad y motivo del ajuste
- Historial completo de movimientos con: producto, tipo, cantidad, stock anterior, stock nuevo, motivo y usuario
- Exportar historial a Excel

#### Recepciones
- Listar recepciones con filtros por estado (DRAFT / CONFIRMED), búsqueda por folio o proveedor y paginación
- **Tarjetas:** historial total, recepciones de los últimos 7 días, confirmadas y en borrador
- **Crear recepción en estado borrador:**
  - Folio asignado automáticamente (`RCP-001`, `RCP-002`, ...)
  - Selección de proveedor (filtra productos disponibles de ese proveedor)
  - Fecha con selector de calendario
  - Múltiples items: producto + talla + cantidad + costo unitario
  - Total calculado en tiempo real
  - Comentarios opcionales
- **Editar** recepciones en estado DRAFT (no se pueden editar las confirmadas)
- **Confirmar recepción** → incrementa el stock por talla en cada producto e registra movimiento de inventario tipo ENTRADA
- **Eliminar** recepciones no confirmadas con modal de confirmación
- Modal de detalle con imagen del producto, talla, cantidades y costos por item
- El sistema detecta cambios sin guardar y solicita confirmación antes de cerrar

#### Ventas
- Listar pedidos con filtros por estado y búsqueda por número de pedido, nombre de cliente o email
- **Tarjetas resumen:** total pedidos, pagados, pendientes, cancelados e ingresos totales (solo pagados)
- **Gráfica de tendencia** de ventas de los últimos 30 días
- **Modal de detalle** con:
  - Número de pedido (`AUR-XXXXX`)
  - Items con imagen, nombre, talla, cantidad, precio unitario y subtotal
  - Datos de envío del cliente
  - Método de pago (Tarjeta, OXXO, SPEI) con etiqueta visual de color
  - Totales: subtotal, envío y total
- **Flujo de estados controlado:**
  - `pendiente → pagado` (descuenta stock automáticamente por talla)
  - `pendiente → cancelado`
  - `pagado → cancelado` (restaura stock automáticamente por talla)
  - `cancelado` es estado final sin acciones disponibles
- **Descargar ticket PDF** con estilo de recibo, marca de agua AURA y mensaje según estado

#### Clientes
- Listar clientes con paginación, búsqueda por nombre/email/RFC y filtro por estado
- **Tarjetas:** total, activos e inactivos con porcentaje del total
- **Columnas de la tabla:** Nombre, RFC, Email, Teléfono, Estado y Acciones
- Crear cliente con: nombre, apellido, RFC, email, teléfono y dirección
- Editar información del cliente
- Activar / desactivar cliente
- Eliminar cliente con modal de confirmación
- Modal de detalle con toda la información del cliente

#### Proveedores
- Listar proveedores con paginación, búsqueda y filtro por estado
- **Columnas:** Nombre, RFC, Email, Teléfono, Estado y Acciones
- Crear proveedor con: nombre, RFC, email, teléfono, dirección y contacto
- Editar información del proveedor
- Activar / desactivar proveedor
- Eliminar proveedor con modal de confirmación
- Modal de detalle con información completa

#### Usuarios
- Listar usuarios del sistema (excluye clientes, que tienen acceso solo a la tienda)
- **Tarjetas:** total de usuarios, activos e inactivos
- **Columnas:** Avatar, Usuario, Nombre, Email, Rol, Estado y Acciones
- Filtro por estado (activos / inactivos) y búsqueda por nombre o usuario
- Crear usuario con: nombre, apellido, email, nombre de usuario, contraseña y rol asignado
- Editar información y rol del usuario
- Activar / desactivar usuario
- Eliminar usuario con modal de confirmación
- Modal de detalle con información completa y rol asignado

#### Roles
- Listar roles con: nombre, descripción, cantidad de permisos y fecha de creación
- **Crear rol** con nombre, descripción y selección de permisos agrupados por módulo
- **Editar rol** y modificar sus permisos
- **Ver detalle** de los permisos asignados al rol
- **Gestionar permisos** directamente desde el módulo (agregar nuevos permisos al catálogo)
- Eliminar rol con modal de confirmación
- Solo accesible para usuarios con rol ADMIN

#### Auditoría
- Registro automático e inmutable de todas las acciones del sistema
- **Tipos de acción registrados:** `CREATE`, `UPDATE`, `DELETE`, `TOGGLE_ACTIVE`, `LOGIN`, `CONFIRM`
- **Recursos auditados:** usuarios, clientes, proveedores, productos, recepciones, ventas
- **Filtros disponibles:**
  - Por tipo de acción (CREATE, UPDATE, DELETE, TOGGLE, LOGIN)
  - Por recurso (users, clients, suppliers, products, recepciones)
  - Por búsqueda de texto
- **Tarjetas resumen:** total de eventos, creaciones, actualizaciones y eliminaciones
- Tabla con: acción (badge de color), recurso, ID, usuario responsable y fecha
- Modal de detalle con información completa del evento y datos del cambio realizado
- Exportar registros a Excel

---

### Tienda en línea (AURA Boutique)

#### Catálogo
- Listado de productos activos con vista en grid o lista
- Filtros por: precio máximo, departamento, talla (ropa, inferior, calzado) y solo en stock
- Drawer de filtros en móvil con animación slide-up
- Buscador en tiempo real (Enter o al limpiar el texto)
- Ordenamiento por: relevancia, precio ascendente/descendente, nombre A-Z / Z-A
- Riel de categorías en móvil, nav de categorías en desktop
- Tallas agotadas visualmente deshabilitadas en tarjetas y vista rápida

#### Vista Rápida
- Modal con imagen del producto, precio, categoría y SKU
- Selector de tallas con indicación visual de tallas sin stock
- Control de cantidad con límite según stock disponible
- Beneficios informativos: envío 24h, 30 días devolución, pago seguro, empaque eco

#### Wishlist
- Panel lateral accesible desde el ícono de corazón en el header
- Agregar o quitar productos de la lista de deseos desde las tarjetas del catálogo
- Toast de confirmación al agregar con botón "Ver wishlist"
- Desde la wishlist se puede agregar directamente al carrito

#### Carrito
- Panel lateral con animación slide-in
A- Control de cantidad con límite de stock por talla
- Barra de progreso hacia envío gratis (a partir de $999)
- Toast de confirmación al agregar con botón "Ver carrito"
- Toast de error si la talla está agotada o se excede el stock

#### Checkout (3 pasos)
**Paso 1 — Envío:**
- Nombre y email pre-llenados desde la sesión (no editables)
- Dirección, código postal (5 dígitos) y ciudad con validación

**Paso 2 — Pago:**
- Métodos: Tarjeta, OXXO Pay, Transferencia SPEI
- Para tarjeta: validación de 16 dígitos, nombre, vencimiento (MM/AA no vencido) y CVV

**Paso 3 — Confirmación:**
- Número de pedido único generado (`AUR-XXXXX`)
- Guardado en Firestore como `numeroPedido`
- El pedido queda en estado `pendiente` hasta que el admin lo marque como pagado

#### Historial de pedidos
- Panel lateral accesible desde el ícono de persona en el header
- Lista todos los pedidos del cliente ordenados por fecha
- Búsqueda por `clienteId` (principal) y email como respaldo
- Detalle de cada pedido: items con imagen, talla, cantidades, totales y dirección
- Descarga de ticket PDF desde el historial

---

## Permisos del sistema

| Código | Descripción |
|---|---|
| `auth:me` | Ver usuario autenticado |
| `users:read/create/update/delete` | Gestión de usuarios |
| `roles:read/create/update/delete` | Gestión de roles |
| `permissions:read/create/update/delete/seed` | Gestión de permisos |
| `clients:read/create/update/delete` | Gestión de clientes |
| `suppliers:read/create/update/delete` | Gestión de proveedores |
| `products:read/create/update/delete` | Gestión de productos |
| `inventory:read/update` | Consulta y ajuste de inventario |
| `recepciones:read/create/update/delete` | Gestión de recepciones |
| `ventas:read/update` | Consulta y actualización de ventas |
| `audit:read` | Consulta de auditoría |
| `dashboard:read` | Acceso al dashboard |
| `tienda:read` | Acceso a la tienda en línea |

---

## Flujos detallados

### Autenticación
1. El usuario ingresa su usuario y contraseña en `/login`
2. El backend valida credenciales y devuelve un JWT con los permisos del usuario
3. El token se almacena en `localStorage` y se envía en cada petición como `Authorization: Bearer <token>`
4. Al expirar, el sistema redirige al login automáticamente
5. Recuperación de contraseña: el usuario recibe un código por email y lo usa para restablecer su contraseña

### Flujo de venta completo
```
Cliente selecciona producto y talla
        ↓
Agrega al carrito (valida stock disponible)
        ↓
Checkout: datos de envío → método de pago → confirmación
        ↓
Se crea la venta (estado: pendiente, número: AUR-XXXXX)
        ↓
Admin cambia estado a "pagado"
        ↓
Stock se descuenta automáticamente por talla
        ↓
Cliente descarga ticket PDF desde historial
```

### Flujo de estados de venta
```
pendiente ──→ pagado      (descuenta stock por talla)
pendiente ──→ cancelado   (sin cambio de stock)
pagado    ──→ cancelado   (restaura stock por talla)
cancelado ──→ (estado final, sin acciones disponibles)
```

### Flujo de recepción de mercancía
```
Admin crea recepción (DRAFT)
        ↓
Selecciona proveedor → folio asignado automáticamente (RCP-001...)
        ↓
Agrega items: producto + talla + cantidad + costo unitario
        ↓
Confirma la recepción
        ↓
Stock incrementa por talla en cada producto
        ↓
Se registra movimiento de inventario tipo ENTRADA
        ↓
Evento registrado en auditoría
```

### Flujo de gestión de usuarios y permisos
```
Admin crea rol con permisos seleccionados
        ↓
Admin crea usuario y le asigna el rol
        ↓
El usuario inicia sesión
        ↓
JWT incluye array de permisos del usuario
        ↓
El frontend muestra/oculta módulos según permisos
        ↓
El backend valida permisos en cada endpoint
```

### Flujo de auditoría
Todas las acciones relevantes quedan registradas automáticamente:
- `LOGIN` al iniciar sesión
- `CREATE` al crear cualquier registro
- `UPDATE` al editar
- `DELETE` al eliminar
- `CONFIRM` al confirmar recepciones

Cada evento guarda: acción, recurso, ID del recurso, detalles, usuario y timestamp.

### Flujo de gestión de productos
```
Admin crea producto con nombre, SKU, categoría, departamento y precios
        ↓
Agrega inventario por talla (cada talla con su cantidad inicial)
        ↓
Producto queda activo y visible en la tienda
        ↓
Al recibir mercancía (recepción) → stock sube por talla
        ↓
Al realizar ventas (pagadas) → stock baja por talla
        ↓
Admin puede activar/desactivar o editar el producto en cualquier momento
        ↓
Si se desactiva → deja de aparecer en la tienda
```

### Flujo de ajuste de inventario
```
Admin accede al módulo de Inventario
        ↓
Selecciona producto y tipo de movimiento (ENTRADA o SALIDA)
        ↓
Ingresa cantidad y motivo del ajuste
        ↓
El stock del producto se actualiza
        ↓
Se registra el movimiento con stock anterior, nuevo y motivo
        ↓
Evento registrado en auditoría
```

### Flujo de gestión de clientes y proveedores
```
Admin crea el registro con datos básicos (nombre, email, teléfono, etc.)
        ↓
El registro queda activo en el sistema
        ↓
Admin puede editar la información en cualquier momento
        ↓
Admin puede activar o desactivar el registro
        ↓
Si se desactiva → el registro se conserva pero queda inactivo
        ↓
Admin puede eliminar el registro si no tiene dependencias
```

### Flujo de roles y permisos
```
Admin accede al módulo de Roles
        ↓
Crea un nuevo rol con nombre y descripción
        ↓
Selecciona los permisos que tendrá el rol (por módulo y acción)
        ↓
Guarda el rol
        ↓
Al crear o editar un usuario, le asigna ese rol
        ↓
El usuario inicia sesión → JWT incluye todos sus permisos
        ↓
Frontend muestra solo los módulos permitidos en el sidebar
        ↓
Backend valida el permiso requerido en cada endpoint antes de procesar
```

### Flujo del Dashboard
```
Usuario autenticado con permiso dashboard:read accede al dashboard
        ↓
El sistema consulta métricas en paralelo:
  - Total de usuarios, clientes, proveedores y productos activos
  - Productos con bajo stock
  - Recepciones de los últimos días
  - Actividad reciente del sistema
        ↓
Las métricas se muestran en tarjetas y tablas resumidas
        ↓
El usuario puede navegar directamente a cada módulo desde las tarjetas
```

---

## Estructura de carpetas

```
ProyectoComputo/
├── backend-computo-ej2026/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js          # Inicialización de Firestore
│   │   ├── middlewares/
│   │   │   ├── auth.js              # Validación de JWT
│   │   │   ├── requirePermissions.js # Control de permisos (AND / OR)
│   │   │   └── validate.js          # Validación con Zod
│   │   ├── modules/
│   │   │   ├── auth/                # Login, logout, refresh, recuperación
│   │   │   ├── users/               # CRUD usuarios
│   │   │   ├── roles/               # CRUD roles
│   │   │   ├── permissions/         # CRUD permisos
│   │   │   ├── clients/             # CRUD clientes
│   │   │   ├── suppliers/           # CRUD proveedores
│   │   │   ├── products/            # CRUD productos
│   │   │   ├── inventory/           # Inventario y movimientos
│   │   │   ├── recepciones/         # Recepciones de mercancía
│   │   │   ├── ventas/              # Pedidos y ventas
│   │   │   ├── audit/               # Auditoría
│   │   │   └── dashboard/           # Métricas del dashboard
│   │   ├── seeds/
│   │   │   └── create-first-user.js # Inicialización de datos base
│   │   └── utils/
│   │       ├── audit.js             # Helper para registrar eventos
│   │       └── asyncHandler.js      # Wrapper para manejo de errores
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── tienda/              # Componentes exclusivos de la tienda
    │   │   │   ├── HeaderTienda.jsx
    │   │   │   ├── FiltrosSidebar.jsx
    │   │   │   ├── VistaRapida.jsx
    │   │   │   ├── SeccionCarrito.jsx
    │   │   │   ├── ModalCheckout.jsx
    │   │   │   ├── HistorialPedidos.jsx
    │   │   │   └── ToastTienda.jsx
    │   │   ├── Tabla.jsx            # Tabla reutilizable con ordenamiento
    │   │   ├── ModalConfirmacion.jsx
    │   │   ├── Etiquetas.jsx        # Badges de estado
    │   │   ├── Paginacion.jsx
    │   │   └── ...
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global de autenticación
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useProtectedRoute.js
    │   │   └── useTitulo.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Productos.jsx
    │   │   ├── Inventario.jsx
    │   │   ├── Recepciones.jsx
    │   │   ├── Ventas.jsx
    │   │   ├── Clientes.jsx
    │   │   ├── Proveedores.jsx
    │   │   ├── Usuarios.jsx
    │   │   ├── Roles.jsx
    │   │   ├── Auditoria.jsx
    │   │   ├── Tienda.jsx
    │   │   └── Login.jsx
    │   ├── services/
    │   │   └── api.js               # Cliente HTTP con interceptores
    │   └── utils/
    │       ├── generarTicket.js     # Generación de PDF con jsPDF
    │       └── permissionMapper.js  # Mapeo de permisos a rutas
    └── package.json
```

---

## Autores

Proyecto desarrollado como entregable académico — Materia: Cómputo Nube, 8vo semestre, Enero - Junio 2026.

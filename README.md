# 🛍️ Unisabana Marketplace - Frontend

Frontend del marketplace de la Universidad de La Sabana desarrollado con React.

## 🚀 Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# El archivo .env debe contener:
REACT_APP_API_URL=http://localhost:3000/api
```

### 3. Iniciar la aplicación
```bash
npm start
```

La aplicación se abrirá en `http://localhost:3001`

## ⚙️ Configuración con el Backend

**MUY IMPORTANTE:** Este frontend está diseñado para trabajar con el backend en un repositorio separado.

### Pasos para conectar frontend y backend:

1. **Asegúrate de que el backend esté corriendo** en `http://localhost:3000`

2. **Configura CORS en el backend:**
   - El backend ya tiene CORS configurado por defecto
   - Acepta peticiones desde `http://localhost:3001`

3. **Verifica la URL del API:**
   - Archivo `.env` debe tener: `REACT_APP_API_URL=http://localhost:3000/api`

4. **Ambos deben estar corriendo:**
   ```bash
   # Terminal 1 - Backend
   cd marketplace-backend
   npm run dev
   # Servidor en http://localhost:3000

   # Terminal 2 - Frontend
   cd marketplace-frontend
   npm start
   # App en http://localhost:3001
   ```

## 📁 Estructura del Proyecto

```
marketplace-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── ProductCard.js
│   │   └── ProductCard.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Auth.css
│   │   ├── ProductDetail.js
│   │   ├── ProductDetail.css
│   │   ├── Cart.js
│   │   ├── MyOrders.js
│   │   ├── Profile.js
│   │   ├── BecomeSeller.js
│   │   ├── CreateProduct.js
│   │   ├── MyProducts.js
│   │   ├── MySales.js
│   │   ├── Conversations.js
│   │   ├── ConversationDetail.js
│   │   └── Notifications.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── .env.example
└── README.md
```

## 🎯 Funcionalidades Implementadas

### Autenticación
- ✅ Registro con validación de correo institucional
- ✅ Inicio de sesión con JWT
- ✅ Perfil de usuario
- ✅ Cerrar sesión

### Productos
- ✅ Listado de productos
- ✅ Búsqueda y filtros (precio min/max)
- ✅ Detalle de producto
- ✅ Crear producto (vendedores)
- ✅ Editar producto (vendedores)
- ✅ Eliminar producto (vendedores)

### Carrito y Compras
- ✅ Agregar al carrito
- ✅ Ver carrito
- ✅ Eliminar del carrito
- ✅ Finalizar compra
- ✅ Ver mis órdenes

### Comunicación
- ✅ Chat entre comprador/vendedor
- ✅ Notificaciones in-app

### Vendedores
- ✅ Convertirse en vendedor
- ✅ Gestionar productos
- ✅ Ver ventas

## 🔌 API Endpoints Utilizados

El frontend consume los siguientes endpoints del backend:

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil
- `POST /api/auth/become-seller` - Hacerse vendedor

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Detalle de producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Carrito
- `GET /api/cart` - Ver carrito
- `POST /api/cart/add` - Agregar al carrito
- `DELETE /api/cart/remove/:itemId` - Eliminar del carrito

### Órdenes
- `POST /api/orders/create` - Crear orden
- `GET /api/orders/my-orders` - Mis órdenes

## 🎨 Tecnologías Utilizadas

- **React 18** - Librería de UI
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Context API** - Manejo de estado global
- **CSS Variables** - Theming y estilos

## 🔒 Autenticación

El sistema usa JWT (JSON Web Tokens):

1. Al hacer login, el backend devuelve un token
2. El token se guarda en `localStorage`
3. Cada petición incluye el token en el header `Authorization: Bearer <token>`
4. El token expira en 24 horas

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Desktop (>768px)
- 📱 Mobile (<768px)

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"
→ Verifica que el backend esté corriendo en `http://localhost:3000`

### Error: "CORS policy"
→ El backend ya tiene CORS configurado. Verifica que ambos estén en los puertos correctos.

### Error: "Token expired"
→ Tu sesión expiró. Inicia sesión nuevamente.

### No puedo ver productos
→ Verifica que el backend tenga productos creados.

## 🚀 Despliegue en Producción

### 1. Build de producción
```bash
npm run build
```

### 2. Configurar variable de entorno
```bash
REACT_APP_API_URL=https://tu-api-backend.com/api
```

### 3. Desplegar la carpeta `build/`
Puedes desplegar en:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 📝 Scripts Disponibles

```bash
# Iniciar en desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test
```

## 🔄 Flujo de Trabajo con Git

```bash
# Clonar el repositorio
git clone <url-del-repo-frontend>
cd marketplace-frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Iniciar desarrollo
npm start
```

## 📞 Soporte

Si tienes problemas:
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12)
3. Verifica las variables de entorno
4. Asegúrate de tener Node.js v14 o superior

## 👨‍💻 Equipo de Desarrollo

Desarrollo Web - Universidad de La Sabana

---

**¡Listo para desarrollar!** 🎉

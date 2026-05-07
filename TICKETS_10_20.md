# Tickets 10 al 20 — Sabana Market Frontend

Implementación frontend de los tickets 10 al 20 del tablero Trello de Unisabana Marketplace.

---

## Ticket 10 · Listar historial de mensajes de una conversación

**Archivo:** `src/pages/ConversationDetail.js` + `ConversationDetail.css`

**Qué se hizo:**
- Página de chat con carga de mensajes desde `GET /conversations/:id/messages?page=1&limit=100`.
- Burbuja de mensajes diferenciadas: propios (azul oscuro) y del otro usuario (blanco).
- Separadores de fecha entre grupos de mensajes del mismo día.
- Auto-scroll al mensaje más reciente al cargar y al enviar.
- Soporte Enter para enviar (Shift+Enter = nueva línea).
- Servicio `conversationService.getMessages(id, params)` añadido a `api.js`.

---

## Ticket 11 · Listar todas las conversaciones del usuario

**Archivo:** `src/pages/Conversations.js` + `Conversations.css`

**Qué se hizo:**
- Lista de conversaciones activas del usuario autenticado via `GET /conversations`.
- Cada ítem muestra: avatar inicial del otro usuario, nombre, producto asociado, último mensaje y tiempo relativo ("hace 5m").
- Estado vacío con CTA para explorar productos.
- Navegación al detalle al tocar cualquier conversación.

---

## Ticket 12 · Ver las reseñas de un vendedor y su promedio

**Archivo:** `src/pages/ProductDetail.js` (sección reviews)

**Qué se hizo:**
- Sección de reseñas al pie de la página de detalle del producto.
- Carga de reseñas via `GET /reviews?sellerId=<uuid>` usando `reviewService.getBySeller`.
- Muestra promedio de calificación (estrellas + número) y total de reseñas.
- Grid de tarjetas de reseña con avatar, nombre del comprador, estrellas y comentario.
- Rating promedio también visible en la card del vendedor dentro del info del producto.

---

## Ticket 13 · Listar y marcar notificaciones como leídas

**Archivo:** `src/pages/Notifications.js` + `Notifications.css`

**Qué se hizo:**
- Lista de notificaciones via `GET /notifications`, ordenadas por `createdAt DESC`.
- Iconos por tipo: `💬` mensajes, `🛒` órdenes, `✅` entregadas, `⭐` reseñas, `🚨` reportes.
- Tiempo relativo ("hace 3h") junto a cada notificación.
- Clic en notificación no leída → `PUT /notifications/:id/read` + actualización local del estado.
- Botón "Marcar todas como leídas" → `PUT /notifications/read-all`.
- Contador de no leídas en el encabezado de la página.
- Servicios actualizados de `PATCH` a `PUT` en `api.js` según contrato del backend.

---

## Ticket 14 · Eliminar un producto como administrador

**Archivo:** `src/pages/Admin.js` (pestaña Productos)

**Qué se hizo:**
- Tabla de productos con columnas: nombre, precio, stock, vendedor, estado.
- Botón "Eliminar" por fila → confirmación + `DELETE /admin/products/:id`.
- Eliminación refleja en la UI sin recargar.
- Solo accesible para usuarios con `role === 'admin'` (ver ticket 18).
- Servicio `adminService.deleteProduct(id)` añadido a `api.js`.

---

## Ticket 15 · Suspender o rehabilitar un usuario

**Archivo:** `src/pages/Admin.js` (pestaña Usuarios)

**Qué se hizo:**
- Tabla de usuarios con: nombre, correo, rol, fecha de registro y estado actual.
- Botón toggling "Suspender / Rehabilitar" por fila → confirmación + `PUT /admin/users/:id/status`.
- El botón se desactiva para usuarios con `role === 'admin'` (no se puede suspender otro admin).
- Actualización optimista del estado en la tabla.
- Servicio `adminService.updateUserStatus(id, data)` añadido a `api.js`.

---

## Ticket 16 · Reportar un producto o perfil de usuario

**Archivo:** `src/pages/ProductDetail.js` (componente `ReportModal`)

**Qué se hizo:**
- Enlace "🚩 Reportar este producto" visible para compradores (no visible al dueño).
- Modal overlay con textarea para ingresar el motivo del reporte.
- Envío via `POST /reports` con `{ targetType: 'product', targetId, reason }`.
- Estado de éxito en el modal ("Reporte enviado") antes de cerrar.
- Servicio `reportService.create(data)` añadido a `api.js`.

---

## Ticket 17 · Listar y gestionar reportes pendientes (Admin)

**Archivo:** `src/pages/Admin.js` (pestaña Reportes)

**Qué se hizo:**
- Filtro por estado: `pendiente` / `resuelto`.
- Tabla con: tipo (producto/usuario), motivo, reportado por, fecha, estado.
- Botón "Resolver" por fila → `PUT /admin/reports/:id/resolve` + eliminación optimista de la fila.
- Servicios `adminService.getReports(params)` y `adminService.resolveReport(id)` añadidos a `api.js`.

---

## Ticket 18 · Middleware de autorización por rol (Frontend)

**Archivo:** `src/App.js` (componente `AdminRoute`)

**Qué se hizo:**
- Componente `AdminRoute` que verifica `user.role === 'admin'` antes de renderizar la ruta.
- Redirige a `/` si el rol no es admin (análogo a `SellerRoute` existente).
- Aplicado sobre la ruta `/admin` en ambas vistas (desktop y mobile).
- Complementa la verificación que el backend realiza por JWT en cada endpoint.

---

## Ticket 19 · Validación y sanitización global de inputs (Frontend)

**Archivo:** `src/utils/validators.js`

**Qué se hizo:**
- Utilidades `sanitize(str)`: elimina etiquetas HTML para prevenir XSS.
- `validators`: colección de funciones de validación puras reutilizables:
  - `required`, `email`, `unisabanaEmail`, `minLength`, `maxLength`, `positiveNumber`, `nonNegativeInt`, `match`, `targetType`, `uuid`.
- `validateForm(values, rules)`: valida un objeto de formulario contra un mapa de reglas y retorna `{ isValid, errors }`.
- `sanitizeObject(obj)`: sanitiza todos los campos string de un objeto.
- Importable en cualquier componente de formulario del proyecto.

---

## Ticket 20 · Gestión de productos (Vendedor)

**Archivo:** `src/pages/MyProducts.js` + `MyProducts.css`

**Qué se hizo:**
- Grid de tarjetas de productos propios cargados via `GET /products/my/products`.
- Buscador local por nombre de producto.
- Indicador de estado: "Activo" (verde) / "Agotado" (rojo) sobre la imagen.
- Botón "Editar" → navega a `/edit-product/:id`.
- Botón "Eliminar" (con confirmación) → `DELETE /products/:id` + actualización local.
- CTA para publicar nuevo producto si la lista está vacía.
- Accesible solo para vendedores (`SellerRoute`).

---

## Revisión de base de datos PostgreSQL

> **Solo revisión — no se implementó ningún cambio en la BD.**

La API backend (`https://market-place-dsaw-26-01.vercel.app/`) utiliza PostgreSQL. Las tablas relevantes para los tickets 10–20 son:

| Tabla | Columnas clave | Tickets |
|---|---|---|
| `Message` | `id`, `conversationId`, `senderId`, `content`, `sentAt` | 10 |
| `Conversation` | `id`, `buyerId`, `sellerId`, `productId`, `lastMessageAt` | 11 |
| `Review` | `id`, `sellerId`, `buyerId`, `orderId`, `rating`, `comment` | 12 |
| `Notification` | `id`, `userId`, `type`, `message`, `read`, `createdAt` | 13 |
| `Product` | `id`, `sellerId`, `active` (soft delete) | 14 |
| `User` | `id`, `role`, `status` (`activo`/`suspendido`) | 15 |
| `Report` | `id`, `reporterId`, `targetType`, `targetId`, `reason`, `status` | 16, 17 |

**Índices recomendados (no implementados):**
- `Message(conversationId, sentAt)` — para paginación cronológica eficiente.
- `Notification(userId, createdAt DESC)` — para listar notificaciones del usuario.
- `Report(status)` — para filtrar por estado en el panel admin.

---

## Archivos modificados / creados

```
src/services/api.js                        (actualizado)
src/App.js                                 (actualizado — AdminRoute + ruta /admin)
src/utils/validators.js                    (nuevo)
src/pages/Conversations.js                 (reescrito)
src/pages/Conversations.css                (nuevo)
src/pages/ConversationDetail.js            (reescrito)
src/pages/ConversationDetail.css           (nuevo)
src/pages/Notifications.js                 (reescrito)
src/pages/Notifications.css                (nuevo)
src/pages/ProductDetail.js                 (actualizado — reviews + report modal)
src/pages/ProductDetail.css                (actualizado)
src/pages/Admin.js                         (nuevo)
src/pages/Admin.css                        (nuevo)
src/pages/MyProducts.js                    (reescrito)
src/pages/MyProducts.css                   (nuevo)
```

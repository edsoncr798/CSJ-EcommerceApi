# Documentación API Ecommerce CSJ

## 1. Introducción

API RESTful para sistema de ecommerce desarrollada con Node.js y Express. Esta API permite gestionar productos, pedidos, clientes, autenticación y pagos mediante Openpay.

**URL Base:** `http://localhost:3000/api`

**Formato de respuesta:** JSON

## 2. Autenticación

La API utiliza autenticación basada en JWT (JSON Web Token). 

### Obtener Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  }
}
```

### Uso del Token
Incluir el token en el header de las peticiones:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Endpoints de Ecommerce

### 3.1 Autenticación

#### Registro de usuario
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña",
  "name": "Nombre Completo",
  "phone": "1234567890"
}
```

#### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

#### Login con Google
```http
POST /auth/google
```

**Body:**
```json
{
  "token": "google_id_token"
}
```

### 3.2 Productos

#### Listar todos los productos
```http
GET /products
```

**Parámetros opcionales:**
- `category`: Filtrar por categoría
- `search`: Búsqueda por nombre o descripción
- `page`: Número de página (paginación)
- `limit`: Cantidad de productos por página

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Producto Ejemplo",
      "description": "Descripción del producto",
      "price": 99.99,
      "stock": 50,
      "category": "Electrónica",
      "image": "url_imagen.jpg",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Obtener producto por ID
```http
GET /products/:id
```

#### Crear producto
```http
POST /products
Authorization: Bearer token
```

**Body:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 149.99,
  "stock": 100,
  "category": "Electrónica",
  "image": "url_imagen.jpg"
}
```

#### Actualizar producto
```http
PUT /products/:id
Authorization: Bearer token
```

#### Eliminar producto
```http
DELETE /products/:id
Authorization: Bearer token
```

### 3.3 Clientes

#### Listar clientes
```http
GET /clients
Authorization: Bearer token
```

**Parámetros opcionales:**
- `search`: Búsqueda por nombre o email
- `page`: Número de página
- `limit`: Cantidad por página

#### Obtener cliente por ID
```http
GET /clients/:id
Authorization: Bearer token
```

#### Crear cliente
```http
POST /clients
Authorization: Bearer token
```

**Body:**
```json
{
  "name": "Cliente Ejemplo",
  "email": "cliente@ejemplo.com",
  "phone": "1234567890",
  "address": "Dirección del cliente",
  "city": "Ciudad",
  "state": "Estado",
  "zipCode": "12345"
}
```

#### Actualizar cliente
```http
PUT /clients/:id
Authorization: Bearer token
```

#### Eliminar cliente
```http
DELETE /clients/:id
Authorization: Bearer token
```

### 3.4 Órdenes / Pedidos

#### Listar órdenes
```http
GET /orders
Authorization: Bearer token
```

**Parámetros opcionales:**
- `status`: Filtrar por estado (pending, completed, cancelled)
- `clientId`: Filtrar por cliente
- `dateFrom`: Fecha inicial (YYYY-MM-DD)
- `dateTo`: Fecha final (YYYY-MM-DD)
- `page`: Número de página
- `limit`: Cantidad por página

#### Obtener orden por ID
```http
GET /orders/:id
Authorization: Bearer token
```

#### Crear orden
```http
POST /orders
Authorization: Bearer token
```

**Body:**
```json
{
  "clientId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 99.99
    }
  ],
  "subtotal": 199.98,
  "tax": 16.00,
  "total": 215.98,
  "paymentMethod": "credit_card"
}
```

#### Actualizar estado de orden
```http
PUT /orders/:id/status
Authorization: Bearer token
```

**Body:**
```json
{
  "status": "completed"
}
```

#### Cancelar orden
```http
DELETE /orders/:id
Authorization: Bearer token
```

### 3.5 Documentos

#### Listar documentos
```http
GET /documents
Authorization: Bearer token
```

**Parámetros opcionales:**
- `type`: Tipo de documento (invoice, receipt, quote)
- `clientId`: Filtrar por cliente
- `dateFrom`: Fecha inicial
- `dateTo`: Fecha final
- `status`: Estado del documento

#### Obtener documento por ID
```http
GET /documents/:id
Authorization: Bearer token
```

#### Crear documento
```http
POST /documents
Authorization: Bearer token
```

**Body:**
```json
{
  "type": "invoice",
  "clientId": 1,
  "orderId": 1,
  "items": [
    {
      "description": "Producto 1",
      "quantity": 2,
      "unitPrice": 99.99,
      "total": 199.98
    }
  ],
  "subtotal": 199.98,
  "tax": 16.00,
  "total": 215.98
}
```

### 3.6 Pagos (Openpay)

#### Crear cargo con tarjeta
```http
POST /openpay/charge
Authorization: Bearer token
```

**Body:**
```json
{
  "amount": 215.98,
  "description": "Pago orden #123",
  "orderId": 123,
  "card": {
    "card_number": "4111111111111111",
    "holder_name": "Juan Pérez",
    "expiration_month": "12",
    "expiration_year": "2025",
    "cvv2": "123"
  },
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "1234567890"
  }
}
```

#### Crear cliente en Openpay
```http
POST /openpay/customers
Authorization: Bearer token
```

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "phone": "1234567890"
}
```

#### Confirmar pago Openpay
```http
POST /openpay/confirm-payment
Authorization: Bearer token
```

**Body:**
```json
{
  "transactionId": "transaction_id_openpay",
  "orderId": 123
}
```

## 4. Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {},
  "message": "Operación realizada exitosamente",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": "Detalle del error (solo en desarrollo)"
}
```

## 5. Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en los datos enviados
- **401 Unauthorized**: Token inválido o no proporcionado
- **403 Forbidden**: Sin permisos para la operación
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## 6. Manejo de Errores

La API implementa manejo consistente de errores con mensajes descriptivos:

```json
{
  "success": false,
  "message": "El campo 'email' es requerido",
  "status": 400
}
```

## 7. Ejemplos de Uso

### Flujo Completo de Compra

1. **Autenticar usuario**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com", "password": "contraseña"}'
```

2. **Listar productos**
```bash
curl -X GET "http://localhost:3000/api/products?category=Electrónica&page=1&limit=10"
```

3. **Crear orden**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "items": [{"productId": 1, "quantity": 2, "price": 99.99}],
    "total": 215.98
  }'
```

4. **Procesar pago**
```bash
curl -X POST http://localhost:3000/api/openpay/charge \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 215.98,
    "orderId": 123,
    "card": {"card_number": "4111111111111111", ...}
  }'
```

## 8. Notas Importantes

- Todos los endpoints protegidos requieren token JWT válido
- Las imágenes de productos se gestionan mediante Cloudinary
- Los pagos se procesan a través de Openpay
- La API incluye validaciones de datos y manejo de errores
- Se implementa paginación en endpoints de listado
- Los campos de fecha siguen formato ISO 8601 (YYYY-MM-DD)

## 9. Soporte

Para dudas o problemas con la API, contactar al equipo de desarrollo o revisar los logs del servidor para más detalles sobre errores específicos.
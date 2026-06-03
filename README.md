# StockFlow API

API RESTful para gestión de inventario y despachos. Node.js + Express + TypeScript + Prisma (SQLite).

## Instalación

```bash
npm install
```

## Base de datos

```bash
# Crear la base de datos y aplicar el esquema
npx prisma migrate dev --name init

# Poblar con datos iniciales
npx prisma db seed
```

Credenciales del seed:
- **Admin:** `admin@stockflow.com` / `admin123`
- **Operator:** `operator@stockflow.com` / `operator123`

## Arrancar en desarrollo

```bash
npm run dev
```

El servidor corre en `http://localhost:3008`.

---

## Endpoints

### Auth (públicos)

| Método | Ruta | Body |
|--------|------|------|
| POST | `/api/auth/register` | `{ email, password, role? }` |
| POST | `/api/auth/login` | `{ email, password }` |

### Productos (autenticado)

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/products` | Any | Listar productos. Query: `?categoryId=1` |
| POST | `/api/products` | ADMIN | Crear producto |
| PUT | `/api/products/:id` | ADMIN | Actualizar producto |
| DELETE | `/api/products/:id` | ADMIN | Eliminar producto |

### Pedidos (autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido (transaccional) |
| GET | `/api/orders/:id` | Ver detalles del pedido |
| PATCH | `/api/orders/:id/status` | Cambiar estado (`PENDING`, `DISPATCHED`, `CANCELLED`) |

### Reportes (ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/low-stock` | Productos con stock ≤ minStock |

---

## Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/login`.

---

## Ejemplo: Crear pedido

```json
POST /api/orders
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 5 }
  ]
}
```

Si algún producto no tiene stock suficiente, la transacción completa falla con error descriptivo y no se altera la base de datos.

import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'StockFlow API',
    version: '1.0.0',
    description: 'API de gestión de inventario y pedidos',
  },
  servers: [{ url: 'http://localhost:3008' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'OPERATOR'] },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          sku: { type: 'string' },
          stock: { type: 'integer' },
          minStock: { type: 'integer' },
          price: { type: 'number' },
          categoryId: { type: 'integer' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          productId: { type: 'integer' },
          quantity: { type: 'integer' },
          priceAtOrder: { type: 'number' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          operatorId: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'DISPATCHED', 'CANCELLED'] },
          createdAt: { type: 'string', format: 'date-time' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@example.com' },
                  password: { type: 'string', minLength: 6, example: 'secret123' },
                  role: { type: 'string', enum: ['ADMIN', 'OPERATOR'], example: 'OPERATOR' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso — retorna JWT',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'categoryId',
            in: 'query',
            description: 'Filtrar por categoría',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de productos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { products: { type: 'array', items: { $ref: '#/components/schemas/Product' } } },
                },
              },
            },
          },
          401: { description: 'No autenticado' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Crear producto (ADMIN)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'sku', 'stock', 'minStock', 'price', 'categoryId'],
                properties: {
                  name: { type: 'string', example: 'Laptop Pro' },
                  sku: { type: 'string', example: 'LAP-001' },
                  stock: { type: 'integer', minimum: 0, example: 50 },
                  minStock: { type: 'integer', minimum: 0, example: 5 },
                  price: { type: 'number', example: 999.99 },
                  categoryId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Producto creado',
            content: { 'application/json': { schema: { type: 'object', properties: { product: { $ref: '#/components/schemas/Product' } } } } },
          },
          400: { description: 'Datos inválidos' },
          403: { description: 'Requiere rol ADMIN' },
        },
      },
    },
    '/api/products/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Actualizar producto (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  sku: { type: 'string' },
                  stock: { type: 'integer', minimum: 0 },
                  minStock: { type: 'integer', minimum: 0 },
                  price: { type: 'number' },
                  categoryId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Producto actualizado', content: { 'application/json': { schema: { type: 'object', properties: { product: { $ref: '#/components/schemas/Product' } } } } } },
          403: { description: 'Requiere rol ADMIN' },
          404: { description: 'Producto no encontrado' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Eliminar producto (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Producto eliminado', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          403: { description: 'Requiere rol ADMIN' },
          404: { description: 'Producto no encontrado' },
        },
      },
    },
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Crear pedido',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity'],
                      properties: {
                        productId: { type: 'integer', example: 1 },
                        quantity: { type: 'integer', minimum: 1, example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pedido creado', content: { 'application/json': { schema: { type: 'object', properties: { order: { $ref: '#/components/schemas/Order' } } } } } },
          400: { description: 'Stock insuficiente o datos inválidos' },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Obtener pedido por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pedido encontrado', content: { 'application/json': { schema: { type: 'object', properties: { order: { $ref: '#/components/schemas/Order' } } } } } },
          404: { description: 'Pedido no encontrado' },
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Actualizar estado del pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'DISPATCHED', 'CANCELLED'], example: 'DISPATCHED' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado', content: { 'application/json': { schema: { type: 'object', properties: { order: { $ref: '#/components/schemas/Order' } } } } } },
          400: { description: 'Transición de estado inválida' },
          404: { description: 'Pedido no encontrado' },
        },
      },
    },
    '/api/reports/low-stock': {
      get: {
        tags: ['Reports'],
        summary: 'Productos con stock bajo el mínimo (ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de productos con bajo stock',
            content: { 'application/json': { schema: { type: 'object', properties: { products: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
          },
          403: { description: 'Requiere rol ADMIN' },
        },
      },
    },
  },
};

const router = Router();
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

export default router;

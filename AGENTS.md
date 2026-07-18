# AutoSync Dashboard - Guia del Proyecto

## Descripcion

Dashboard de gestion de inventario con asistente IA. Permite agregar productos, visualizar stock en graficos, eliminar cantidad de productos, limpiar inventario, y consultar al asistente IA para analisis de datos.

## Stack Tecnologico

| Capa        | Tecnologia                          |
|-------------|-------------------------------------|
| Frontend    | React 19, Vite 7, Tailwind CSS (CDN) |
| Graficos    | Recharts 3.4                        |
| Backend     | Express 5, Node.js                  |
| Base Datos  | MySQL via Prisma 6 ORM              |
| IA          | Groq SDK (Llama 3.1 8B)             |
| HTTP Client | Axios                               |

## Estructura de Directorios

```
autosync-dashboard/
├── client/                    # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx           # Componente principal (dashboard completo)
│   │   ├── StockForm.jsx     # Formulario de agregar productos
│   │   ├── main.jsx          # Punto de entrada React
│   │   └── index.css         # Estilos globales
│   ├── index.html            # Entry HTML (carga Tailwind via CDN)
│   ├── vite.config.js        # Configuracion Vite
│   └── package.json          # Dependencias del cliente
├── server/                    # Backend Express + Prisma
│   ├── src/
│   │   ├── index.js          # Servidor Express (puerto 4000)
│   │   ├── db.js             # Singleton PrismaClient
│   │   ├── routes/
│   │   │   └── routes.js    # Rutas: /stock, /stock/:id/reduce, /analyze
│   │   ├── controllers/
│   │   │   └── stock.controller.js  # Controlador de analisis IA
│   │   ├── services/
│   │   │   └── stock.service.js     # Capa de acceso a datos
│   │   └── mcp/
│   │       └── analyzer.js  # Integracion con Groq AI
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo Stock (id, product, amount, price, date)
│   │   └── migrations/      # 5 migraciones historicas
│   ├── .env                 # Variables de entorno (DB + API key)
│   └── package.json         # Dependencias del servidor
└── AGENTS.md                 # Este archivo
```

## Modelo de Datos

```prisma
model Stock {
  id        Int      @id @default(autoincrement())
  product   String   @unique    # Nombre unico del producto
  amount    Float               # Cantidad en inventario
  price     Float?              # Precio (opcional)
  date      DateTime @default(now())
}
```

## Endpoints API

| Metodo | Ruta              | Descripcion                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | `/stock`          | Obtiene todo el stock ordenado por fecha (desc)   |
| POST   | `/stock`          | Crea producto o incrementa cantidad (upsert)      |
| DELETE | `/stock`          | Elimina todo el inventario                        |
| POST   | `/stock/:id/reduce` | Reduce cantidad de un producto (body: {amount}) |
| GET    | `/analyze?prompt=`| Envia consulta + stock a IA Groq, retorna analisis|

## Funcionalidades del Dashboard

### 1. Agregar Producto (StockForm)
- Formulario con campos: nombre, cantidad, precio
- POST a `/stock` con upsert (si existe, incrementa cantidad)
- Actualiza el grafico en tiempo real

### 2. Grafico de Inventario (Recharts BarChart)
- Barras horizontales ordenadas por cantidad (mayor a menor)
- Colores condicionales: verde (>15), amarillo (6-15), rojo (<=5)
- Tooltip personalizado con nombre, cantidad, precio y estado
- Estadisticas: total productos, unidades y valor
- Layout vertical con esquinas redondeadas
- Click en una barra abre panel para eliminar cantidad

### 3. Eliminar Cantidad de Producto
- Click en una barra del grafico selecciona el producto
- Panel lateral muestra nombre, stock actual y campo de cantidad
- POST a `/stock/:id/reduce` con `{ amount: number }`
- Si la cantidad eliminada iguala el stock, el producto se elimina
- Actualiza el grafico en tiempo real

### 4. Limpiar Inventario
- Boton rojo que elimina todos los productos
- Confirmacion antes de ejecutar
- DELETE a `/stock`
- Limpia el estado local

### 5. Consulta IA
- Input de texto para preguntas en lenguaje natural
- GET a `/analyze?prompt=...`
- Groq AI (Llama 3.1 8B) analiza stock completo + pregunta
- Muestra respuesta con formato

## Patrones de Codigo

- **Estado**: `useState` hooks en App.jsx (sin Redux/Zustand)
- **Estilos**: Tailwind CSS via CDN (clases inline)
- **HTTP**: Axios para todas las llamadas API
- **URL Base**: Hardcoded `http://localhost:4000` (definida como constante `API`)
- **Componentes**: `App.jsx` (principal) + `StockForm.jsx` (formulario)
- **API URL constante**: `const API = "http://localhost:4000"`

## Comandos Utiles

```bash
# Cliente
cd client && npm run dev      # Iniciar frontend (Vite)
cd client && npm run build    # Build de produccion
cd client && npm run lint     # Linting con ESLint

# Servidor
cd server && npm run dev      # Iniciar backend (Express)
cd server && npm run start    # Iniciar en produccion
```

## Notas Importantes

- El servidor debe estar corriendo en puerto 4000 antes de usar el cliente
- La base de datos MySQL debe estar configurada en `server/.env`
- El modelo de IA usa Groq (requiere API key en `.env`)
- Los datos de stock con `amount <= 0` no se muestran en el grafico
- El boton Limpiar y Reducir se deshabilitan si no hay productos

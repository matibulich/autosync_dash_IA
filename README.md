# AutoSync Dashboard

Sistema de control de inventario/stock impulsado por Inteligencia Artificial. Permite gestionar productos, visualizar niveles de stock en tiempo real, eliminar productos y realizar consultas en lenguaje natural asistidas por IA.

![AutoSync Dashboard](autosync.png)

## Funcionalidades

- **Gestión de Inventario** — Alta de productos con nombre, cantidad y precio opcional. Si el producto ya existe, se incrementa la cantidad automáticamente (upsert).
- **Dashboard Visual** — Gráfico de barras horizontal que muestra todos los productos con stock > 0, ordenados de mayor a menor cantidad, codificado por colores según nivel de stock:
  - 🟢 Verde: stock > 15 (Saludable)
  - 🟡 Amarillo: stock entre 6 y 15 (Bajo)
  - 🔴 Rojo: stock <= 5 (Crítico)
- **Eliminar Cantidad** — Al hacer click en una barra del gráfico se abre un panel para reducir la cantidad de ese producto. Si la cantidad a eliminar iguala el stock, el producto se elimina.
- **Limpiar Inventario** — Botón para eliminar todos los productos del stock de una vez (con confirmación).
- **Asistente de IA** — Consultas en lenguaje natural sobre los datos de stock, respondidas por el modelo Llama 3.1 8B a través de la API de Groq.

## Stack Tecnológico

### Frontend (`client/`)

| Tecnología | Versión | Descripción |
|---|---|---|
| React | 19.1.1 | Framework UI |
| Vite (SWC) | 7.1.7 | Dev server y build tool |
| Recharts | 3.4.1 | Gráficos (BarChart horizontal) |
| Axios | 1.13.2 | Cliente HTTP |
| Tailwind CSS | CDN | Estilos utility-first |

### Backend (`server/`)

| Tecnología | Versión | Descripción |
|---|---|---|
| Node.js + Express | 5.1.0 | Servidor REST API |
| Prisma ORM | 6.18.0 | Capa de acceso a base de datos |
| MySQL | — | Base de datos relacional |
| Groq SDK | 0.35.0 | Integración con Llama 3.1 8B |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (Frontend)                      │
│  React 19 · Vite 7 · Recharts · Tailwind CSS · Axios           │
│  App.jsx (dashboard principal) + StockForm.jsx (formulario)     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (Axios)
                             �
┌────────────────────────────▼────────────────────────────────────┐
│                  SERVIDOR EXPRESS (puerto 4000)                  │
│  routes.js → controllers/ → services/ → Prisma ORM             │
│  analyzer.js ──────────────────────────────┐                    │
└────────────────────────────┬───────────────┘                    │
                             │                                    │
              ┌──────────────▼──────────────┐                     │
              │          MySQL              │   ┌─────────────────┐│
              │   (PrismaClient singleton)  │   │   Groq Cloud    ││
              │                             │   │ (Llama 3.1 8B)  ││
              └─────────────────────────────┘   └─────────────────┘
```

### Arquitectura Backend (capas)

```
routes.js          → Maneja HTTP request/response, validación
stock.controller.js → Orquestación lógica (análisis IA)
stock.service.js    → Capa de acceso a datos (Prisma queries)
analyzer.js         → Integración con Groq AI
db.js               → Singleton PrismaClient
```

### Modelo de Datos

```prisma
model Stock {
  id        Int      @id @default(autoincrement())
  product   String   @unique     // Nombre único del producto
  amount    Float                 // Cantidad en inventario
  price     Float?                // Precio (opcional)
  date      DateTime @default(now())
}
```

## Estructura del Proyecto

```
autosync-dashboard/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                  # Dashboard principal (gráfico + consultas IA)
│   │   ├── StockForm.jsx            # Formulario de alta de productos
│   │   ├── main.jsx                 # Entry point de React
│   │   ├── index.css                # Estilos globales (fuentes, tema)
│   │   └── App.css                  # Estilos boilerplate de Vite
│   ├── index.html                   # Entry HTML (carga Tailwind CDN)
│   ├── vite.config.js               # Configuración Vite con SWC
│   ├── eslint.config.js             # ESLint flat config
│   └── package.json
│
├── server/                          # Backend (Express + Prisma + Groq)
│   ├── src/
│   │   ├── index.js                 # Servidor Express (puerto 4000)
│   │   ├── db.js                    # Cliente Prisma (singleton)
│   │   ├── routes/
│   │   │   └── routes.js            # Todas las rutas de la API
│   │   ├── controllers/
│   │   │   └── stock.controller.js  # Controlador de análisis IA
│   │   ├── services/
│   │   │   └── stock.service.js     # Capa de acceso a datos
│   │   └── mcp/
│   │       └── analyzer.js          # Integración con Groq AI
│   ├── prisma/
│   │   ├── schema.prisma            # Modelo de datos
│   │   └── migrations/              # 5 migraciones históricas
│   ├── schema.env                   # Plantilla de variables de entorno
│   ├── .env                         # Variables de entorno (no commitear)
│   └── package.json
│
└── README.md
```

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18+
- MySQL ejecutándose localmente
- API Key de [Groq](https://console.groq.com/) (tier gratuito disponible)

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/matibulich/autosync_dash_IA.git
cd autosync_dash_IA
```

### 2. Configurar variables de entorno

Crear el archivo `server/.env` basándose en `server/schema.env`:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/autosync_dashboard"
GROQ_API_KEY="gsk_..."
```

### 3. Configurar la base de datos

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Instalar dependencias e iniciar

**Backend** (puerto 4000):

```bash
cd server
npm install
npm run dev
```

**Frontend** (puerto 5173):

```bash
cd client
npm install
npm run dev
```

> **Nota:** El servidor debe estar corriendo en el puerto 4000 antes de iniciar el cliente.

## Endpoints de la API

| Método | Ruta | Body / Query | Descripción |
|---|---|---|---|
| `GET` | `/stock` | — | Obtiene todos los productos ordenados por fecha (desc) |
| `POST` | `/stock` | `{ product, amount, price? }` | Crea un producto o incrementa cantidad si ya existe (upsert) |
| `DELETE` | `/stock` | — | Elimina todo el inventario |
| `POST` | `/stock/:id/reduce` | `{ amount }` | Reduce cantidad; si llega a 0, elimina el producto |
| `GET` | `/analyze` | `?prompt=<texto>` | Envía consulta en lenguaje natural + stock completo a la IA |

## Comandos Disponibles

### Cliente (`client/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run lint` | Verificación con ESLint |

### Servidor (`server/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor Express en puerto 4000 |
| `npm run start` | Iniciar en modo producción |
| `npx prisma migrate dev` | Ejecutar migraciones de base de datos |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npx prisma studio` | Abrir Prisma Studio (editor visual de datos) |

## Patrones de Código

- **Estado:** `useState` hooks en App.jsx (sin librería externa de estado)
- **Estilos:** Tailwind CSS via CDN (clases utility-first inline)
- **HTTP:** Axios para todas las llamadas API
- **URL Base:** Constante `const API = "http://localhost:4000"` en App.jsx
- **Componentes:** App.jsx (principal) + StockForm.jsx (formulario)
- **Base de datos:** Patrón Singleton para PrismaClient (db.js)
- **Backend:** Arquitectura en capas (routes → controllers → services)

## Notas Importantes

- Los datos de stock con `amount <= 0` no se muestran en el gráfico
- El botón "Limpiar Inventario" se deshabilita si no hay productos
- Si la eliminación de cantidad iguala el stock, el producto se elimina automáticamente
- El modelo de IA recibe todos los datos de stock + la pregunta del usuario para generar su respuesta
- La base de datos tiene 5 migraciones históricas (evolucionó de modelo "Sale" a "Stock")

## Licencia

Este proyecto es privado.

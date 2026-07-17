# AutoSync Dashboard

Sistema de control de inventario/stock impulsado por Inteligencia Artificial. Permite gestionar productos, visualizar niveles de stock en tiempo real y realizar consultas en lenguaje natural asistidas por IA.

## Funcionalidades

- **Gestión de Inventario** — Alta de productos con nombre, cantidad y precio opcional. Si el producto ya existe, se incrementa la cantidad automáticamente.
- **Dashboard Visual** — Gráfico de barras horizontal que muestra todos los productos con stock > 0, codificado por colores según nivel de stock:
  - Verde: stock > 15
  - Amarillo: stock entre 6 y 15
  - Rojo: stock <= 5
- **Asistente de IA** — Consultas en lenguaje natural sobre los datos de stock, respondidas por el modelo Llama 3.1 8B a través de la API de Groq.

## Stack Tecnológico

### Frontend (`client/`)

| Tecnología | Versión |
|---|---|
| React | 19.1.1 |
| Vite (con SWC) | 7.1.7 |
| Recharts | 3.4.1 |
| Axios | 1.13.2 |
| Tailwind CSS | CDN |

### Backend (`server/`)

| Tecnología | Versión |
|---|---|
| Node.js + Express | 5.1.0 |
| Prisma ORM | 6.18.0 |
| MySQL | — |
| Groq SDK (Llama 3.1 8B) | 0.35.0 |

## Estructura del Proyecto

```
autosync-dashboard/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx            # Dashboard principal (gráfico + consultas IA)
│   │   ├── StockForm.jsx      # Formulario de alta de productos
│   │   └── main.jsx           # Entry point de React
│   ├── index.html
│   └── package.json
├── server/                    # Backend (Express + Prisma + Groq)
│   ├── src/
│   │   ├── index.js           # Servidor Express (puerto 4000)
│   │   ├── db.js              # Cliente Prisma (singleton)
│   │   ├── routes/routes.js   # Rutas API
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Capa de servicios
│   │   └── mcp/analyzer.js    # Integración con Groq AI
│   ├── prisma/
│   │   ├── schema.prisma      # Modelo de datos
│   │   └── migrations/        # Migraciones de base de datos
│   ├── .env                   # Variables de entorno (no commitear)
│   └── package.json
└── README.md
```

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v18+)
- MySQL ejecutándose localmente
- API Key de [Groq](https://console.groq.com/) (disponible en tier gratuito)

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

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/stock` | Obtiene todos los productos ordenados por fecha |
| `POST` | `/stock` | Crea un producto o incrementa cantidad si ya existe. Body: `{ product, amount, price? }` |
| `GET` | `/analyze?prompt=...` | Envía una consulta en lenguaje natural + datos actuales de stock al modelo de IA |

## Comandos Disponibles

| Comando | Ubicación | Descripción |
|---|---|---|
| `npm run dev` | `client/` | Iniciar servidor de desarrollo Vite |
| `npm run build` | `client/` | Build de producción |
| `npm run lint` | `client/` | Verificación con ESLint |
| `npm run dev` | `server/` | Iniciar servidor Express en puerto 4000 |
| `npx prisma migrate dev` | `server/` | Ejecutar migraciones de base de datos |
| `npx prisma generate` | `server/` | Regenerar cliente Prisma |

## Licencia

Este proyecto es privado.

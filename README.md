# 📚 Sistema de Gestión Editorial

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

&gt; **Backend API REST** para gestión de catálogo editorial con autenticación JWT, roles de usuario y validación estricta de datos.

## 🎯 Contexto del Proyecto

Sistema desarrollado para una **librería independiente** con comunidad activa en Instagram, que necesitaba digitalizar su catálogo de libros y fanzines. El proyecto incluye panel de administración para gestión de inventario y búsqueda avanzada para clientes.

**Duración:** 6 semanas  
**Rol:** Full Stack Developer  
**Equipo:** 1 Developer + 1 UX/UI Designer (Figma)

---

## ✨ Features Principales

### 🔐 Autenticación y Autorización

- Registro/login con JWT (access tokens)
- Sistema de roles: `admin` vs `user`
- Middleware de protección de rutas RBAC
- Password hashing con bcrypt (salt rounds: 10)

### 📖 Gestión de Catálogo

- CRUD completo de libros (solo admin)
- Búsqueda full-text por título, autor, editorial
- Filtros por categorías: novedades, fanzines
- Validación de ISBN (10 y 13 dígitos)
- Normalización automática de datos (uppercase, trim)

### 🛡️ Seguridad y Validación

- **Validación estricta** con Zod (type-safe)
- Sanitización de errores para producción
- Rate limiting ready (estructura preparada)
- `select: false` en campos sensibles (password)

### 🏗️ Arquitectura

```
src/
├── config/          # Conexión DB (patrón Singleton)
├── controllers/     # Lógica de negocio HTTP
├── middlewares/     # Auth, RBAC, error handling
├── models/          # Schemas Mongoose + tipos
├── routes/          # Definición de endpoints
├── schemas/         # Validación Zod
├── types/           # Interfaces TypeScript
└── scripts/         # Seeders (primer admin)
```

---

## 🚀 Tecnologías

| Capa              | Tecnología     | Propósito                                                      |
| ----------------- | -------------- | -------------------------------------------------------------- |
| **Runtime**       | Node.js 20     | Entorno de ejecución                                           |
| **Framework**     | Express 5      | API REST                                                       |
| **Lenguaje**      | TypeScript 5.9 | Tipado estricto (`strict: true`, `exactOptionalPropertyTypes`) |
| **Base de datos** | MongoDB Atlas  | Persistencia NoSQL                                             |
| **ODM**           | Mongoose 9     | Modelado de datos + validaciones                               |
| **Validación**    | Zod 4          | Runtime validation + type inference                            |
| **Auth**          | JWT + bcrypt   | Tokens firmados + hashing seguro                               |
| **DevOps**        | tsx            | Ejecución TypeScript sin compilado                             |

---

## 📋 API Endpoints

### Autenticación

| Método | Endpoint         | Descripción               | Auth       |
| ------ | ---------------- | ------------------------- | ---------- |
| `POST` | `/auth/register` | Registro de usuarios      | Pública    |
| `POST` | `/auth/login`    | Login + JWT               | Pública    |
| `POST` | `/auth/admin`    | Crear admin (solo admins) | JWT + Role |

### Libros

| Método   | Endpoint              | Descripción                        | Auth        |
| -------- | --------------------- | ---------------------------------- | ----------- |
| `GET`    | `/books`              | Listar libros (filtros opcionales) | Pública     |
| `GET`    | `/books/search?term=` | Búsqueda full-text                 | Pública     |
| `POST`   | `/books`              | Crear libro                        | JWT + Admin |
| `PATCH`  | `/books/:id`          | Actualizar libro                   | JWT + Admin |
| `DELETE` | `/books/:id`          | Eliminar libro                     | JWT + Admin |

---

## 🛠️ Instalación y Uso

### Prerrequisitos

- Node.js 20+
- MongoDB Atlas (o local)
- Variables de entorno configuradas

### 1. Clonar y instalar

```bash
git clone https://github.com/tu-usuario/libreria-backend.git
cd libreria-backend
npm install
```

### 2. Configurar variables de entorno

cp .env.example .env
PORT=
MONGO_URI=
JWT_SECRET=
FIRST_ADMIN_EMAIL=
FIRST_ADMIN_PASSWORD=

### 3. Crear primer administrador

```bash
npm run seed:admin
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

### 5. Compilar para producción

```bash
npm run build
npm start
```

🧪 Decisiones Técnicas Destacadas

1. TypeScript Strict Mode -> Tipado exhaustivo que elimina undefined accidentales y fuerza manejo de casos edge.
   {
   "strict": true,
   "exactOptionalPropertyTypes": true,
   "noUncheckedIndexedAccess": true
   }

2. Patrón Singleton para MongoDB
   // Evita reconexiones en entornos serverless (Vercel, AWS Lambda)
   let isConnected = false;
   if (isConnected) return existingConnection;

3. Zod + TypeScript Integration -> Validación en runtime que coincide 100% con el tipado en compile time.

```
const schema = z.object({ email: z.email() });
type Input = z.infer<typeof schema>; // TypeScript conoce el tipo
```

4. Manejo Centralizado de Errores

// Diferencia entre errores 4xx (cliente) y 5xx (servidor)
// Sanitización de mensajes en producción
// Logging detallado solo en desarrollo

🎨 Frontend
El frontend fue desarrollado en React + Vite con diseño profesional en Figma:
⚡ Build ultra-rápido con Vite
🎨 Implementación pixel-perfect de diseño Figma
📱 Responsive design
🔗 Consume esta API REST

📈 Métricas del Proyecto

| Aspecto                  | Detalle                        |
| ------------------------ | ------------------------------ |
| **Cobertura de tipos**   | 100% TypeScript strict         |
| **Endpoints**            | 8 rutas RESTful                |
| **Middlewares**          | 3 capas (auth, roles, errores) |
| **Modelos**              | 2 colecciones (users, books)   |
| **Validaciones**         | 3 schemas Zod                  |
| **Tiempo de desarrollo** | 6 semanas                      |

🚧 Próximos Pasos (Roadmap)

[ ] Implementar refresh tokens para mayor seguridad
[ ] Agregar rate limiting con express-rate-limit
[ ] Sistema de logs estructurados (Winston/Pino)
[ ] Tests unitarios con Vitest
[ ] CI/CD con GitHub Actions

👨‍💻 Autor
Croma - Full Stack Developer
https://www.linkedin.com/in/rocio-mendonca/
https://github.com/k-hroma

# La Palacio — Sistema de Gestión Editorial

**Full Stack en producción** para una librería independiente. Backend API REST con autenticación avanzada · React SPA con gestión de sesión sin localStorage.

🔗 [Frontend en Vercel](https://librerialapalacio.vercel.app) · [Backend en Render](https://backend-libreria-lapalacio-api-rest.onrender.com)

---

## El problema que resuelve

Una librería independiente con catálogo de libros y fanzines manejaba su inventario manualmente. Necesitaba digitalizar el catálogo, habilitar búsqueda para clientes y dar a su equipo un panel de administración seguro. El desafío técnico principal: construir un sistema de autenticación robusto para un contexto donde el backend vive en un servidor y el frontend en otro dominio (Render + Vercel), sin comprometer seguridad.

---

## Stack

| Capa          | Tecnología                           | Por qué                                                |
| ------------- | ------------------------------------ | ------------------------------------------------------ |
| Backend       | Node.js 20 + Express + TypeScript    | ESM nativo, tipado estricto                            |
| Base de datos | MongoDB Atlas + Mongoose             | Flexibilidad para catálogo editorial variable          |
| Validación    | Zod 4                                | Runtime validation + type inference sincronizados      |
| Auth          | JWT + bcryptjs + cookie-parser       | Access tokens en memoria + refresh en httpOnly cookies |
| Frontend      | React 19 + Vite + TypeScript         | React 19 estable, build optimizado                     |
| Imágenes      | Cloudinary                           | Upload desde panel admin sin backend propio            |
| Deploy        | Vercel (frontend) + Render (backend) | Free tier con config de producción real                |

---

## Funcionalidades

**Catálogo público**

- Listado de libros, fanzines y novedades con filtros combinados
- Búsqueda full-text (título, autor, editorial) con fallback regex
- Perfil de autor/escritorx con biografía y libros relacionados
- Carrito de compras (estado en memoria con Context API)

**Panel de administración** (solo admin)

- CRUD completo de libros y escritorxs
- Upload de imágenes de portada vía Cloudinary
- Registro de nuevos administradores (solo desde cuenta admin)
- Dashboard con estado del catálogo

**Autenticación**

- Login/registro con JWT de 15 minutos
- Sesión persistente con refresh tokens de 7 días
- Logout individual y logout de todos los dispositivos

---

## Decisiones técnicas

### 1. Refresh Token Rotation con Token Family (OAuth 2.0 pattern)

El sistema de sesión implementa el patrón recomendado por OWASP para refresh tokens:

- El refresh token **no se guarda en la BD** — se guarda su hash bcrypt
- Cada sesión tiene un `tokenFamily` (UUID) que identifica la cadena de renovaciones
- Cada uso del refresh token genera uno nuevo; el anterior queda marcado como `replacedByTokenHash`
- Si se detecta reutilización de un token ya consumido → **todas las sesiones de esa familia se revocan automáticamente**
- Índice TTL en MongoDB elimina tokens expirados sin cron job

```
Login → refresh_token_plain + token_family en cookies httpOnly
        hash(refresh_token_plain) en BD

Refresh → busca por token_family, verifica hash, genera nuevo par
          si replacedByTokenHash existe → ataque detectado, revocar todo
```

**Por qué importa:** Si un atacante roba el refresh token de un usuario, el primer uso legítimo del usuario detecta la reutilización y cierra todas las sesiones. Sin esto, el atacante mantiene acceso indefinido.

### 2. Access token en memoria (no localStorage)

```typescript
// client.ts — store fuera del DOM
let accessToken: string | null = null;
```

El access token nunca toca `localStorage` ni `sessionStorage`. Vive en una variable de módulo. Esto elimina el vector de ataque XSS más común: scripts maliciosos inyectados no pueden leer el token.

El refresh token vive en una **cookie httpOnly** — inaccesible desde JavaScript por spec del navegador.

### 3. Cola de requests durante refresh (concurrency handling)

```typescript
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
```

Si 5 requests simultáneos reciben 401, solo **uno** llama a `/auth/refresh`. Los otros 4 se suscriben y reciben el nuevo token cuando el primero resuelve. Sin esto: 5 refresh simultáneos, condición de carrera en las cookies, comportamiento undefined.

### 4. External Store Pattern con `useSyncExternalStore`

El estado de autenticación vive **fuera de React** en un store a nivel de módulo. `doRefresh()` se ejecuta al importar el módulo — antes del primer render de cualquier componente. Elimina el "flash de no-autenticado" al recargar la página con sesión activa.

`useSyncExternalStore` es la API interna que usan Zustand y Jotai. Implementarlo directamente demuestra comprensión del modelo de sincronización de React.

### 5. Cache con invalidación por prefijo

```typescript
// Clave estable independiente del orden de propiedades
const sorted = Object.fromEntries(
  Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)),
);
// books:list:{"fanzine":true} === books:list:{"fanzine":true} siempre
```

Las búsquedas nunca se cachean (cada input de usuario requiere resultado fresco). Las mutaciones invalidan `books:*` completo. TTL diferenciado: 5 min para listas, 10 min para items individuales.

### 6. Seguridad en capa de configuración

- **CORS fail-fast:** Si `FRONTEND_URL` no está en producción, la app tira error al arrancar (no silenciosamente usa localhost)
- **Sanitización de errores:** Errores 5xx devuelven mensaje genérico en producción; 4xx pasan el mensaje original
- **Audit log sin PII:** Los logs de seguridad registran `userId`, IP, timestamp — nunca email ni nombre
- **Rate limiting diferenciado:** 100 req/15min general, 10 req/15min en endpoints de auth (con `skipSuccessfulRequests: true`)

### 7. Búsqueda en dos estrategias

```
1. MongoDB $text index → resultados rankeados por relevancia (rápido)
2. Si sin resultados → regex con escapeRegExp() + maxTimeMS(5000)
                       ↑ previene ReDoS    ↑ previene starvation del servidor
```

`escapeRegExp` neutraliza input como `(.*)+` que podría causar backtracking exponencial en el motor de regex.

### 8. TypeScript con flags avanzados

```json
"noUncheckedIndexedAccess": true,    // array[0] es T | undefined, no T
"exactOptionalPropertyTypes": true,   // { a?: string } ≠ { a: string | undefined }
"strict": true
```

Estos flags son más estrictos que la configuración por defecto de `strict` y eliminan categorías completas de bugs en tiempo de compilación.

---

## Valor social y cultural del proyecto

La librería es un espacio cultural independiente en Buenos Aires con foco en publicaciones de disidencias, fanzines y literatura fuera del circuito comercial. Digitalizar su catálogo no es solo una solución técnica: es infraestructura para visibilidad de editoriales y autores que no llegan a las plataformas mainstream.

El sistema de categorías (libros / fanzines / novedades) responde directamente a la lógica de curaduría de la librería, no a un modelo genérico de e-commerce.

---

## Setup local

```bash
# Backend
cd backend
npm install
cp .env.example .env   # configurar MONGO_URI, JWT_SECRET, FRONTEND_URL
npm run seed:admin     # crear primer administrador
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env   # configurar VITE_API_URL
npm run dev
```

**Variables de entorno requeridas (backend):**

| Variable               | Descripción                                        |
| ---------------------- | -------------------------------------------------- |
| `MONGO_URI`            | Connection string de MongoDB Atlas                 |
| `JWT_SECRET`           | Mínimo 32 caracteres aleatorios                    |
| `FRONTEND_URL`         | URL del frontend en producción (requerido en prod) |
| `FIRST_ADMIN_EMAIL`    | Para el script de seed inicial                     |
| `FIRST_ADMIN_PASSWORD` | Mínimo 8 caracteres                                |

**Health check:** `GET /health` devuelve estado de la app y conexión a BD (usado por Render para monitoreo).

---

## Próximos pasos

- [ ] Tests unitarios con Vitest (priority: controladores de auth y `DataCache`)
- [ ] Tests de integración con supertest (endpoints `/auth/login`, `/auth/refresh`, token reuse detection)
- [ ] Paginación en `GET /books` (`?page=&limit=` con `meta` en respuesta)
- [ ] Sistema de logs estructurados (Winston/Pino)
- [ ] Documentación OpenAPI con Swagger

---

## Autora

**Rocío Mendonca** — Full Stack Developer  
[LinkedIn](https://www.linkedin.com/in/rocio-mendonca/) · [GitHub](https://github.com/k-hroma)

_Full Stack con Node.js, React y TypeScript. Formación en comunicación social y artes audiovisuales. Enfoque en proyectos de cultura, derechos humanos y organizaciones de impacto social._

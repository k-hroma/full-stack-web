1- npm create vite@latest .
2- npm i react-router-dom

Mejores practicas
main.jsx → Configuración global (Router, Providers, StrictMode)
App.jsx → Estructura de la aplicación (Routes, Layouts)
pages/components → Lógica específica de cada vista

Enrutamiento
BrowserRouter en el main-> buena practica
Crear router/RouterApp.jsx -> Routes-> Route
Components /layout / public o admmin -> navbar->NavLink

Material UI : mui.com
npm install @mui/material @emotion/react @emotion/styled
npm i @mui/icons-material
Badge / shopingCart

SweetAlert2
npm i sweetalert2

## Arquitectura

Usuario interactúa
↓
Componente (Button, ProductCard)
↓
Hook (useCart, useAuth) o Store (cartStore)
↓
Service (cartService, authService)
↓
API Client (api/client.ts)
↓
Tu backend espectacular

src/
├── api/ # Cliente HTTP y configuración
├── assets/ # Estáticos (imágenes, fonts, icons)
├── components/ # Componentes React reutilizables
├── config/ # Configuración global
├── contexts/ # Contextos de React (Auth, Cart, etc.)
├── hooks/ # Custom hooks
├── layouts/ # Layouts de página
├── pages/ # Rutas/Páginas
├── router/ # Configuración de rutas
├── services/ # Lógica de negocio/API
├── store/ # Estado global (Zustand/Redux)
├── styles/ # Estilos globales y temas
├── types/ # TypeScript types/interfaces
└── utils/ # Funciones utilitarias puras

Configuración del cliente HTTP, manejo de tokens, base URL.
api/
├── client.ts # Instancia base de axios/fetch
├── interceptors.ts # Request/response interceptors
└── endpoints.ts # URLs centralizadas

ui/: Botones, inputs, modales genéricos (Storybook friendly)
features/: ProductCard, ReviewList, CheckoutSteps (tienen lógica de negocio)
forms/: Formularios con validación (React Hook Form + Zod)

components/
├── ui/ # Atómicos, puros, sin lógica de negocio
│ ├── Button/
│ │ ├── Button.tsx
│ │ ├── Button.module.css
│ │ └── index.ts
│ ├── Input/
│ ├── Card/
│ ├── Modal/
│ └── index.ts # Export barrel
├── features/ # Componentes de dominio específico
│ ├── ProductCard/
│ ├── CartItem/
│ ├── UserProfile/
│ └── OrderSummary/
└── forms/ # Formularios reutilizables
├── LoginForm/
├── RegisterForm/
└── ProductForm/

Valores que no cambian en runtime, configuración centralizada.
config/
├── constants.ts # APP_NAME, MAX_ITEMS_CART, etc.
├── routes.ts # Rutas como constantes
├── theme.ts # Config MUI/Tailwind
└── env.ts # Validación de variables de entorno

Solo contextos que necesitan estar "vivos" globalmente. Preferir Zustand para estado global, Context solo para dependencias inyectadas.
contexts/
├── AuthContext.tsx # Estado de autenticación
├── CartContext.tsx # Estado del carrito
├── ThemeContext.tsx # Dark/light mode
└── index.tsx # Provider composer

Lógica reutilizable entre componentes. Cada hook = una responsabilidad.
hooks/
├── useAuth.ts # Login, logout, user
├── useCart.ts # Add, remove, clear cart
├── useProducts.ts # Fetch productos
├── useOrders.ts # Historial de compras
├── useLocalStorage.ts # Persistencia
└── useDebounce.ts # Utilitarios

Estructuras visuales completas. Cada layout tiene sus sub-componentes.
layouts/
├── PublicLayout/
│ ├── PublicLayout.tsx
│ ├── Navbar.tsx
│ ├── Footer.tsx
│ └── index.ts
├── AdminLayout/
│ ├── AdminLayout.tsx
│ ├── AdminSidebar.tsx
│ ├── AdminHeader.tsx
│ └── index.ts
└── AuthLayout/ # Login/register sin navbar
├── AuthLayout.tsx
└── index.ts

Componentes de página que se mapean 1:1 con rutas. Orquestan features.
pages/
├── public/ # Rutas accesibles sin auth
│ ├── Home/
│ ├── Products/
│ ├── ProductDetail/
│ ├── Cart/
│ ├── Checkout/
│ └── index.ts
├── auth/ # Login, register, forgot password
│ ├── Login/
│ ├── Register/
│ └── index.ts
├── admin/ # Panel de administración
│ ├── Dashboard/
│ ├── Products/
│ │ ├── ProductList.tsx
│ │ ├── ProductCreate.tsx
│ │ └── ProductEdit.tsx
│ ├── Users/
│ │ ├── UserList.tsx
│ │ └── UserEdit.tsx
│ ├── Orders/
│ └── index.ts
└── user/ # Área del usuario logueado
├── Profile/
├── OrdersHistory/
└── index.ts

Configuración de React Router. Lazy loading, guards, layouts por ruta.
router/
├── index.tsx # AppRoutes principal
├── privateRoutes.tsx # Guards de autenticación
├── adminRoutes.tsx # Guards de rol admin
└── routePaths.ts # Definición de paths

Funciones que hablan con la API. Abstracción del HTTP.
services/
├── authService.ts # Login, register, refresh token
├── userService.ts # CRUD usuarios
├── productService.ts # CRUD productos
├── orderService.ts # Crear orden, historial
├── cartService.ts # Persistir carrito en backend/LS
└── index.ts

Estado global accesible desde cualquier lado. Reemplaza Redux complejo.
store/
├── authStore.ts # User, token, isAuthenticated
├── cartStore.ts # Items, total, add, remove
├── uiStore.ts # Modales, toasts, loading global
└── index.ts

Estilos globales, temas, variables de diseño.
styles/
├── global.css # Reset, tipografía, utilidades
├── variables.css # CSS custom properties
├── mixins/ # SCSS mixins si aplica
└── themes/
├── light.ts
└── dark.ts

Interfaces y types compartidos. No types locales de componentes.
types/
├── auth.ts # User, LoginDTO, RegisterDTO
├── product.ts # Product, Category
├── order.ts # Order, OrderItem, Payment
├── cart.ts # CartItem
├── api.ts # ApiResponse, ApiError
└── index.ts

Funciones puras, sin dependencias de React. Testeables unitariamente.
utils/
├── formatters.ts # formatPrice, formatDate
├── validators.ts # Validaciones puras (Zod schemas)
├── storage.ts # localStorage/sessionStorage wrapper
├── calculations.ts # calcTotal, calcDiscount
└── helpers.ts # Funciones misceláneas puras

## Empezar

[ ] Crear estructura de carpetas vacía
[ ] Configurar api/client.ts con tu backend
[ ] Crear layouts/PublicLayout básico
[ ] Setup de rutas públicas en router/
[ ] Crear store/authStore (Zustand)
[ ] Implementar página Login con services/authService

//probando error en git

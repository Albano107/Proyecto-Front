# Proyecto Frontend - Plataforma de Monitoreo de Productos en Góndola

Frontend desarrollado con **React + Vite** para la plataforma de monitoreo proactivo de productos en góndola. Permite visualizar el estado del inventario, gestionar usuarios y consultar reportes de mermas, conectado en vivo al backend.

## 🛠️ Tecnologías

- React 19 + Vite 8
- Axios (cliente HTTP con interceptor de token)
- html5-qrcode (lectura de código de barras/QR con la cámara)
- CSS puro (sin frameworks)
- Navegación por estado (sin React Router)

## 📂 Estructura

```
src/
├── api/
│   ├── axios.js         # instancia de Axios (baseURL /api + token Bearer)
│   └── auth.js          # loginConEmail / loginConPin
├── components/
│   └── Sidebar.jsx      # layout con sidebar + menú mobile
├── pages/
│   ├── login.jsx / login.css
│   ├── inicio.jsx / inicio.css
│   ├── inventario.jsx / inventario.css
│   ├── reportes.jsx / reportes.css
│   └── usuarios.jsx / usuarios.css
├── App.jsx
└── main.jsx
```

## 🚀 Instalación

```bash
git clone https://github.com/Albano107/Proyecto-Front
cd Proyecto-Front
npm install
npm run dev
```

En desarrollo, `vite` sirve la app y las llamadas a `/api/*` deben apuntar (vía proxy o `nginx`) al backend en `http://localhost:3000`.

## 🐳 Docker

Incluye `dockerfile` (build multi-stage con Node + Nginx) y `nginx.conf`, que sirve el build estático y hace proxy de `/api/` hacia el servicio `backend:3000`.

```bash
docker build -t gondolapro-front .
docker run -p 80:80 gondolapro-front
```

## ✅ Lo que tiene

- Pantalla de login con email/contraseña y PIN, conectada a `/auth/login` y `/auth/login-pin`
- Inicio con resumen general obtenido de `/dashboard`
- Inventario con semáforo visual (verde/amarillo/rojo), toggle por productos/unidades, alta/edición/baja de productos, registro de retiros y paginación — todo contra la API real (`/inventario`, `/productos`, `/sucursales`, `/retiros`)
- Lector de código de barras/QR con la cámara (`html5-qrcode`) para buscar productos en Inventario
- Reportes de mermas con historial de retiros, resumen y filtro por sucursal
- Gestión de usuarios con alta/baja (activar-desactivar) de cuentas
- Control de acceso por rol en la navegación (el ítem "Usuarios" se oculta para el rol Operario)
- Diseño responsive mobile-first con menú hamburguesa
- Cliente Axios centralizado que adjunta el token guardado en `localStorage` a cada request

## 🔧 Lo que falta

- Autenticación real con JWT persistente (hoy el login responde con los datos del usuario, pero el backend todavía no emite ni valida un token)
- Control de acceso por rol a nivel de backend (por ahora solo se oculta la UI en el frontend)
- Exportación de reportes a Excel y PDF
- Dashboard con gráficos estadísticos (hoy son datos numéricos, sin gráficos)

## 🔗 Repositorios relacionados

- Backend: [Albano107/Proyecto-Backend](https://github.com/Albano107/Proyecto-Backend)
- Base de datos: [Albano107/Proyecto-bd](https://github.com/Albano107/Proyecto-bd)

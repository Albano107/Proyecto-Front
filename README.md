# Proyecto Frontend - Plataforma de Monitoreo de Productos en Góndola

Frontend desarrollado con **React + Vite** para la plataforma de monitoreo proactivo de productos en góndola. Permite visualizar el estado del inventario, gestionar usuarios y consultar reportes de mermas.

## 🛠️ Tecnologías

- React + Vite
- CSS puro (sin frameworks)
- Navegación por estado (sin React Router)

## 📂 Estructura

```
src/
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

## ✅ Lo que tiene

- Pantalla de login con email/contraseña y PIN
- Inicio con resumen general del sistema
- Inventario con semáforo visual (verde/amarillo/rojo) y toggle por productos/unidades
- Reportes de mermas con historial de retiros
- Gestión de usuarios con alta y baja de cuentas
- Diseño responsive mobile-first con menú hamburguesa

## 🔧 Lo que falta

- Conexión al backend (actualmente usa datos mockeados)
- Autenticación real con JWT
- Control de acceso por rol (admin/operario)
- Exportación de reportes a Excel y PDF
- Lector de código de barras
- Dashboard con gráficos estadísticos
- Dockerización

## 🔗 Repositorios relacionados

- Backend: [Albano107/Proyecto-Backend](https://github.com/Albano107/Proyecto-Backend)
- Base de datos: [Albano107/Proyecto-bd](https://github.com/Albano107/Proyecto-bd)

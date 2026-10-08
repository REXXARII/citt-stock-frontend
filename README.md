# CITT Stock - Frontend 📦💻

> Interfaz de usuario moderna, rápida y escalable para la plataforma de gestión, control de inventario y trazabilidad de activos del **Centro de Innovación y Transferencia Tecnológica (CITT)** – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General

Este repositorio contiene exclusivamente el código **Frontend** de **CITT Stock**. 

La interfaz ha sido diseñada con un enfoque prioritario en la experiencia de usuario (UX) y la usabilidad en terreno para los pañoles y laboratorios. Proporciona vistas interactivas para la gestión de catálogos, control de movimientos (préstamos temporales con fecha límite, devoluciones y pedidos definitivos de consumibles), lectura y escaneo de códigos QR, agendamiento de órdenes de mantenimiento y visualización de métricas en tiempo real.

---

## ✨ Características de la Interfaz y Módulos

* **Dashboard Métrico:** Indicadores generales del estado del pañol, alertas de stock crítico y accesos directos operativos.
* **Catálogo y Ficha de Activos:** Listado filtrable de equipos con detalles individuales, stock disponible y etiquetas QR listas para impresión.
* **Flujos de Movimiento:** Formularios dinámicos para préstamos, devoluciones y entrega de consumibles (como filamento 3D con conversión matemática de unidades).
* **Escáner QR Interactivo:** Módulo adaptado para cámaras de dispositivos móviles y tablets para agilizar la identificación de elementos en ventanilla.
* **Control de Mantenimiento y Parametrización:** Gestión de órdenes preventivas/correctivas y configuración adaptativa de casilleros y categorías.
* **Diseño Limpio y Responsivo:** Estilizado mediante una paleta institucional celeste y blanca, adaptada perfectamente a monitores, tablets y dispositivos móviles.

---

## 🛠️ Stack Tecnológico

* **Framework Base:** [Next.js](https://nextjs.org/) (App Router)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Sistema de Componentes:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
* **Iconografía:** [Lucide React](https://lucide.dev/)

---

## 🚀 Guía de Instalación y Uso (Desarrolladores)

Sigue estos pasos para levantar el entorno de desarrollo frontend en tu máquina local:

### 1. Clonar el repositorio
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/TU_USUARIO/citt-stock-frontend.git
cd citt-stock-frontend
```

### 2. Instalar las dependencias
Para descargar todas las librerías necesarias especificadas en el proyecto, ejecuta:
```bash
npm install
```

### 3. Encender el servidor de desarrollo
Una vez finalizada la instalación de paquetes, inicia el servidor local:
```bash
npm run dev
```

### 4. Visualizar la interfaz
Abre tu navegador web de preferencia e ingresa a la dirección:
👉 **http://localhost:3000**

---

## 📂 Estructura Principal del Proyecto

* `src/app/` — Rutas principales, páginas dinámicas y Layout del sistema (Dashboard, Inventario, Movimientos, Escáner, Reportes).
* `src/components/ui/` — Componentes modulares reutilizables basados en Shadcn UI (botones, tablas, modales).
* `public/` — Recursos estáticos, logotipos institucionales e imágenes de referencia.

---

## 🤝 Representantes y Equipo

* **Contraparte Institucional / Cliente:**
  * Paz Morales Saavedra

* **Unidad Ejecutora:**
  * Estudiantes de la Escuela de Informática y Telecomunicaciones — Duoc UC Sede San Bernardo.
  * - Arianette Pavez
  * - Tania Gaete

# CITT Stock

Aplicación frontend para la gestión y trazabilidad del inventario CITT, construida con Next.js.

## Funcionalidades

- **Dashboard:** métricas de inventario, préstamos, alertas y mantenimiento.
- **Inventario:** búsqueda y filtros, vistas de lista y tarjetas, fichas con QR, alta, reposición y exportación CSV.
- **Pedidos:** catálogo, carrito, seguimiento y gestión de estados.
- **Movimientos:** préstamos, pedidos, devoluciones y bajas con firma digital.
- **Miembros:** directorio, registro, edición, bloqueo y ficha de usuario.
- **Mantenimiento:** órdenes de trabajo y cambios de estado con observaciones.
- **Alertas y reportes:** alertas operativas y exportaciones CSV.
- **Configuración:** reglas y parámetros de la sede.

La interfaz incluye perfiles de demostración para probar los roles Administrador, Alumno Ayudante y Alumno Global. El login no muestra credenciales de demostración. La autenticación es local y de prueba: no sustituye un servicio de acceso real.

## Requisitos

- Node.js y npm.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Validación y producción

```bash
npm run lint
npm run build
npm start
```

## Datos y persistencia

Los datos de la aplicación se guardan en el `localStorage` del navegador; la sesión de acceso se guarda en el `sessionStorage` de la pestaña. No hay persistencia compartida entre usuarios ni conexión a un backend remoto.

`src/lib/mockData.ts` contiene ejemplos de contratos para activos, préstamos, movimientos de stock, usuarios, categorías, ubicaciones, roles y sedes. Estos ejemplos no representan una API conectada.

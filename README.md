# CITT Stock

Frontend de gestión y trazabilidad de inventario CITT construido con Next.js.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Vistas

- **Dashboard:** métricas de inventario, préstamos, alertas y mantenimiento.
- **Catálogo de activos:** búsqueda, filtros por categoría, lista/tarjetas, ficha QR, alta, reposición y exportación CSV.
- **Pedidos / catálogo:** catálogo de solicitudes, carrito, seguimiento y estados del pedido.
- **Gestión de pedidos:** aprobación, preparación, despacho, recepción y trazabilidad.
- **Movimientos:** préstamos, pedidos, devoluciones y bajas con firma digital.
- **Miembros:** directorio, registro, edición, bloqueo y ficha.
- **Mantenimiento:** órdenes de trabajo, cambios de estado con observaciones.
- **Alertas, reportes y parametrización:** alertas operativas, exportaciones CSV y reglas de sede.

El selector al pie del menú permite probar los roles Administrador, Alumno Ayudante y Alumno Global. Los datos de demostración se guardan en el `localStorage` del navegador para mantener los cambios entre rutas y recargas. Para compartir datos entre usuarios o persistirlos en un servidor hace falta conectar una API/backend; el mockup HTML no incluye un servicio de datos remoto.

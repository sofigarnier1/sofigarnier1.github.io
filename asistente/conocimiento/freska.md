# FRESKA Gestión

**Electron · Node.js · JavaScript · SQLite · PWA** · _Proyecto propio, en uso real_

Sistema de gestión con aplicación de escritorio y acceso desde el celular mediante PWA, que diseñé y desarrollé de punta a punta para un comercio. Reemplaza el cuaderno, la calculadora y el Excel con los que llevaban todo el negocio. Lo usa el administrador todos los días, desde la computadora del negocio y desde el celular, con la misma base de datos. Incluye pedidos, facturas, cobros y cuenta corriente, cheques, gastos, otros ingresos y caja, proveedores y compras, productos y stock, comisiones de vendedores, estadísticas y reportes.

- Relevé las necesidades con el usuario real, prioricé y rediseñé según su uso diario; documenté decisiones, manual y roadmap
- Migré los datos de un Excel a una base de datos relacional (SQLite) con reglas de negocio
- Usuarios con login, roles y permisos; anular una operación exige un motivo y el sistema avisa al administrador de las anulaciones de empleados
- Servidor propio en Node (API por HTTP, sesiones por cookie HttpOnly/Secure/SameSite, permisos por rol, control de concurrencia) que ejecuta la misma lógica que la app de escritorio; PWA que reutiliza las pantallas adaptadas al celular
- Tests automáticos para dinero y stock (más de 30 archivos), una prueba de 250 operaciones al azar por 8 semillas que verifica que los saldos cierren y una de 20 cobros simultáneos que no se pasan del saldo
- Migraciones de base de datos probadas sobre copias antes de aplicarlas; instalador para Windows, versiones publicadas, copias de seguridad y manual de uso dentro de la app

_Código: [github.com/sofigarnier1/freska-gestion](https://github.com/sofigarnier1/freska-gestion)_

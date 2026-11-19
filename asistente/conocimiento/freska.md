# FRESKA Gestión

FRESKA es un sistema de gestión hecho a medida para un comercio (no es un producto de venta): lo diseñó y desarrolló Sofía.

**Tecnologías: Electron · Node.js · JavaScript · SQLite · PWA** · _Proyecto propio, en uso real_

Sistema de gestión con aplicación de escritorio y acceso desde el celular mediante PWA, que diseñé y desarrollé de punta a punta para un comercio. Reemplaza el cuaderno, la calculadora y el Excel con los que llevaban todo el negocio. Lo usa el dueño todos los días, desde la computadora del negocio y desde el celular, con la misma base de datos. Incluye pedidos, facturas, cobros y cuenta corriente, cheques, gastos, otros ingresos y caja, proveedores y compras, productos y stock, comisiones de vendedores, estadísticas y reportes.

- Relevé las necesidades con el usuario real, prioricé y rediseñé según su uso diario; documenté decisiones, manual y roadmap
- Migré los datos de un Excel a una base de datos relacional (SQLite) con reglas de negocio
- Usuarios con login, roles y permisos; anular una operación exige un motivo y el sistema avisa al dueño de las anulaciones de empleados
- Servidor propio en Node (API por HTTP, sesiones por cookie HttpOnly/Secure/SameSite, permisos por rol, control de concurrencia) que ejecuta la misma lógica que la app de escritorio; PWA que reutiliza las pantallas adaptadas al celular
- Tests automáticos para dinero y stock (más de 30 archivos), una prueba de 250 operaciones al azar por 8 semillas que verifica que los saldos cierren y una de 20 cobros simultáneos que no se pasan del saldo
- Migraciones de base de datos probadas sobre copias antes de aplicarlas; instalador para Windows, versiones publicadas, copias de seguridad y manual de uso dentro de la app
- La desarrolló con Claude Code: ella define qué se construye, revisa y no da nada por terminado sin tests

_Código: [github.com/sofigarnier1/freska-gestion](https://github.com/sofigarnier1/freska-gestion)_

## Lo más difícil de FRESKA

Fueron dos cosas. La primera, pasar el negocio de un Excel a una base de datos relacional (SQLite) con reglas de negocio, sin perder datos. La segunda, llevarlo al celular: que el servidor y la app de escritorio hagan exactamente lo mismo, que se pueda usar sin conexión y adaptar las pantallas a un tamaño chico para usarlo en el reparto. Hoy el dueño lo usa desde el celular y su computadora con Windows 10 hace de servidor.

## Uso sin conexión en el celular

Sin conexión se puede cargar gastos y gastos personales, cobros (quedan con la fecha en que se cargaron, no con la del envío), pedidos (incluidos los programados) y notas o "para hacer". Esas cargas quedan en una cola dentro del celular y se mandan solas cuando vuelve la conexión. Para mirar, usa lo que quedó guardado la última vez que abrió con conexión: clientes, productos, pedidos, carga de hoy, stock, notas y apuntes; lo cargado sin conexión aparece en las listas marcado como "por mandar". También puede abrir la app y entrar con su contraseña sin conexión, siempre que haya entrado antes con conexión en ese celular; con 5 intentos fallidos tiene que esperar a que vuelva la computadora.

## Un error que Sofía corrigió en FRESKA

Al revisar la app encontró que, al renombrar o quitar un método de pago (una cuenta), los cobros ya registrados pasaban a "Sin asignar" y se perdía a dónde había entrado la plata. Lo corrigió: ahora no se puede quitar una cuenta que tiene plata, y agregó tests para que no vuelva a pasar. Los errores de este tipo los suele detectar ella con sus pruebas en la app, o se los avisa el dueño que la usa todos los días.

## Por qué Electron y SQLite

Elegí Electron porque es JavaScript, el mismo lenguaje que la interfaz web, y eso permitió después reutilizar casi todo para el celular con un servidor que sirve las mismas pantallas y una PWA. Además trae instalador y actualizaciones automáticas (electron-updater): el dueño se actualiza tocando un botón.

Elegí SQLite (con better-sqlite3) porque es un solo archivo, sin servidor de base de datos que instalar ni mantener, lo que también simplifica las copias de seguridad (la copia diaria y la externa a Drive). Es transaccional, algo importante para la plata (facturas, cobros y saldos): o se guarda todo o no se guarda nada. Para un negocio chico alcanza de sobra (la base pesa hoy unos 250 KB) y funciona sin internet, con los datos en la computadora del dueño.

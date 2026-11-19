# Sofía Garnier

**Desarrolladora Full Stack Junior (Junior Full Stack Developer)**  
Técnica Universitaria en Programación (UTN)  
📍 Concepción del Uruguay, Entre Ríos, Argentina  
✉ sofigarnier1@gmail.com  
💼 [linkedin.com/in/sofia-garnier](https://www.linkedin.com/in/sofia-garnier)  
⬡ [github.com/sofigarnier1](https://github.com/sofigarnier1) · 🌐 [sofia-garnier.vercel.app](https://sofia-garnier.vercel.app)

---

## Sobre mí

Desarrolladora full stack junior. Diseñé y desarrollé FRESKA, el sistema de gestión que un comercio usa todos los días para pedidos, facturas, cobros, stock y caja, desde la computadora y el celular, con pruebas automáticas para todo lo que toca dinero. Hice el frontend del portal de inversores de una constructora con Next.js y TypeScript, en uso. Busco sumarme a un equipo de desarrollo.

---

## Proyectos

### FRESKA Gestión
**Electron · Node.js · JavaScript · SQLite · PWA** · _Proyecto propio, en uso real_

Sistema de gestión con aplicación de escritorio y acceso desde el celular mediante PWA, que diseñé y desarrollé de punta a punta para un comercio. Reemplaza el cuaderno, la calculadora y el Excel con los que llevaban todo el negocio. Lo usa el dueño todos los días, desde la computadora del negocio y desde el celular, con la misma base de datos. Según el dueño, le ahorra un 25 % del tiempo. Incluye pedidos, facturas, cobros y cuenta corriente, cheques, gastos, otros ingresos y caja, proveedores y compras, productos y stock, comisiones de vendedores, estadísticas y reportes.

- Relevé las necesidades con el usuario real, prioricé y rediseñé según su uso diario; documenté decisiones, manual y roadmap
- Migré los datos de un Excel a una base de datos relacional (SQLite) con reglas de negocio
- Usuarios con login, roles y permisos; anular una operación exige un motivo y el sistema avisa al dueño de las anulaciones de empleados
- Servidor propio en Node (API por HTTP, sesiones por cookie HttpOnly/Secure/SameSite, permisos por rol, control de concurrencia) que ejecuta la misma lógica que la app de escritorio; PWA que reutiliza las pantallas adaptadas al celular
- Tests automáticos para dinero y stock (más de 30 archivos), una prueba de 250 operaciones al azar por 8 semillas que verifica que los saldos cierren y una de 20 cobros simultáneos que no se pasan del saldo
- Migraciones de base de datos probadas sobre copias antes de aplicarlas; instalador para Windows, versiones publicadas, copias de seguridad y manual de uso dentro de la app
- Lo desarrollé con Claude Code: defino qué se construye, reviso y no doy nada por terminado sin tests.

_Código: [github.com/sofigarnier1/freska-gestion](https://github.com/sofigarnier1/freska-gestion)_

### Pancho Piletas
**Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL)** · _Freelance · en desarrollo_

- Desarrollé la landing (catálogo de cloro, calculadora por pasos, pedido por WhatsApp) y pantallas del backoffice para que el dueño cargue los services que hace y venda cloro.
- Lo diseñé a partir de cómo trabaja el dueño, buscando que sea lo más práctico posible para el día a día.
- Escribí tablas, consultas y migraciones en PostgreSQL (Supabase) y levanté el entorno en contenedores con Docker, en equipo con otro desarrollador. Dominio adquirido; todavía sin publicar.

_Código: [github.com/sofigarnier1/pancho-piletas](https://github.com/sofigarnier1/pancho-piletas)_

### Alinea Desarrollos
**Next.js · React · TypeScript · Tailwind CSS** · _Freelance · ya en uso_ · [alineadesarrollos.com.ar](https://www.alineadesarrollos.com.ar)

- Frontend de la web institucional, del portal del inversor y del panel de administración de una constructora, con tests end-to-end (Playwright), entregados y en uso.
- Trabajo en equipo con otro desarrollador, que hizo el CRM y los flujos de automatización; repositorio en Azure DevOps y despliegue en Vercel y Azure App Service.

### Asistente y agente con IA
**Claude API · RAG · Supabase (pgvector) · Python** · _Asistente en mi portfolio; agente con código público en GitHub_ · [github.com/sofigarnier1/agente-pedidos-freska](https://github.com/sofigarnier1/agente-pedidos-freska)

- **Agente en Python que toma pedidos** con tres herramientas cerradas: los precios y las cuentas los resuelve el código, no el modelo. 28 de 30 casos de prueba (93 %), trampas incluidas.
- **Asistente con RAG**: embeddings (OpenAI), pgvector en Supabase y API de Claude; responde solo con mis documentos. Botón para dejarme un mensaje, con aviso por Telegram. Con tope de gasto.

### Proyectos académicos
- **Sistema de Gestión de Almacenes (WMS)** — Java · SQL: movimientos y trazabilidad por usuario sobre base de datos relacional.
- **Base de datos Northwind** — SQL · MySQL: normalización y consultas con JOINs, subconsultas y agregaciones.

---

## Experiencia

**Desarrolladora de software freelance · Sistemas a medida para clientes (feb 2026 – Actualidad)**

- FRESKA: diseño, desarrollo y mantenimiento del sistema de gestión que hoy usa un comercio
- Pancho Piletas: landing, pantallas del backoffice y base de datos (tablas, consultas y migraciones) de un negocio de cloro y service de piletas, en equipo con otro desarrollador (en desarrollo)
- Alinea Desarrollos: frontend de la web institucional, del portal del inversor y del panel de administración, con tests end-to-end, en uso, en equipo con otro desarrollador

**Community Manager y Creadora de Contenido · Freelance (ago 2024 – Actualidad)**

- Redes de locales de indumentaria, un consultorio y un negocio de piletas: contenido, campañas en Meta Ads y trato directo con cada cliente

**Atención al Cliente · Local de ropa masculina (sep 2024 – abr 2026)**

- Atención y asesoramiento, cobros y caja

**Ventas B2B · remoto (2023 – 2024)**

- **Especialista en ventas (appointment setter)** — InnovaTech Solutions, agencias de turismo (may 2023 – dic 2024)
- **Appointment setter** — ENBI Consulting, empresas de software, media jornada (feb – ago 2024): agenda de reuniones para el equipo comercial; hasta 15 reuniones agendadas en una semana

---

## Educación y cursos

**Tecnicatura Universitaria en Programación** — UTN, Facultad Regional Concepción del Uruguay (2024 – jul 2026) · Promedio 8,67

- Inglés para Programadores — UTN, 16 h (feb – mar 2025)
- Marketing digital: Digital Ad Certificate — Digital Ad Expert by Aleph (nov 2023)
- Comunicación efectiva con inteligencia emocional — Academia Comunica (sept 2026)

---

## Habilidades

- **Lenguajes:** JavaScript · TypeScript · Python · Java (POO) · SQL · HTML · CSS
- **Frontend:** Next.js · React · Tailwind CSS · Framer Motion · diseño responsive · PWA (2 proyectos)
- **Backend:** Node.js · Express · API REST · Electron
- **Diseño:** Figma · diseño de interfaces · identidad visual
- **Datos:** SQLite · PostgreSQL (Supabase) · MySQL · MongoDB · diseño relacional
- **Herramientas:** Git · GitHub · Azure DevOps · Azure App Service · Vercel · Docker · n8n (avisos por Telegram) · VS Code · npm
- **IA:** desarrollo con Claude Code y Codex, revisando y probando lo que generan
- **Calidad y entrega:** pruebas automáticas · tests end-to-end (Playwright) · instaladores y actualizaciones
- **Aprendiendo:** TypeScript en Node · inglés

**Idiomas:** Español nativo · Inglés básico (aprendiendo)

# SiteForge Studio v0.9

## Cambios
- Patrones **independientes** y **sincronizados** por sitio. Al actualizar un patrón, sus referencias se resuelven con el contenido más reciente al consultar borradores o páginas publicadas. La edición de la instancia sincronizada se sobrescribe cuando se recarga: para personalizarla, inserta una copia independiente.
- Diseñador global de **encabezado y pie de página** usando Puck y la biblioteca de componentes. Cada uno tiene borrador y versión publicada. Un diseño publicado con contenido reemplaza a la versión básica del tema en todas las páginas del mismo sitio.
- Inspector responsive: configuración de columnas para **tablet y móvil** en los componentes de columnas y grid.

## Instalación / actualización
1. Copiar y configurar `.env` desde `.env.example` si es una instalación nueva.
2. `npm install`
3. `docker compose up -d` (solo cuando no esté ejecutándose la base de datos).
4. Si el proyecto es nuevo: `npm run db:init`.
5. `npm run db:migrate` (aplica `phase6.sql`, es idempotente).
6. `npm run check`, `npm run build`, `npm run dev`.

En **Estilos del sitio** están los enlaces al editor visual de encabezado y pie. En **Patrones**, usa «Copia» o «Sincronizado». Para actualizar un patrón se elige el componente raíz de la página que se usará como nueva definición.

## Limitaciones y notas de seguridad
- Las actualizaciones de patrones sincronizados **se reflejan inmediatamente en páginas públicas**. No existe un flujo independiente de aprobación de cambios globales.
- Si un patrón se elimina, una instancia existente conserva su contenido de respaldo y deja de sincronizarse.
- Las instancias de patrón sincronizado están pensadas para gestionarse desde la biblioteca. No editar individualmente los contenidos internos y esperar conservar esas personalizaciones.
- El header/footer visual se añade como composición de bloques Puck, no como control del DOM fuera del editor.
- Persisten los requisitos previos de producción: pruebas de browser, autenticación endurecida, despliegue, dominios, almacenamiento y cobros.

# SiteForge Studio v0.8 — Capas y patrones

## Incluye
- Navegador de capas **Outline** incluido de fábrica en Puck. Desde ese panel se seleccionan y reordenan elementos, incluidos los slots dentro de filas y columnas.
- Biblioteca de patrones **por sitio**: guardar cualquier componente de primer nivel (incluyendo sus hijos y columnas), organizarlo por categoría, insertarlo como copia independiente y eliminarlo.
- Inserción preservando datos previos y asignando IDs nuevos a todos los componentes dentro de los slots. El editor se vuelve a montar después de insertar para cargar el nuevo borrador.
- Permisos de API: lectura para miembros, edición para propietarios y editores. Los patrones se filtran por site_id.

## Instalación / actualización desde v0.7
1. Copiar los archivos o descomprimir esta versión (conservar la configuración `.env` y PostgreSQL existente).
2. `npm install`
3. `npm run db:migrate` (incluye nueva tabla `site_patterns`).
4. `npm run check`
5. `npm run dev`
6. Abrir una página en `/editor/:id`, usar el panel **Outline** de Puck o el botón **Patrones** superior.

## Comportamiento y límites
- Los patrones son **copias independientes**, no se sincronizan de vuelta a las páginas donde se hayan insertado.
- La interfaz de guardado permite seleccionar componentes **raíz**. Para guardar una composición anidada, guarda el contenedor padre.
- Los cambios insertados permanecen en borrador hasta pulsar **Guardar borrador** o **Publicar**.
- No se incluye reordenamiento propio adicional: se utiliza el Outline interactivo oficial de Puck.
- No incluye cobros ni hosting de producción; ejecutar pruebas de integración y revisión de seguridad antes de publicarlo.

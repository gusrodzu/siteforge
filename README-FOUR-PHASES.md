# SiteForge Studio v0.4 — fases 1 a 4

Proyecto completo local con React + Vite, Puck, API Express y PostgreSQL. **MVP de desarrollo, no listo para uso público en producción**.

## Incluye
1. **Fase 1:** autenticación demo, empresas, permisos, sitios, páginas, Puck, borrador y publicación.
2. **Fase 2:** plantillas por giro, estilos de marca y previsualización responsive.
3. **Fase 3:** invitaciones con expiración, colaboradores, medios locales (WebP), DNS TXT y auditoría de publicación.
4. **Fase 4:** generador guiado y IA opcional, contenido editable Puck, navegación configurable y catálogo de planes **sin cobros**.

## Requisitos
Node 22+, Docker Desktop con PostgreSQL en puerto 5439.

## Instalación limpia (PowerShell)
```powershell
Copy-Item .env.example .env
# Edita .env antes de iniciar: SESSION_SECRET y contraseñas del seed
npm install
docker compose up -d
npm run db:init
npm run db:migrate
npm run check
npm run dev
```
Abre http://localhost:5173. Usa credenciales `SEED_ADMIN_*` definidas en `.env`.

## Actualizar desde v0.3
Conserva `.env`, PostgreSQL y `uploads` anteriores. Sustituye archivos del código sin borrar volúmenes y ejecuta:
```powershell
npm install
npm run db:migrate
npm run check
npm run dev
```

## Generador de páginas
En **Sitios → seleccionar sitio → Crear con IA**, describe la empresa y elige **Generar**. Sin `OPENAI_API_KEY` se genera un contenido guiado local, claramente etiquetado; con la clave, el servidor consulta la API de OpenAI y utiliza sus textos. Se revisa una vista previa resumida antes de crear una **nueva página en borrador**. No se publica automáticamente.

## Navegación
En **Estilos globales**, edita etiquetas y slugs de páginas internas. El header enlaza a los slugs dentro del mismo sitio; asegúrate de que las páginas estén publicadas. Los enlaces son relativos para funcionar también en ruta `/web/organizacion/sitio/pagina`.

## Planes
`/plans` lista precios ilustrativos en MXN y límites de referencia. No hay checkout, cargos, ni activación automática. La cuota mensual se comprueba de forma básica para el generador, **sin garantía ante solicitudes concurrentes**. No ofrecer como sistema de cobros terminado.

## Limitaciones y seguridad pendientes
- Falta registro público, recuperación de contraseña y verificación de correo.
- Falta endurecimiento contra abuso, CSRF sólido, rate limiting distribuido y observabilidad.
- Media en disco local: migrar a Cloudflare R2 antes de producción.
- DNS TXT no conecta dominios a Cloudflare ni configura certificados HTTPS automáticamente.
- Claves de terceros solo en el backend; no exponer en JavaScript del navegador.
- No utilizar la conexión PostgreSQL ni credenciales de demostración en producción.
- No desplegar el backend Node en Cloudflare Workers sin adaptar las dependencias y la persistencia de sesiones.
- No hay pasarela de pago ni facturación real.

## Comandos
`npm run dev` · `npm run build` · `npm run check` · `npm run db:migrate`


## Biblioteca v0.5

Se agregaron 65 bloques nuevos, sin borrar los 5 originales. Consulta `README-BLOCKS.md` para categorías, límites y uso.

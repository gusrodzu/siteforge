# SiteForge Studio v0.3 — Administración multiempresa

Extiende fase 2 con **invitaciones de clientes, roles, biblioteca de imágenes, registro de dominios y auditoría de publicaciones**.

## Ejecutar

1. `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`). Configurar contraseñas y una clave `SESSION_SECRET` fuerte.
2. `docker compose up -d`
3. `npm install`
4. Para instalación nueva: `npm run db:init` y después `npm run db:migrate`.
5. Para actualizar desde fase 2: **no reinicialices datos**, ejecuta `npm run db:migrate`.
6. `npm run dev`; abre http://localhost:5173.
7. Desde un sitio, entra a «Usuarios · Medios · Dominio».

**Nota:** si actualizas desde una base con la fase 2 existente, las migraciones crean nuevas tablas de forma idempotente. Las sesiones pasan a PostgreSQL y se invalidarán las sesiones locales anteriores.

## Invitaciones

Solo propietario crea invitaciones para editor o lector. El enlace se entrega **una vez** para compartir manualmente; dura 48 horas y en base solo se conserva su hash. Si el correo ya corresponde a un usuario, deberá introducir su contraseña actual para aceptar. Para un usuario nuevo se crea la cuenta con su contraseña.

## Imágenes

JPG/PNG/WebP de hasta 5 MB; Sharp verifica/reescribe a WebP. Se guardan en `UPLOAD_DIR` local, que **debe persistir** entre reinicios. Las imágenes son públicamente accesibles por URL una vez subidas; no usar para archivos privados. Para producción migrar a Cloudflare R2, con CDN y control de cuotas.

## Dominios

Añadir un dominio devuelve el TXT `_siteforge.nombre-del-dominio` con un token. «Comprobar DNS» verifica la propiedad mediante DNS público. **Esto NO configura un dominio personalizado ni SSL automáticamente**: para hacerlo hay que provisionar Cloudflare for SaaS / Custom Hostnames, configurar DNS y enrutar tráfico por Host hacia el sitio correcto. No se habilita automáticamente un dominio por verificar su TXT.

## Seguridad y pendientes para beta pública

- Roles revisados desde la API por cada organización. Guardado/publicación requiere editor o propietario. Lector solo lee información privada autorizada.
- Session store en PostgreSQL; cookie `HttpOnly`, `SameSite=Lax`, `Secure` en producción; origen cross-site bloqueado para mutaciones con `Origin` distinto.
- Antes de beta: activar HTTPS/TLS real, rate limiting login/invitaciones, sistema de correos, CSRF explícito para entornos cross-origin, backups, supervisión, auditoría y límites de almacenamiento. La API actual de sitios públicos sirve JSON desde la ruta `/web`; producción requiere dominio + renderizado por host.
- No abrir el servidor de desarrollo ni las credenciales de demostración a Internet.

## Validación

`npm run check` revisa sintaxis backend. `npm run build` revisa frontend (requiere dependencias instaladas). Pruebas end-to-end contra una base PostgreSQL en funcionamiento todavía son necesarias.

# SiteForge Studio v0.5 — Biblioteca ampliada de bloques

Este paquete integra todas las fases anteriores (1 a 4), conservando los cinco bloques originales y agregando **65 componentes**, organizados en 8 categorías dentro de Puck. En total hay **70 bloques**.

- **Estructura**: secciones con regiones de arrastre, contenedores, columnas, espaciador, separador, ancla, franja de color, sección dividida y barra informativa.
- **Texto**: encabezado, párrafo, artículo, cita, listas, pasos, icono con texto, aviso y fragmento de código.
- **Multimedia**: galería, imagen + texto, YouTube, audio, logotipos, antes/después, collage y descarga.
- **Marketing**: hero de dos columnas, tarjetas, beneficios, cifras, testimonios, precios, preguntas frecuentes, proceso, tabla, cuenta regresiva, franja de captación.
- **Negocios**: equipo, portafolio, caso de éxito, eventos, ubicación externa, datos de contacto, horarios, menú gastronómico, servicios y vacantes.
- **Interacción**: formulario por cliente de correo, botón de newsletter externo, búsqueda visual, pestañas, acordeón, redes sociales, WhatsApp y reservas externas.
- **Comercio**: cuadrícula y destacado de productos, categorías, promociones y carrito externo.
- **Avanzados**: recurso incrustado con dominios permitidos (YouTube/Google Maps), aviso informativo de cookies, índice, barras de progreso y etiquetas.

## Instalación

Si ya tienes v0.4, reemplaza los archivos de código con esta versión **sin sustituir tu `.env` ni la base de datos**. Consulta también `README-FOUR-PHASES.md`.

```powershell
npm install
docker compose up -d
npm run db:migrate
npm run check
npm run dev
```

En la ruta `/editor/:id`, abre la biblioteca de componentes de Puck para insertar y configurar los nuevos bloques. Se reutiliza exactamente el mismo `config` para edición y publicación.

## Límites actuales

No se afirma que existan todos los componentes posibles del ecosistema web. Esta es una biblioteca base extensible. Los módulos de contacto no almacenan ni envían desde servidor: generan un enlace de correo; Newsletter, reservas y carrito abren servicios externos; el buscador es solo presentación. Para comercio transaccional, reservas propias, recepción de formularios, consentimiento real de cookies y búsqueda dinámica, es necesario construir backend y conexiones externas por empresa.

No insertar HTML ni JavaScript arbitrarios en los embeds. No ejecutar código de terceros dentro del editor. Validar y restringir contenidos y URLs en el servidor antes de usarlo con clientes reales. 

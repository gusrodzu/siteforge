# SiteForge Studio v0.7 — Inspector de diseño y responsive

Mejoras inspiradas en prácticas comunes de los constructores modernos, sin reutilizar código ni interfaces propietarias.

## Incluye

- Conserva las fases 1–4, los 70 bloques y los 7 bloques de composición previos.
- Controles del inspector de Puck en todos los bloques Layout: radio, sombra, borde, visibilidad y estilos existentes de espacio, alineación y fondo.
- Comportamiento de visibilidad por breakpoint: todos, escritorio y tablet, solo escritorio, solo móvil u ocultar en tablet.
- En los bloques de 2–4 columnas y grid se puede fijar 1 o 2 columnas en tablet.
- Sin cambio de esquema PostgreSQL: las propiedades se guardan dentro de los datos Puck de cada página.

## Instalación

Para actualizar un proyecto existente, haz respaldo de la base de datos y archivos antes de sustituir el código. Copia `.env.example` a `.env` solo en instalaciones nuevas; en una existente conserva tu `.env`.

```
npm install
npm run check
npm run build
npm run dev
```

Para instalación nueva, consulta `README-FOUR-PHASES.md` y configura PostgreSQL con Docker.

## Limitaciones conocidas

Esto agrega controles reales de diseño sobre contenedores; **no** implementa todavía el panel visual de capas personalizado, redimensionado de columnas por arrastre, patrones sincronizados, conectores Shopify ni publicación de producción. Esas funciones requieren una nueva etapa.

El CSS de visibilidad es intencionalmente limitado a opciones seguras y predefinidas. Elementos ocultos siguen formando parte del HTML, por lo que no sirve como control de acceso ni privacidad.

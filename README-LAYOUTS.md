# SiteForge Studio v0.6 · Contenedores, filas y columnas

La versión v0.6 conserva las cuatro fases y los 70 bloques anteriores e incorpora **7 bloques adicionales de composición**, para un total de **77**. Los nuevos componentes usan campos `slot` de Puck: cada zona almacena sus propios componentes y aparece en la interfaz drag-and-drop del editor. **No se usa `DropZone`, obsoleto en Puck.**

## Biblioteca: «00 · Contenedores y columnas»

| Bloque | Uso |
| --- | --- |
| Contenedor anidable | Envolver secciones y módulos; 720/1120/1440 px o 100% |
| Fila flexible | Componentes en horizontal con ajuste automático |
| Columnas · 2 | 50/50, 66/33, 33/66, 75/25 o 25/75 |
| Columnas · 3 | Iguales, centro amplio o primera amplia |
| Columnas · 4 | Cuatro columnas de igual ancho |
| Cuadrícula de módulos | Distribución automática de bloques en 2, 3 o 4 columnas |
| Pila vertical | Componentes apilados con espacio configurable |

Todos permiten editar separación, alineación, relleno y fondo; los contenedores permiten configurar su ancho. En el editor: **Añadir → Contenedores y columnas → selecciona una composición → arrastra cualquier bloque a su interior**. Los bloques también pueden anidarse en otros contenedores.

### Ejemplo de jerarquía

```
Contenedor (ancho normal)
└── Columnas · 3
    ├── Columna 1: Imagen
    ├── Columna 2: Encabezado + Párrafo
    └── Columna 3: CTA + Icono
```

### Responsive
- **Escritorio:** 2, 3 o 4 columnas según el bloque.
- **Tablet:** 4 columnas → 2 columnas.
- **Móvil:** una columna; se puede invertir el orden del contenido en los bloques de columnas.
- La cuadrícula reduce a 2 columnas en tablet y a una en móvil.

Las nuevas zonas tienen área mínima para poder soltar bloques vacíos. No se migran ni renombran los bloques anteriores `Section`, `Container` y `Columns`, para preservar las páginas guardadas. Los nuevos bloques se identifican como `Layout*`.

## Actualización desde v0.5

Descomprime la versión completa, conserva tu archivo `.env` y volumen PostgreSQL existentes, y ejecuta:

```powershell
npm install
npm run check
npm run dev
```

**No se necesita migración SQL**: Puck guarda la estructura de columnas y módulos anidados en el JSON de cada página.

## Limitaciones

- Los bloques nuevos son una primera implementación de composición visual: aún no incluyen controles independientes de estilos por breakpoint, ajuste de proporciones por arrastre del separador, reglas de profundidad máxima de anidación ni diseño libre por coordenadas.
- Algunos bloques antiguos están concebidos como secciones de ancho completo y podrían requerir estilos específicos cuando se insertan dentro de columnas estrechas.
- Es necesario instalar las dependencias y probar el flujo de guardar/publicar visualmente antes de usar el editor en producción.

# FreshCut — Dirección de Diseño

Antes de escribir cualquier componente, sigue este plan exactamente. No uses paletas ni layouts "por defecto" fuera de lo que aquí se especifica.

## Por qué esto importa

El diseño generado por IA en 2025-2026 cae casi siempre en uno de tres patrones reconocibles:

1. Fondo crema (#F4F1EA) + serif de alto contraste + acento terracota (#D97757)
2. Fondo casi negro + un solo acento verde ácido o vermellón brillante
3. Layout tipo periódico: reglas finas, cero border-radius, columnas densas

Ninguno de los tres se usa aquí. FreshCut se inspira en el mundo real de una barbería: cuero, latón, acero de navaja, pizarra de menú de precios — no en una plantilla de SaaS.

## Paleta (tokens)

| Rol | Hex | Uso |
| --- | --- | --- |
| Fondo base | `#1C1A17` | Negro cálido, no negro puro — como madera oscura/cuero |
| Superficie | `#26221D` | Tarjetas, paneles |
| Texto principal | `#F2ECE2` | Blanco hueso, no blanco puro |
| Acento primario | `#B08D57` | Latón envejecido (herrajes de sillón de barbería) |
| Acento secundario | `#8A3B2E` | Rojo ladrillo apagado (poste de barbería, sin ser el rojo saturado típico) |
| Éxito / confirmación | `#5C7A5C` | Verde salvia apagado, no verde semáforo |

Nada de gradientes decorativos. El latón (`#B08D57`) se usa con moderación — botones primarios, bordes activos, iconografía de estado — no como fondo de secciones completas.

## Tipografía

- **Display (headings, nombre de la marca):** una slab serif condensada con carácter de rótulo pintado a mano — ej. `Fraunces` en corte ancho/bold, o `Bitter` bold condensada. Se usa con restricción: solo en el nombre del sitio, títulos de sección y nombres de profesionales en sus tarjetas.
- **Cuerpo:** sans neutra y legible — `Inter` o `IBM Plex Sans`. Todo el texto funcional (horarios, formularios, botones) va aquí.
- **Utilitaria (precios, duración, horas):** `IBM Plex Mono` para los datos tabulares — precios y duración en minutos se leen como una etiqueta de recibo, no como texto de párrafo.

## Layout / signature element

**Elemento distintivo:** las citas se presentan como un "ticket" de barbería — una tarjeta con muesca perforada en un lado (simulada con `clip-path` o un SVG de borde dentado), como un boleto de turno físico. Esto se usa en la confirmación de cita y en "Mis citas". No se repite en cada componente — es el único elemento con ese tratamiento, para que destaque.

**Estructura general (ASCII):**

```
[ Header: nombre marca (display font) — nav simple — botón login ]

[ Hero: NO usar big-number-stat-gradient genérico ]
  → en vez de eso: selector visual de profesional como fila
    horizontal de "sillones" (tarjetas con foto circular +
    nombre en display font + especialidad), el hero ES la
    acción principal, no una promesa de marketing

[ Al elegir profesional → selector de servicio (chips) →
  grid de horas disponibles como botones tipo "sello" ]

[ Confirmación → el ticket-card dentado descrito arriba ]
```

Nada de números de proceso "01 / 02 / 03" — no hay una secuencia narrativa que lo justifique, solo un flujo de selección.

## Motion

Mínimo e intencional: transición suave al seleccionar un horario disponible (breve escala + cambio de color, no más de 150ms), y una animación de "sello estampándose" al confirmar una cita — es el único momento con animación protagonista. Todo lo demás es estático. Respeta `prefers-reduced-motion`.

## Copy / tono

Escribe desde el lado del cliente, no del sistema: "Elige tu horario", no "Seleccione un slot disponible". Los estados vacíos dan una instrucción, no una disculpa: "Aún no tienes citas — reserva tu primer corte" en vez de "No se encontraron resultados". Los botones dicen la acción exacta: "Confirmar cita", no "Enviar".

## Checklist antes de dar por terminado un componente

- [ ] ¿Usé la paleta de arriba y no un azul/morado de Tailwind por defecto?
- [ ] ¿El acento latón aparece con moderación, no como fondo grande?
- [ ] ¿Hay algún gradiente decorativo sin justificación? → quítalo
- [ ] ¿El ticket dentado es el único elemento con tratamiento especial?
- [ ] ¿Funciona en mobile y con foco visible de teclado?
  
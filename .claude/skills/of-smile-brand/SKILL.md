---
name: of-smile-brand
description: Identidad visual y sistema de diseño de la app OF Smile (consultorio dental de la Dra. Laura), inspirado en Código Facilito - tema oscuro, verde #00B16C, tarjetas redondeadas, tono cercano en español. Úsala siempre que crees o modifiques cualquier pantalla, componente, formulario, botón, badge, CSS o paleta de este proyecto, aunque el usuario solo diga "haz la pantalla de...", "ponle estilos" o "que se vea bien". No uses colores ni estilos inventados fuera de esta skill.
---

# OF Smile — diseño de marca

La app la usa una asistente no técnica, muchas veces desde el celular y durante el trabajo. El estilo es oscuro, limpio y de alto contraste (referencia: plataformas de educación en tecnología como Código Facilito), pero el contenido es un consultorio dental: priorizar legibilidad y acciones obvias sobre decoración.

## Antes de escribir UI
1. Importa los tokens: `assets/tokens.css` de esta skill (copia en `frontend/src/tokens.css`). Todo color, radio y espaciado sale de ahí como variable CSS. No escribas hex sueltos en componentes.
2. Si necesitas un color nuevo, agrégalo primero a los tokens; no lo inventes en el componente.

## Paleta (resumen; valores exactos en `assets/tokens.css`)
| Uso | Token | Valor |
|---|---|---|
| Fondo de página | `--bg` | `#0b0f19` |
| Tarjetas / superficies | `--surface` | `#1e293b` |
| Bordes | `--border` | `#334155` |
| Texto principal | `--text` | `#ffffff` |
| Texto secundario | `--text-muted` | `#94a3b8` |
| Acento de marca | `--brand` | `#00b16c` |
| Info / Alerta / Error | `--info` / `--warning` / `--danger` | azul / ámbar / rojo suave |

## Reglas
- **Botón primario**: fondo `--brand`, texto `--on-brand` (oscuro). El texto blanco sobre ese verde no cumple contraste; no lo uses. Hover `--brand-hover`. Un solo botón primario por pantalla/formulario.
- **Tarjetas**: `--surface`, borde 1px `--border`, `border-radius: var(--radius)`, padding `--space-4` (móvil) a `--space-6` (escritorio).
- **Inputs**: fondo `--bg`, borde `--border`, radio `--radius-sm`, altura mínima 44px (se usan con el dedo). Foco visible: borde y anillo `--brand`. Etiqueta siempre visible encima (no solo placeholder).
- **Errores**: texto `--danger` bajo el campo, en español, diciendo cómo corregir ("Escribe el número con 10 dígitos"), nunca códigos técnicos. El color no es la única señal: incluye el texto.
- **Éxito**: confirmación breve con `--success`, que no bloquee el siguiente paso.
- **Badges de estado** (para fases futuras: programada, confirmada, asistió, no asistió, cancelada): píldora pequeña, fondo del color al ~15% de opacidad, texto del color pleno. Verde = confirmada/asistió, ámbar = pendiente/por contactar, azul = programada, rojo = no asistió/cancelada.
- **Progreso de tratamiento** ("sesión 2 de 3"): barra delgada con relleno `--brand` sobre `--border`, más el texto.
- **Tipografía**: `--font`; títulos 600–700, cuerpo 16px mínimo (evita zoom en iOS), texto secundario 14px en `--text-muted`.
- **Movimiento**: transiciones de `--transition` solo en color, borde y sombra. Sin animaciones decorativas.
- **Responsive**: mobile-first, contenedor máx. 720px centrado, una columna en móvil. Sin scroll horizontal a 375px.

## Tono de los textos
Cercano, profesional y directo, en español de tú. Verbos de acción en botones ("Guardar paciente", no "Enviar"). Mensajes que confirman lo que pasó: "Paciente guardado: Ana Pérez". Evita jerga técnica y signos de exclamación excesivos; un saludo cálido en la pantalla principal está bien ("¡Hola, Laura!").

## Qué NO hacer
- No copiar logos, nombres ni textos de Código Facilito: solo se toma la sensación visual (oscuro + verde + tarjetas redondeadas).
- No usar bloques de código con resaltado de sintaxis ni badges de nivel (Principiante/Avanzado): eso es del dominio educativo, no de este producto.
- No agregar librerías de UI ni de íconos para cumplir estas reglas; CSS plano con tokens basta.
- No poner datos personales de pacientes en ejemplos reales: usa nombres ficticios.

## Revisión rápida antes de entregar
- [ ] Todos los colores vienen de tokens
- [ ] Un solo botón primario, texto oscuro sobre verde
- [ ] Inputs ≥44px, con etiqueta y foco visible
- [ ] Errores en español con la acción para corregir
- [ ] Se ve bien a 375px y a 1280px

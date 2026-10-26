# Novio en Fuga

Runner de scroll lateral estilo *Jetpack Joyride*. Es el día de tu boda, te arrepentiste, y escapas con un jetpack de botellas de champaña mientras la novia furiosa te persigue.

## Cómo se juega
- **Mantén presionado** (Espacio, ↑, W, clic o toque) para subir. **Suelta** para caer.
- Esquiva luces eléctricas, torres de copas, arañas de cristal y ramos-misil (avisa un ❤ ! en el borde derecho).
- Cada golpe acerca a la novia; si el medidor de arriba se vacía, te atrapa.
- Recoge anillos (10 pts c/u). Power-ups: **Velo** (aguanta 1 golpe), **Imán**, **Luna de miel** (turbo invencible).
- Pausa: `P` o `Esc`.

## Regalos, vehículos y logros

- **Regalos de boda 🎁**: aparecen cada cierto tiempo (el primero cerca de los 90 m). Al cruzarlos te subes a un vehículo al azar que aguanta **un golpe** (si te dan, se destruye y sigues con el jetpack, sin castigo de la novia).
  - **Cisne Inflable**: cada toque da un aletazo; mantén para seguir aleteando.
  - **Limusina Recién Casados**: rueda por el piso; mantén para saltar más alto. Aplasta las torres de copas.
  - **Carroza de Cupido**: cada toque invierte la gravedad (piso ⇄ techo).
- **Logros** (menú → Logros): 29 retos en 6 grupos, con barra de progreso, y un **Garaje** con los vehículos descubiertos.
- El progreso se guarda en `localStorage` (clave `novio_en_fuga_save_v1`) y se puede borrar desde el modal de Logros.

## Desarrollo
```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint    # tsc --noEmit
```

## Video de intro
`public/assets/intro.mp4` es el video original y **se conserva tal cual**. Para que cargue en cualquier navegador, celular o IDE, la intro prueba estos formatos en orden (`src/components/IntroSequence.tsx`):

1. `src/assets/video/intro-compat.mp4`: mismo video, H.264 + una sola pista AAC (el original trae AAC y AC-3).
2. `src/assets/video/intro.webm`: VP9 + Opus, para navegadores sin códecs propietarios.
3. `public/assets/intro.mp4`: el original, como último recurso.

Las rutas de 1 y 2 las resuelve Vite (con `base: './'` en `vite.config.ts`), así que no dependen de dónde se sirva el proyecto. Si el video no se puede reproducir, se muestra un aviso con "Reintentar" y "Continuar" en vez de saltarlo en silencio.

## Estructura
- `src/game/engine.ts` – lógica y dibujo del juego (sin React).
- `src/game/constants.ts` – tamaños, colores, zonas, textos y valores de power-ups.
- `src/game/art/` – arte 100% vectorial en canvas: `characters.ts`, `props.ts`, `backgrounds.ts`, `core.ts`.
- `src/game/sound.ts` – efectos y música con Web Audio (sin archivos de audio).
- `src/game/RunnerCanvas.tsx` – monta el canvas y captura la entrada.
- `src/components/` – menú, game over y cómo jugar.

No hay imágenes ni audio externos: todo el arte y el sonido se generan por código.

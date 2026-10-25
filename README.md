# Novio en Fuga

Runner de scroll lateral estilo *Jetpack Joyride*. Es el día de tu boda, te arrepentiste, y escapas con un jetpack de botellas de champaña mientras la novia furiosa te persigue.

## Cómo se juega
- **Mantén presionado** (Espacio, ↑, W, clic o toque) para subir. **Suelta** para caer.
- Esquiva luces eléctricas, torres de copas, arañas de cristal y ramos-misil (avisa un ❤ ! en el borde derecho).
- Cada golpe acerca a la novia; si el medidor de arriba se vacía, te atrapa.
- Recoge anillos (10 pts c/u). Power-ups: **Velo** (aguanta 1 golpe), **Imán**, **Luna de miel** (turbo invencible).
- Pausa: `P` o `Esc`.

## Desarrollo
```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint    # tsc --noEmit
```

## Estructura
- `src/game/engine.ts` – lógica y dibujo del juego (sin React).
- `src/game/constants.ts` – tamaños, colores, zonas, textos y valores de power-ups.
- `src/game/art/` – arte 100% vectorial en canvas: `characters.ts`, `props.ts`, `backgrounds.ts`, `core.ts`.
- `src/game/sound.ts` – efectos y música con Web Audio (sin archivos de audio).
- `src/game/RunnerCanvas.tsx` – monta el canvas y captura la entrada.
- `src/components/` – menú, game over y cómo jugar.

No hay imágenes ni audio externos: todo el arte y el sonido se generan por código.

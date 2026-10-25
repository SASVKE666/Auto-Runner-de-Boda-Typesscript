/**
 * Utilidades de dibujo compartidas: fábrica de canvas, caché de sprites,
 * helpers de contorno y texto con borde.
 */
import { COLORS } from '../constants';

export const FONT_DISPLAY = '"Titan One", "Arial Black", Impact, system-ui, sans-serif';

type CanvasFactory = (w: number, h: number) => HTMLCanvasElement;

let factory: CanvasFactory = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Permite inyectar otra implementación de canvas (p. ej. pruebas fuera del navegador) */
export function setCanvasFactory(f: CanvasFactory) {
  factory = f;
  spriteCache.clear();
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  return factory(w, h);
}

let renderScale = 1;
const spriteCache = new Map<string, HTMLCanvasElement>();

/** Escala de resolución para los sprites pre-renderizados (normalmente devicePixelRatio) */
export function setRenderScale(s: number) {
  if (s !== renderScale) {
    renderScale = s;
    spriteCache.clear();
  }
}
export function getRenderScale() {
  return renderScale;
}

/** Pre-renderiza un dibujo una sola vez y lo reutiliza con drawImage */
export function getSprite(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  let c = spriteCache.get(key);
  if (!c) {
    c = makeCanvas(Math.ceil(w * renderScale), Math.ceil(h * renderScale));
    const ctx = c.getContext('2d')!;
    ctx.scale(renderScale, renderScale);
    draw(ctx);
    spriteCache.set(key, c);
  }
  return c;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ruido pseudoaleatorio determinista en [0,1) */
export function rand01(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Rellena y contornea el trazado actual con el estilo "cartoon" del juego */
export function ink(ctx: CanvasRenderingContext2D, fill: string | null, lw = 3, stroke: string = COLORS.ink) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (lw > 0) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string | null, lw = 3) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ink(ctx, fill, lw);
}

export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | null,
  lw = 3,
  rot = 0
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ink(ctx, fill, lw);
}

export function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | null,
  lw = 3
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ink(ctx, fill, lw);
}

export function poly(ctx: CanvasRenderingContext2D, pts: number[], fill: string | null, lw = 3) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ink(ctx, fill, lw);
}

export function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.55, y - s, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.55, y - s, x + s, y - s * 0.3, x, y + s * 0.35);
  ctx.closePath();
}

export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, lw = 2.5) {
  heartPath(ctx, x, y, s);
  ink(ctx, fill, lw);
}

export interface TextOpts {
  align?: CanvasTextAlign;
  stroke?: string;
  strokeW?: number;
  baseline?: CanvasTextBaseline;
  font?: string;
  alpha?: number;
}

/** Texto con contorno grueso, estilo arcade */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string = COLORS.cream,
  o: TextOpts = {}
) {
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.font = `${size}px ${o.font ?? FONT_DISPLAY}`;
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = o.baseline ?? 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = o.strokeW ?? Math.max(3, size / 5);
  ctx.strokeStyle = o.stroke ?? COLORS.ink;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

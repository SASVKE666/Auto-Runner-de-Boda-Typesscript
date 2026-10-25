/**
 * Personajes dibujados con vectores (estilo cartoon plano con contorno grueso).
 * Todas las funciones usan coordenadas locales con origen en el centro del torso
 * y el personaje mirando hacia la derecha (+X).
 */
import { COLORS } from '../constants';
import { circle, clamp, drawHeart, ellipse, ink, poly, rrect } from './core';

/** Colores del novio: coinciden con el personaje del video de intro (piel amarilla, ojos morados) */
export const GROOM_SKIN = '#f4cf45';
export const GROOM_SKIN_SHADE = '#d9a92c';
export const GROOM_IRIS = '#8e44ad';

export interface GroomPose {
  t: number;
  thrusting: boolean;
  grounded: boolean;
  vy: number;
  /** 0 = tranquilo, 1 = aterrado */
  fear: number;
  stunned: boolean;
  shield: boolean;
  turbo: boolean;
  caught?: boolean;
}

/** Punto (relativo al centro del novio) por donde sale la espuma de champaña */
export const NOZZLES = [
  { x: -25, y: 21 },
  { x: -17, y: 23 },
];

function bottle(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  rrect(ctx, -3.5, 6, 7, 11, 2, COLORS.bottle, 2.5); // cuello
  rrect(ctx, -4.8, 14, 9.6, 7, 2, COLORS.gold, 2.5); // papel dorado (boquilla)
  rrect(ctx, -7, -20, 14, 29, 6, COLORS.bottle, 2.5); // cuerpo
  rrect(ctx, -7, -9, 14, 11, 1, COLORS.cream, 2); // etiqueta
  circle(ctx, 0, -3.5, 2.2, COLORS.gold, 1.2);
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -16);
  ctx.lineTo(-4, -12);
  ctx.stroke();
  ctx.restore();
}

function limb(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  ang: number,
  len: number,
  w: number,
  sleeve: string,
  hand: string
) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(ang);
  rrect(ctx, -w / 2, -2, w, len, w / 2, sleeve, 2.5);
  circle(ctx, 0, len + 1.5, 4.6, hand, 2.5);
  ctx.restore();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  const pts: number[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  poly(ctx, pts, fill, 1.8);
}

export function drawGroom(ctx: CanvasRenderingContext2D, x: number, y: number, p: GroomPose) {
  const { t, grounded, thrusting, fear } = p;
  const run = grounded ? Math.sin(t * 17) : 0;
  const lean = p.caught
    ? 0
    : grounded
      ? 0.07
      : clamp(p.vy * 0.00045, -0.1, 0.2) + (thrusting ? 0.1 : 0);

  ctx.save();
  ctx.translate(x, y);

  // Aura dorada del turbo
  if (p.turbo) {
    const g = ctx.createRadialGradient(0, 0, 8, 0, 0, 62);
    g.addColorStop(0, 'rgba(255,230,120,.75)');
    g.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.rotate(lean);
  if (p.stunned && Math.floor(t * 16) % 2 === 0) ctx.globalAlpha = 0.42;

  // --- Jetpack: dos botellas de champaña ---
  bottle(ctx, -25, 2, -0.1);
  bottle(ctx, -17, 4, 0.06);
  // correa
  ctx.save();
  ctx.fillStyle = COLORS.burgundy;
  ctx.fillRect(-26, -3, 14, 5);
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.ink;
  ctx.strokeRect(-26, -3, 14, 5);
  ctx.restore();

  // --- Brazo trasero ---
  let backArm: number;
  let frontArm: number;
  if (p.caught) {
    backArm = 2.6 + Math.sin(t * 30) * 0.2;
    frontArm = -2.6 - Math.sin(t * 30) * 0.2;
  } else if (grounded) {
    backArm = -0.45 - run * 0.8;
    frontArm = -0.45 + run * 0.8;
  } else if (thrusting) {
    backArm = 0.55 + Math.sin(t * 14) * 0.06;
    frontArm = -1.55 + Math.sin(t * 14 + 1) * 0.06;
  } else {
    backArm = 2.3 + Math.sin(t * 13) * 0.35;
    frontArm = -2.3 + Math.sin(t * 13 + 1.7) * 0.35;
  }
  limb(ctx, -3, -12, backArm, 18, 8, COLORS.tux, COLORS.cream);

  // --- Piernas ---
  let legA: number;
  let legB: number;
  if (p.caught) {
    legA = 0.3 + Math.sin(t * 26) * 0.5;
    legB = -0.3 - Math.sin(t * 26) * 0.5;
  } else if (grounded) {
    legA = run * 0.95;
    legB = -run * 0.95;
  } else if (thrusting) {
    legA = 0.55 + Math.sin(t * 18) * 0.07;
    legB = 0.9 + Math.sin(t * 18 + 1) * 0.07;
  } else {
    legA = -0.35 + Math.sin(t * 11) * 0.28;
    legB = 0.4 + Math.sin(t * 11 + 2) * 0.28;
  }
  for (const a of [legB, legA]) {
    ctx.save();
    ctx.translate(-2, 14);
    ctx.rotate(a);
    rrect(ctx, -4.8, -2, 9.6, 22, 4.5, COLORS.tux, 2.5);
    ellipse(ctx, 3.5, 23, 8.5, 4.6, '#1b1320', 2.5);
    ellipse(ctx, 1, 21, 5, 2.6, COLORS.cream, 0);
    ctx.restore();
  }

  // --- Torso: frac negro ---
  poly(ctx, [-14, 2, -29, 22, -9, 18], COLORS.tux, 2.5); // faldones
  rrect(ctx, -14, -19, 28, 36, 9, COLORS.tux, 3);
  rrect(ctx, 2.5, -17.5, 10.5, 24, 4, COLORS.white, 2); // camisa
  ctx.beginPath();
  ctx.moveTo(2.5, -17);
  ctx.lineTo(6.5, 3);
  ink(ctx, null, 2.2);
  circle(ctx, 9.5, -8, 1.3, COLORS.ink, 0);
  circle(ctx, 9.5, -2, 1.3, COLORS.ink, 0);
  rrect(ctx, -14, 6, 28, 7, 2, COLORS.rose, 2.5); // faja
  // flor en la solapa
  circle(ctx, -1, -8, 4, COLORS.white, 2);
  circle(ctx, -1, -8, 1.6, '#e7d9c4', 0);

  // --- Cabeza ---
  circle(ctx, 6, -33, 15, GROOM_SKIN, 3);
  ellipse(ctx, -7.5, -32, 3.6, 4.6, GROOM_SKIN_SHADE, 2.2); // oreja
  // cabello
  ctx.beginPath();
  ctx.moveTo(-9.5, -33);
  ctx.bezierCurveTo(-13, -50, 2, -57, 13, -52);
  ctx.bezierCurveTo(20, -50, 22, -43, 21, -39);
  ctx.bezierCurveTo(15, -45, 9, -42, 6, -38);
  ctx.bezierCurveTo(2, -37, -2, -41, -4, -34);
  ctx.closePath();
  ink(ctx, COLORS.hair, 3);
  // remolino
  ctx.beginPath();
  ctx.moveTo(1, -52);
  ctx.quadraticCurveTo(4, -60, 11, -56);
  ink(ctx, null, 2.6, COLORS.ink);
  // ojo
  ellipse(ctx, 13, -34, 5.3, 6.5, COLORS.white, 2.2);
  circle(ctx, 14.8, -33.6, 3.4, GROOM_IRIS, 0);
  circle(ctx, 15.2, -33.4, 1.7, COLORS.ink, 0);
  circle(ctx, 16.1, -35.2, 1.1, COLORS.white, 0);
  // ceja preocupada
  ctx.beginPath();
  ctx.moveTo(8, -41.5 + fear * 1.5);
  ctx.lineTo(19, -43.5 - fear * 3.5);
  ink(ctx, null, 3.2);
  // nariz
  ctx.beginPath();
  ctx.moveTo(20.5, -32);
  ctx.quadraticCurveTo(25, -29.5, 20.8, -27.5);
  ink(ctx, null, 2.2);
  // mejilla
  ellipse(ctx, 11, -26.5, 3.6, 2.2, 'rgba(255,110,140,.5)', 0);
  // boca
  if (fear > 0.45 || p.caught) {
    ellipse(ctx, 15.5, -23.2, 3.6, 4.7, COLORS.burgundy, 2);
    ellipse(ctx, 15.5, -21.6, 2, 1.5, '#f28aa0', 0);
  } else {
    ctx.beginPath();
    ctx.arc(15, -26.5, 4.4, 0.15 * Math.PI, 0.85 * Math.PI);
    ink(ctx, null, 2.4);
  }
  // gota de sudor
  if (fear > 0.35) {
    const sy = -47 + ((t * 38) % 9);
    ctx.beginPath();
    ctx.moveTo(-2, sy - 5);
    ctx.quadraticCurveTo(-6, sy + 1, -2, sy + 3);
    ctx.quadraticCurveTo(2, sy + 1, -2, sy - 5);
    ink(ctx, '#7fd0ff', 1.8);
  }

  // moño (sobre el cuello, por delante de la cabeza)
  poly(ctx, [8, -15.5, -1, -20.5, -1, -10.5], COLORS.rose, 2.4);
  poly(ctx, [8, -15.5, 17, -20.5, 17, -10.5], COLORS.rose, 2.4);
  circle(ctx, 8, -15.5, 3.2, COLORS.roseDark, 2);

  // --- Brazo delantero ---
  limb(ctx, 6, -11, frontArm, 18, 8, COLORS.tux, COLORS.cream);

  // Estrellas de aturdimiento
  if (p.stunned) {
    for (let i = 0; i < 3; i++) {
      const a = t * 7 + (i * Math.PI * 2) / 3;
      star(ctx, 6 + Math.cos(a) * 17, -58 + Math.sin(a) * 4.5, 5, COLORS.gold);
    }
  }
  ctx.restore();

  // --- Velo protector ---
  if (p.shield) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = 1 + Math.sin(t * 6) * 0.03;
    ctx.scale(pulse, pulse);
    const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
    g.addColorStop(0, 'rgba(255,255,255,.05)');
    g.addColorStop(1, 'rgba(255,200,230,.5)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 41, Math.PI * 1.1, Math.PI * 1.45);
    ctx.stroke();
    drawHeart(ctx, 34, -34, 7, COLORS.blush, 2);
    ctx.restore();
  }
}

/** Novia furiosa: vuela hacia la derecha con el vestido y el velo ondeando */
export function drawBride(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  anger: number,
  grabbing = false
) {
  const dress = '#fffaf2';
  const hairCol = '#2f1b1b';
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 5) * 3);
  ctx.rotate(0.12 + Math.sin(t * 3) * 0.03);

  // Resplandor rojo cuando está cerca
  if (anger > 0.45) {
    const g = ctx.createRadialGradient(0, -10, 10, 0, -10, 95);
    g.addColorStop(0, `rgba(255,50,80,${0.38 * anger})`);
    g.addColorStop(1, 'rgba(255,50,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -10, 95, 0, Math.PI * 2);
    ctx.fill();
  }

  const w1 = Math.sin(t * 9) * 5;
  const w2 = Math.sin(t * 9 + 1.5) * 7;

  // Velo (detrás de todo): cinta translúcida que ondea
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.bezierCurveTo(-24, -70 + w1, -58, -52 + w2, -96, -60 + w1);
  ctx.bezierCurveTo(-82, -50 + w2, -86, -42 + w1, -98, -36 + w2);
  ctx.bezierCurveTo(-60, -40 + w1, -30, -34 + w2, -2, -44);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(42,20,32,.75)';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Falda: cono que se abre hacia atrás con dobladillo festoneado
  const h1 = Math.sin(t * 10) * 4;
  const h2 = Math.sin(t * 10 + 1.2) * 4;
  const hem: [number, number][] = [
    [-88 + h1, -12],
    [-82 + h2, 4],
    [-76 + h1, 20],
    [-70 + h2, 36],
    [-62 + h1, 52],
  ];
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.bezierCurveTo(-22, -4, -58, -24, hem[0][0], hem[0][1]);
  for (let i = 1; i < hem.length; i++) {
    const [px, py] = hem[i - 1];
    const [nx, ny] = hem[i];
    ctx.quadraticCurveTo((px + nx) / 2 - 11, (py + ny) / 2, nx, ny);
  }
  ctx.bezierCurveTo(-42, 46, -10, 34, 12, 18);
  ctx.closePath();
  ink(ctx, dress, 3);
  ctx.strokeStyle = '#f0cfd8';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (const k of [1, 2, 3]) {
    ctx.beginPath();
    ctx.moveTo(-4, 6 + k * 2.5);
    ctx.quadraticCurveTo(-34, 4 + k * 8, hem[k][0] + 12, hem[k][1] + 2);
    ctx.stroke();
  }

  // Brazo trasero levantado con el rodillo
  ctx.save();
  ctx.translate(-4, -17);
  ctx.rotate(grabbing ? 2.5 : 2.1 + Math.sin(t * 8) * 0.28);
  rrect(ctx, -3.8, -2, 7.6, 20, 3.8, '#f3c9a1', 2.5);
  ctx.translate(0, 20);
  ctx.rotate(-0.9);
  rrect(ctx, -3.2, -24, 6.4, 48, 3.2, '#d9a566', 2.5); // rodillo
  rrect(ctx, -4.2, -34, 8.4, 12, 3.4, '#a8703a', 2.5);
  rrect(ctx, -4.2, 22, 8.4, 12, 3.4, '#a8703a', 2.5);
  circle(ctx, 0, 0, 4.6, '#f3c9a1', 2.4);
  ctx.restore();

  // Corpiño
  rrect(ctx, -10, -25, 23, 34, 9, dress, 3);
  rrect(ctx, -10, 1, 23, 6, 2, COLORS.rose, 2.4);
  poly(ctx, [-10, 4, -21, -3, -21, 11], COLORS.rose, 2.2); // moño trasero

  // --- Cabeza ---
  circle(ctx, -8, -56, 9, hairCol, 2.8); // chongo
  circle(ctx, 7, -41, 17, '#f3c9a1', 3);
  ellipse(ctx, -8, -40, 3.8, 4.8, COLORS.skinShade, 2.2); // oreja
  ctx.beginPath();
  ctx.moveTo(-9, -40);
  ctx.bezierCurveTo(-13, -60, 5, -63, 15, -57);
  ctx.bezierCurveTo(21, -54, 22, -50, 21, -47);
  ctx.bezierCurveTo(15, -53, 9, -51, 5, -46);
  ctx.bezierCurveTo(1, -45, -4, -47, -5, -40);
  ctx.closePath();
  ink(ctx, hairCol, 3);
  // tiara
  poly(ctx, [-5, -57, -2, -66, 2, -58, 6, -68, 10, -58, 14, -66, 16, -57], COLORS.gold, 2.2);
  // ojo furioso
  ellipse(ctx, 15, -41, 5.8, 6, COLORS.white, 2.2);
  circle(ctx, 17, -40.6, 3, COLORS.ink, 0);
  circle(ctx, 18, -42, 1.1, COLORS.white, 0);
  ctx.beginPath();
  ctx.moveTo(8.5, -50);
  ctx.lineTo(23, -44.5);
  ink(ctx, null, 4);
  // nariz
  ctx.beginPath();
  ctx.moveTo(23.5, -38);
  ctx.quadraticCurveTo(28, -35.5, 23.8, -33.6);
  ink(ctx, null, 2.2);
  // mejilla
  ellipse(ctx, 10, -32, 4.4, 2.8, 'rgba(255,60,90,.55)', 0);
  // boca gritando
  const mouth = 4 + Math.abs(Math.sin(t * 9)) * 2;
  ellipse(ctx, 17.5, -29.5, 5.2, mouth, COLORS.burgundy, 2.2);
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(13.5, -29.5 - mouth + 1.6, 8.2, 2.6);
  // marca de enojo
  const vs = 1 + Math.sin(t * 12) * 0.18;
  ctx.save();
  ctx.translate(-2, -62);
  ctx.scale(vs, vs);
  ctx.strokeStyle = '#ff2d4f';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 2, -2);
    ctx.quadraticCurveTo(s * 7, -2, s * 7, -8);
    ctx.moveTo(s * 2, 2);
    ctx.quadraticCurveTo(s * 7, 2, s * 7, 8);
    ctx.stroke();
  }
  ctx.restore();
  // vapor
  if (anger > 0.3) {
    for (let i = 0; i < 2; i++) {
      const k = (t * 1.6 + i * 0.5) % 1;
      ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(-14 - i * 7, -48 - k * 22, 3 + k * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Brazo delantero estirado hacia el novio
  ctx.save();
  ctx.translate(6, -17);
  ctx.rotate(grabbing ? -1.15 : -1.42 + Math.sin(t * 7) * 0.08);
  rrect(ctx, -3.8, -2, 7.6, 32, 3.8, '#f3c9a1', 2.5);
  circle(ctx, 0, 32, 5.6, '#f3c9a1', 2.5);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 3, 36);
    ctx.lineTo(i * 3.8, 41);
    ink(ctx, null, 2.4);
  }
  ctx.restore();

  ctx.restore();
}

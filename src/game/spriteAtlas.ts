/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sistema de Sprites y Renderizado para PincheGorda Auto-Runner
 * Incluye función drawSpriteBottomCenter con pivote en los pies
 */

export type SpriteId =
  | 'groom_run_0'
  | 'groom_run_1'
  | 'groom_run_2'
  | 'groom_run_3'
  | 'groom_jump'
  | 'groom_fall'
  | 'groom_slide'
  | 'bride_chase_0'
  | 'bride_chase_1'
  | 'bride_chase_2'
  | 'bride_chase_3'
  | 'obstacle_cake'
  | 'obstacle_flowers'
  | 'obstacle_champagne'
  | 'obstacle_chandelier'
  | 'obstacle_garland'
  | 'obstacle_bell'
  | 'powerup_shield'
  | 'powerup_magnet'
  | 'powerup_boost'
  | 'powerup_multiplier'
  | 'coin_ring';

export interface SpriteDef {
  id: SpriteId;
  width: number;
  height: number;
  anchorX: number; // 0.5 = centro
  anchorY: number; // 1.0 = pies (Bottom)
}

export const SPRITE_DEFINITIONS: Record<SpriteId, SpriteDef> = {
  groom_run_0: { id: 'groom_run_0', width: 48, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_1: { id: 'groom_run_1', width: 48, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_2: { id: 'groom_run_2', width: 48, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_3: { id: 'groom_run_3', width: 48, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_jump: { id: 'groom_jump', width: 50, height: 74, anchorX: 0.5, anchorY: 1.0 },
  groom_fall: { id: 'groom_fall', width: 50, height: 74, anchorX: 0.5, anchorY: 1.0 },
  groom_slide: { id: 'groom_slide', width: 68, height: 36, anchorX: 0.5, anchorY: 1.0 },

  bride_chase_0: { id: 'bride_chase_0', width: 64, height: 84, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_1: { id: 'bride_chase_1', width: 64, height: 84, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_2: { id: 'bride_chase_2', width: 64, height: 84, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_3: { id: 'bride_chase_3', width: 64, height: 84, anchorX: 0.5, anchorY: 1.0 },

  obstacle_cake: { id: 'obstacle_cake', width: 46, height: 52, anchorX: 0.5, anchorY: 1.0 },
  obstacle_flowers: { id: 'obstacle_flowers', width: 44, height: 48, anchorX: 0.5, anchorY: 1.0 },
  obstacle_champagne: { id: 'obstacle_champagne', width: 48, height: 58, anchorX: 0.5, anchorY: 1.0 },

  obstacle_chandelier: { id: 'obstacle_chandelier', width: 58, height: 70, anchorX: 0.5, anchorY: 0.0 }, // Cuelga del techo
  obstacle_garland: { id: 'obstacle_garland', width: 72, height: 60, anchorX: 0.5, anchorY: 0.0 },
  obstacle_bell: { id: 'obstacle_bell', width: 54, height: 64, anchorX: 0.5, anchorY: 0.0 },

  powerup_shield: { id: 'powerup_shield', width: 36, height: 36, anchorX: 0.5, anchorY: 0.5 },
  powerup_magnet: { id: 'powerup_magnet', width: 36, height: 36, anchorX: 0.5, anchorY: 0.5 },
  powerup_boost: { id: 'powerup_boost', width: 36, height: 36, anchorX: 0.5, anchorY: 0.5 },
  powerup_multiplier: { id: 'powerup_multiplier', width: 36, height: 36, anchorX: 0.5, anchorY: 0.5 },

  coin_ring: { id: 'coin_ring', width: 26, height: 26, anchorX: 0.5, anchorY: 0.5 },
};

/**
 * Función principal solicitada: Dibuja un sprite alineado por su centro inferior (pivote en pies)
 */
export function drawSpriteBottomCenter(
  ctx: CanvasRenderingContext2D,
  spriteId: SpriteId,
  x: number,
  y: number,
  scale = 1,
  extraParams?: {
    flash?: boolean;
    hasShield?: boolean;
    rotation?: number;
    animTick?: number;
  }
): void {
  const def = SPRITE_DEFINITIONS[spriteId];
  if (!def) return;

  ctx.save();
  ctx.translate(x, y);

  if (extraParams?.rotation) {
    ctx.rotate(extraParams.rotation);
  }

  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Desplazamiento según el ancla (pivote en pies por defecto)
  const drawOffsetX = -def.width * def.anchorX;
  const drawOffsetY = -def.height * def.anchorY;

  ctx.translate(drawOffsetX, drawOffsetY);

  // Renderizado gráfico estilizado y de alta fidelidad
  renderCustomSprite(ctx, spriteId, def.width, def.height, extraParams);

  ctx.restore();
}

/**
 * Renderizador de arte vectorial nítido para cada elemento del juego
 */
function renderCustomSprite(
  ctx: CanvasRenderingContext2D,
  id: SpriteId,
  w: number,
  h: number,
  params?: {
    flash?: boolean;
    hasShield?: boolean;
    animTick?: number;
  }
) {
  const t = params?.animTick || 0;

  // Si está parpadeando por daño/invulnerabilidad
  if (params?.flash) {
    ctx.globalAlpha = Math.sin(t * 20) > 0 ? 0.35 : 0.9;
  }

  // ================= JUGADOR (NOVIO EN TRAJE BLANCO) =================
  if (id.startsWith('groom')) {
    renderGroom(ctx, id, w, h, t, params?.hasShield);
    return;
  }

  // ================= PERSECUTORA (NOVIA EN VESTIDO ROJO) =================
  if (id.startsWith('bride')) {
    renderBride(ctx, id, w, h, t);
    return;
  }

  // ================= OBSTÁCULOS =================
  if (id === 'obstacle_cake') {
    renderWeddingCake(ctx, w, h);
    return;
  }
  if (id === 'obstacle_flowers') {
    renderFlowerPot(ctx, w, h);
    return;
  }
  if (id === 'obstacle_champagne') {
    renderChampagneTower(ctx, w, h);
    return;
  }
  if (id === 'obstacle_chandelier') {
    renderChandelier(ctx, w, h);
    return;
  }
  if (id === 'obstacle_garland') {
    renderGarland(ctx, w, h, t);
    return;
  }
  if (id === 'obstacle_bell') {
    renderWeddingBell(ctx, w, h, t);
    return;
  }

  // ================= POWER-UPS =================
  if (id.startsWith('powerup_')) {
    renderPowerupIcon(ctx, id, w, h, t);
    return;
  }

  // ================= MONEDAS (ANILLOS) =================
  if (id === 'coin_ring') {
    renderWeddingRing(ctx, w, h, t);
    return;
  }
}

/** Novio corriendo / saltando / deslizándose */
function renderGroom(
  ctx: CanvasRenderingContext2D,
  id: string,
  w: number,
  h: number,
  t: number,
  hasShield?: boolean
) {
  const isSliding = id === 'groom_slide';
  const isJumping = id === 'groom_jump';
  const isFalling = id === 'groom_fall';

  // Si tiene escudo, dibuja burbuja protectora translúcida
  if (hasShield) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.7, h * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (isSliding) {
    // Novio deslizándose en el suelo horizontalmente
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, w / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Piernas estiradas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.1, h * 0.55, w * 0.5, 12);
    // Zapatos negros
    ctx.fillStyle = '#000000';
    ctx.fillRect(w * 0.05, h * 0.55, 14, 13);

    // Torso inclinado
    ctx.fillStyle = '#f8fafc'; // Traje blanco
    ctx.beginPath();
    ctx.roundRect(w * 0.45, h * 0.35, 24, 16, 4);
    ctx.fill();

    // Corbata roja ondeando hacia atrás
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(w * 0.48, h * 0.4);
    ctx.lineTo(w * 0.32, h * 0.25);
    ctx.lineTo(w * 0.34, h * 0.45);
    ctx.closePath();
    ctx.fill();

    // Cabeza con cara asustada
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.45, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cabello negro despeinado
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(w * 0.77, h * 0.38, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    // Ojo blanco bien abierto de pánico
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w * 0.79, h * 0.43, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(w * 0.81, h * 0.43, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Gotas de sudor
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w * 0.9, h * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // --- Postura de pie / saltando / corriendo ---
  const legCycle = Math.sin(t * 18);
  const armCycle = Math.cos(t * 18);

  // Sombra proyectada
  if (!isJumping && !isFalling) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Piernas (Pantalón negro/esmoquin)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  if (isJumping || isFalling) {
    // Pierna trasera flexionada
    ctx.beginPath();
    ctx.moveTo(w / 2 - 4, h - 30);
    ctx.lineTo(w / 2 - 14, h - 18);
    ctx.lineTo(w / 2 - 6, h - 6);
    ctx.stroke();

    // Pierna delantera extendida
    ctx.beginPath();
    ctx.moveTo(w / 2 + 4, h - 30);
    ctx.lineTo(w / 2 + 16, h - 16);
    ctx.lineTo(w / 2 + 20, h - 4);
    ctx.stroke();
  } else {
    // Animación de correr
    const legOffset = legCycle * 14;
    // Pierna 1
    ctx.beginPath();
    ctx.moveTo(w / 2 - 3, h - 32);
    ctx.lineTo(w / 2 - legOffset, h - 16);
    ctx.lineTo(w / 2 - legOffset * 1.2, h - 3);
    ctx.stroke();

    // Pierna 2
    ctx.beginPath();
    ctx.moveTo(w / 2 + 3, h - 32);
    ctx.lineTo(w / 2 + legOffset, h - 16);
    ctx.lineTo(w / 2 + legOffset * 1.2, h - 3);
    ctx.stroke();
  }

  // Torso / Saco Blanco
  const bobbing = Math.abs(Math.sin(t * 18)) * 3;
  const torsoY = h - 52 + (isJumping ? 0 : bobbing);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 12, torsoY, 24, 25, 4);
  ctx.fill();
  ctx.stroke();

  // Solapas del smoking y camisa
  ctx.fillStyle = '#0f172a'; // Solapa
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, torsoY);
  ctx.lineTo(w / 2 - 4, torsoY + 12);
  ctx.lineTo(w / 2 - 10, torsoY + 18);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w / 2 + 10, torsoY);
  ctx.lineTo(w / 2 + 4, torsoY + 12);
  ctx.lineTo(w / 2 + 10, torsoY + 18);
  ctx.fill();

  // Corbata Roja brillante (flotando con el viento hacia la izquierda)
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(w / 2, torsoY + 4);
  ctx.lineTo(w / 2 - 14, torsoY + 12);
  ctx.lineTo(w / 2 - 8, torsoY + 18);
  ctx.lineTo(w / 2, torsoY + 8);
  ctx.closePath();
  ctx.fill();

  // Brazos
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  if (isJumping) {
    // Brazos levantados de susto
    ctx.beginPath();
    ctx.moveTo(w / 2 - 8, torsoY + 6);
    ctx.lineTo(w / 2 - 16, torsoY - 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2 + 8, torsoY + 6);
    ctx.lineTo(w / 2 + 18, torsoY - 10);
    ctx.stroke();
  } else {
    // Braceo dinámico
    const armOffset = armCycle * 12;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 8, torsoY + 6);
    ctx.lineTo(w / 2 - armOffset, torsoY + 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2 + 8, torsoY + 6);
    ctx.lineTo(w / 2 + armOffset, torsoY + 18);
    ctx.stroke();
  }

  // Cabeza
  const headY = torsoY - 13;
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(w / 2 + 1, headY, 11, 0, Math.PI * 2);
  ctx.fill();

  // Pelo negro engominado pero desaliñado
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(w / 2 + 1, headY - 3, 11, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();
  // Mechón rebelde
  ctx.fillRect(w / 2 - 10, headY - 12, 6, 4);

  // Ojo mirando hacia atrás con pánico
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 2, headY - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w / 2 - 4, headY - 1, 2, 0, Math.PI * 2); // Pupila mirando a la izquierda
  ctx.fill();

  // Boca gritando (óvalo negro con lengua)
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.ellipse(w / 2 + 4, headY + 5, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gotas de sudor volando
  ctx.fillStyle = '#38bdf8';
  const sweatPhase = (t * 5) % 1;
  ctx.beginPath();
  ctx.arc(w / 2 - 12 - sweatPhase * 8, headY - 6 + sweatPhase * 4, 2, 0, Math.PI * 2);
  ctx.fill();
}

/** Novia furiosa en vestido rojo con rodillo de cocina ("PincheGorda") */
function renderBride(
  ctx: CanvasRenderingContext2D,
  _id: string,
  w: number,
  h: number,
  t: number
) {
  const step = Math.sin(t * 16);

  // Sombra pesada
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 2, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pies pisando fuerte
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(w / 2 - 16 + step * 4, h - 10, 14, 8);
  ctx.fillRect(w / 2 + 2 - step * 4, h - 10, 14, 8);

  // Vestido rojo voluminoso y arrugado
  const dressBob = Math.abs(step) * 4;
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 24, h - 10);
  ctx.quadraticCurveTo(w / 2 - 28, h - 40, w / 2 - 16, h - 52 - dressBob);
  ctx.lineTo(w / 2 + 16, h - 52 - dressBob);
  ctx.quadraticCurveTo(w / 2 + 28, h - 40, w / 2 + 24, h - 10);
  ctx.closePath();
  ctx.fill();

  // Detalles dorados en el vestido
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, h - 14, 18, 0, Math.PI);
  ctx.stroke();

  // Velo de novia rojo ondeando furiosamente hacia atrás
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 8, h - 68);
  ctx.quadraticCurveTo(w / 2 - 36, h - 60, w / 2 - 32, h - 35);
  ctx.quadraticCurveTo(w / 2 - 14, h - 45, w / 2 - 8, h - 56);
  ctx.fill();

  // Cabeza enfurecida
  const headY = h - 62 - dressBob;
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(w / 2, headY, 15, 0, Math.PI * 2);
  ctx.fill();

  // Cabello rizado castaño / rojo recogido con tiara
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(w / 2, headY - 4, 16, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Tiara dorada de novia
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, headY - 14);
  ctx.lineTo(w / 2 - 5, headY - 20);
  ctx.lineTo(w / 2, headY - 15);
  ctx.lineTo(w / 2 + 5, headY - 20);
  ctx.lineTo(w / 2 + 10, headY - 14);
  ctx.closePath();
  ctx.fill();

  // Cejas inclinadas de pura furia
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 8, headY - 6);
  ctx.lineTo(w / 2 - 2, headY - 2);
  ctx.moveTo(w / 2 + 8, headY - 6);
  ctx.lineTo(w / 2 + 2, headY - 2);
  ctx.stroke();

  // Ojos encendidos en cólera
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w / 2 - 7, headY - 2, 5, 5);
  ctx.fillRect(w / 2 + 3, headY - 2, 5, 5);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(w / 2 - 5, headY - 1, 3, 4);
  ctx.fillRect(w / 2 + 5, headY - 1, 3, 4);

  // Boca gritando furiosa con dientes apretados
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#450a0a';
  ctx.lineWidth = 1.5;
  ctx.fillRect(w / 2 - 7, headY + 5, 14, 6);
  ctx.strokeRect(w / 2 - 7, headY + 5, 14, 6);

  // Brazo derecho sosteniendo RODILLO DE COCINA amenazante
  const rollingPinAngle = Math.sin(t * 14) * 0.5 - 0.4;
  ctx.save();
  ctx.translate(w / 2 + 16, headY + 4);
  ctx.rotate(rollingPinAngle);

  // Brazo
  ctx.strokeStyle = '#fed7aa';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, -8);
  ctx.stroke();

  // Rodillo de madera tradicional con mangos
  ctx.fillStyle = '#d97706'; // Madera cuerpo
  ctx.fillRect(8, -26, 8, 30);
  ctx.fillStyle = '#92400e'; // Mango 1
  ctx.fillRect(10, -32, 4, 7);
  ctx.fillRect(10, 3, 4, 7); // Mango 2

  ctx.restore();
}

/** Obstáculo Bajo: Pastel de boda espinoso de 3 pisos */
function renderWeddingCake(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base / Plato plateado
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 4, w / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Piso 1 (Grande, abajo)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.fillRect(w * 0.1, h - 22, w * 0.8, 18);
  ctx.strokeRect(w * 0.1, h - 22, w * 0.8, 18);

  // Betún fresa
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(w * 0.1, h - 24, w * 0.8, 4);

  // Piso 2 (Medio)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.22, h - 38, w * 0.56, 15);
  ctx.strokeRect(w * 0.22, h - 38, w * 0.56, 15);
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(w * 0.22, h - 40, w * 0.56, 4);

  // Piso 3 (Arriba con espinas / velas amenazantes)
  ctx.fillStyle = '#fff1f2';
  ctx.fillRect(w * 0.34, h - 49, w * 0.32, 11);
  ctx.strokeRect(w * 0.34, h - 49, w * 0.32, 11);

  // Muñecos de novios rotos / velas encendidas en la cima
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(w / 2 - 4, h - 56, 3, 8);
  ctx.fillRect(w / 2 + 2, h - 56, 3, 8);
  // Llamas
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(w / 2 - 2.5, h - 58, 2.5, 0, Math.PI * 2);
  ctx.arc(w / 2 + 3.5, h - 58, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Obstáculo Bajo: Arreglo floral grande con rosas espinosas */
function renderFlowerPot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Maceta de mármol blanco
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h - 2);
  ctx.lineTo(w * 0.15, h - 20);
  ctx.lineTo(w * 0.85, h - 20);
  ctx.lineTo(w * 0.8, h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Follaje verde denso
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(w / 2, h - 28, 20, 0, Math.PI * 2);
  ctx.fill();

  // Rosas rojas con espinas
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(w / 2 - 8, h - 30, 7, 0, Math.PI * 2);
  ctx.arc(w / 2 + 8, h - 30, 7, 0, Math.PI * 2);
  ctx.arc(w / 2, h - 40, 8, 0, Math.PI * 2);
  ctx.fill();

  // Espinas afiladas saliendo
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h - 28);
  ctx.lineTo(w * 0.02, h - 32);
  ctx.moveTo(w * 0.9, h - 28);
  ctx.lineTo(w * 0.98, h - 32);
  ctx.stroke();
}

/** Obstáculo Bajo: Pirámide de copas de champán listas para romperse */
function renderChampagneTower(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Mesa de banquete con mantel rojo
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(w * 0.1, h - 16, w * 0.8, 16);
  ctx.fillStyle = '#fbbf24'; // Borde dorado
  ctx.fillRect(w * 0.08, h - 18, w * 0.84, 4);

  // Copas de cristal dorado espumoso
  ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  // Fila 1 (3 copas)
  for (let i = 0; i < 3; i++) {
    const cx = w * 0.25 + i * 14;
    ctx.fillRect(cx - 4, h - 32, 8, 12);
    ctx.strokeRect(cx - 4, h - 32, 8, 12);
  }
  // Fila 2 (2 copas)
  for (let i = 0; i < 2; i++) {
    const cx = w * 0.32 + i * 14;
    ctx.fillRect(cx - 4, h - 45, 8, 12);
    ctx.strokeRect(cx - 4, h - 45, 8, 12);
  }
  // Fila 3 (1 copa en la cima)
  ctx.fillRect(w / 2 - 4, h - 56, 8, 11);
  ctx.strokeRect(w / 2 - 4, h - 56, 8, 11);
}

/** Obstáculo Alto: Candelabro colgante de cristal y velas (requiere agacharse) */
function renderChandelier(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Cadena de oro desde el techo
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h * 0.4);
  ctx.stroke();

  // Estructura de brazos curvados barrocos
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.55, 20, 0, Math.PI);
  ctx.stroke();

  // Cristales colgantes brillantes
  ctx.fillStyle = '#38bdf8';
  for (let i = -2; i <= 2; i++) {
    const cx = w / 2 + i * 10;
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.55);
    ctx.lineTo(cx - 2, h * 0.85);
    ctx.lineTo(cx, h * 0.95);
    ctx.lineTo(cx + 2, h * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  // Velas con fuego amenazante
  ctx.fillStyle = '#fef08a';
  for (let i = -1; i <= 1; i += 2) {
    const cx = w / 2 + i * 15;
    ctx.fillRect(cx - 2, h * 0.42, 4, 10);
    // Llama
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, h * 0.38, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Obstáculo Alto: Guirnalda de flores y banderines festivos colgantes */
function renderGarland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  const sway = Math.sin(t * 4) * 3;

  // Cuerdas
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.quadraticCurveTo(w / 2, h * 0.5 + sway, w, 10);
  ctx.stroke();

  // Banderines triangulares de boda
  const colors = ['#ef4444', '#f8fafc', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 4; i++) {
    const cx = (w / 5) * (i + 1);
    const cy = 18 + Math.sin((i / 4) * Math.PI) * (h * 0.4) + sway;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 6);
    ctx.lineTo(cx + 8, cy - 6);
    ctx.lineTo(cx, cy + 18);
    ctx.closePath();
    ctx.fill();
  }
}

/** Obstáculo Alto: Campana de boda de bronce oscilante */
function renderWeddingBell(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  const angle = Math.sin(t * 6) * 0.2;

  // Viga superior
  ctx.fillStyle = '#451a03';
  ctx.fillRect(w * 0.1, 0, w * 0.8, 12);

  ctx.save();
  ctx.translate(w / 2, 12);
  ctx.rotate(angle);

  // Campana dorada
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-18, h * 0.6, -22, h * 0.75);
  ctx.lineTo(22, h * 0.75);
  ctx.quadraticCurveTo(18, h * 0.6, 10, 8);
  ctx.closePath();
  ctx.fill();

  // Badajo oscilando
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, h * 0.85, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Power-ups con aura brillante */
function renderPowerupIcon(
  ctx: CanvasRenderingContext2D,
  id: string,
  w: number,
  h: number,
  t: number
) {
  const pulse = Math.sin(t * 8) * 3;

  // Halo brillante exterior
  ctx.save();
  ctx.shadowBlur = 14;

  if (id === 'powerup_shield') {
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    // Escudo heráldico
    ctx.beginPath();
    ctx.moveTo(w / 2, 2 - pulse);
    ctx.lineTo(w - 2, 10 - pulse);
    ctx.quadraticCurveTo(w - 4, h - 8, w / 2, h + pulse);
    ctx.quadraticCurveTo(4, h - 8, 2, 10 - pulse);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cruz interior
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - 2, 10, 4, 16);
    ctx.fillRect(w / 2 - 8, 16, 16, 4);
  } else if (id === 'powerup_magnet') {
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Imán en forma de U
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 2, 14, Math.PI, 0, false);
    ctx.lineTo(w / 2 + 14, h - 6);
    ctx.lineTo(w / 2 + 7, h - 6);
    ctx.lineTo(w / 2 + 7, h / 2 - 2);
    ctx.arc(w / 2, h / 2 - 2, 7, 0, Math.PI, true);
    ctx.lineTo(w / 2 - 7, h - 6);
    ctx.lineTo(w / 2 - 14, h - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Polos plateados
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(w / 2 - 14, h - 12, 7, 6);
    ctx.fillRect(w / 2 + 7, h - 12, 7, 6);
  } else if (id === 'powerup_boost') {
    ctx.shadowColor = '#eab308';
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Rayo turbo
    ctx.beginPath();
    ctx.moveTo(w / 2 + 3, 2 - pulse);
    ctx.lineTo(6, h / 2 + 2);
    ctx.lineTo(w / 2 - 2, h / 2 + 2);
    ctx.lineTo(w / 2 - 4, h + pulse);
    ctx.lineTo(w - 6, h / 2 - 2);
    ctx.lineTo(w / 2 + 2, h / 2 - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'powerup_multiplier') {
    ctx.shadowColor = '#a855f7';
    ctx.fillStyle = '#9333ea';
    ctx.strokeStyle = '#f3e8ff';
    ctx.lineWidth = 2;
    // Estrella dorada/púrpura
    drawStar(ctx, w / 2, h / 2, 5, 14 + pulse, 7);
    ctx.fill();
    ctx.stroke();

    // Texto '2X'
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2X', w / 2, h / 2);
  }

  ctx.restore();
}

/** Moneda: Anillo de bodas resplandeciente */
function renderWeddingRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  const rot = t * 4;
  const scaleX = Math.cos(rot); // Efecto 3D de giro de la moneda

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(Math.abs(scaleX) < 0.15 ? 0.15 : scaleX, 1);

  // Aro dorado
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(0, 2, 8, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Diamante brillante en la parte superior
  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(5, -6);
  ctx.lineTo(0, -3);
  ctx.lineTo(-5, -6);
  ctx.closePath();
  ctx.fill();

  // Destello blanco
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

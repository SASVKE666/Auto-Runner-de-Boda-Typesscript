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
  | 'groom_jump_up'
  | 'groom_jump_apex'
  | 'groom_jump'
  | 'groom_fall'
  | 'groom_fast_fall'
  | 'groom_slide_0'
  | 'groom_slide_1'
  | 'groom_slide_2'
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
  | 'coin_ring'
  | 'obstacle_double_cake'
  | 'obstacle_mid_arch';

export interface SpriteDef {
  id: SpriteId;
  width: number;
  height: number;
  anchorX: number; // 0.5 = centro
  anchorY: number; // 1.0 = pies (Bottom)
}

export const SPRITE_DEFINITIONS: Record<SpriteId, SpriteDef> = {
  groom_run_0: { id: 'groom_run_0', width: 50, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_1: { id: 'groom_run_1', width: 50, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_2: { id: 'groom_run_2', width: 50, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_run_3: { id: 'groom_run_3', width: 50, height: 72, anchorX: 0.5, anchorY: 1.0 },
  groom_jump_up: { id: 'groom_jump_up', width: 54, height: 76, anchorX: 0.5, anchorY: 1.0 },
  groom_jump_apex: { id: 'groom_jump_apex', width: 56, height: 70, anchorX: 0.5, anchorY: 1.0 },
  groom_jump: { id: 'groom_jump', width: 54, height: 74, anchorX: 0.5, anchorY: 1.0 },
  groom_fall: { id: 'groom_fall', width: 52, height: 74, anchorX: 0.5, anchorY: 1.0 },
  groom_fast_fall: { id: 'groom_fast_fall', width: 50, height: 78, anchorX: 0.5, anchorY: 1.0 },
  groom_slide_0: { id: 'groom_slide_0', width: 62, height: 48, anchorX: 0.5, anchorY: 1.0 },
  groom_slide_1: { id: 'groom_slide_1', width: 72, height: 35, anchorX: 0.5, anchorY: 1.0 },
  groom_slide_2: { id: 'groom_slide_2', width: 66, height: 42, anchorX: 0.5, anchorY: 1.0 },
  groom_slide: { id: 'groom_slide', width: 72, height: 35, anchorX: 0.5, anchorY: 1.0 },

  bride_chase_0: { id: 'bride_chase_0', width: 92, height: 98, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_1: { id: 'bride_chase_1', width: 92, height: 98, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_2: { id: 'bride_chase_2', width: 92, height: 98, anchorX: 0.5, anchorY: 1.0 },
  bride_chase_3: { id: 'bride_chase_3', width: 92, height: 98, anchorX: 0.5, anchorY: 1.0 },

  obstacle_cake: { id: 'obstacle_cake', width: 46, height: 52, anchorX: 0.5, anchorY: 1.0 },
  obstacle_flowers: { id: 'obstacle_flowers', width: 44, height: 48, anchorX: 0.5, anchorY: 1.0 },
  obstacle_champagne: { id: 'obstacle_champagne', width: 48, height: 58, anchorX: 0.5, anchorY: 1.0 },

  obstacle_chandelier: { id: 'obstacle_chandelier', width: 58, height: 70, anchorX: 0.5, anchorY: 0.0 }, // Cuelga del techo
  obstacle_garland: { id: 'obstacle_garland', width: 72, height: 60, anchorX: 0.5, anchorY: 0.0 },
  obstacle_bell: { id: 'obstacle_bell', width: 54, height: 64, anchorX: 0.5, anchorY: 0.0 },
  obstacle_double_cake: { id: 'obstacle_double_cake', width: 90, height: 52, anchorX: 0.5, anchorY: 1.0 }, // Dos pasteles juntos (más ancho, requiere salto preciso)
  obstacle_mid_arch: { id: 'obstacle_mid_arch', width: 60, height: 80, anchorX: 0.5, anchorY: 1.0 }, // Arco a nivel del suelo (requiere agacharse sí o sí)


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

  if (id === 'obstacle_double_cake') {
    renderDoubleCake(ctx, w, h);
    return;
  }

  if (id === 'obstacle_mid_arch') {
    renderMidArch(ctx, w, h);
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


function renderGroom(
  ctx: CanvasRenderingContext2D,
  id: string,
  w: number,
  h: number,
  t: number,
  hasShield?: boolean
) {
  const isSliding0 = id === 'groom_slide_0';
  const isSliding1 = id === 'groom_slide_1' || id === 'groom_slide';
  const isSliding2 = id === 'groom_slide_2';
  const isAnySlide = isSliding0 || isSliding1 || isSliding2;

  const isJumpUp = id === 'groom_jump_up' || id === 'groom_jump';
  const isJumpApex = id === 'groom_jump_apex';
  const isFalling = id === 'groom_fall';
  const isFastFalling = id === 'groom_fast_fall';
  const isInAir = isJumpUp || isJumpApex || isFalling || isFastFalling;

  // Escudo protector
  if (hasShield) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    ctx.ellipse(w / 2, isAnySlide ? h / 2 : h * 0.55, w * 0.7, isAnySlide ? h * 0.55 : h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 1. ANIMACIÓN DE DESLIZAMIENTO / AGACHARSE 
  // =========================================================================
  if (isAnySlide) {
    // Sombra baja alargada en el piso
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, w * 0.48, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chispas de fricción y polvo
    if (isSliding1) {
      for (let i = 0; i < 4; i++) {
        const sparkPhase = ((t * 25 + i * 0.3) % 1);
        const sparkX = w * 0.28 - sparkPhase * 36;
        const sparkY = h - 2 - Math.random() * 5;
        ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2.5 - sparkPhase * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      const dustPhase = (t * 18) % 1;
      ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.beginPath();
      ctx.arc(w * 0.16 - dustPhase * 25, h - 5 - dustPhase * 4, 4 + dustPhase * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isSliding0) {
      // FASE 0: INICIO DE AGACHADO (dejándose caer con una rodilla)
      // Pierna trasera doblada con pantorrilla hacia atrás
      drawLegLimb(ctx, w * 0.30, h - 22, w * 0.16, h - 14, w * 0.08, h - 4, true);

      // PANTALONES / SHORTS CARBÓN (CADERA DELGADA Y AJUSTADA)
      drawPants(ctx, w * 0.36, h - 28, 15, 14, 0.15);

      // Torso amarillo
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.42, h - 38, 17, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Pierna delantera flexionada
      drawLegLimb(ctx, w * 0.42, h - 20, w * 0.52, h - 14, w * 0.62, h - 4, false);

      // Brazo rozando el piso
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.54, h - 30);
      ctx.lineTo(w * 0.7, h - 8);
      ctx.stroke();

      drawGroomHead(ctx, w * 0.64, h - 34, 0.12, t, 'focused');
      return;
    }

    if (isSliding1) {
      // FASE 1: DERRAPE PLENO A RAS DE SUELO (horizontal, cadera delgada y pantalones)
      // Pierna trasera extendida plana
      drawLegLimb(ctx, w * 0.30, h - 16, w * 0.16, h - 12, w * 0.04, h - 6, true);

      // PANTALONES / SHORTS CARBÓN (CADERA DELGADA)
      drawPants(ctx, w * 0.35, h - 22, 15, 12, 0.1);

      // Torso amarillo rasante
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.43, h - 22, 18, 13, 4);
      ctx.fill();
      ctx.stroke();

      // Pierna delantera plegada debajo
      drawLegLimb(ctx, w * 0.40, h - 14, w * 0.5, h - 12, w * 0.58, h - 6, false);

      // Brazo apoyado adelante con chispas
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.56, h - 16);
      ctx.lineTo(w * 0.8, h - 6);
      ctx.stroke();

      drawGroomHead(ctx, w * 0.72, h - 22, 0.2, t, 'gritted');
      return;
    }

    // FASE 2: RECUPERACIÓN (reincorporándose con manos)
    drawLegLimb(ctx, w * 0.30, h - 20, w * 0.18, h - 12, w * 0.12, h - 4, true);

    // PANTALONES (CADERA DELGADA)
    drawPants(ctx, w * 0.36, h - 28, 15, 14, 0.05);

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w * 0.43, h - 34, 17, 15, 4);
    ctx.fill();
    ctx.stroke();

    drawLegLimb(ctx, w * 0.42, h - 20, w * 0.48, h - 12, w * 0.54, h - 4, false);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.54, h - 26);
    ctx.lineTo(w * 0.68, h - 8);
    ctx.stroke();

    drawGroomHead(ctx, w * 0.64, h - 32, 0.05, t, 'focused');
    return;
  }

  // =========================================================================
  // 2. ANIMACIÓN EN EL AIRE / SALTO (PIERNAS NATURALES + CADERA DELGADA)
  // =========================================================================
  if (isInAir) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isFastFalling) {
      // Picada aerodinámica con pantalones claros y piernas estilizadas
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const lx = w * 0.25 + i * 14;
        ctx.beginPath();
        ctx.moveTo(lx, h * 0.1);
        ctx.lineTo(lx, h * 0.7);
        ctx.stroke();
      }

      // Piernas estiradas arriba con pantalones en los muslos
      drawLegLimb(ctx, w * 0.39, h - 50, w * 0.35, h - 62, w * 0.32, h - 72, true);
      drawLegLimb(ctx, w * 0.45, h - 50, w * 0.43, h - 62, w * 0.41, h - 72, false);

      // PANTALONES (CADERA DELGADA)
      drawPants(ctx, w * 0.37, h - 52, 15, 14, -0.2);

      // Torso
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.36, h - 38, 17, 18, 5);
      ctx.fill();
      ctx.stroke();

      // Brazos pegados
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h - 34);
      ctx.lineTo(w * 0.3, h - 48);
      ctx.moveTo(w * 0.54, h - 34);
      ctx.lineTo(w * 0.6, h - 48);
      ctx.stroke();

      drawGroomHead(ctx, w * 0.45, h - 18, 0.3, t, 'screaming');
      return;
    }

    if (isJumpUp) {
      // SALTO ASCENDENTE (Rodillas subiendo de manera natural y atlética)
      // Pierna trasera subiendo doblada
      drawLegLimb(ctx, w * 0.39, h - 46, w * 0.30, h - 34, w * 0.32, h - 22, true);

      // PANTALONES (CADERA DELGADA)
      drawPants(ctx, w * 0.36, h - 48, 15, 14, 0);

      // Torso
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.36, h - 62, 17, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Pierna delantera doblada hacia arriba con rodilla al frente
      drawLegLimb(ctx, w * 0.46, h - 46, w * 0.58, h - 36, w * 0.52, h - 22, false);

      // Brazos arriba
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h - 58);
      ctx.lineTo(w * 0.22, h - 70);
      ctx.moveTo(w * 0.52, h - 58);
      ctx.lineTo(w * 0.68, h - 70);
      ctx.stroke();

      drawGroomHead(ctx, w * 0.44, h - 70, -0.15, t, 'gritted');
      return;
    }

    if (isJumpApex) {
      // ÁPICE DEL SALTO (Pose ninja tuck jump: piernas flexionadas naturales al pecho)
      // Pierna 1 recogida
      drawLegLimb(ctx, w * 0.38, h - 40, w * 0.25, h - 44, w * 0.32, h - 34, true);

      // PANTALONES (CADERA DELGADA)
      drawPants(ctx, w * 0.36, h - 42, 15, 14, 0);

      // Torso
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.36, h - 56, 17, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Pierna 2 recogida al frente
      drawLegLimb(ctx, w * 0.46, h - 40, w * 0.60, h - 44, w * 0.54, h - 34, false);

      // Brazos abiertos
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h - 52);
      ctx.lineTo(w * 0.16, h - 46);
      ctx.moveTo(w * 0.53, h - 52);
      ctx.lineTo(w * 0.72, h - 46);
      ctx.stroke();

      drawGroomHead(ctx, w * 0.44, h - 64, 0, t, 'screaming');
      return;
    }

    // CAÍDA REGULAR (Piernas extendiéndose para aterrizar de manera realista)
    drawLegLimb(ctx, w * 0.39, h - 40, w * 0.33, h - 26, w * 0.3, h - 14, true);

    // PANTALONES (CADERA DELGADA)
    drawPants(ctx, w * 0.36, h - 42, 15, 14, 0);

    // Torso
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w * 0.36, h - 56, 17, 16, 4);
    ctx.fill();
    ctx.stroke();

    drawLegLimb(ctx, w * 0.46, h - 40, w * 0.50, h - 26, w * 0.54, h - 14, false);

    // Brazos
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h - 52);
    ctx.lineTo(w * 0.22, h - 66);
    ctx.moveTo(w * 0.53, h - 52);
    ctx.lineTo(w * 0.66, h - 66);
    ctx.stroke();

    drawGroomHead(ctx, w * 0.44, h - 64, 0.05, t, 'gritted');
    return;
  }

  // =========================================================================
  // 3. ANIMACIÓN DE CORRER (MOVIMIENTO NATURAL DE PIERNAS CON 2 ARTICULACIONES)
  // =========================================================================
  // Ciclo angular fluido de zancada
  const runRate = 14;
  const cycle = (t * runRate) % (Math.PI * 2);
  const runBounce = Math.sin(cycle * 2) * 2.5;

  // Sombra proyectada en el suelo
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(w * 0.48, h - 2, 18, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = h - 34 + runBounce;
  // Caderas delgadas centradas armoniosamente
  const hipX1 = w * 0.43;
  const hipX2 = w * 0.48;

  // Cinemática natural de carrera: pierna 1 (trasera) y pierna 2 (delantera)
  const p1 = cycle;
  const p2 = (cycle + Math.PI) % (Math.PI * 2);

  // PIERNA TRASERA (se dibuja primero, detrás del torso y shorts)
  drawNaturalRunLeg(ctx, hipX1, hipY, p1, true);

  // PANTALONES / SHORTS CARBÓN (CADERA DELGADA Y ESTILIZADA)
  drawPants(ctx, w * 0.37, hipY - 14, 15, 14, 0.05);

  // Torso amarillo sin camisa con inclinación aerodinámica
  const torsoY = hipY - 26;
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(w * 0.37, torsoY, 17, 16, 4);
  ctx.fill();
  ctx.stroke();

  // Pecho / clavículas
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w * 0.43, torsoY + 7, 1, 0, Math.PI * 2);
  ctx.arc(w * 0.50, torsoY + 7, 1, 0, Math.PI * 2);
  ctx.stroke();

  // PIERNA DELANTERA (se dibuja en primer plano, con articulación y sombra natural)
  drawNaturalRunLeg(ctx, hipX2, hipY, p2, false);

  // Braceo armónico coordinado con las piernas
  const armSwing = Math.sin(cycle) * 14;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Brazo trasero
  ctx.beginPath();
  ctx.moveTo(w * 0.4, torsoY + 4);
  ctx.lineTo(w * 0.4 - armSwing, torsoY + 16);
  ctx.stroke();

  // Brazo delantero
  ctx.beginPath();
  ctx.moveTo(w * 0.52, torsoY + 4);
  ctx.lineTo(w * 0.52 + armSwing, torsoY + 16);
  ctx.stroke();

  // Cabeza con ojos reducidos y pelo estilizado
  drawGroomHead(ctx, w * 0.47, torsoY - 8, 0.06, t, 'gritted');

  // Sudor por la velocidad
  const sweatPhase = (t * 5) % 1;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(w * 0.3 - sweatPhase * 14, torsoY - 12 + sweatPhase * 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Dibuja los pantalones/shorts deportivos carbón de cadera delgada y estilizada
 */
function drawPants(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle = 0
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);

  const hw = width / 2;
  const hh = height / 2;

  // Cadera delgada y estilizada (carbón oscuro #27272a)
  ctx.fillStyle = '#27272a';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-hw, -hh, width, height, 3);
  ctx.fill();
  ctx.stroke();

  // Salida de las perneras del pantalón hacia las piernas
  ctx.beginPath();
  ctx.roundRect(-hw + 0.5, hh - 3.5, width * 0.46, 4, [0, 0, 2, 2]);
  ctx.roundRect(0.5, hh - 3.5, width * 0.46, 4, [0, 0, 2, 2]);
  ctx.fill();
  ctx.stroke();

  // Cintura elástica gris ajustada (#52525b)
  ctx.fillStyle = '#52525b';
  ctx.fillRect(-hw, -hh, width, 3);

  ctx.restore();
}

/**
 * Cinemática natural de pierna humana para el ciclo de carrera:
 * Cadera -> Muslo con pantalón -> Rodilla -> Pantorrilla amarilla -> Zapatilla
 */
function drawNaturalRunLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  phase: number,
  isBehind: boolean
) {
  // Simulación biomecánica fluida de carrera:
  // - En impulso (fase > PI): pierna se estira hacia atrás y pisa el suelo
  // - En recobro (fase <= PI): rodilla se dobla hacia adelante y el talón sube
  const sin = Math.sin(phase);

  // Ángulo del muslo (inclinación adelante/atrás)
  const thighAngle = sin * 0.65;

  // Ángulo de flexión de la rodilla (se dobla hacia atrás durante el recobro)
  const kneeBend = phase < Math.PI ? Math.sin(phase) * 1.25 : Math.max(0, -sin * 0.35);

  const thighLen = 13;
  const calfLen = 13;

  // Cálculo de posiciones articulares
  const kneeX = hipX + Math.sin(thighAngle) * thighLen;
  const kneeY = hipY + Math.cos(thighAngle) * thighLen;

  const calfAngle = thighAngle - kneeBend;
  const footX = kneeX + Math.sin(calfAngle) * calfLen;
  const footY = Math.min(480, kneeY + Math.cos(calfAngle) * calfLen);

  drawLegLimb(ctx, hipX, hipY, kneeX, kneeY, footX, footY, isBehind);
}

/**
 * Dibuja una pierna con:
 * - Tramo superior (cadera -> rodilla): PANTALÓN / BERMUDA de tela carbón
 * - Tramo inferior (rodilla -> pie): PIEL AMARILLA expuesta
 * - Pie: Zapatilla deportiva estilizada
 */
function drawLegLimb(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  kneeX: number,
  kneeY: number,
  footX: number,
  footY: number,
  isBehind: boolean
) {
  ctx.save();

  // 1. PANTALÓN EN LA PIERNA (Muslo cubierto con el pantalón carbón)
  // Contorno negro del muslo/pantalón
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  // Relleno de la tela del pantalón (#27272a carbón oscuro, #18181b si está detrás)
  ctx.strokeStyle = isBehind ? '#18181b' : '#27272a';
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  // Dobladillo/borde del pantalón justo encima de la rodilla
  ctx.strokeStyle = isBehind ? '#3f3f46' : '#52525b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const dx = kneeX - hipX;
  const dy = kneeY - hipY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.moveTo(kneeX - nx * 3.5, kneeY - ny * 3.5);
  ctx.lineTo(kneeX + nx * 3.5, kneeY + ny * 3.5);
  ctx.stroke();

  // 2. PIEL AMARILLA (Rodilla a pie / pantorrilla descubierta)
  // Contorno negro de la pantorrilla
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.lineTo(footX, footY);
  ctx.stroke();

  // Relleno amarillo de la pantorrilla
  ctx.strokeStyle = isBehind ? '#d97706' : '#facc15';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.lineTo(footX, footY);
  ctx.stroke();

  // Rodilla anatómica visible
  ctx.fillStyle = isBehind ? '#d97706' : '#facc15';
  ctx.beginPath();
  ctx.arc(kneeX, kneeY, 2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Zapatilla / pie estilizado
  ctx.fillStyle = isBehind ? '#09090b' : '#18181b';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(footX + 3.5, footY, 5.5, 3.2, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Detalle de la suela blanca
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(footX + 3.5, footY + 1.8, 4.5, 1.2, 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Dibuja la cabeza del novio con:
 * - Ojos REDUCIDOS y SEPARADOS horizontalmente (#9333ea púrpura)
 * - Piel amarilla (#facc15)
 * - Pelo castaño puntiagudo anime/emo con flequillo (#451a03)
 * - Oreja con piercings plateados
 * - Expresión facial cómica
 */
function drawGroomHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  t: number,
  expression: 'gritted' | 'screaming' | 'focused'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // 1. Pelo trasero (volumen de picos shaggy)
  ctx.fillStyle = '#381607';
  ctx.beginPath();
  ctx.arc(-2, -6, 17, 0, Math.PI * 2);
  ctx.fill();

  // Picos traseros del pelo castaño
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(-26, -2);
  ctx.lineTo(-14, 4);
  ctx.lineTo(-24, 12);
  ctx.lineTo(-10, 14);
  ctx.closePath();
  ctx.fill();

  // 2. Oreja izquierda con piercings plateados
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-11, 1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Piercings metálicos plateados
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-13, -1, 2.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-13, 3, 2.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  // 3. Cabeza redonda amarilla
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(2, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. OJOS REDUCIDOS Y BIEN SEPARADOS (PÚRPURA / VIOLETA)
  // Ojo izquierdo (separado hacia la izquierda)
  ctx.fillStyle = '#9333ea';
  ctx.strokeStyle = '#3b0764';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-3.5, -1, 2.6, 3.6, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ojo derecho (separado hacia la derecha)
  ctx.beginPath();
  ctx.ellipse(8.5, -1, 2.8, 3.8, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Destellos blancos sutiles en los ojos (reducidos)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-3, -2.2, 0.65, 0, Math.PI * 2);
  ctx.arc(9, -2.2, 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Nariz sutil entre los ojos separados
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(2.5, 0);
  ctx.lineTo(3.5, 2);
  ctx.lineTo(2, 2.5);
  ctx.stroke();

  // Cejas expresivas bien ubicadas sobre cada ojo separado
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  if (expression === 'screaming') {
    ctx.moveTo(-6, -7);
    ctx.lineTo(-1, -9);
    ctx.moveTo(6, -9);
    ctx.lineTo(12, -7);
  } else {
    ctx.moveTo(-6, -6);
    ctx.lineTo(-1, -5);
    ctx.moveTo(6, -5);
    ctx.lineTo(12, -7);
  }
  ctx.stroke();

  // 5. Boca centrada
  if (expression === 'screaming') {
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(2.5, 7, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 4, 5, 2);
  } else {
    // Dientes apretados centrados
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-1, 5, 9, 4.5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 5);
    ctx.lineTo(2, 9.5);
    ctx.moveTo(5, 5);
    ctx.lineTo(5, 9.5);
    ctx.stroke();
  }

  // 6. Cabello frontal: Flequillo castaño
  ctx.fillStyle = '#5c2a10';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-2, -18);
  ctx.lineTo(6, -18);
  ctx.lineTo(16, -12);
  ctx.lineTo(12, -4);
  ctx.lineTo(6, -8);
  ctx.lineTo(2, -2);
  ctx.lineTo(-4, -6);
  ctx.lineTo(-10, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mechón alzado rebelde
  const hairSway = Math.sin(t * 14) * 2;
  ctx.fillStyle = '#783c18';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(-6, -28 + hairSway, -12, -26);
  ctx.quadraticCurveTo(-2, -22, 6, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Novia furiosa (Carrera contra el Altar)
 * Modelo fiel a la hoja de sprites y referencias:
 * - Piel morena
 * - Vestido blanco de novia strapless y velo blanco largo ondulante
 * - Cabello rizado castaño rojizo voluminoso
 * - Labios gruesos morados/azulados distintivos
 * - Ojos saltones gigantescos desorbitados con pupilas locas
 * - Boca abierta con LENGUA GIGANTE ROJA colgando y aleteando cómicamente
 * - Ramo de flores nupciales en las manos con pétalos volando
 */
function renderBride(
  ctx: CanvasRenderingContext2D,
  _id: string,
  w: number,
  h: number,
  t: number
) {
  const step = Math.sin(t * 16);
  const legBob = Math.abs(step);
  const tongueWobble = Math.sin(t * 22) * 5;
  const veilWave = Math.sin(t * 12) * 6;

  // 1. Sombra en el suelo
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(w / 2 - 2, h - 3, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Nubes de polvo tras sus pasos pesados
  const dustPhase = (t * 12) % 1;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.5)';
  ctx.beginPath();
  ctx.arc(w * 0.15 - dustPhase * 16, h - 8 - dustPhase * 6, 6 + dustPhase * 8, 0, Math.PI * 2);
  ctx.arc(w * 0.22 - dustPhase * 12, h - 14 - dustPhase * 4, 4 + dustPhase * 6, 0, Math.PI * 2);
  ctx.fill();

  // 3. Velo largo de novia blanco ondeando hacia atrás (izquierda)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.22);
  ctx.quadraticCurveTo(w * 0.15, h * 0.28 + veilWave, w * 0.02, h * 0.58 + veilWave);
  ctx.quadraticCurveTo(w * 0.08, h * 0.72 + veilWave, w * 0.22, h * 0.76);
  ctx.quadraticCurveTo(w * 0.32, h * 0.52, w * 0.48, h * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pliegues del velo
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.28);
  ctx.quadraticCurveTo(w * 0.18, h * 0.42 + veilWave, w * 0.06, h * 0.64 + veilWave);
  ctx.stroke();
  ctx.restore();

  // 4. Pies / Piernas morenas con pisadas firmes
  ctx.fillStyle = '#8c5535';
  ctx.strokeStyle = '#5a341e';
  ctx.lineWidth = 1.5;

  const leftFootX = w * 0.32 - step * 10;
  const rightFootX = w * 0.54 + step * 10;
  const leftFootY = h - 12 - (step > 0 ? step * 10 : 0);
  const rightFootY = h - 12 - (step < 0 ? -step * 10 : 0);

  // Pie izquierdo
  ctx.beginPath();
  ctx.roundRect(leftFootX, leftFootY, 18, 12, 5);
  ctx.fill();
  ctx.stroke();

  // Pie derecho
  ctx.beginPath();
  ctx.roundRect(rightFootX, rightFootY, 18, 12, 5);
  ctx.fill();
  ctx.stroke();

  // 5. Vestido blanco voluminoso de novia
  const dressBob = legBob * 5;
  const bodyY = h * 0.48 - dressBob;

  // Falda ancha con vuelo blanco
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(w * 0.3, bodyY + 12);
  ctx.quadraticCurveTo(w * 0.12, h * 0.75, w * 0.2, h - 8);
  ctx.lineTo(w * 0.75, h - 8);
  ctx.quadraticCurveTo(w * 0.85, h * 0.72, w * 0.7, bodyY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sombreados y pliegues en la falda blanca
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(w * 0.26, h - 8);
  ctx.quadraticCurveTo(w * 0.22, h * 0.76, w * 0.34, bodyY + 22);
  ctx.lineTo(w * 0.4, bodyY + 22);
  ctx.quadraticCurveTo(w * 0.32, h * 0.78, w * 0.38, h - 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.55, h - 8);
  ctx.quadraticCurveTo(w * 0.58, h * 0.74, w * 0.62, bodyY + 20);
  ctx.lineTo(w * 0.68, bodyY + 20);
  ctx.quadraticCurveTo(w * 0.66, h * 0.76, w * 0.68, h - 8);
  ctx.closePath();
  ctx.fill();

  // Corset / Torso strapless blanco con escote voluptuoso
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(w * 0.32, bodyY - 14, w * 0.42, 28, 8);
  ctx.fill();
  ctx.stroke();

  // Escote en corazón con ribete tenue
  ctx.fillStyle = '#fef08a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w * 0.43, bodyY - 14, 9, Math.PI, 0);
  ctx.arc(w * 0.61, bodyY - 14, 9, Math.PI, 0);
  ctx.stroke();

  // 6. Cabeza grande, redonda y cómica (Piel morena)
  const headX = w * 0.52;
  const headY = bodyY - 26;

  // Cabello rizado trasero (volumen de bucles)
  ctx.fillStyle = '#2d0e06';
  ctx.beginPath();
  ctx.arc(headX - 10, headY - 10, 20, 0, Math.PI * 2);
  ctx.arc(headX - 16, headY + 4, 18, 0, Math.PI * 2);
  ctx.arc(headX - 8, headY - 22, 17, 0, Math.PI * 2);
  ctx.arc(headX + 8, headY - 24, 18, 0, Math.PI * 2);
  ctx.arc(headX + 22, headY - 16, 17, 0, Math.PI * 2);
  ctx.fill();

  // Cuello y doble mentón cómico
  ctx.fillStyle = '#8c5535';
  ctx.strokeStyle = '#5a341e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(headX, headY + 14, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rostro ancho
  ctx.beginPath();
  ctx.ellipse(headX + 4, headY - 2, 24, 21, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bucles y rizos castaño rojizo al frente
  ctx.fillStyle = '#7c2d12'; // Tono rojizo-caoba
  for (let i = 0; i < 6; i++) {
    const rx = headX - 18 + i * 8;
    const ry = headY - 20 + Math.sin(i * 1.5) * 4;
    ctx.beginPath();
    ctx.arc(rx, ry, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#b45309'; // Reflejos cobrizos
  for (let i = 0; i < 4; i++) {
    const rx = headX - 14 + i * 9;
    const ry = headY - 24;
    ctx.beginPath();
    ctx.arc(rx, ry, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiara de novia blanca / diadema con velo
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(headX + 2, headY - 24, 16, 4.5, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. OJOS SALTONES GIGANTESCOS (Rasgo cómico de la imagen)
  // Ojo izquierdo (grande y desorbitado)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(headX - 6, headY - 11, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ojo derecho (aún más salido hacia el frente)
  ctx.beginPath();
  ctx.arc(headX + 13, headY - 12, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupilas negras desalineadas / locas mirando al novio y hacia arriba
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(headX - 4, headY - 14, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(headX + 16, headY - 15, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Destellos blancos en los ojos
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headX - 5, headY - 15, 1.2, 0, Math.PI * 2);
  ctx.arc(headX + 15, headY - 16, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Pestañas gruesas arqueadas
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headX - 12, headY - 21);
  ctx.lineTo(headX - 8, headY - 24);
  ctx.moveTo(headX - 4, headY - 22);
  ctx.lineTo(headX - 1, headY - 25);

  ctx.moveTo(headX + 8, headY - 23);
  ctx.lineTo(headX + 12, headY - 26);
  ctx.moveTo(headX + 17, headY - 23);
  ctx.lineTo(headX + 22, headY - 26);
  ctx.stroke();

  // 8. BOCA ENORME ABIERTA CON LABIOS MORADOS Y LENGUA GIGANTE
  // Cavidad bucal abierta en grito desquiciado
  ctx.fillStyle = '#3a0808';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(headX + 8, headY + 7, 14, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dientes cómicos
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX + 1, headY + 1, 5, 4);
  ctx.fillRect(headX + 7, headY + 1, 5, 4);
  ctx.fillRect(headX + 13, headY + 2, 4, 3.5);

  // LABIOS GRUESOS CARNOSOS MORADOS/AZULADOS (Detalle clave de la imagen)
  ctx.strokeStyle = '#556699';
  ctx.fillStyle = '#556699';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  // Labio superior curvado
  ctx.beginPath();
  ctx.moveTo(headX - 6, headY + 4);
  ctx.quadraticCurveTo(headX + 8, headY - 2, headX + 22, headY + 5);
  ctx.stroke();
  // Labio inferior grueso
  ctx.beginPath();
  ctx.moveTo(headX - 3, headY + 12);
  ctx.quadraticCurveTo(headX + 9, headY + 19, headX + 21, headY + 11);
  ctx.stroke();

  // LENGUA ENORME ROJA COLGANDO Y ALETEANDO HACIA ADELANTE
  ctx.save();
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headX + 4, headY + 6);
  ctx.quadraticCurveTo(headX + 18, headY + 10 + tongueWobble, headX + 26, headY + 22 + tongueWobble);
  ctx.quadraticCurveTo(headX + 22, headY + 30 + tongueWobble, headX + 12, headY + 24 + tongueWobble);
  ctx.quadraticCurveTo(headX + 8, headY + 14, headX + 2, headY + 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Línea media de la lengua
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headX + 7, headY + 9);
  ctx.quadraticCurveTo(headX + 16, headY + 14 + tongueWobble, headX + 19, headY + 24 + tongueWobble);
  ctx.stroke();
  ctx.restore();

  // 9. BRAZOS MORENOS Y RAMO DE FLORES DE NOVIA
  // Brazo extendido hacia adelante con bouquet nupcial
  const armSwing = Math.sin(t * 16) * 6;
  ctx.strokeStyle = '#8c5535';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headX + 16, bodyY - 4);
  ctx.lineTo(w * 0.78, bodyY + 6 + armSwing);
  ctx.stroke();

  // Manos sosteniendo el ramo
  ctx.fillStyle = '#8c5535';
  ctx.beginPath();
  ctx.arc(w * 0.78, bodyY + 6 + armSwing, 6, 0, Math.PI * 2);
  ctx.fill();

  // Ramo de novia (Bouquet): envoltorio rosa/rojo y flores blancas con centros amarillos
  const bouquetX = w * 0.82;
  const bouquetY = bodyY + 4 + armSwing;

  // Papel envoltorio del ramo
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.moveTo(bouquetX - 6, bouquetY + 10);
  ctx.lineTo(bouquetX + 6, bouquetY + 10);
  ctx.lineTo(bouquetX, bouquetY + 18);
  ctx.closePath();
  ctx.fill();

  // Flores blancas hinchadas (pompón de flores)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < 6; a++) {
    const fx = bouquetX + Math.cos((a * Math.PI) / 3) * 8;
    const fy = bouquetY + Math.sin((a * Math.PI) / 3) * 7;
    ctx.beginPath();
    ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Flor central
  ctx.beginPath();
  ctx.arc(bouquetX, bouquetY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Centros amarillos de las flores
  ctx.fillStyle = '#facc15';
  for (let a = 0; a < 6; a++) {
    const fx = bouquetX + Math.cos((a * Math.PI) / 3) * 8;
    const fy = bouquetY + Math.sin((a * Math.PI) / 3) * 7;
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(bouquetX, bouquetY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Pétalos volando en el aire por la velocidad de la persecución
  const petalPhase1 = (t * 4) % 1;
  const petalPhase2 = (t * 4 + 0.5) % 1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(bouquetX - 18 - petalPhase1 * 30, bouquetY - 6 - petalPhase1 * 14, 3, 2, petalPhase1 * 3, 0, Math.PI * 2);
  ctx.ellipse(bouquetX - 28 - petalPhase2 * 35, bouquetY + 8 - petalPhase2 * 10, 3.5, 2, petalPhase2 * 4, 0, Math.PI * 2);
  ctx.fill();
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

/** Obstáculo Bajo Doble: Dos pasteles de boda juntos (más ancho, requiere salto preciso) */
function renderDoubleCake(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base / Plato plateado extendido
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 4, w / 2 - 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pastel 1 (Izquierda)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.fillRect(w * 0.08, h - 22, w * 0.36, 18);
  ctx.strokeRect(w * 0.08, h - 22, w * 0.36, 18);
  ctx.fillStyle = '#fb7185'; // Betún
  ctx.fillRect(w * 0.08, h - 24, w * 0.36, 4);
  // Piso superior 1
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.14, h - 34, w * 0.24, 12);
  ctx.strokeRect(w * 0.14, h - 34, w * 0.24, 12);

  // Pastel 2 (Derecha)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(w * 0.56, h - 22, w * 0.36, 18);
  ctx.strokeRect(w * 0.56, h - 22, w * 0.36, 18);
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(w * 0.56, h - 24, w * 0.36, 4);
  // Piso superior 2
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.62, h - 34, w * 0.24, 12);
  ctx.strokeRect(w * 0.62, h - 34, w * 0.24, 12);

  // Decoración de espinas/rosas en el medio para hacerlo peligroso
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h - 22);
  ctx.lineTo(w * 0.5, h - 32);
  ctx.lineTo(w * 0.58, h - 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** Obstáculo Medio: Arco nupcial bajo (requiere agacharse/deslizarse sí o sí) */
function renderMidArch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base de madera oscura en el suelo
  ctx.fillStyle = '#451a03';
  ctx.fillRect(w * 0.1, h - 8, w * 0.8, 8);

  // Columnas laterales del arco
  ctx.fillStyle = '#78350f';
  ctx.fillRect(w * 0.1, h - 80, 12, 72);
  ctx.fillRect(w * 0.8 - 12, h - 80, 12, 72);

  // Arco superior (la parte que golpea si no te agachas)
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h - 80);
  ctx.quadraticCurveTo(w / 2, h - 105, w * 0.9, h - 80);
  ctx.lineTo(w * 0.9, h - 70);
  ctx.quadraticCurveTo(w / 2, h - 95, w * 0.1, h - 70);
  ctx.closePath();
  ctx.fill();

  // Contorno del arco
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Decoración de flores colgando del arco (estilo nupcial)
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(w / 2, h - 92, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(w / 2 - 12, h - 84, 7, 0, Math.PI * 2);
  ctx.arc(w / 2 + 12, h - 84, 7, 0, Math.PI * 2);
  ctx.fill();

  // Brillos en las flores
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 3, h - 95, 2, 0, Math.PI * 2);
  ctx.arc(w / 2 - 14, h - 86, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
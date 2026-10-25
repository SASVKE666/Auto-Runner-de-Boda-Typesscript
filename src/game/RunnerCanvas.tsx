/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Canvas Principal de PincheGorda Auto-Runner
 * Renderizado a 60fps con requestAnimationFrame, física, partículas, combo y efectos
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  checkAABB,
  executeJump,
  executeSlide,
  getPlayerHitbox,
  isOnGround,
  PlayerPhysicsConfig,
  PlayerPhysicsState,
  Rect,
  updatePlayerPhysics,
} from './physics';
import {
  ActivePowerups,
  createPowerup,
  getPowerupHitbox,
  INITIAL_ACTIVE_POWERUPS,
  POWERUP_CONFIG,
  PowerupItem,
  PowerupType,
  updateActivePowerups,
} from './powerups';
import { sound } from './sound';
import { drawSpriteBottomCenter, SpriteId } from './spriteAtlas';

export interface GameStats {
  score: number;
  distance: number;
  coins: number;
  combo: number;
  speed: number;
  brideDistancePct: number; // 0 = atrapado, 100 = lejos
  activePowerups: ActivePowerups;
  isGameOver: boolean;
  isPaused: boolean;
}

interface Obstacle {
  id: string;
  type: 'low' | 'high';
  spriteId: SpriteId;
  x: number;
  y: number; // Suelo o techo
  width: number;
  height: number;
  dodged: boolean;
  clearedInAir: boolean;
}

interface CoinItem {
  id: string;
  x: number;
  y: number;
  baseY: number;
  width: number;
  height: number;
  collected: boolean;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
}

/**
 * Renderizador Chibi Cartoon de Alta Fidelidad para el Corredor (Novio)
 * Cumple con todas las especificaciones de diseño:
 * 1. Cabeza grande estilo cartoon chibi:
 *    - Piel amarilla brillante (#F4D03F)
 *    - Ojos púrpuras GRANDES y expresivos (#9B59B6 / #8E44AD), separación de 14px, brillo blanco doble
 *    - Cejas negras gruesas (3px) y puente nasal sutil
 * 2. Cabello café oscuro (#5C3317 / #6B4423), estilo spiky con volumen superior y flequillo
 * 3. Chaqueta a cuadros grises y negros (checkerboard #2C2C2C y #5A5A5A) + camiseta interior cyan (#06B6D4)
 * 4. Pants azul marino (#1E3A8A) con piernas delgadas cartoon y zapatos deportivos grises con suela blanca (#6B7280 y #FFFFFF)
 * 5. Outlines gruesos negros (3-4px) y animación facial según acción
 * 6. Pivot estricto en los pies (bottom-center)
 */

/**
 * VISTA LATERAL (SIDE VIEW - ESTILO JETPACK JOYRIDE):
 * Dibuja la chaqueta a cuadros vista de perfil.
 * - Espalda hacia la izquierda (-X), pecho hacia la derecha (+X)
 * - Camiseta interior cyan (#06B6D4) visible al frente/cuello
 * - Patrón checkerboard (#2C2C2C y #5A5A5A)
 */
function drawCheckerboardJacketSideView(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  torsoW = 46, // Ancho de perfil
  torsoH = 55, // 25% del cuerpo
  angle = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const halfW = torsoW / 2;
  const halfH = torsoH / 2;

  // Silueta lateral de perfil: espalda a la izquierda, pecho y solapa al frente a la derecha
  ctx.beginPath();
  ctx.moveTo(-halfW + 4, -halfH + 3); // Hombro trasero
  ctx.quadraticCurveTo(0, -halfH, halfW - 2, -halfH + 5); // Cuello y hombro delantero
  ctx.quadraticCurveTo(halfW + 8, 0, halfW - 1, halfH - 2); // Pecho hacia abdomen
  ctx.lineTo(-halfW + 5, halfH); // Cintura
  ctx.quadraticCurveTo(-halfW - 4, 0, -halfW + 4, -halfH + 3); // Espalda arqueada
  ctx.closePath();

  // 1. Relleno base oscuro (#2C2C2C)
  ctx.fillStyle = '#2c2c2c';
  ctx.fill();

  // 2. Patrón checkerboard visible en grises (#5A5A5A sobre #2C2C2C)
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#5a5a5a';
  const sq = 12;
  for (let row = -3; row <= 3; row++) {
    for (let col = -3; col <= 3; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillRect(col * sq, row * sq, sq, sq);
      }
    }
  }
  ctx.restore();

  // 3. Camiseta interior color turquesa/cyan (#06B6D4) visible al frente en perfil
  ctx.fillStyle = '#06b6d4';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(halfW - 12, -halfH + 2);
  ctx.lineTo(halfW - 1, -halfH + 6);
  ctx.lineTo(halfW - 3, -halfH + 18);
  ctx.lineTo(halfW - 13, -halfH + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Solapa de la chaqueta en perfil
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(halfW - 13, -halfH + 2);
  ctx.lineTo(halfW - 5, -halfH + 20);
  ctx.lineTo(halfW - 7, halfH - 3);
  ctx.stroke();

  // 5. Outlines negros gruesos estilo cartoon
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();
}

/**
 * Cuello visto de perfil conectando suavemente cabeza y torso lateral
 */
function drawChibiNeckSideView(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  neckW = 24,
  neckH = 14,
  angle = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const halfW = neckW / 2;
  const halfH = neckH / 2;

  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-halfW, -halfH, neckW, neckH, 3);
  ctx.fill();
  ctx.stroke();

  // Sombra posterior
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.rect(-halfW, -halfH, 6, neckH);
  ctx.fill();

  ctx.restore();
}

/**
 * Pierna en vista lateral de perfil:
 * - Pants azul marino (#1E3A8A o #172554 si está detrás)
 * - Rodilla articulada visible
 * - Zapato deportivo gris de perfil con suela blanca apuntando a la derecha (+X)
 */
function drawChibiLegSideView(
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

  const pantsColor = isBehind ? '#172554' : '#1e3a8a';
  const pantsHighlight = isBehind ? '#1e3a8a' : '#2563eb';

  // Curva Bézier en pantorrilla para dar volumen muscular de perfil
  const calfDx = footX - kneeX;
  const calfDy = footY - kneeY;
  const calfDist = Math.hypot(calfDx, calfDy) || 1;
  const normX = -calfDy / calfDist;
  const normY = calfDx / calfDist;
  const ctrlX = (kneeX + footX) / 2 + normX * 4;
  const ctrlY = (kneeY + footY) / 2 + normY * 4;

  // 1. Muslo (Thigh)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  ctx.strokeStyle = pantsColor;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  // 2. Pantorrilla (Calf)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, footX, footY);
  ctx.stroke();

  ctx.strokeStyle = pantsColor;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, footX, footY);
  ctx.stroke();

  // 3. Rodilla articulada visible
  ctx.fillStyle = pantsHighlight;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(kneeX + 1, kneeY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Zapato deportivo de perfil mirando hacia la derecha (+X)
  const shoeColor = isBehind ? '#4b5563' : '#6b7280';
  ctx.fillStyle = shoeColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;

  // Silueta del tenis lateral
  ctx.beginPath();
  ctx.moveTo(footX - 10, footY - 3); // Talón superior
  ctx.lineTo(footX - 12, footY + 4); // Talón base
  ctx.lineTo(footX + 18, footY + 4); // Puntera base
  ctx.quadraticCurveTo(footX + 20, footY - 2, footX + 16, footY - 5); // Puntera delantera
  ctx.lineTo(footX + 4, footY - 7); // Empeine
  ctx.lineTo(footX - 4, footY - 7); // Tobillo
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Suela blanca gruesa (#FFFFFF) en la base
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(footX - 12, footY + 1.5, 30, 4.5, 1.5);
  ctx.fill();
  ctx.stroke();

  // Lengüeta blanca
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(footX + 2, footY - 6.5, 5, 3);

  ctx.restore();
}

/**
 * Cinemática de carrera lateral (Jetpack Joyride stride):
 * Las piernas se alternan (una adelante impulsando, otra atrás flexionando la rodilla)
 */
function drawNaturalChibiLegSideView(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  phase: number,
  isBehind: boolean
) {
  const sin = Math.sin(phase);
  // Zancada amplia de perfil estilo Jetpack Joyride
  const thighAngle = sin * 0.85;

  // Rodilla se flexiona hacia arriba/atrás cuando la pierna retrocede
  const kneeBend = phase < Math.PI
    ? Math.max(0, sin * 0.45)
    : Math.max(0, -sin * 1.35);

  const thighLen = 34; // 35% proporciones Jetpack
  const calfLen = 43;

  const kneeX = hipX + Math.sin(thighAngle) * thighLen;
  const kneeY = hipY + Math.cos(thighAngle) * thighLen;

  const calfAngle = thighAngle - kneeBend;
  const footX = kneeX + Math.sin(calfAngle) * calfLen;
  const footY = Math.min(0, kneeY + Math.cos(calfAngle) * calfLen);

  drawChibiLegSideView(ctx, hipX, hipY, kneeX, kneeY, footX, footY, isBehind);
}

/**
 * VISTA LATERAL: Solo el brazo derecho es visible (el izquierdo está oculto tras el torso)
 * Hombro, codo y mano articulados en línea con flexión atlética.
 * Balanceo rítmico hacia adelante y atrás.
 */
function drawChibiArmSideView(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  armAngle: number,
  length = 52
) {
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(armAngle);

  const upperL = 25;
  const lowerL = 27;

  // Ligera flexión en el codo para postura atlética
  const elbowBend = 0.28;
  const elbowX = 0;
  const elbowY = upperL;
  const handX = elbowX + Math.sin(elbowBend) * lowerL;
  const handY = elbowY + Math.cos(elbowBend) * lowerL;

  // 1. Manga superior a cuadros (#2C2C2C)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(elbowX, elbowY);
  ctx.stroke();

  ctx.strokeStyle = '#2c2c2c';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(elbowX, elbowY);
  ctx.stroke();

  // Cuadro decorativo en manga
  ctx.fillStyle = '#5a5a5a';
  ctx.beginPath();
  ctx.arc(0, upperL * 0.5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Articulación de codo visible
  ctx.fillStyle = '#3f3f46';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Antebrazo
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.strokeStyle = '#2c2c2c';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // 4. Puño / Mano cartoon amarilla (#F4D03F) con pulgar visible al frente (+X)
  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(handX, handY, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pulgar cartoon al frente
  ctx.beginPath();
  ctx.arc(handX + 5, handY - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * VISTA LATERAL (SIDE VIEW) DE LA CABEZA:
 * - Perfil lateral visto desde el lado, mirando a la derecha (+X)
 * - Forma ovalada alargada horizontalmente
 * - Nariz visible de perfil sobresaliendo adelante
 * - UN SOLO OJO visible (el del lado derecho)
 * - Oreja visible en el lado posterior/izquierdo con piercings plateados
 * - Cabello soplado hacia atrás por el movimiento (wind effect)
 */
function drawChibiHeadSideView(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  t: number,
  expression: 'running' | 'fast_running' | 'jumping' | 'falling' | 'sliding',
  speed: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Efecto dinámico de viento en el cabello que responde a la velocidad del juego
  const windIntensity = Math.min(1.5, 0.8 + speed / 600);
  const windWave1 = Math.sin(t * 16) * 4 * windIntensity;
  const windWave2 = Math.cos(t * 14 + 1) * 4 * windIntensity;
  const windWave3 = Math.sin(t * 18 + 2) * 5 * windIntensity;

  // 1. CABELLO TRASERO SOPLADO POR EL VIENTO (Wind effect hacia atrás -X)
  ctx.fillStyle = '#5c3317';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-18, -32);
  ctx.lineTo(-48 + windWave1, -38);
  ctx.lineTo(-32, -22);
  ctx.lineTo(-58 + windWave2, -18);
  ctx.lineTo(-34, -4);
  ctx.lineTo(-52 + windWave3, 6);
  ctx.lineTo(-28, 16);
  ctx.lineTo(-12, 28);
  ctx.lineTo(8, 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Reflejo café claro en pelo trasero (#6B4423)
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.moveTo(-20, -28);
  ctx.lineTo(-44 + windWave1, -32);
  ctx.lineTo(-28, -16);
  ctx.closePath();
  ctx.fill();

  // 2. OREJA VISIBLE EN EL LADO IZQUIERDO/POSTERIOR DE LA CABEZA (x = -18, y = 4)
  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(-18, 4, 9, 13, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-17, 3, 5, -Math.PI * 0.4, Math.PI * 0.6);
  ctx.stroke();

  // Piercings metálicos plateados
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-22, 1, 3.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-22, 7, 3.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  // 3. SILUETA FACIAL DE PERFIL (Forma ovalada alargada con NARIZ DE PERFIL)
  ctx.fillStyle = '#f4d03f';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 7.5;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.quadraticCurveTo(18, -34, 28, -18); // Frente lisa de perfil
  ctx.lineTo(31, -8); // Puente nasal
  // NARIZ VISIBLE DE PERFIL (sobresale adelante hacia la derecha +X)
  ctx.lineTo(44, -3); // Punta de la nariz
  ctx.lineTo(33, 4);  // Base de la nariz
  ctx.lineTo(31, 10); // Labio superior
  ctx.lineTo(33, 16); // Labio inferior
  ctx.lineTo(32, 22); // Barbilla prominente
  ctx.quadraticCurveTo(16, 32, -4, 28); // Línea de la mandíbula
  ctx.quadraticCurveTo(-24, 24, -28, 4); // Nuca
  ctx.quadraticCurveTo(-26, -26, -6, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sombra suave bajo mandíbula
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(8, 22, 16, 0.2, Math.PI - 0.2);
  ctx.fill();

  // 4. CABELLO SUPERIOR Y FLEQUILLO DE PERFIL
  ctx.fillStyle = '#5c3317';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-16, -30);
  ctx.lineTo(-8, -48);
  ctx.lineTo(6, -40);
  ctx.lineTo(20, -45); // Pico delantero
  ctx.lineTo(28, -26);
  ctx.lineTo(33, -16); // Flequillo
  ctx.lineTo(24, -14);
  ctx.lineTo(18, -4);  // Mechón patilla
  ctx.lineTo(10, -18);
  ctx.lineTo(-4, -12);
  ctx.lineTo(-14, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brillo café claro (#6B4423)
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.moveTo(-4, -42);
  ctx.lineTo(4, -34);
  ctx.lineTo(16, -38);
  ctx.closePath();
  ctx.fill();

  // 5. UN SOLO OJO VISIBLE DE PERFIL (El derecho, morado/púrpura)
  const eyeX = 17;
  const eyeY = -3;
  const isJumping = expression === 'jumping';
  const eyeW = 9;
  const eyeH = isJumping ? 14 : 11;

  ctx.fillStyle = '#9b59b6';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW, eyeH, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#2e1065';
  ctx.beginPath();
  ctx.ellipse(eyeX + 1, eyeY + 1, eyeW * 0.65, eyeH * 0.65, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Brillos blancos en el ojo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeX - 1.5, eyeY - 3.5, 2.5, 0, Math.PI * 2);
  ctx.arc(eyeX + 3, eyeY + 3.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Ceja negra expresiva de perfil
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (expression === 'jumping' || expression === 'falling') {
    ctx.moveTo(eyeX - 8, eyeY - eyeH - 6);
    ctx.quadraticCurveTo(eyeX, eyeY - eyeH - 12, eyeX + 8, eyeY - eyeH - 8);
  } else if (expression === 'fast_running' || expression === 'sliding') {
    ctx.moveTo(eyeX - 8, eyeY - eyeH - 10);
    ctx.lineTo(eyeX + 9, eyeY - eyeH - 4);
  } else {
    ctx.moveTo(eyeX - 8, eyeY - eyeH - 7);
    ctx.lineTo(eyeX + 8, eyeY - eyeH - 5);
  }
  ctx.stroke();

  // 6. BOCA VISIBLE DE PERFIL
  ctx.lineWidth = 3.5;
  if (expression === 'fast_running' || expression === 'jumping') {
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(30, 8);
    ctx.quadraticCurveTo(36, 14, 28, 20);
    ctx.quadraticCurveTo(22, 14, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, 9, 7, 3.5);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(28, 17, 4, 0, Math.PI);
    ctx.fill();
  } else if (expression === 'sliding') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(23, 11, 10, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(27, 11);
    ctx.lineTo(27, 17);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(24, 12);
    ctx.quadraticCurveTo(31, 14, 33, 10);
    ctx.stroke();
  }

  // Sudor al correr rápido o saltar
  if (speed > 450 || expression === 'jumping') {
    const sweatPhase = (t * 6) % 1;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-26 - sweatPhase * 30, -10 + sweatPhase * 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawChibiGroomPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  playerState: PlayerPhysicsState,
  speed: number,
  animTick: number,
  options: {
    invulnerable: boolean;
    hasShield: boolean;
    slideDuration: number;
  }
) {
  ctx.save();

  // Si está invulnerable tras recibir daño, parpadea
  if (options.invulnerable) {
    ctx.globalAlpha = Math.sin(animTick * 25) > 0 ? 0.35 : 0.95;
  }

  const isFastFalling = playerState.isFastFalling;
  const isSliding = playerState.isSliding;
  const isGrounded = playerState.isGrounded;
  const vy = playerState.vy;
  const isInAir = !isGrounded;

  // 1. SOMBRA / BASE EN EL SUELO (proyectada en suelo real y = 400)
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  if (isSliding) {
    ctx.ellipse(px + 4, 400, 36, 7, 0, 0, Math.PI * 2);
  } else if (isInAir) {
    const heightAboveGround = Math.max(0, 400 - py);
    const shadowScale = Math.max(0.4, 1 - heightAboveGround / 350);
    ctx.ellipse(px, 400, 26 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(px, 400, 28, 6.5, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();

  // Burbuja de escudo protector si está activo
  if (options.hasShield) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    const shieldCenterY = isSliding ? py - 24 : py - 48;
    ctx.ellipse(px + 2, shieldCenterY, 36, isSliding ? 26 : 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brillo de escudo
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px - 18, shieldCenterY - 16, 9, -Math.PI * 0.7, -Math.PI * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  // Chispas y polvo si está deslizándose
  if (isSliding) {
    for (let i = 0; i < 4; i++) {
      const sparkPhase = (animTick * 25 + i * 0.3) % 1;
      const sparkX = px - 20 - sparkPhase * 40;
      const sparkY = py - 2 - Math.random() * 5;
      ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2.5 - sparkPhase * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Determinar expresión facial
  let expression: 'running' | 'fast_running' | 'jumping' | 'falling' | 'sliding' = 'running';
  if (isSliding) {
    expression = 'sliding';
  } else if (isFastFalling) {
    expression = 'falling';
  } else if (isInAir) {
    expression = vy < 120 ? 'jumping' : 'falling';
  } else if (speed > 450) {
    expression = 'fast_running';
  }

  // =========================================================================
  // VISTA LATERAL (SIDE VIEW - ESTILO JETPACK JOYRIDE):
  // Proporciones canónicas Jetpack Joyride:
  // - Cabeza: 40% del cuerpo (88px de alto, ovalada alargada, perfil con nariz y 1 ojo)
  // - Torso: 25% del cuerpo (55px de alto, visto de perfil con chaqueta a cuadros)
  // - Piernas: 35% del cuerpo (77px de alto, piernas alternándose en corrida lateral)
  // - Brazo visible: SOLO EL DERECHO (el izquierdo está oculto tras el cuerpo)
  // - Inclinación hacia adelante: 10-15 grados (0.22 rad ≈ 12.6°)
  // - Altura canónica total: 220px. Con GAME_HEIGHT = 88px, scale = 88 / 220 = 0.4
  // =========================================================================
  const CANONICAL_HEIGHT = 220;
  const GAME_HEIGHT = 88;
  const scale = GAME_HEIGHT / CANONICAL_HEIGHT; // 0.4

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  // Todo el renderizado se ejecuta en el espacio canónico de 220px (pivote en pies y = 0)

  // =========================================================================
  // CASO A: DESLIZAMIENTO LATERAL (SIDE SLIDE ESTILO JETPACK JOYRIDE)
  // =========================================================================
  if (isSliding) {
    const hipX = -15;
    const hipY = -34;

    // 1. Pierna trasera extendida deslizándose al ras del suelo
    drawChibiLegSideView(ctx, hipX - 4, hipY, hipX + 30, -16, hipX + 70, -5, true);

    // 2. Torso inclinado hacia atrás en perfil
    const torsoY = hipY - 24;
    drawCheckerboardJacketSideView(ctx, hipX - 6, torsoY, 46, 55, -0.42);

    // 3. Pierna delantera extendida al frente
    drawChibiLegSideView(ctx, hipX + 6, hipY, hipX + 42, -18, hipX + 86, -5, false);

    // 4. Cuello visto de perfil
    drawChibiNeckSideView(ctx, hipX + 6, torsoY - 28, 24, 14, -0.25);

    // 5. Cabeza baja mirando hacia el frente (+X)
    drawChibiHeadSideView(ctx, hipX + 22, torsoY - 44, -0.1, animTick, 'sliding', speed);

    // 6. Solo brazo derecho visible: apoyado hacia atrás/suelo
    drawChibiArmSideView(ctx, hipX - 4, torsoY - 10, -0.85, 52);

    ctx.restore();
    ctx.restore();
    return;
  }

  // =========================================================================
  // CASO B: EN EL AIRE (SALTO, ÁPICE, CAÍDA O FAST FALL EN VISTA LATERAL)
  // =========================================================================
  if (isInAir) {
    if (isFastFalling) {
      // Fast fall: postura de buzo picando hacia abajo con estela
      const hipY = -115;
      const lean = 0.38;

      // Piernas estiradas atrás en diagonal
      drawChibiLegSideView(ctx, -10, hipY, -24, hipY - 35, -34, hipY - 75, true);
      drawChibiLegSideView(ctx, 4, hipY, -10, hipY - 35, -20, hipY - 75, false);

      // Torso inclinado
      const torsoY = hipY + 28;
      drawCheckerboardJacketSideView(ctx, 0, torsoY, 46, 55, lean);

      // Cuello
      drawChibiNeckSideView(ctx, 14, torsoY - 28, 24, 14, lean);

      // Cabeza picando adelante
      drawChibiHeadSideView(ctx, 30, torsoY - 48, lean - 0.05, animTick, 'falling', speed);

      // Brazo derecho pegado atrás
      drawChibiArmSideView(ctx, 2, torsoY - 12, -2.2, 52);

      ctx.restore();
      ctx.restore();
      return;
    }

    if (vy < -220) {
      // Salto ascendente: postura de despegue Jetpack Joyride (puño arriba, piernas en tuck)
      const hipY = -94;
      const lean = 0.16;

      // Pierna trasera doblada estilo tuck
      drawChibiLegSideView(ctx, -8, hipY, -26, hipY + 26, -8, hipY + 52, true);

      // Torso inclinado hacia adelante (10-15°)
      const torsoY = hipY - 34;
      drawCheckerboardJacketSideView(ctx, 0, torsoY, 46, 55, lean);

      // Pierna delantera recogida con rodilla al frente
      drawChibiLegSideView(ctx, 4, hipY, 24, hipY + 24, 8, hipY + 52, false);

      // Cuello
      drawChibiNeckSideView(ctx, 4, torsoY - 30, 24, 14, lean);

      // Cabeza con un solo ojo mirando al frente
      drawChibiHeadSideView(ctx, 8, torsoY - 50, lean - 0.05, animTick, 'jumping', speed);

      // Brazo derecho levantado heroico hacia arriba (+X, -Y)
      drawChibiArmSideView(ctx, 6, torsoY - 14, -2.1, 52);

      ctx.restore();
      ctx.restore();
      return;
    }

    if (vy < 180) {
      // Ápice del salto: flotando en el aire
      const hipY = -90;
      const lean = 0.08;

      // Piernas en pose flotante
      drawChibiLegSideView(ctx, -8, hipY, -28, hipY + 22, -12, hipY + 52, true);
      drawChibiLegSideView(ctx, 4, hipY, 28, hipY + 24, 26, hipY + 56, false);

      // Torso
      const torsoY = hipY - 34;
      drawCheckerboardJacketSideView(ctx, 0, torsoY, 46, 55, lean);

      // Cuello
      drawChibiNeckSideView(ctx, 3, torsoY - 30, 24, 14, lean);

      // Cabeza
      drawChibiHeadSideView(ctx, 6, torsoY - 50, lean, animTick, 'jumping', speed);

      // Brazo derecho equilibrado al frente
      drawChibiArmSideView(ctx, 4, torsoY - 14, 1.1, 52);

      ctx.restore();
      ctx.restore();
      return;
    }

    // Caída regular: piernas extendiéndose hacia adelante/abajo para amortiguar
    const hipY = -92;
    const lean = 0.12;

    // Piernas amortiguadoras
    drawChibiLegSideView(ctx, -8, hipY, -14, hipY + 36, -6, hipY + 74, true);
    drawChibiLegSideView(ctx, 4, hipY, 18, hipY + 36, 26, hipY + 74, false);

    // Torso
    const torsoY = hipY - 34;
    drawCheckerboardJacketSideView(ctx, 0, torsoY, 46, 55, lean);

    // Cuello
    drawChibiNeckSideView(ctx, 3, torsoY - 30, 24, 14, lean);

    // Cabeza
    drawChibiHeadSideView(ctx, 6, torsoY - 50, lean * 0.7, animTick, 'falling', speed);

    // Brazo derecho preparado hacia adelante
    drawChibiArmSideView(ctx, 4, torsoY - 14, 0.55, 52);

    ctx.restore();
    ctx.restore();
    return;
  }

  // =========================================================================
  // CASO C: CORRIENDO EN TIERRA (RUNNING - VISTA LATERAL JETPACK JOYRIDE)
  // =========================================================================
  const runRate = 12 + speed / 110;
  const cycle = (animTick * runRate) % (Math.PI * 2);
  const runBounce = Math.sin(cycle * 2) * 4.5;

  // Inclinación característica del cuerpo hacia adelante (10 a 15 grados: 0.22 rad ≈ 12.6°)
  const torsoLean = 0.22;

  // Altura de cadera: -77px (piernas de 77px representan el 35% del cuerpo de 220px)
  const hipY = -77 + runBounce;
  const hipX = 0;

  // 1. Pierna trasera (vista detrás del torso, zancada lateral)
  drawNaturalChibiLegSideView(ctx, hipX - 4, hipY, cycle, true);

  // 2. Torso con chaqueta a cuadros visto de perfil (25% del cuerpo: 55px de alto)
  const torsoY = hipY - 34;
  drawCheckerboardJacketSideView(ctx, hipX + 2, torsoY, 46, 55, torsoLean);

  // 3. Pierna delantera (al frente, zancada opuesta)
  drawNaturalChibiLegSideView(ctx, hipX + 4, hipY, cycle + Math.PI, false);

  // 4. Cuello visto de perfil
  const neckY = torsoY - 30;
  drawChibiNeckSideView(ctx, hipX + 6, neckY, 24, 14, torsoLean);

  // 5. Cabeza lateral grande (40% del cuerpo: 88px, perfil con nariz, oreja y un solo ojo)
  const headY = torsoY - 52;
  drawChibiHeadSideView(ctx, hipX + 12, headY, torsoLean * 0.7, animTick, expression, speed);

  // 6. SOLO UN BRAZO VISIBLE (El derecho): se balancea hacia adelante y atrás al compás
  // El brazo izquierdo NO se dibuja (oclusión de vista lateral)
  const armAngle = -Math.sin(cycle) * 0.75 + 0.15;
  drawChibiArmSideView(ctx, hipX + 8, torsoY - 14, armAngle, 52);

  ctx.restore();
  ctx.restore();
}

interface RunnerCanvasProps {
  onStatsUpdate?: (stats: GameStats) => void;
  onGameOver?: (finalStats: GameStats) => void;
  soundEnabled?: boolean;
  isPaused?: boolean;
  onRequestRestart?: () => void;
}

export const RunnerCanvas: React.FC<RunnerCanvasProps> = ({
  onStatsUpdate,
  onGameOver,
  soundEnabled = true,
  isPaused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parámetros de depuración ajustables en tiempo real
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugParams, setDebugParams] = useState({
    jumpForce: 670,
    slideDuration: 0.4,
    gravityScale: 1750,
    baseSpeed: 300,
    maxSpeed: 700,
    showHitboxes: false,
    godMode: false,
  });

  const debugRef = useRef(debugParams);
  useEffect(() => {
    debugRef.current = debugParams;
  }, [debugParams]);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Referencias mutables para el game loop
  const gameStateRef = useRef({
    score: 0,
    distance: 0,
    coins: 0,
    combo: 1,
    consecutiveAirDodges: 0,
    speed: 300,
    isGameOver: false,
    isPaused: false,
    brideX: 45, // Posición de la novia persecutora
    lastTime: 0,
    animTick: 0,
    screenShake: 0,
    screenFlash: 0,
    screenFlashColor: '#ffffff',
    invulnerableTimer: 0,

    // Entidades
    playerState: {
      y: 380,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      isSliding: false,
      isFastFalling: false,
      slideTimer: 0,
    } as PlayerPhysicsState,

    activePowerups: { ...INITIAL_ACTIVE_POWERUPS },
    obstacles: [] as Obstacle[],
    powerups: [] as PowerupItem[],
    coinsList: [] as CoinItem[],
    confetti: [] as ConfettiParticle[],
    floatingTexts: [] as FloatingText[],

    // Generadores
    obstacleSpawnTimer: 1.5,
    powerupSpawnTimer: 6.0,
    coinGroupSpawnTimer: 2.5,
  });

  // Pausa sincronizada
  useEffect(() => {
    gameStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  // Dimensiones del canvas virtual (16:9 arcade)
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 480;
  const GROUND_Y = 400;
  const CEILING_Y = 0;
  const PLAYER_X = 230;

  // Inicializar o reiniciar partida
  const resetGame = () => {
    const s = gameStateRef.current;
    s.score = 0;
    s.distance = 0;
    s.coins = 0;
    s.combo = 1;
    s.consecutiveAirDodges = 0;
    s.speed = debugRef.current.baseSpeed;
    s.isGameOver = false;
    s.brideX = 45;
    s.screenShake = 0;
    s.screenFlash = 0;
    s.invulnerableTimer = 0;

    s.playerState = {
      y: GROUND_Y,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      isSliding: false,
      isFastFalling: false,
      slideTimer: 0,
    };

    s.activePowerups = { ...INITIAL_ACTIVE_POWERUPS };
    s.obstacles = [];
    s.powerups = [];
    s.coinsList = [];
    s.floatingTexts = [];
    s.obstacleSpawnTimer = 1.5;
    s.powerupSpawnTimer = 5.0;
    s.coinGroupSpawnTimer = 2.0;

    // Inicializar confeti
    s.confetti = Array.from({ length: 45 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      vx: -(Math.random() * 80 + 40),
      vy: Math.random() * 70 + 40,
      size: Math.random() * 6 + 4,
      color: ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff', '#10b981'][
        Math.floor(Math.random() * 6)
      ],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 6,
    }));
  };

  // Helper para spawn de texto flotante
  const addFloatingText = (
    text: string,
    x: number,
    y: number,
    color = '#facc15',
    scale = 1
  ) => {
    gameStateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -60,
      alpha: 1.0,
      color,
      scale,
    });
  };

  // Disparo de acciones del jugador con ANIMATION CANCELING
  const handleJumpAction = () => {
    const s = gameStateRef.current;
    if (s.isGameOver || s.isPaused) return;

    const config: PlayerPhysicsConfig = {
      x: PLAYER_X,
      width: 44,
      standingHeight: 70,
      slidingHeight: 35,
      groundY: GROUND_Y,
      jumpForce: debugRef.current.jumpForce,
      fastFallSpeed: 950,
      gravity: debugRef.current.gravityScale,
      slideDuration: debugRef.current.slideDuration,
    };

    const nextState = executeJump(s.playerState, config);
    if (nextState !== s.playerState) {
      s.playerState = nextState;
      sound.playJump();
    }
  };

  const handleSlideAction = () => {
    const s = gameStateRef.current;
    if (s.isGameOver || s.isPaused) return;

    const config: PlayerPhysicsConfig = {
      x: PLAYER_X,
      width: 44,
      standingHeight: 70,
      slidingHeight: 35,
      groundY: GROUND_Y,
      jumpForce: debugRef.current.jumpForce,
      fastFallSpeed: 950,
      gravity: debugRef.current.gravityScale,
      slideDuration: debugRef.current.slideDuration,
    };

    const nextState = executeSlide(s.playerState, config);
    if (nextState !== s.playerState) {
      s.playerState = nextState;
      sound.playSlide();
    }
  };

  // Listeners de teclado y touch
  useEffect(() => {
    resetGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle de debug
      if (e.key === 'd' || e.key === 'D') {
        if (!e.ctrlKey && !e.metaKey) {
          setDebugOpen((prev) => !prev);
          return;
        }
      }

      // Salto: Espacio, W, Flecha Arriba
      if (e.code === 'Space' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJumpAction();
      }
      // Deslizamiento: S, Flecha Abajo
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleSlideAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Manejo de toques en pantalla dividida (Izquierda = Deslizar, Derecha = Saltar)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;

    if (touchX < CANVAS_WIDTH / 2) {
      handleSlideAction();
    } else {
      handleJumpAction();
    }
  };

  // ================= GAME LOOP PRINCIPAL =================
  useEffect(() => {
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const s = gameStateRef.current;
      if (!s.lastTime) s.lastTime = timestamp;
      const dt = Math.min((timestamp - s.lastTime) / 1000, 0.1); // Clamp dt
      s.lastTime = timestamp;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (ctx && canvas) {
        if (!s.isPaused && !s.isGameOver) {
          s.animTick += dt;

          // 1. VELOCIDAD PROGRESIVA (300 -> 700 px/s)
          const targetBaseSpeed = Math.min(
            debugRef.current.maxSpeed,
            debugRef.current.baseSpeed + (s.distance / 12) * 5
          );
          // Bonus de Boost
          const boostBonus =
            s.activePowerups.boostTimer > 0
              ? POWERUP_CONFIG.boostSpeedBonus
              : 0;
          s.speed = targetBaseSpeed + boostBonus;

          // Distancia y Puntuación
          s.distance += s.speed * dt * 0.05;
          const pointMultiplier =
            (s.activePowerups.multiplierTimer > 0 ? 2 : 1) * s.combo;
          s.score += Math.round(s.speed * dt * 0.1 * pointMultiplier);

          // Timers de powerups
          s.activePowerups = updateActivePowerups(s.activePowerups, dt);

          // Screen Shake & Flash decay
          if (s.screenShake > 0) {
            s.screenShake = Math.max(0, s.screenShake - dt * 25);
          }
          if (s.screenFlash > 0) {
            s.screenFlash = Math.max(0, s.screenFlash - dt * 4);
          }
          if (s.invulnerableTimer > 0) {
            s.invulnerableTimer = Math.max(0, s.invulnerableTimer - dt);
          }

          // 2. FÍSICA DEL JUGADOR
          const physicsConfig: PlayerPhysicsConfig = {
            x: PLAYER_X,
            width: 44,
            standingHeight: 70,
            slidingHeight: 35,
            groundY: GROUND_Y,
            jumpForce: debugRef.current.jumpForce,
            fastFallSpeed: 950,
            gravity: debugRef.current.gravityScale,
            slideDuration: debugRef.current.slideDuration,
          };

          const { state: updatedPlayer, landed } = updatePlayerPhysics(
            s.playerState,
            physicsConfig,
            dt
          );
          s.playerState = updatedPlayer;

          // Si aterriza en el suelo, se resetea el combo aéreo si no ha esquivado nada o se estabiliza
          if (landed) {
            if (s.consecutiveAirDodges === 0 && s.combo > 1) {
              s.combo = 1; // Tocar suelo sin combos aéreos resetea el multiplicador
            }
            s.consecutiveAirDodges = 0;
          }

          const playerBox = getPlayerHitbox(s.playerState, physicsConfig);

          // 3. ACTUALIZAR NOVIA (Mecánica estilo Power Pamplona)
          // La novia se aleja gradualmente si corres bien, pero se acerca cuando te chocas
          const idealBrideX = 45;
          if (s.brideX > idealBrideX) {
            s.brideX = Math.max(idealBrideX, s.brideX - dt * 20);
          }
          // Si la novia te alcanza: GAME OVER
          if (s.brideX >= PLAYER_X - 42 && !debugRef.current.godMode) {
            s.isGameOver = true;
            sound.playHit();
            sound.playGameOver();
            onGameOver?.({
              score: s.score,
              distance: Math.floor(s.distance),
              coins: s.coins,
              combo: s.combo,
              speed: Math.round(s.speed),
              brideDistancePct: 0,
              activePowerups: s.activePowerups,
              isGameOver: true,
              isPaused: false,
            });
          }

          // 4. GENERACIÓN DE OBSTÁCULOS
          s.obstacleSpawnTimer -= dt;
          if (s.obstacleSpawnTimer <= 0) {
            // Frecuencia dinámica según la velocidad
            s.obstacleSpawnTimer = Math.max(
              0.85,
              2.2 - (s.speed - debugRef.current.baseSpeed) / 400 + Math.random() * 0.6
            );

            // Generar ráfaga o individual
            const isBurst = Math.random() < 0.28;
            const count = isBurst ? (Math.random() < 0.5 ? 2 : 3) : 1;

            for (let i = 0; i < count; i++) {
              const spawnX = CANVAS_WIDTH + 80 + i * (isBurst ? 140 : 0);
              const isHigh = Math.random() < 0.42;

              if (isHigh) {
                // Obstáculo Alto: Candelabro, Guirnalda, Campana
                const highSprites: SpriteId[] = [
                  'obstacle_chandelier',
                  'obstacle_garland',
                  'obstacle_bell',
                  'obstacle_mid_arch'
                ];
                const spr =
                  highSprites[Math.floor(Math.random() * highSprites.length)];
                s.obstacles.push({
                  id: Math.random().toString(),
                  type: 'high',
                  spriteId: spr,
                  x: spawnX,
                  y: CEILING_Y, // Cuelga del techo
                  width: 54,
                  height: 125, // Ocupa desde el techo hasta 275px del suelo, obligando a agacharse
                  dodged: false,
                  clearedInAir: false,
                });
              } else {
                // Obstáculo Bajo: Pastel de bodas, Flores con espinas, Champán
                const lowSprites: SpriteId[] = [
                  'obstacle_cake',
                  'obstacle_flowers',
                  'obstacle_champagne',
                  'obstacle_double_cake'
                ];
                const spr =
                  lowSprites[Math.floor(Math.random() * lowSprites.length)];
                s.obstacles.push({
                  id: Math.random().toString(),
                  type: 'low',
                  spriteId: spr,
                  x: spawnX,
                  y: GROUND_Y,
                  width: 46,
                  height: 52,
                  dodged: false,
                  clearedInAir: false,
                });
              }
            }
          }

          // 5. GENERACIÓN DE POWER-UPS
          s.powerupSpawnTimer -= dt;
          if (s.powerupSpawnTimer <= 0) {
            s.powerupSpawnTimer = 8.0 + Math.random() * 6.0;
            const types: PowerupType[] = [
              'shield',
              'magnet',
              'boost',
              'multiplier',
            ];
            const pType = types[Math.floor(Math.random() * types.length)];
            const floatY = GROUND_Y - 90 - Math.random() * 80;
            s.powerups.push(createPowerup(pType, CANVAS_WIDTH + 50, floatY));
          }

          // 6. GENERACIÓN DE MONEDAS (ANILLOS DE BODA)
          s.coinGroupSpawnTimer -= dt;
          if (s.coinGroupSpawnTimer <= 0) {
            s.coinGroupSpawnTimer = 3.0 + Math.random() * 2.5;
            const pattern = Math.floor(Math.random() * 3);
            const startX = CANVAS_WIDTH + 40;

            if (pattern === 0) {
              // Arco de salto
              for (let i = 0; i < 5; i++) {
                const cx = startX + i * 36;
                const cy = GROUND_Y - 50 - Math.sin((i / 4) * Math.PI) * 90;
                s.coinsList.push({
                  id: Math.random().toString(),
                  x: cx,
                  y: cy,
                  baseY: cy,
                  width: 24,
                  height: 24,
                  collected: false,
                });
              }
            } else if (pattern === 1) {
              // Fila baja (recoger deslizándose o corriendo)
              for (let i = 0; i < 4; i++) {
                s.coinsList.push({
                  id: Math.random().toString(),
                  x: startX + i * 40,
                  y: GROUND_Y - 26,
                  baseY: GROUND_Y - 26,
                  width: 24,
                  height: 24,
                  collected: false,
                });
              }
            } else {
              // Fila alta
              for (let i = 0; i < 3; i++) {
                s.coinsList.push({
                  id: Math.random().toString(),
                  x: startX + i * 44,
                  y: GROUND_Y - 110,
                  baseY: GROUND_Y - 110,
                  width: 24,
                  height: 24,
                  collected: false,
                });
              }
            }
          }

          // 7. ACTUALIZAR OBSTÁCULOS & COLISIONES
          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const obs = s.obstacles[i];
            obs.x -= s.speed * dt;

            // Hitbox del obstáculo
            const obsBox: Rect =
              obs.type === 'low'
                ? {
                  x: obs.x - obs.width / 2,
                  y: obs.y - obs.height,
                  width: obs.width,
                  height: obs.height,
                }
                : {
                  x: obs.x - obs.width / 2,
                  y: obs.y,
                  width: obs.width,
                  height: obs.height,
                };

            // Detección de salto/esquiva de combo sin tocar el suelo
            if (!obs.dodged && obs.x < PLAYER_X) {
              obs.dodged = true;
              if (!s.playerState.isGrounded) {
                // Esquivado en el aire: Combo aumenta hasta x4!
                s.consecutiveAirDodges++;
                s.combo = Math.min(4, s.combo + 1);
                addFloatingText(
                  `COMBO x${s.combo}!`,
                  PLAYER_X,
                  s.playerState.y - 85,
                  '#f59e0b',
                  1.2
                );
                s.score += 150 * s.combo;
              }
            }

            // Colisión con el jugador
            if (
              !debugRef.current.godMode &&
              s.invulnerableTimer <= 0 &&
              checkAABB(playerBox, obsBox)
            ) {
              if (s.activePowerups.shield) {
                // Escudo absorbe el choque
                s.activePowerups.shield = false;
                s.invulnerableTimer = 1.2;
                s.screenShake = 12;
                s.screenFlash = 0.5;
                s.screenFlashColor = '#38bdf8';
                sound.playShieldBreak();
                addFloatingText('¡ESCUDO ROTO!', PLAYER_X, s.playerState.y - 70, '#38bdf8');
              } else {
                // Choque real: tropiezo, pierde combo, la novia se acerca peligrosamente
                s.invulnerableTimer = 1.5;
                s.screenShake = 18;
                s.screenFlash = 0.6;
                s.screenFlashColor = '#ef4444';
                s.combo = 1;
                s.brideX += 65; // Novia se lanza hacia adelante
                sound.playHit();
                addFloatingText('¡TROPIEZO!', PLAYER_X, s.playerState.y - 70, '#ef4444', 1.3);

                // Si al empujar a la novia alcanza al novio: FIN
                if (s.brideX >= PLAYER_X - 35) {
                  s.isGameOver = true;
                  sound.playGameOver();
                  onGameOver?.({
                    score: s.score,
                    distance: Math.floor(s.distance),
                    coins: s.coins,
                    combo: s.combo,
                    speed: Math.round(s.speed),
                    brideDistancePct: 0,
                    activePowerups: s.activePowerups,
                    isGameOver: true,
                    isPaused: false,
                  });
                }
              }
            }

            // Limpieza fuera de pantalla
            if (obs.x < -100) {
              s.obstacles.splice(i, 1);
            }
          }

          // 8. ACTUALIZAR POWER-UPS
          for (let i = s.powerups.length - 1; i >= 0; i--) {
            const pw = s.powerups[i];
            pw.x -= s.speed * dt;
            pw.y = pw.baseY + Math.sin(s.animTick * 4 + pw.floatPhase) * 8;

            const pwBox = getPowerupHitbox(pw);
            if (!pw.collected && checkAABB(playerBox, pwBox)) {
              pw.collected = true;
              s.activePowerups = {
                ...s.activePowerups,
                ...((() => {
                  const active = { ...s.activePowerups };
                  if (pw.type === 'shield') active.shield = true;
                  if (pw.type === 'magnet')
                    active.magnetTimer = POWERUP_CONFIG.magnetDuration;
                  if (pw.type === 'boost')
                    active.boostTimer = POWERUP_CONFIG.boostDuration;
                  if (pw.type === 'multiplier')
                    active.multiplierTimer = POWERUP_CONFIG.multiplierDuration;
                  return active;
                })()),
              };

              s.screenFlash = 0.4;
              s.screenFlashColor =
                pw.type === 'shield'
                  ? '#38bdf8'
                  : pw.type === 'boost'
                    ? '#facc15'
                    : pw.type === 'magnet'
                      ? '#f43f5e'
                      : '#a855f7';
              s.screenShake = 6;
              sound.playPowerup();

              const labels: Record<PowerupType, string> = {
                shield: '¡ESCUDO!',
                magnet: '¡IMÁN DE ANILLOS!',
                boost: '¡TURBO VELOCIDAD!',
                multiplier: '¡PUNTOS X2!',
              };
              addFloatingText(
                labels[pw.type],
                pw.x,
                pw.y - 20,
                s.screenFlashColor,
                1.3
              );
            }

            if (pw.collected || pw.x < -80) {
              s.powerups.splice(i, 1);
            }
          }

          // 9. ACTUALIZAR MONEDAS & IMÁN
          const magnetActive = s.activePowerups.magnetTimer > 0;
          for (let i = s.coinsList.length - 1; i >= 0; i--) {
            const coin = s.coinsList[i];
            coin.x -= s.speed * dt;

            // Atracción magnética
            if (magnetActive && !coin.collected) {
              const dx = PLAYER_X - coin.x;
              const dy = s.playerState.y - 35 - coin.y;
              const dist = Math.hypot(dx, dy);

              if (dist < POWERUP_CONFIG.magnetRadius) {
                const pullSpeed = 500 * (1 - dist / POWERUP_CONFIG.magnetRadius);
                coin.x += (dx / dist) * pullSpeed * dt;
                coin.y += (dy / dist) * pullSpeed * dt;
              }
            }

            // Colisión con moneda
            const coinBox: Rect = {
              x: coin.x - coin.width / 2,
              y: coin.y - coin.height / 2,
              width: coin.width,
              height: coin.height,
            };

            if (!coin.collected && checkAABB(playerBox, coinBox)) {
              coin.collected = true;
              s.coins += 1;
              const multiplier =
                (s.activePowerups.multiplierTimer > 0 ? 2 : 1) * s.combo;
              const pts = 50 * multiplier;
              s.score += pts;
              sound.playCoin();
              addFloatingText(
                `+${pts}`,
                coin.x,
                coin.y - 12,
                '#facc15',
                s.combo > 1 ? 1.15 : 0.9
              );
            }

            if (coin.collected || coin.x < -50) {
              s.coinsList.splice(i, 1);
            }
          }

          // 10. ACTUALIZAR CONFETI
          for (const p of s.confetti) {
            p.x += (p.vx - s.speed * 0.4) * dt;
            p.y += p.vy * dt;
            p.rotation += p.vRot * dt;

            if (p.x < -20) p.x = CANVAS_WIDTH + 20;
            if (p.y > CANVAS_HEIGHT) {
              p.y = -10;
              p.x = Math.random() * CANVAS_WIDTH;
            }
          }

          // 11. ACTUALIZAR TEXTOS FLOTANTES
          for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
            const ft = s.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.alpha -= dt * 1.2;
            if (ft.alpha <= 0) {
              s.floatingTexts.splice(i, 1);
            }
          }

          // Notificar estadísticas al frontend React
          const brideDistancePct = Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((PLAYER_X - s.brideX - 35) / (PLAYER_X - idealBrideX - 35)) *
                100
              )
            )
          );

          onStatsUpdate?.({
            score: s.score,
            distance: Math.floor(s.distance),
            coins: s.coins,
            combo: s.combo,
            speed: Math.round(s.speed),
            brideDistancePct,
            activePowerups: s.activePowerups,
            isGameOver: s.isGameOver,
            isPaused: s.isPaused,
          });
        }

        // ================= RENDERIZADO =================
        ctx.save();

        // Screen Shake
        if (s.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * s.screenShake;
          const shakeY = (Math.random() - 0.5) * s.screenShake;
          ctx.translate(shakeX, shakeY);
        }

        // Fondo Parallax festivo
        renderFestiveBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, s.distance, GROUND_Y);

        // Banderines superiores (Bunting festivo)
        renderBuntingFlags(ctx, CANVAS_WIDTH, s.distance);

        // Confeti cayendo
        for (const p of s.confetti) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }

        // Dibujar Monedas (Anillos de bodas)
        for (const coin of s.coinsList) {
          if (!coin.collected) {
            drawSpriteBottomCenter(
              ctx,
              'coin_ring',
              coin.x,
              coin.y,
              1,
              { animTick: s.animTick }
            );
          }
        }

        // Dibujar Power-ups
        for (const pw of s.powerups) {
          if (!pw.collected) {
            drawSpriteBottomCenter(
              ctx,
              pw.spriteId,
              pw.x,
              pw.y,
              1,
              { animTick: s.animTick }
            );
          }
        }

        // Dibujar Obstáculos
        for (const obs of s.obstacles) {
          drawSpriteBottomCenter(
            ctx,
            obs.spriteId,
            obs.x,
            obs.y,
            1,
            { animTick: s.animTick }
          );
        }

        // Dibujar Novia Furiosa persecutora
        const brideAnimId: SpriteId =
          s.animTick % 0.4 < 0.1
            ? 'bride_chase_0'
            : s.animTick % 0.4 < 0.2
              ? 'bride_chase_1'
              : s.animTick % 0.4 < 0.3
                ? 'bride_chase_2'
                : 'bride_chase_3';

        drawSpriteBottomCenter(
          ctx,
          brideAnimId,
          s.brideX,
          GROUND_Y,
          1,
          { animTick: s.animTick }
        );

        // Dibujar Jugador (Novio Chibi Cartoon de Alta Fidelidad)
        drawChibiGroomPlayer(
          ctx,
          PLAYER_X,
          s.playerState.y,
          s.playerState,
          s.speed,
          s.animTick,
          {
            invulnerable: s.invulnerableTimer > 0,
            hasShield: s.activePowerups.shield,
            slideDuration: debugRef.current.slideDuration || 0.4,
          }
        );

        // Efecto visual de velocidad extra (Estelas de viento)
        if (s.activePowerups.boostTimer > 0) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
          ctx.lineWidth = 2.5;
          for (let i = 0; i < 4; i++) {
            const lineY = GROUND_Y - 20 - i * 16;
            const lineLen = 60 + Math.random() * 40;
            ctx.beginPath();
            ctx.moveTo(PLAYER_X - 30, lineY);
            ctx.lineTo(PLAYER_X - 30 - lineLen, lineY);
            ctx.stroke();
          }
        }

        // Dibujar Textos Flotantes
        for (const ft of s.floatingTexts) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.fillStyle = ft.color;
          ctx.font = `bold ${Math.round(18 * ft.scale)}px "Outfit", sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }

        // Destello en pantalla (Flash de recogida de powerup o golpe)
        if (s.screenFlash > 0) {
          ctx.fillStyle = s.screenFlashColor;
          ctx.globalAlpha = s.screenFlash * 0.45;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.globalAlpha = 1;
        }

        // MODO DEBUG: Hitboxes visuales
        if (debugRef.current.showHitboxes) {
          const physicsConfig: PlayerPhysicsConfig = {
            x: PLAYER_X,
            width: 44,
            standingHeight: 70,
            slidingHeight: 35,
            groundY: GROUND_Y,
            jumpForce: debugRef.current.jumpForce,
            fastFallSpeed: 950,
            gravity: debugRef.current.gravityScale,
            slideDuration: debugRef.current.slideDuration,
          };
          const pBox = getPlayerHitbox(s.playerState, physicsConfig);

          ctx.strokeStyle = '#22c55e'; // Verde para el novio
          ctx.lineWidth = 2;
          ctx.strokeRect(pBox.x, pBox.y, pBox.width, pBox.height);

          // Hitbox de obstáculos (Rojo)
          ctx.strokeStyle = '#ef4444';
          for (const obs of s.obstacles) {
            const obsBox: Rect =
              obs.type === 'low'
                ? {
                  x: obs.x - obs.width / 2,
                  y: obs.y - obs.height,
                  width: obs.width,
                  height: obs.height,
                }
                : {
                  x: obs.x - obs.width / 2,
                  y: obs.y,
                  width: obs.width,
                  height: obs.height,
                };
            ctx.strokeRect(obsBox.x, obsBox.y, obsBox.width, obsBox.height);
          }

          // Hitbox de powerups (Amarillo)
          ctx.strokeStyle = '#eab308';
          for (const pw of s.powerups) {
            const pb = getPowerupHitbox(pw);
            ctx.strokeRect(pb.x, pb.y, pb.width, pb.height);
          }
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-video max-h-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-500/40 select-none flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Guías táctiles móviles en la pantalla */}
      <div className="absolute inset-0 pointer-events-none flex">
        <div className="w-1/2 h-full border-r border-white/5 flex items-end p-4">
          <span className="text-xs uppercase font-extrabold tracking-wider bg-black/40 text-stone-300 px-3 py-1 rounded-full backdrop-blur-sm">
            👇 Toque Izq: Deslizar
          </span>
        </div>
        <div className="w-1/2 h-full flex items-end justify-end p-4">
          <span className="text-xs uppercase font-extrabold tracking-wider bg-black/40 text-stone-300 px-3 py-1 rounded-full backdrop-blur-sm">
            ☝️ Toque Der: Saltar
          </span>
        </div>
      </div>

      {/* Botón flotante para abrir panel de depuración */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={() => setDebugOpen(!debugOpen)}
          className="px-2.5 py-1 text-xs font-bold bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded border border-stone-600 backdrop-blur-md transition-all shadow"
        >
          {debugOpen ? 'Cerrar Debug (D)' : '⚙️ Debug'}
        </button>
      </div>

      {/* Panel de Depuración solicitado */}
      {debugOpen && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-stone-900/95 border border-stone-700 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs text-stone-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-700">
            <span className="font-black text-amber-400 uppercase tracking-wider">
              Panel de Depuración
            </span>
            <button
              onClick={() =>
                setDebugParams({
                  jumpForce: 670,
                  slideDuration: 0.4,
                  gravityScale: 1750,
                  baseSpeed: 300,
                  maxSpeed: 700,
                  showHitboxes: false,
                  godMode: false,
                })
              }
              className="text-[10px] text-amber-500 hover:underline font-bold"
            >
              Resetear
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>jumpForce:</span>
                <span className="text-amber-400 font-mono">
                  {debugParams.jumpForce} px/s
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="1000"
                step="10"
                value={debugParams.jumpForce}
                onChange={(e) =>
                  setDebugParams({
                    ...debugParams,
                    jumpForce: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>slideDuration:</span>
                <span className="text-amber-400 font-mono">
                  {debugParams.slideDuration}s
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={debugParams.slideDuration}
                onChange={(e) =>
                  setDebugParams({
                    ...debugParams,
                    slideDuration: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>gravityScale:</span>
                <span className="text-amber-400 font-mono">
                  {debugParams.gravityScale} px/s²
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="3000"
                step="50"
                value={debugParams.gravityScale}
                onChange={(e) =>
                  setDebugParams({
                    ...debugParams,
                    gravityScale: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>baseSpeed:</span>
                <span className="text-amber-400 font-mono">
                  {debugParams.baseSpeed} px/s
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="500"
                step="10"
                value={debugParams.baseSpeed}
                onChange={(e) =>
                  setDebugParams({
                    ...debugParams,
                    baseSpeed: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>maxSpeed:</span>
                <span className="text-amber-400 font-mono">
                  {debugParams.maxSpeed} px/s
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="1200"
                step="25"
                value={debugParams.maxSpeed}
                onChange={(e) =>
                  setDebugParams({
                    ...debugParams,
                    maxSpeed: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-stone-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugParams.showHitboxes}
                  onChange={(e) =>
                    setDebugParams({
                      ...debugParams,
                      showHitboxes: e.target.checked,
                    })
                  }
                  className="accent-amber-500"
                />
                <span>Mostrar Hitboxes AABB</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugParams.godMode}
                  onChange={(e) =>
                    setDebugParams({
                      ...debugParams,
                      godMode: e.target.checked,
                    })
                  }
                  className="accent-amber-500"
                />
                <span>Modo Dios (Invulnerable)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Renderizado del fondo festivo estilo Power Pamplona nupcial */
function renderFestiveBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  distance: number,
  groundY: number
) {
  // 1. Cielo crepúsculo festivo
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#1e1b4b');
  skyGrad.addColorStop(0.4, '#4c0519');
  skyGrad.addColorStop(0.85, '#831843');
  skyGrad.addColorStop(1, '#9f1239');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, groundY);

  // 2. Siluetas de fondo lejano (Edificios históricos / salón de fiestas colonial)
  const layer1Offset = -(distance * 0.15) % 300;
  ctx.fillStyle = '#290518';
  for (let x = -300 + layer1Offset; x < w + 300; x += 180) {
    ctx.fillRect(x, groundY - 140, 160, 140);
    // Cúpula o tejado
    ctx.beginPath();
    ctx.moveTo(x, groundY - 140);
    ctx.lineTo(x + 80, groundY - 200);
    ctx.lineTo(x + 160, groundY - 140);
    ctx.fill();

    // Ventanas iluminadas
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 30, groundY - 120, 20, 30);
    ctx.fillRect(x + 110, groundY - 120, 20, 30);
    ctx.fillStyle = '#290518';
  }

  // 3. Arcos barrocos de boda y faroles iluminados (Capa media)
  const layer2Offset = -(distance * 0.45) % 400;
  ctx.fillStyle = '#4c0519';
  for (let x = -400 + layer2Offset; x < w + 400; x += 320) {
    // Columnas decoradas
    ctx.fillRect(x, groundY - 180, 28, 180);
    ctx.fillRect(x + 220, groundY - 180, 28, 180);

    // Arco superior
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x + 124, groundY - 170, 110, Math.PI, 0);
    ctx.stroke();

    // Farol de banquete colgante
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 124, groundY - 130, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4c0519';
  }

  // 4. Suelo: Alfombra roja de boda y adoquines elegantes
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0, '#7f1d1d'); // Rojo terciopelo
  groundGrad.addColorStop(0.2, '#991b1b');
  groundGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Ribete dorado de la alfombra roja
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, groundY, w, 4);

  // Textura de adoquines / tablones deslizándose
  const floorOffset = -(distance * 1.0) % 60;
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
  ctx.lineWidth = 2;
  for (let x = floorOffset; x < w + 60; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 4);
    ctx.lineTo(x - 30, h);
    ctx.stroke();
  }
}

/** Banderines colgantes festivos (papel picado nupcial) */
function renderBuntingFlags(
  ctx: CanvasRenderingContext2D,
  w: number,
  distance: number
) {
  const swayOffset = -(distance * 0.3) % 180;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 15);
  for (let x = 0; x < w; x += 120) {
    ctx.quadraticCurveTo(x + 60, 42, x + 120, 15);
  }
  ctx.stroke();

  // Banderines
  const flagColors = [
    '#ef4444',
    '#ffffff',
    '#f59e0b',
    '#ec4899',
    '#38bdf8',
    '#10b981',
  ];
  for (let x = swayOffset - 60; x < w + 60; x += 40) {
    const colorIndex = Math.floor(Math.abs(x) / 40) % flagColors.length;
    const flagY = 24 + Math.sin((x / 120) * Math.PI) * 12;

    ctx.fillStyle = flagColors[colorIndex];
    ctx.beginPath();
    ctx.moveTo(x - 12, flagY);
    ctx.lineTo(x + 12, flagY);
    ctx.lineTo(x, flagY + 22);
    ctx.closePath();
    ctx.fill();
  }
}

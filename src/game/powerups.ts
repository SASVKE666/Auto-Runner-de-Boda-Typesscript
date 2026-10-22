/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de Power-Ups para PincheGorda Auto-Runner
 */

import { Rect } from './physics';
import { SpriteId } from './spriteAtlas';

export type PowerupType = 'shield' | 'magnet' | 'boost' | 'multiplier';

export interface PowerupItem {
  id: string;
  type: PowerupType;
  spriteId: SpriteId;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  baseY: number; // Para flotación senoidal
  floatPhase: number;
}

export interface ActivePowerups {
  shield: boolean; // Dura hasta que se consume 1 choque
  magnetTimer: number; // Segundos restantes
  boostTimer: number; // 3 segundos
  multiplierTimer: number; // 5 segundos
}

export const INITIAL_ACTIVE_POWERUPS: ActivePowerups = {
  shield: false,
  magnetTimer: 0,
  boostTimer: 0,
  multiplierTimer: 0,
};

export const POWERUP_CONFIG = {
  magnetDuration: 8.0, // 8 segundos de atracción de monedas
  magnetRadius: 260, // Radio de atracción en píxeles
  boostDuration: 3.0, // 3 segundos de super velocidad
  boostSpeedBonus: 220, // +220 px/s de velocidad
  multiplierDuration: 5.0, // 5 segundos de x2
};

export function createPowerup(
  type: PowerupType,
  x: number,
  y: number
): PowerupItem {
  const spriteMap: Record<PowerupType, SpriteId> = {
    shield: 'powerup_shield',
    magnet: 'powerup_magnet',
    boost: 'powerup_boost',
    multiplier: 'powerup_multiplier',
  };

  return {
    id: `pw_${type}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    spriteId: spriteMap[type],
    x,
    y,
    baseY: y,
    floatPhase: Math.random() * Math.PI * 2,
    width: 36,
    height: 36,
    collected: false,
  };
}

export function getPowerupHitbox(item: PowerupItem): Rect {
  return {
    x: item.x - item.width / 2,
    y: item.y - item.height / 2,
    width: item.width,
    height: item.height,
  };
}

/**
 * Aplica el efecto del power-up recolectado al estado de power-ups activos
 */
export function activatePowerup(
  type: PowerupType,
  current: ActivePowerups
): ActivePowerups {
  const updated = { ...current };

  switch (type) {
    case 'shield':
      updated.shield = true;
      break;
    case 'magnet':
      updated.magnetTimer = POWERUP_CONFIG.magnetDuration;
      break;
    case 'boost':
      updated.boostTimer = POWERUP_CONFIG.boostDuration;
      break;
    case 'multiplier':
      updated.multiplierTimer = POWERUP_CONFIG.multiplierDuration;
      break;
  }

  return updated;
}

/**
 * Actualiza los contadores de tiempo de los power-ups activos
 */
export function updateActivePowerups(
  active: ActivePowerups,
  dt: number
): ActivePowerups {
  return {
    shield: active.shield,
    magnetTimer: Math.max(0, active.magnetTimer - dt),
    boostTimer: Math.max(0, active.boostTimer - dt),
    multiplierTimer: Math.max(0, active.multiplierTimer - dt),
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de física pura para PincheGorda Auto-Runner
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerPhysicsConfig {
  x: number;
  width: number;
  standingHeight: number;
  slidingHeight: number;
  groundY: number; // Y de la superficie donde pisan los pies
  jumpForce: number; // Impulso vertical hacia arriba (px/s)
  fastFallSpeed: number; // Velocidad de caída rápida al deslizar en el aire (px/s)
  gravity: number; // Aceleración de gravedad (px/s²)
  slideDuration: number; // Duración máxima del deslizamiento (segundos)
}

export interface PlayerPhysicsState {
  y: number; // Posición Y de los pies
  vy: number; // Velocidad vertical (positivo = hacia abajo, negativo = hacia arriba)
  isGrounded: boolean;
  isJumping: boolean;
  isSliding: boolean;
  isFastFalling: boolean;
  slideTimer: number; // Tiempo restante de deslizamiento
}

/**
 * Detección de colisión entre dos rectángulos AABB (Axis-Aligned Bounding Box)
 */
export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Calcula el hitbox actual del jugador con pivote en los pies (Bottom-Center).
 * En deslizamiento, la altura se reduce al 50% y la caja se mantiene pegada al suelo.
 */
export function getPlayerHitbox(
  player: PlayerPhysicsState,
  config: PlayerPhysicsConfig
): Rect {
  const currentHeight = player.isSliding
    ? config.slidingHeight
    : config.standingHeight;
  const currentWidth = player.isSliding
    ? config.width * 1.25 // Ligeramente más largo horizontalmente al barrerse
    : config.width;

  return {
    x: config.x - currentWidth / 2,
    y: player.y - currentHeight,
    width: currentWidth,
    height: currentHeight,
  };
}

/**
 * Aplica la aceleración de la gravedad a la velocidad vertical
 */
export function applyGravity(
  vy: number,
  gravity: number,
  dt: number,
  maxFallSpeed = 1200
): number {
  return Math.min(vy + gravity * dt, maxFallSpeed);
}

/**
 * Determina si el jugador está en contacto con el suelo
 */
export function isOnGround(y: number, groundY: number, tolerance = 0.5): boolean {
  return y >= groundY - tolerance;
}

/**
 * Ejecuta la actualización física de un paso temporal (dt) para el jugador
 */
export function updatePlayerPhysics(
  state: PlayerPhysicsState,
  config: PlayerPhysicsConfig,
  dt: number
): { state: PlayerPhysicsState; landed: boolean } {
  let { y, vy, isGrounded, isJumping, isSliding, isFastFalling, slideTimer } =
    state;
  let landed = false;

  // Actualización del temporizador de deslizamiento
  if (isSliding) {
    slideTimer -= dt;
    if (slideTimer <= 0) {
      isSliding = false;
      slideTimer = 0;
    }
  }

  // Si está en el aire, aplicar gravedad
  if (!isGrounded) {
    vy = applyGravity(vy, config.gravity, dt);
    y += vy * dt;

    // Colisión con el suelo
    if (y >= config.groundY) {
      y = config.groundY;
      vy = 0;
      isGrounded = true;
      isJumping = false;
      landed = true;

      // Si venía en caída rápida (Fast Fall), inicia deslizamiento automático
      if (isFastFalling) {
        isSliding = true;
        slideTimer = config.slideDuration;
        isFastFalling = false;
      }
    }
  } else {
    // Pegado al suelo
    y = config.groundY;
    vy = 0;
  }

  return {
    state: {
      y,
      vy,
      isGrounded,
      isJumping,
      isSliding,
      isFastFalling,
      slideTimer,
    },
    landed,
  };
}

/**
 * LÓGICA DE SALTO con Animation Canceling:
 * - Cancela el deslizamiento si está activo
 * - Resetea velocidad vertical a 0 antes del impulso
 */
export function executeJump(
  state: PlayerPhysicsState,
  config: PlayerPhysicsConfig
): PlayerPhysicsState {
  if (state.isGrounded || state.isSliding) {
    return {
      ...state,
      vy: -config.jumpForce, // Impulso limpio hacia arriba
      isGrounded: false,
      isJumping: true,
      isSliding: false, // Cancela deslizamiento de inmediato
      isFastFalling: false,
      slideTimer: 0,
    };
  }
  return state;
}

/**
 * LÓGICA DE DESLIZAMIENTO con Animation Canceling (Fast Fall):
 * - En suelo: Inicia deslizamiento reduciendo hitbox al 50% por 0.4s
 * - En el aire: Ejecuta Fast Fall acelerando verticalmente hacia el suelo
 */
export function executeSlide(
  state: PlayerPhysicsState,
  config: PlayerPhysicsConfig
): PlayerPhysicsState {
  if (state.isGrounded) {
    return {
      ...state,
      isSliding: true,
      slideTimer: config.slideDuration,
    };
  } else {
    // ANIMATION CANCELING: En el aire + Deslizar = Caída Rápida (Fast Fall)
    return {
      ...state,
      vy: Math.max(state.vy, config.fastFallSpeed),
      isFastFalling: true,
    };
  }
}

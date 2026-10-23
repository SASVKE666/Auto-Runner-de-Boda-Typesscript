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

        // Dibujar Jugador (Novio)
        let playerSpriteId: SpriteId = 'groom_run_0';
        if (s.playerState.isSliding) {
          playerSpriteId = 'groom_slide';
        } else if (!s.playerState.isGrounded) {
          playerSpriteId =
            s.playerState.vy < 0 ? 'groom_jump' : 'groom_fall';
        } else {
          const runIndex = Math.floor((s.animTick * 12) % 4);
          playerSpriteId = `groom_run_${runIndex}` as SpriteId;
        }

        drawSpriteBottomCenter(
          ctx,
          playerSpriteId,
          PLAYER_X,
          s.playerState.y,
          1,
          {
            flash: s.invulnerableTimer > 0,
            hasShield: s.activePowerups.shield,
            animTick: s.animTick,
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

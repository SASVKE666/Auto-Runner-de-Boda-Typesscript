/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PincheGorda - Auto-Runner de Boda (Inspirado en Power Pamplona)
 * Componente principal React con HUD arcade, medidor de proximidad, combos y controles
 */

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Magnet,
  Zap,
  Sparkles,
  Trophy,
  Flame,
  HelpCircle,
  X,
  Keyboard,
} from 'lucide-react';
import { RunnerCanvas, GameStats } from './game/RunnerCanvas';
import { sound } from './game/sound';

export default function App() {
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coins: 0,
    combo: 1,
    speed: 300,
    brideDistancePct: 100,
    activePowerups: {
      shield: false,
      magnetTimer: 0,
      boostTimer: 0,
      multiplierTimer: 0,
    },
    isGameOver: false,
    isPaused: false,
  });
  const [gamePhase, setGamePhase] = useState<'intro' | 'menu' | 'playing' | 'gameover'>('intro');

  // Verificar si ya vio la intro al cargar
  /*   useEffect(() => {
      const introSeen = localStorage.getItem('pinchegorda_intro_seen');
      if (introSeen === 'true') {
        setGamePhase('menu');
      }
    }, []); */
  const [soundMuted, setSoundMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('pinchegorda_high_score') || '0');
  });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameKey, setGameKey] = useState(1);

  // Guardar puntuación récord
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('pinchegorda_high_score', String(stats.score));
    }
  }, [stats.score, highScore]);

  // Manejo de sonido
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.enabled = !next;
  };

  const restartGame = () => {
    setIsPaused(false);
    setGamePhase('menu'); // Cambia: ahora vuelve al menú en lugar de jugar directo
    setGameKey((prev) => prev + 1);
  };

  // Tecla de pausa (P o Escape) y reinicio con Espacio en Game Over
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (!stats.isGameOver) {
          setIsPaused((p) => !p);
        }
      }
      if (stats.isGameOver && (e.code === 'Space' || e.key === 'Enter')) {
        restartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stats.isGameOver]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 flex flex-col font-sans select-none antialiased">

      {/* ==================== FASE: INTRO ==================== */}
      {gamePhase === 'intro' && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <div className="text-center space-y-8 px-4">
            <div className="text-8xl mb-4">👰🤵</div>
            <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 animate-pulse">
              PINCHEGORDA
            </h1>
            <p className="text-2xl text-stone-300 italic">Sanfermines, 2026...</p>
            <p className="text-stone-400 text-sm">
              Una historia de amor... y de huida.
            </p>
            <button
              onClick={() => {
                localStorage.setItem('pinchegorda_intro_seen', 'true');
                setGamePhase('menu');
              }}
              className="mt-8 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 transition"
            >
              Saltar intro ▶
            </button>
          </div>
        </div>
      )}

      {/* ==================== FASE: MENÚ PRINCIPAL ==================== */}
      {gamePhase === 'menu' && (
        <div className="fixed inset-0 bg-gradient-to-b from-stone-900 via-rose-950 to-stone-900 z-40 flex flex-col items-center justify-center overflow-hidden">

          {/* Fondo decorativo animado */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 text-6xl animate-bounce">🎊</div>
            <div className="absolute top-20 right-20 text-5xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 text-6xl animate-bounce">🎉</div>
            <div className="absolute bottom-10 right-10 text-5xl animate-pulse"></div>
          </div>

          {/* Título */}
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 mb-4 tracking-tight">
            PINCHEGORDA
          </h1>
          <p className="text-stone-400 text-sm mb-12 italic">
            ¡Huye de la novia antes de que te aplaste con el rodillo!
          </p>

          {/* Récord */}
          {highScore > 0 && (
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-amber-950/50 border border-amber-500/50 px-4 py-2 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-mono font-bold">
                🏆 {highScore.toLocaleString()}
              </span>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-4 w-80 z-10">
            <button
              onClick={() => setGamePhase('playing')}
              className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xl rounded-xl shadow-lg shadow-rose-900/50 transition transform hover:scale-105"
            >
              <Play className="w-6 h-6" />
              JUGAR
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center justify-center gap-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-700 transition"
            >
              <HelpCircle className="w-5 h-5" />
              CÓMO JUGAR
            </button>
          </div>

          <p className="absolute bottom-8 text-stone-500 text-sm">
            Presiona <kbd className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-stone-300">ESPACIO</kbd> para jugar
          </p>
        </div>
      )}

      {/* ==================== FASE: JUGANDO (todo tu código actual) ==================== */}
      {gamePhase === 'playing' && (
        <>
          {/* Barra Superior / Header Arcade */}
          <header className="bg-stone-900/90 border-b border-amber-600/30 backdrop-blur-md px-4 py-2.5 shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Logo y Nombre */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md font-black text-2xl">
                  👰
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 uppercase">
                      PincheGorda
                    </h1>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white tracking-widest">
                      Auto-Runner
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 hidden sm:block">
                    ¡Huye de la novia antes de que te aplaste con el rodillo!
                  </p>
                </div>
              </div>

              {/* Marcadores HUD principales */}
              <div className="flex items-center gap-4 text-sm font-black">
                {/* Combo Multiplier */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${stats.combo > 1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 scale-105 shadow-lg shadow-amber-500/20'
                    : 'bg-stone-800/60 text-stone-400 border border-stone-700/50'
                    }`}
                >
                  <Flame
                    className={`w-4 h-4 ${stats.combo > 1 ? 'text-amber-400 animate-bounce' : 'text-stone-500'
                      }`}
                  />
                  <span className="font-mono text-base font-black">
                    x{stats.combo}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-500">
                    Combo
                  </span>
                </div>

                {/* Anillos de Boda (Monedas) */}
                <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/70 px-3 py-1 rounded-xl">
                  <span className="text-base">💍</span>
                  <span className="font-mono text-amber-400 text-base">
                    {stats.coins}
                  </span>
                </div>

                {/* Distancia */}
                <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/70 px-3 py-1 rounded-xl">
                  <span className="text-xs text-stone-400">DIST:</span>
                  <span className="font-mono text-stone-200 text-base">
                    {stats.distance}m
                  </span>
                </div>

                {/* Puntuación */}
                <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-3 py-1 rounded-xl">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-amber-300 text-base">
                    {stats.score.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Botones de configuración rápida */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition shadow"
                  title="Cómo Jugar"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleSound}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition shadow"
                  title={soundMuted ? 'Activar Sonido' : 'Silenciar'}
                >
                  {soundMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition shadow"
                  title={isPaused ? 'Reanudar' : 'Pausar (P)'}
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setGamePhase('menu')}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition shadow"
                  title="Volver al Menú"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Barra de Tensión: Medidor de Proximidad de la Novia Furiosa */}
          <div className="max-w-5xl mx-auto w-full px-4 pt-3">
            <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
              <div className="flex items-center gap-2 text-rose-400">
                <span className="animate-pulse">⚠️</span>
                <span>Distancia de la Novia Furiosa:</span>
              </div>
              <div className="font-mono text-stone-400">
                {stats.brideDistancePct <= 25 ? (
                  <span className="text-rose-500 font-extrabold animate-bounce">
                    ¡¡TE TIENE AL ALCANCE DEL RODILLO!!
                  </span>
                ) : stats.brideDistancePct <= 50 ? (
                  <span className="text-amber-400">¡SE ESTÁ ACERCANDO!</span>
                ) : (
                  <span className="text-emerald-400">MANTENIENDO VENTAJA</span>
                )}
              </div>
            </div>
            <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800 relative shadow-inner">
              <div
                className={`h-full transition-all duration-150 rounded-full ${stats.brideDistancePct <= 25
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                  : stats.brideDistancePct <= 55
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                  }`}
                style={{ width: `${stats.brideDistancePct}%` }}
              />
            </div>
          </div>

          {/* Power-ups Activos */}
          <div className="max-w-5xl mx-auto w-full px-4 py-2 flex flex-wrap items-center gap-2 min-h-10">
            {stats.activePowerups.shield && (
              <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-400/60 text-sky-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-sky-500/20">
                <Shield className="w-3.5 h-3.5 text-sky-400 fill-sky-400/30" />
                <span>Escudo Activo (1 Choque)</span>
              </div>
            )}

            {stats.activePowerups.magnetTimer > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-400/60 text-rose-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-rose-500/20">
                <Magnet className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>Imán: {stats.activePowerups.magnetTimer.toFixed(1)}s</span>
              </div>
            )}

            {stats.activePowerups.boostTimer > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-400/60 text-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-amber-500/20">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Turbo Boost: {stats.activePowerups.boostTimer.toFixed(1)}s</span>
              </div>
            )}

            {stats.activePowerups.multiplierTimer > 0 && (
              <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-400/60 text-purple-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Puntos x2: {stats.activePowerups.multiplierTimer.toFixed(1)}s
                </span>
              </div>
            )}

            {!stats.activePowerups.shield &&
              stats.activePowerups.magnetTimer <= 0 &&
              stats.activePowerups.boostTimer <= 0 &&
              stats.activePowerups.multiplierTimer <= 0 && (
                <span className="text-xs text-stone-500 italic">
                  Recoge iconos brillantes para ganar ventajas y poderes temporales.
                </span>
              )}
          </div>

          {/* Área del Canvas del Juego */}
          <main className="flex-1 min-h-0 flex flex-col justify-center items-center px-2 py-1 w-full relative">
            <RunnerCanvas
              key={gameKey}
              soundEnabled={!soundMuted}
              isPaused={isPaused}
              onStatsUpdate={(newStats) => setStats(newStats)}
              onGameOver={(finalStats) => {
                setStats(finalStats);
              }}
            />

            {/* Modal de Pausa */}
            {isPaused && !stats.isGameOver && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-40 p-6">
                <div className="bg-stone-900 border-2 border-amber-500/60 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                  <h2 className="text-3xl font-black text-amber-400 mb-2 uppercase">
                    Juego Pausado
                  </h2>
                  <p className="text-stone-300 text-sm mb-6">
                    Toma aliento, la novia sigue esperando con el rodillo.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-black rounded-xl text-lg transition shadow-lg"
                    >
                      Continuar Escapando
                    </button>
                    <button
                      onClick={() => {
                        setIsPaused(false);
                        setGamePhase('menu');
                      }}
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition border border-stone-700"
                    >
                      Volver al Menú
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Game Over */}
            {stats.isGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-40 p-6 animate-in fade-in duration-200">
                <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-rose-600/80 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl shadow-rose-950/50">
                  <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-4 text-3xl">
                    💀
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-rose-500 uppercase tracking-tight mb-1">
                    ¡Te Atrapó la Novia!
                  </h2>
                  <p className="text-stone-300 text-sm mb-6 font-medium">
                    Un golpe certero de rodillo de cocina selló tu destino matrimonial.
                  </p>

                  {/* Estadísticas de la partida */}
                  <div className="grid grid-cols-2 gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-xl mb-6 text-left">
                    <div>
                      <span className="text-xs text-stone-400 uppercase font-bold block">
                        Puntuación Final
                      </span>
                      <span className="font-mono text-2xl font-black text-amber-400">
                        {stats.score.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 uppercase font-bold block">
                        Distancia Recorrida
                      </span>
                      <span className="font-mono text-2xl font-black text-rose-400">
                        {stats.distance} m
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 uppercase font-bold block">
                        Anillos Recogidos
                      </span>
                      <span className="font-mono text-lg font-black text-stone-200">
                        💍 {stats.coins}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 uppercase font-bold block">
                        Récord Histórico
                      </span>
                      <span className="font-mono text-lg font-black text-emerald-400">
                        🏆 {highScore.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={restartGame}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-black rounded-xl text-lg uppercase tracking-wide transition shadow-xl shadow-rose-600/30 active:scale-98"
                    >
                      Volver al Menú
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Guía Rápida de Mecánicas y Controles */}
          <footer className="bg-stone-900/80 border-t border-stone-800 px-4 py-3 text-xs text-stone-400">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-stone-300">Salto:</span>
                  <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                    Espacio
                  </kbd>
                  <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                    W
                  </kbd>
                  <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                    ↑
                  </kbd>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-300">Deslizar:</span>
                  <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                    S
                  </kbd>
                  <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 text-stone-200">
                    ↓
                  </kbd>
                </div>

                <div className="hidden md:flex items-center gap-2 text-stone-400">
                  <span className="text-amber-400 font-bold"> Anim Canceling:</span>
                  <span>Deslizar + Salto = Salto inmediato</span>
                  <span>•</span>
                  <span>Aire + Deslizar = Caída Rápida (Fast Fall)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-stone-500">
                  Tecla <kbd className="bg-stone-800 px-1 rounded">D</kbd> para Panel Debug
                </span>
              </div>
            </div>
          </footer>

          {/* Modal de Cómo Jugar */}
          {showHowToPlay && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-6 text-stone-200 shadow-2xl relative">
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-black text-amber-400 uppercase mb-4 flex items-center gap-2">
                  <span>👰</span> Manual de Fuga: PincheGorda
                </h3>

                <div className="space-y-4 text-xs leading-relaxed text-stone-300">
                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase text-amber-300">
                      1. El Peligro (Estilo Power Pamplona)
                    </h4>
                    <p>
                      Tu prometida enfurecida corre tras de ti con un rodillo. Si
                      tropiezas con un obstáculo o pierdes ritmo, ella ganará terreno
                      inmediatamente. Si se acerca lo suficiente, ¡te atrapará!
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase text-amber-300">
                      2. Obstáculos y Variedad
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong className="text-stone-100">Obstáculos Bajos (Pasteles, arreglos florales, pirámides de copas):</strong> Requieren saltar con precisión.
                      </li>
                      <li>
                        <strong className="text-stone-100">Obstáculos Altos (Candelabros barrocos, guirnaldas, campanas):</strong> Requieren deslizarse agachado.
                      </li>
                      <li>
                        <strong className="text-stone-100">Ráfagas:</strong> Secuencias de 2 a 3 obstáculos seguidos.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase text-amber-300">
                      3. Animation Canceling Avanzado
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong className="text-stone-100">Deslizando + Saltar:</strong> Cancela la barrida al instante y salta hacia arriba.
                      </li>
                      <li>
                        <strong className="text-stone-100">En el aire + Deslizar:</strong> Ejecuta Fast Fall hacia el suelo; al aterrizar, te deslizas automáticamente debajo de techos bajos.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase text-amber-300">
                      4. Power-Ups y Anillos
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="p-2 bg-stone-800/80 rounded border border-stone-700">
                        <span className="font-bold text-sky-400">️ Escudo:</span> Protege de un impacto sin perder distancia.
                      </div>
                      <div className="p-2 bg-stone-800/80 rounded border border-stone-700">
                        <span className="font-bold text-rose-400">🧲 Imán:</span> Atrae los anillos de boda cercanos automáticamente.
                      </div>
                      <div className="p-2 bg-stone-800/80 rounded border border-stone-700">
                        <span className="font-bold text-amber-400">⚡ Turbo:</span> Aumenta tu velocidad durante 3 segundos.
                      </div>
                      <div className="p-2 bg-stone-800/80 rounded border border-stone-700">
                        <span className="font-bold text-purple-400">⭐ Puntos x2:</span> Duplica toda puntuación por 5 segundos.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl uppercase text-xs tracking-wider transition"
                >
                  ¡Entendido, a Correr!
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

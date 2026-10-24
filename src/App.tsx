import React, { useState, useEffect } from 'react';
import { RunnerCanvas, GameStats } from './game/RunnerCanvas';
import { sound } from './game/sound';
import { IntroScreen } from './components/IntroScreen';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { VideoIntro } from './components/VideoIntro';

export default function App() {
  const [gamePhase, setGamePhase] = useState<'intro' | 'video' | 'menu' | 'playing' | 'gameover'>('intro');
  const [stats, setStats] = useState<GameStats>({
    score: 0, distance: 0, coins: 0, combo: 1, speed: 300,
    brideDistancePct: 100,
    activePowerups: { shield: false, magnetTimer: 0, boostTimer: 0, multiplierTimer: 0 },
    isGameOver: false, isPaused: false,
  });

  const [soundMuted, setSoundMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameKey, setGameKey] = useState(1);

  // Clave de localStorage actualizada al nuevo nombre
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('carrera_altar_high_score') || '0'));

  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('carrera_altar_high_score', String(stats.score));
    }
  }, [stats.score, highScore]);

  const toggleSound = () => {
    setSoundMuted(!soundMuted);
    sound.enabled = !soundMuted;
  };

  const handleGameOver = (finalStats: GameStats) => {
    setStats(finalStats);
    setGamePhase('gameover');
  };

  const restartGame = () => {
    setIsPaused(false);
    setGamePhase('menu');
    setGameKey((prev) => prev + 1);
  };

  // Atajos de teclado globales
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Saltar intro con cualquier tecla
      if (gamePhase === 'intro') {
        setGamePhase('menu');
        return;
      }
      // Pausar
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gamePhase === 'playing' && !stats.isGameOver) {
        setIsPaused((p) => !p);
      }
      // Reiniciar desde Game Over
      if (stats.isGameOver && (e.code === 'Space' || e.key === 'Enter')) {
        restartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gamePhase, stats.isGameOver]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 flex flex-col font-sans select-none antialiased">

      {gamePhase === 'intro' && <IntroScreen onComplete={() => setGamePhase('video')} />}

      {gamePhase === 'video' && <VideoIntro onComplete={() => setGamePhase('menu')} />}

      {gamePhase === 'menu' && (
        <MainMenu
          onPlay={() => setGamePhase('playing')}
          onHowToPlay={() => setShowHowToPlay(true)}
          highScore={highScore}
        />
      )}

      {gamePhase === 'playing' && (
        <div className="flex flex-col h-full">
          <GameHUD
            stats={stats}
            soundMuted={soundMuted}
            isPaused={isPaused}
            onToggleSound={toggleSound}
            onPause={() => setIsPaused(!isPaused)}
            onHowToPlay={() => setShowHowToPlay(true)}
            onReturnToMenu={() => { setIsPaused(false); setGamePhase('menu'); }}
          />

          <main className="flex-1 min-h-0 flex flex-col justify-center items-center px-2 py-1 w-full relative">
            <RunnerCanvas
              key={gameKey}
              soundEnabled={!soundMuted}
              isPaused={isPaused}
              onStatsUpdate={setStats}
              onGameOver={handleGameOver}
            />

            {isPaused && !stats.isGameOver && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-40 p-6">
                <div className="bg-stone-900 border-2 border-amber-500/60 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                  <h2 className="text-3xl font-black text-amber-400 mb-2 uppercase">Juego Pausado</h2>
                  <p className="text-stone-300 text-sm mb-6">Toma aliento, la novia sigue esperando con el rodillo.</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setIsPaused(false)} className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-black rounded-xl text-lg transition shadow-lg">Continuar Escapando</button>
                    <button onClick={() => { setIsPaused(false); setGamePhase('menu'); }} className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition border border-stone-700">Volver al Menú</button>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="bg-stone-900/80 border-t border-stone-800 px-4 py-3 text-xs text-stone-400">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-stone-500">Tecla <kbd className="bg-stone-800 px-1 rounded">D</kbd> para Panel Debug en el juego</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {gamePhase === 'gameover' && <GameOverModal stats={stats} highScore={highScore} onRestart={restartGame} />}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
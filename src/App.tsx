import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { RunnerCanvas, GameStats } from './game/RunnerCanvas';
import { sound } from './game/sound';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { IntroSequence } from './components/IntroSequence';

type Phase = 'intro' | 'menu' | 'playing' | 'gameover';

const STORAGE_BEST = 'novio_en_fuga_best';
const STORAGE_MUTED = 'novio_en_fuga_muted';

function readNumber(key: string) {
  try {
    return Number(localStorage.getItem(key) || '0') || 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [gameKey, setGameKey] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [best, setBest] = useState(() => readNumber(STORAGE_BEST));
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_MUTED) === '1';
    } catch {
      return false;
    }
  });
  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const bestRef = useRef(best);
  bestRef.current = best;

  useEffect(() => {
    sound.enabled = !muted;
    try {
      localStorage.setItem(STORAGE_MUTED, muted ? '1' : '0');
    } catch {
      /* sin almacenamiento */
    }
  }, [muted]);

  const play = useCallback(() => {
    setPaused(false);
    setNewRecord(false);
    setGameKey((k) => k + 1);
    setPhase('playing');
  }, []);

  const goMenu = useCallback(() => {
    setPaused(false);
    setPhase('menu');
  }, []);

  const handleGameOver = useCallback((stats: GameStats) => {
    setLastStats(stats);
    if (stats.distance > bestRef.current) {
      setNewRecord(bestRef.current > 0);
      setBest(stats.distance);
      try {
        localStorage.setItem(STORAGE_BEST, String(stats.distance));
      } catch {
        /* sin almacenamiento */
      }
    }
    setPhase('gameover');
  }, []);

  // Atajos globales: pausa, y Enter para jugar / reintentar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showHelp) {
        if (e.code === 'Escape') setShowHelp(false);
        return;
      }
      if (phase === 'playing' && (e.code === 'KeyP' || e.code === 'Escape')) {
        setPaused((p) => !p);
      } else if (phase === 'menu' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        play();
      } else if (phase === 'gameover' && e.code === 'Enter') {
        play();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, showHelp, play]);

  // Pausa automática al cambiar de pestaña
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && phase === 'playing') setPaused(true);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [phase]);

  const inGame = phase === 'playing' || phase === 'gameover';

  return (
    <div className="fixed inset-0 bg-[#1b0a14] flex items-center justify-center overflow-hidden select-none">
      {inGame && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="relative max-w-full max-h-full w-full"
            style={{ aspectRatio: '16 / 9', maxWidth: 'calc(100vh * 16 / 9)' }}
          >
            <RunnerCanvas key={gameKey} isPaused={paused || phase === 'gameover'} best={best} onGameOver={handleGameOver} />

            {phase === 'playing' && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setMuted((m) => !m)}
                  className="p-2 rounded-full bg-black/45 hover:bg-black/65 text-white/90 transition"
                  aria-label={muted ? 'Activar sonido' : 'Silenciar'}
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPaused((p) => !p)}
                  className="p-2 rounded-full bg-black/45 hover:bg-black/65 text-white/90 transition"
                  aria-label={paused ? 'Continuar' : 'Pausar'}
                >
                  {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
              </div>
            )}

            {paused && phase === 'playing' && (
              <div className="absolute inset-0 bg-[#2a0b1d]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                <h2 className="font-display text-4xl sm:text-5xl text-amber-300 drop-shadow-[0_3px_0_#2a1420]">PAUSA</h2>
                <p className="text-rose-100/90 text-sm sm:text-base text-center">La novia se detuvo a arreglarse el velo...</p>
                <button onClick={() => setPaused(false)} className="btn-primary w-64">Seguir huyendo</button>
                <button onClick={() => setShowHelp(true)} className="btn-secondary w-64">Cómo jugar</button>
                <button onClick={goMenu} className="btn-secondary w-64">Menú principal</button>
              </div>
            )}
          </div>

          {phase === 'gameover' && lastStats && (
            <GameOverModal stats={lastStats} best={best} newRecord={newRecord} onRetry={play} onMenu={goMenu} />
          )}
        </div>
      )}

      {phase === 'intro' && <IntroSequence onComplete={goMenu} />}

      {phase === 'menu' && <MainMenu onPlay={play} onHowToPlay={() => setShowHelp(true)} best={best} />}
      {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

import React from 'react';
import { HelpCircle, Play, Trophy } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onHowToPlay: () => void;
  onAchievements: () => void;
  best: number;
  achDone: number;
  achTotal: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onHowToPlay, onAchievements, best, achDone, achTotal }) => {
  return (
    <div className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#2a0b1d] via-[#5a1630] to-[#2a0b1d]">
      {/* banderines */}
      <svg className="absolute top-0 left-0 w-full h-24 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 100">
        <path d="M0 8 Q 500 80 1000 8" fill="none" stroke="#2a1420" strokeWidth="3" />
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 24 + i * 44;
          const y = 8 + 72 * (1 - Math.pow((x - 500) / 500, 2)) * 0.5 - 2;
          const cols = ['#e63e6d', '#fff4e0', '#f6c453', '#f9c5d3'];
          return <polygon key={i} points={`${x - 13},${y} ${x + 13},${y} ${x},${y + 32}`} fill={cols[i % 4]} stroke="#2a1420" strokeWidth="3" strokeLinejoin="round" />;
        })}
      </svg>

      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[22%] left-[8%] text-5xl animate-bounce">💍</div>
        <div className="absolute top-[30%] right-[10%] text-5xl animate-pulse">💐</div>
        <div className="absolute bottom-[18%] left-[12%] text-5xl animate-pulse">🥂</div>
        <div className="absolute bottom-[24%] right-[8%] text-5xl animate-bounce">🎂</div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="text-6xl sm:text-7xl mb-2">🤵💨 👰‍♀️</div>
        <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] text-amber-300 tracking-wide drop-shadow-[0_5px_0_#2a1420] [-webkit-text-stroke:3px_#2a1420] [paint-order:stroke_fill]">
          NOVIO
          <br />
          <span className="text-rose-400">EN FUGA</span>
        </h1>
        <p className="mt-4 max-w-md text-rose-100/90 text-sm sm:text-base">
          Es el día de tu boda, ¡y te acabas de arrepentir! Escapa con tu jetpack de champaña antes de que la novia te atrape.
        </p>

        {best > 0 && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-black/30 border-2 border-amber-300/60 text-amber-200 font-display tracking-wide">
            🏆 MEJOR: {best} m
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 w-72">
          <button onClick={onPlay} className="btn-primary text-2xl py-3.5 flex items-center justify-center gap-2">
            <Play className="w-6 h-6 fill-current" /> ¡CORRER!
          </button>
          <button onClick={onAchievements} className="btn-secondary flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" /> Logros <span className="text-amber-200 text-sm">{achDone}/{achTotal}</span>
          </button>
          <button onClick={onHowToPlay} className="btn-secondary flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5" /> Cómo jugar
          </button>
        </div>
        <p className="mt-5 text-rose-200/60 text-xs">
          Pulsa <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-rose-200/30">Enter</kbd> o{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-rose-200/30">Espacio</kbd> para empezar
        </p>
      </div>
    </div>
  );
};

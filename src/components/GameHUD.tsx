import React from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Shield, Magnet, Zap, Sparkles, Trophy, Flame, HelpCircle } from 'lucide-react';
import { GameStats } from '../game/RunnerCanvas.tsx';

interface GameHUDProps {
    stats: GameStats;
    soundMuted: boolean;
    isPaused: boolean;
    onToggleSound: () => void;
    onPause: () => void;
    onHowToPlay: () => void;
    onReturnToMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, soundMuted, isPaused, onToggleSound, onPause, onHowToPlay, onReturnToMenu }) => {
    return (
        <>
            <header className="bg-stone-900/90 border-b border-amber-600/30 backdrop-blur-md px-4 py-2.5 shadow-lg">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md font-black text-2xl">👰</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-black text-sm sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 uppercase">Carrera contra el Altar</h1>
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white tracking-widest hidden sm:block">Auto-Runner</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-sm font-black">
                        <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl transition-all ${stats.combo > 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 scale-105' : 'bg-stone-800/60 text-stone-400 border border-stone-700/50'}`}>
                            <Flame className={`w-4 h-4 ${stats.combo > 1 ? 'text-amber-400 animate-bounce' : 'text-stone-500'}`} />
                            <span className="font-mono text-base">x{stats.combo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/70 px-2 sm:px-3 py-1 rounded-xl">
                            <span>💍</span><span className="font-mono text-amber-400">{stats.coins}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/70 px-2 sm:px-3 py-1 rounded-xl hidden sm:flex">
                            <span className="text-xs text-stone-400">DIST:</span><span className="font-mono text-stone-200">{stats.distance}m</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-2 sm:px-3 py-1 rounded-xl">
                            <Trophy className="w-4 h-4 text-amber-400" /><span className="font-mono text-amber-300">{stats.score.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={onHowToPlay} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition" title="Cómo Jugar"><HelpCircle className="w-4 h-4" /></button>
                        <button onClick={onToggleSound} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition" title="Sonido">
                            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                        <button onClick={onPause} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition" title="Pausar">
                            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button onClick={onReturnToMenu} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition" title="Menú"><RotateCcw className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto w-full px-4 pt-3">
                <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
                    <div className="flex items-center gap-2 text-rose-400"><span className="animate-pulse">⚠️</span><span className="hidden sm:inline">Distancia de la Novia Furiosa:</span><span className="sm:hidden">Novia:</span></div>
                    <div className="font-mono text-stone-400 text-right">
                        {stats.brideDistancePct <= 25 ? <span className="text-rose-500 font-extrabold animate-bounce">¡TE VA A ATRAPAR!</span> : stats.brideDistancePct <= 50 ? <span className="text-amber-400">¡SE ACERCA!</span> : <span className="text-emerald-400">VENTAJA</span>}
                    </div>
                </div>
                <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800 relative shadow-inner">
                    <div className={`h-full transition-all duration-150 rounded-full ${stats.brideDistancePct <= 25 ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse' : stats.brideDistancePct <= 55 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'}`} style={{ width: `${stats.brideDistancePct}%` }} />
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 py-2 flex flex-wrap items-center gap-2 min-h-10">
                {stats.activePowerups.shield && <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-400/60 text-sky-300 px-3 py-1 rounded-full text-xs font-bold"><Shield className="w-3.5 h-3.5" /><span>Escudo</span></div>}
                {stats.activePowerups.magnetTimer > 0 && <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-400/60 text-rose-300 px-3 py-1 rounded-full text-xs font-bold"><Magnet className="w-3.5 h-3.5 animate-spin" /><span>Imán: {stats.activePowerups.magnetTimer.toFixed(1)}s</span></div>}
                {stats.activePowerups.boostTimer > 0 && <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-400/60 text-amber-300 px-3 py-1 rounded-full text-xs font-bold"><Zap className="w-3.5 h-3.5 animate-pulse" /><span>Turbo: {stats.activePowerups.boostTimer.toFixed(1)}s</span></div>}
                {stats.activePowerups.multiplierTimer > 0 && <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-400/60 text-purple-300 px-3 py-1 rounded-full text-xs font-bold"><Sparkles className="w-3.5 h-3.5" /><span>x2 Puntos: {stats.activePowerups.multiplierTimer.toFixed(1)}s</span></div>}
            </div>
        </>
    );
};
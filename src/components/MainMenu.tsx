import React from 'react';
import { Play, HelpCircle, Trophy } from 'lucide-react';

interface MainMenuProps {
    onPlay: () => void;
    onHowToPlay: () => void;
    highScore: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onHowToPlay, highScore }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-stone-900 via-rose-950 to-stone-900 z-40 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-bounce">🎊</div>
                <div className="absolute top-20 right-20 text-5xl animate-pulse">💒</div>
                <div className="absolute bottom-20 left-20 text-6xl animate-bounce">🎉</div>
                <div className="absolute bottom-10 right-10 text-5xl animate-pulse">💍</div>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 mb-4 tracking-tight text-center leading-tight z-10 px-4">
                CARRERA CONTRA<br />EL ALTAR
            </h1>
            <p className="text-stone-400 text-sm mb-12 italic z-10">¡Huye de la novia antes de que te atrape para la boda!</p>

            {highScore > 0 && (
                <div className="absolute top-8 right-8 flex items-center gap-2 bg-amber-950/50 border border-amber-500/50 px-4 py-2 rounded-xl z-10">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 font-mono font-bold">🏆 {highScore.toLocaleString()}</span>
                </div>
            )}

            <div className="flex flex-col gap-4 w-80 z-10">
                <button onClick={onPlay} className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xl rounded-xl shadow-lg shadow-rose-900/50 transition transform hover:scale-105">
                    <Play className="w-6 h-6" /> JUGAR
                </button>
                <button onClick={onHowToPlay} className="flex items-center justify-center gap-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-700 transition">
                    <HelpCircle className="w-5 h-5" /> CÓMO JUGAR
                </button>
            </div>

            <p className="absolute bottom-8 text-stone-500 text-sm z-10">
                Presiona <kbd className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-stone-300">ESPACIO</kbd> para jugar
            </p>
        </div>
    );
};
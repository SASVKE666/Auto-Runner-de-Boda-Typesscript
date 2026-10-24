import React from 'react';
import { Play, HelpCircle, Settings, Trophy } from 'lucide-react';

interface MainMenuProps {
    onPlay: () => void;
    onHowToPlay: () => void;
    onOptions: () => void;
    highScore: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
    onPlay,
    onHowToPlay,
    onOptions,
    highScore,
}) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-stone-900 via-rose-950 to-stone-900 z-40 flex flex-col items-center justify-center">
            {/* Título */}
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 mb-12 animate-pulse">
                PINCHEGORDA
            </h1>

            {/* Récord */}
            {highScore > 0 && (
                <div className="absolute top-8 right-8 flex items-center gap-2 bg-amber-950/50 border border-amber-500/50 px-4 py-2 rounded-xl">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 font-mono font-bold">{highScore.toLocaleString()}</span>
                </div>
            )}

            {/* Botones */}
            <div className="flex flex-col gap-4 w-80">
                <button
                    onClick={onPlay}
                    className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xl rounded-xl shadow-lg transition transform hover:scale-105"
                >
                    <Play className="w-6 h-6" />
                    JUGAR
                </button>

                <button
                    onClick={onHowToPlay}
                    className="flex items-center justify-center gap-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-700 transition"
                >
                    <HelpCircle className="w-5 h-5" />
                    CÓMO JUGAR
                </button>

                <button
                    onClick={onOptions}
                    className="flex items-center justify-center gap-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-700 transition"
                >
                    <Settings className="w-5 h-5" />
                    OPCIONES
                </button>
            </div>

            {/* Footer */}
            <p className="absolute bottom-8 text-stone-500 text-sm">
                Presiona ESPACIO para jugar
            </p>
        </div>
    );
};
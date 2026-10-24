import React from 'react';
import { Trophy } from 'lucide-react';
import { GameStats } from '../game/RunnerCanvas';

interface GameOverModalProps {
    stats: GameStats;
    highScore: number;
    onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, highScore, onRestart }) => {
    return (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-40 p-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-rose-600/80 p-6 sm:p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl shadow-rose-950/50">
                <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-4 text-3xl">💀</div>
                <h2 className="text-2xl sm:text-4xl font-black text-rose-500 uppercase tracking-tight mb-1">¡Te Atrapó la Novia!</h2>
                <p className="text-stone-300 text-sm mb-6 font-medium">Un golpe certero de rodillo de cocina selló tu destino matrimonial.</p>

                <div className="grid grid-cols-2 gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-xl mb-6 text-left">
                    <div><span className="text-xs text-stone-400 uppercase font-bold block">Puntuación</span><span className="font-mono text-xl sm:text-2xl font-black text-amber-400">{stats.score.toLocaleString()}</span></div>
                    <div><span className="text-xs text-stone-400 uppercase font-bold block">Distancia</span><span className="font-mono text-xl sm:text-2xl font-black text-rose-400">{stats.distance} m</span></div>
                    <div><span className="text-xs text-stone-400 uppercase font-bold block">Anillos</span><span className="font-mono text-lg font-black text-stone-200">💍 {stats.coins}</span></div>
                    <div><span className="text-xs text-stone-400 uppercase font-bold block">Récord</span><span className="font-mono text-lg font-black text-emerald-400">🏆 {highScore.toLocaleString()}</span></div>
                </div>

                <button onClick={onRestart} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-black rounded-xl text-lg uppercase tracking-wide transition shadow-xl shadow-rose-600/30 active:scale-98">
                    Volver al Menú
                </button>
            </div>
        </div>
    );
};
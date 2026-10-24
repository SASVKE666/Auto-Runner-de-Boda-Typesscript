import React, { useEffect } from 'react';

interface IntroScreenProps {
    onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
    useEffect(() => {
        // Avanza automáticamente al menú después de 15 segundos
        const timer = setTimeout(onComplete, 15000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-pointer" onClick={onComplete}>
            <div className="text-center space-y-8 px-4 animate-in fade-in duration-1000 pointer-events-none">
                <div className="text-8xl mb-4">👰🤵</div>
                <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 animate-pulse leading-tight">
                    CARRERA CONTRA<br />EL ALTAR
                </h1>
                <p className="text-2xl text-stone-300 italic">Sanfermines, 2026...</p>
                <p className="text-stone-400 text-sm">Una historia de amor... y de huida.</p>
                <button
                    onClick={(e) => { e.stopPropagation(); onComplete(); }}
                    className="mt-8 pointer-events-auto px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 transition"
                >
                    Saltar intro ▶
                </button>
            </div>
        </div>
    );
};
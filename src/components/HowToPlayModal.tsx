import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface HowToPlayModalProps {
    onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-6 text-stone-200 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white"><X className="w-5 h-5" /></button>
                <h3 className="text-xl font-black text-amber-400 uppercase mb-4 flex items-center gap-2"><span>💒</span> Manual de Fuga</h3>
                <div className="space-y-4 text-xs leading-relaxed text-stone-300">
                    <div>
                        <h4 className="font-bold text-white mb-1 uppercase text-amber-300">1. El Peligro</h4>
                        <p>Tu prometida enfurecida corre tras de ti con un rodillo. Si tropiezas, ella ganará terreno. ¡Si te alcanza, se acabó!</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-1 uppercase text-amber-300">2. Controles</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> Saltar: <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">Espacio</kbd> / <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">W</kbd></span>
                            <span className="flex items-center gap-1">Deslizar: <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">S</kbd> / <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">↓</kbd></span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-1 uppercase text-amber-300">3. Animation Canceling</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Deslizando + Saltar:</strong> Cancela la barrida y salta al instante.</li>
                            <li><strong>Aire + Deslizar:</strong> Caída Rápida (Fast Fall). Al tocar suelo, te deslizas automáticamente.</li>
                        </ul>
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl uppercase text-xs tracking-wider transition">¡Entendido, a Correr!</button>
            </div>
        </div>
    );
};
import React, { useEffect, useRef, useState } from 'react';

interface VideoIntroProps {
    onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [canSkip, setCanSkip] = useState(false);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        // Permitir saltar después de 2 segundos
        const skipTimer = setTimeout(() => setCanSkip(true), 2000);

        // Auto-play el video
        const video = videoRef.current;
        if (video) {
            video.play().catch((err) => {
                console.log('Autoplay bloqueado:', err);
                // Si falla el autoplay, intentar de nuevo con interacción
                setVideoError(true);
            });
        }

        return () => clearTimeout(skipTimer);
    }, []);

    const handleEnd = () => {
        onComplete();
    };

    const handleSkip = () => {
        onComplete();
    };

    // Si el video no existe o falla, pasar directo al menú
    if (videoError) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                <div className="text-center text-stone-400">
                    <p>Cargando video...</p>
                    <button onClick={onComplete} className="mt-4 px-6 py-2 bg-white/20 text-white rounded">
                        Continuar ▶
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                src="../public/assets/intro.mp4"
                className="w-full h-full object-contain"
                onEnded={handleEnd}
                onError={() => setVideoError(true)}
                autoPlay
                playsInline
                muted={false}
            />

            {canSkip && (
                <button
                    onClick={handleSkip}
                    className="absolute bottom-8 right-8 px-6 py-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 transition z-10"
                >
                    Saltar video ▶
                </button>
            )}

            {!canSkip && (
                <div className="absolute bottom-8 right-8 text-white/50 text-sm">
                    Cargando...
                </div>
            )}
        </div>
    );
};
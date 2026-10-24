import React, { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
    onComplete: () => void;
}

function IntroScreen({ onComplete }: { onComplete: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [canSkip, setCanSkip] = useState(false);

    useEffect(() => {
        // Permitir saltar después de 2 segundos
        const timer = setTimeout(() => setCanSkip(true), 2000);

        // Auto-play el video
        const video = videoRef.current;
        if (video) {
            video.play().catch((err) => {
                console.log('Autoplay bloqueado:', err);
            });
        }

        return () => clearTimeout(timer);
    }, []);

    const handleEnd = () => {
        localStorage.setItem('pinchegorda_intro_seen', 'true');
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem('pinchegorda_intro_seen', 'true');
        onComplete();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <video
                ref={videoRef}
                src="public/assets/intro.mp4"
                className="w-full h-full object-contain"
                onEnded={handleEnd}
                autoPlay
                playsInline
            />
            {canSkip && (
                <button
                    onClick={handleSkip}
                    className="absolute bottom-8 right-8 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 transition"
                >
                    Saltar ▶
                </button>
            )}
        </div>
    );
}
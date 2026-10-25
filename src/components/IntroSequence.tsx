import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IntroSequenceProps {
  onComplete: () => void;
}

const VIDEO_SRC = '/assets/intro.mp4';

/**
 * Secuencia de intro: tarjeta de título -> video (public/assets/intro.mp4) -> menú.
 * La tarjeta de título existe porque los navegadores solo permiten reproducir
 * audio después de un clic/toque; ese gesto arranca el video con sonido.
 * Si el video falla o el navegador lo bloquea, pasa directo al menú.
 */
export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'title' | 'video'>('title');
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  const start = useCallback(() => setStage('video'), []);

  // Teclado: en el título Enter/Espacio inicia; en el video Esc/Enter/Espacio salta
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (stage === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        start();
      } else if (stage === 'video' && canSkip && (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, canSkip, start, finish]);

  // Al empezar el video: habilitar "saltar" y reproducir (con sonido; si falla, sin sonido)
  useEffect(() => {
    if (stage !== 'video') return;
    const skipTimer = setTimeout(() => setCanSkip(true), 1500);
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(finish);
      });
    }
    return () => clearTimeout(skipTimer);
  }, [stage, finish]);

  if (stage === 'title') {
    return (
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 px-4 text-center cursor-pointer bg-gradient-to-b from-black via-[#2a0b1d] to-black"
        onClick={start}
      >
        <div className="text-7xl sm:text-8xl">🤵💨👰‍♀️</div>
        <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] text-amber-300 tracking-wide drop-shadow-[0_5px_0_#2a1420] [-webkit-text-stroke:3px_#2a1420] [paint-order:stroke_fill]">
          NOVIO
          <br />
          <span className="text-rose-400">EN FUGA</span>
        </h1>
        <p className="text-rose-100/80 italic">Una historia de amor... y de huida.</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
          className="btn-primary mt-4 animate-pulse"
        >
          ▶ Toca para empezar
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      />
      {canSkip ? (
        <button
          onClick={finish}
          className="absolute bottom-6 right-6 px-5 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold border border-white/30 transition"
        >
          Saltar ▶
        </button>
      ) : (
        <div className="absolute bottom-6 right-6 text-white/50 text-sm">Cargando...</div>
      )}
    </div>
  );
};

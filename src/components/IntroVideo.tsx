/**
 * IntroVideo.tsx
 * Reproduces the wedding-game cinematic intro once per session.
 * Saves localStorage flag 'pinchegorda_intro_seen' on finish or skip.
 */

import React, { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
    onFinished: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onFinished }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [visible, setVisible] = useState(true);
    const [muted, setMuted] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [progress, setProgress] = useState(0);

    const finish = () => {
        if (!visible) return;
        setVisible(false);
        localStorage.setItem('pinchegorda_intro_seen', '1');
        onFinished();
    };

    // Try to unmute once the user interacts with the page
    const handleFirstInteraction = () => {
        if (!hasInteracted && videoRef.current) {
            videoRef.current.muted = false;
            setMuted(false);
            setHasInteracted(true);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onEnded = () => finish();
        const onTimeUpdate = () => {
            if (video.duration > 0) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        video.addEventListener('ended', onEnded);
        video.addEventListener('timeupdate', onTimeUpdate);

        // Attempt autoplay (muted to comply with browser autoplay policy)
        video.play().catch(() => {
            // Autoplay blocked — show video with play button fallback (it will play on click)
        });

        return () => {
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('timeupdate', onTimeUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!visible) return null;

    return (
        <div
            className="intro-overlay"
            onClick={handleFirstInteraction}
            style={{
                position: 'fixed',
                inset: 0,
                background: '#000',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <video
                ref={videoRef}
                src="/assets/intro (online-video-cutter.com).mp4"
                muted={muted}
                autoPlay
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
            />

            {/* Progress bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 64,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: 3,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                        borderRadius: 4,
                        transition: 'width 0.3s linear',
                    }}
                />
            </div>

            {/* Muted hint */}
            {muted && (
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#facc15',
                        fontSize: 12,
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.05em',
                        animation: 'pulse 2s infinite',
                    }}
                >
                    🔇 Toca la pantalla para activar el sonido
                </div>
            )}

            {/* Skip button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    finish();
                }}
                style={{
                    position: 'absolute',
                    bottom: 28,
                    right: 28,
                    background: 'rgba(0,0,0,0.55)',
                    border: '1.5px solid rgba(245,158,11,0.7)',
                    color: '#fde68a',
                    fontFamily: 'sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    padding: '8px 20px',
                    borderRadius: 30,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.2s, transform 0.15s',
                    textTransform: 'uppercase',
                }}
                onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.background = 'rgba(245,158,11,0.35)')
                }
                onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)')
                }
            >
                Saltar ▶
            </button>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default IntroVideo;

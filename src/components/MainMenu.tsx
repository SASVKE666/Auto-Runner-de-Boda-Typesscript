/**
 * MainMenu.tsx
 * Animated main menu for PincheGorda.
 * Shows the game running in demo mode as an animated background.
 * Handles: JUGAR, CÓMO JUGAR, OPCIONES, Game Over recap, and REINTENTAR.
 */

import React, { useState } from 'react';
import { Trophy, Volume2, VolumeX, X, Keyboard, HelpCircle, Settings } from 'lucide-react';
import { RunnerCanvas } from '../game/RunnerCanvas';
import { sound } from '../game/sound';

interface GameOverInfo {
    score: number;
    distance: number;
    coins: number;
}

interface MainMenuProps {
    highScore: number;
    soundMuted: boolean;
    onToggleSound: () => void;
    onPlay: () => void;
    gameOverInfo?: GameOverInfo | null;
    /** When provided, shows REINTENTAR / MENÚ instead of JUGAR */
    isGameOver?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({
    highScore,
    soundMuted,
    onToggleSound,
    onPlay,
    gameOverInfo,
    isGameOver = false,
}) => {
    const [modal, setModal] = useState<'howto' | 'options' | null>(null);
    const [demoKey] = useState(1); // stable — demo never restarts

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#0c0c0d',
                fontFamily: '"Inter", "Segoe UI", sans-serif',
                color: '#f5f5f4',
            }}
        >
            {/* ── Animated background: game in demo mode ── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.45,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <RunnerCanvas
                    key={demoKey}
                    soundEnabled={false}
                    isPaused={false}
                    demoMode={true}
                />
            </div>

            {/* ── Dark vignette overlay ── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.78) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* ── High score badge (top right) ── */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(251,191,36,0.12)',
                    border: '1.5px solid rgba(251,191,36,0.45)',
                    borderRadius: 40,
                    padding: '8px 18px',
                    backdropFilter: 'blur(6px)',
                }}
            >
                <Trophy size={16} color="#fbbf24" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>
                    RÉCORD: {highScore.toLocaleString()}
                </span>
            </div>

            {/* ── Sound toggle (top left) ── */}
            <button
                onClick={onToggleSound}
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 24,
                    background: 'rgba(28,25,23,0.7)',
                    border: '1.5px solid rgba(87,83,78,0.6)',
                    borderRadius: 40,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    color: soundMuted ? '#f43f5e' : '#34d399',
                    backdropFilter: 'blur(6px)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    transition: 'background 0.2s',
                }}
            >
                {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {soundMuted ? 'SONIDO OFF' : 'SONIDO ON'}
            </button>

            {/* ── Main centered panel ── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                }}
            >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, letterSpacing: '0.4em', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                        Auto-Runner de Boda
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 'clamp(48px, 9vw, 88px)',
                            fontWeight: 900,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f43f5e 50%, #fde68a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'titlePulse 3s ease-in-out infinite',
                            filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.45))',
                            lineHeight: 1,
                        }}
                    >
                        PincheGorda
                    </h1>
                    <div style={{ fontSize: 14, color: '#a8a29e', marginTop: 8, fontStyle: 'italic' }}>
                        ¡Huye de la novia antes de que te aplaste con el rodillo! 👰🎂
                    </div>
                </div>

                {/* ── Game Over recap card ── */}
                {isGameOver && gameOverInfo && (
                    <div
                        style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1.5px solid rgba(239,68,68,0.5)',
                            borderRadius: 16,
                            padding: '18px 32px',
                            marginTop: 18,
                            marginBottom: 4,
                            textAlign: 'center',
                            backdropFilter: 'blur(8px)',
                            minWidth: 280,
                        }}
                    >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>💀</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                            ¡Te Atrapó la Novia!
                        </div>
                        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', fontSize: 13 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#a8a29e', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Puntos</div>
                                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{gameOverInfo.score.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#a8a29e', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Dist.</div>
                                <div style={{ color: '#f87171', fontWeight: 900, fontSize: 22 }}>{gameOverInfo.distance}m</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#a8a29e', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Anillos</div>
                                <div style={{ color: '#f5f5f4', fontWeight: 900, fontSize: 22 }}>💍{gameOverInfo.coins}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Buttons ── */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: isGameOver ? 16 : 32,
                    }}
                >
                    {/* Primary action */}
                    {isGameOver ? (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <MenuButton
                                onClick={onPlay}
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    color: '#1c1917',
                                    fontSize: 18,
                                    padding: '14px 36px',
                                    boxShadow: '0 0 32px rgba(239,68,68,0.4)',
                                }}
                            >
                                🔁 REINTENTAR
                            </MenuButton>
                        </div>
                    ) : (
                        <MenuButton
                            onClick={onPlay}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                color: '#1c1917',
                                fontSize: 20,
                                padding: '16px 56px',
                                boxShadow: '0 0 40px rgba(239,68,68,0.5)',
                                animation: 'playBounce 2.5s ease-in-out infinite',
                            }}
                        >
                            ▶ JUGAR
                        </MenuButton>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <SecondaryButton onClick={() => setModal('howto')}>
                            <HelpCircle size={14} /> Cómo Jugar
                        </SecondaryButton>
                        <SecondaryButton onClick={() => setModal('options')}>
                            <Settings size={14} /> Opciones
                        </SecondaryButton>
                    </div>
                </div>

                {/* Keyboard hint */}
                <div
                    style={{
                        marginTop: 28,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        color: '#78716c',
                    }}
                >
                    <Keyboard size={12} />
                    <span>Espacio / W / ↑ para Saltar · S / ↓ para Deslizar · P para Pausar</span>
                </div>
            </div>

            {/* ── Modal: Cómo Jugar ── */}
            {modal === 'howto' && (
                <Modal title="👰 Manual de Fuga: PincheGorda" onClose={() => setModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, lineHeight: 1.6, color: '#d6d3d1' }}>
                        <Section heading="1. El Peligro">
                            Tu prometida enfurecida corre tras de ti con un rodillo. Si tropiezas, ella gana terreno. ¡Si se acerca demasiado, te atrapa!
                        </Section>
                        <Section heading="2. Obstáculos">
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                <li><b style={{ color: '#f5f5f4' }}>Bajos (pasteles, flores, champán):</b> sáltalos.</li>
                                <li><b style={{ color: '#f5f5f4' }}>Altos (candelabros, guirnaldas, campanas):</b> deslízate bajo ellos.</li>
                                <li><b style={{ color: '#f5f5f4' }}>Ráfagas:</b> secuencias de 2-3 obstáculos seguidos.</li>
                            </ul>
                        </Section>
                        <Section heading="3. Animation Canceling">
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                <li><b style={{ color: '#f5f5f4' }}>Deslizando + Saltar:</b> cancela la barrida y salta al instante.</li>
                                <li><b style={{ color: '#f5f5f4' }}>En el aire + Deslizar:</b> Fast Fall → aterriza y se desliza automáticamente.</li>
                            </ul>
                        </Section>
                        <Section heading="4. Power-Ups">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[
                                    ['🛡️ Escudo', 'Protege de un impacto', '#38bdf8'],
                                    ['🧲 Imán', 'Atrae anillos cercanos', '#f43f5e'],
                                    ['⚡ Turbo', 'Velocidad por 3 s', '#fbbf24'],
                                    ['⭐ x2', 'Doble puntaje por 5 s', '#a855f7'],
                                ].map(([name, desc, color]) => (
                                    <div key={name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                                        <span style={{ color, fontWeight: 700 }}>{name}:</span> {desc}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                    <button
                        onClick={() => setModal(null)}
                        style={primaryBtnStyle}
                    >
                        ¡Entendido, a Correr!
                    </button>
                </Modal>
            )}

            {/* ── Modal: Opciones ── */}
            {modal === 'options' && (
                <Modal title="⚙️ Opciones" onClose={() => setModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Sonido */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Sonido</div>
                                <div style={{ fontSize: 11, color: '#78716c' }}>Efectos y música del juego</div>
                            </div>
                            <button
                                onClick={() => { onToggleSound(); sound.enabled = soundMuted; }}
                                style={{
                                    background: soundMuted ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)',
                                    border: `1.5px solid ${soundMuted ? '#ef4444' : '#34d399'}`,
                                    color: soundMuted ? '#f87171' : '#34d399',
                                    borderRadius: 20,
                                    padding: '6px 16px',
                                    fontWeight: 800,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {soundMuted ? '🔇 OFF' : '🔊 ON'}
                            </button>
                        </div>

                        {/* Controles */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Controles</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#d6d3d1' }}>
                                {[
                                    ['Saltar', 'Espacio / W / ↑'],
                                    ['Deslizar', 'S / ↓'],
                                    ['Pausar', 'P / Escape'],
                                    ['Debug', 'D'],
                                    ['Toque izquierda', 'Deslizar'],
                                    ['Toque derecha', 'Saltar'],
                                ].map(([action, key]) => (
                                    <div key={action} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{ color: '#a8a29e', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{action}</span>
                                        <span style={{ fontWeight: 600, color: '#fbbf24' }}>{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setModal(null)} style={primaryBtnStyle}>Cerrar</button>
                </Modal>
            )}

            {/* Global keyframe styles */}
            <style>{`
        @keyframes titlePulse {
          0%, 100% { filter: drop-shadow(0 0 24px rgba(251,191,36,0.45)); }
          50%       { filter: drop-shadow(0 0 48px rgba(244,63,94,0.7)); }
        }
        @keyframes playBounce {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 40px rgba(239,68,68,0.5); }
          50%       { transform: scale(1.04); box-shadow: 0 0 60px rgba(239,68,68,0.75); }
        }
      `}</style>
        </div>
    );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const MenuButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    style,
    ...props
}) => (
    <button
        {...props}
        style={{
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            ...style,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.04)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
    >
        {children}
    </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    ...props
}) => (
    <button
        {...props}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(28,25,23,0.75)',
            border: '1.5px solid rgba(87,83,78,0.55)',
            color: '#d6d3d1',
            borderRadius: 40,
            padding: '10px 22px',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(87,83,78,0.4)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.5)';
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(28,25,23,0.75)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(87,83,78,0.55)';
        }}
    >
        {children}
    </button>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
    title,
    onClose,
    children,
}) => (
    <div
        style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        }}
        onClick={onClose}
    >
        <div
            style={{
                background: 'linear-gradient(160deg, #1c1917 0%, #0c0a09 100%)',
                border: '1.5px solid rgba(87,83,78,0.55)',
                borderRadius: 20,
                maxWidth: 520,
                width: '100%',
                padding: '28px 28px 24px',
                position: 'relative',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'none',
                    border: 'none',
                    color: '#78716c',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <X size={18} />
            </button>
            <h2 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 900, color: '#fbbf24', letterSpacing: '0.03em' }}>
                {title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        </div>
    </div>
);

const Section: React.FC<{ heading: string; children: React.ReactNode }> = ({ heading, children }) => (
    <div>
        <h4 style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {heading}
        </h4>
        {children}
    </div>
);

const primaryBtnStyle: React.CSSProperties = {
    marginTop: 20,
    width: '100%',
    padding: '12px 0',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: 12,
    color: '#1c1917',
    fontFamily: 'inherit',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
};

export default MainMenu;

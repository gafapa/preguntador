import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n.jsx';

const SHAPES = ['▲', '◆', '●', '■'];

export default function PlayerGameScreen({ navigate, playerConnection, playerName }) {
    const { t } = useLanguage();
    const [phase, setPhase] = useState('waiting');
    const [questionData, setQuestionData] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [disconnected, setDisconnected] = useState(false);

    useEffect(() => {
        if (!playerConnection) return;

        const unsub = playerConnection.on((event, data) => {
            if (event === 'message') {
                handleMessage(data);
            }
            if (event === 'disconnected') {
                setDisconnected(true);
            }
        });

        return () => unsub();
    }, [playerConnection]);

    const handleAnswer = (answerIndex) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answerIndex);
        setPhase('answered');
        playerConnection.send({
            type: 'answer',
            payload: { answerIndex },
        });
    };

    // Keyboard Shortcuts (1, 2, 3, 4)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (phase !== 'question' || !questionData) return;
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1;
                if (questionData.answers[index]) {
                    handleAnswer(index);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, questionData, selectedAnswer]);

    const handleMessage = (msg) => {
        switch (msg.type) {
            case 'countdown':
                setPhase('countdown');
                setSelectedAnswer(null);
                setResultData(null);
                break;
            case 'question':
                setPhase('question');
                setQuestionData(msg.payload);
                setSelectedAnswer(null);
                break;
            case 'result':
                setPhase('result');
                setResultData(msg.payload);
                break;
            case 'leaderboard':
                setPhase('leaderboard');
                setLeaderboardData(msg.payload);
                setMyRank(msg.payload.leaderboard.findIndex(p => p.name === playerName) + 1 || null);
                break;
            case 'game-end':
                setPhase('end');
                setLeaderboardData(msg.payload);
                setMyRank(msg.payload.leaderboard.findIndex(p => p.name === playerName) + 1 || null);
                break;
        }
    };

    const handleLeave = () => {
        playerConnection.destroy();
        navigate('home');
    };

    if (disconnected) {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <div style={{ fontSize: '3rem' }}>😵</div>
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>{t('player.disconnectedTitle') || 'Conexión perdida'}</h2>
                    <p className="subtitle">{t('player.disconnectedSub') || 'Se ha perdido la conexión con el host'}</p>
                    <button className="btn btn-primary btn-large" onClick={handleLeave}>
                        🏠 {t('home.backBtn') || 'Volver al Inicio'}
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'waiting') {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <div style={{ fontSize: '3rem', animation: 'popIn 0.4s var(--ease-bounce)' }}>✅</div>
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>{t('player.in') || '¡Estás dentro!'}</h2>
                    <p className="subtitle">Hola, <strong>{playerName}</strong></p>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('player.waitingLabel')}</p>
                    <div className="dots-loader" style={{ display: 'flex', gap: 8 }}>
                        {[0, 1, 2].map((i) => (
                            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-primary-light)', animation: `popIn 0.6s ${i * 0.2}s var(--ease-bounce) infinite alternate` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'countdown') {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <div style={{ fontSize: '3rem' }}>⏳</div>
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>{t('player.getReady')}</h2>
                    <p className="subtitle">{t('player.nextQuestionLabel') || 'La siguiente pregunta está a punto de aparecer'}</p>
                </div>
            </div>
        );
    }

    if (phase === 'question' && questionData) {
        return (
            <div className="screen" style={{ justifyContent: 'center', padding: 'var(--space-md)' }}>
                <div className="flex-col items-center gap-lg w-full" style={{ maxWidth: 600 }}>
                    <p style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        {t('home.question')} {questionData.index + 1} / {questionData.total}
                    </p>
                    <div className="answer-grid w-full">
                        {questionData.answers.map((text, i) => (
                            text && (
                                <button
                                    className={`answer-btn answer-${i}`}
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                >
                                    <span className="answer-shape">{SHAPES[i]}</span>
                                    {text}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'answered') {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <div className={`answer-btn answer-${selectedAnswer}`} style={{ width: 120, height: 120, borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-3xl)', cursor: 'default' }}>
                        <span className="answer-shape" style={{ fontSize: 'var(--text-3xl)' }}>{SHAPES[selectedAnswer]}</span>
                    </div>
                    <p className="subtitle">{t('player.sent') || '¡Respuesta enviada!'}</p>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('player.waitingOthers')}</p>
                </div>
            </div>
        );
    }

    if (phase === 'result' && resultData) {
        return (
            <div className="screen">
                <div className={`feedback-overlay ${resultData.correct ? 'correct' : 'incorrect'}`}>
                    <div className="feedback-icon">{resultData.correct ? '🎉' : '😢'}</div>
                    <div className="feedback-text">{resultData.correct ? t('player.correct') : t('player.incorrect')}</div>
                    {resultData.correct && (
                        <div className="feedback-points">+{resultData.points} {t('game.points')}</div>
                    )}
                    {resultData.streak > 1 && (
                        <div style={{ color: 'var(--color-yellow)', fontWeight: 700, marginTop: 'var(--space-sm)' }}>
                            🔥 {t('player.streak') || 'Racha de'} {resultData.streak}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (phase === 'leaderboard' && leaderboardData) {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>📊 {t('player.leaderboard') || 'Clasificación'}</h2>
                    {myRank && (
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{t('player.rank') || 'Tu posición'}</p>
                            <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--color-primary-light)' }}>#{myRank}</p>
                        </div>
                    )}
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('player.waitingNext') || 'Esperando siguiente pregunta...'}</p>
                </div>
            </div>
        );
    }

    if (phase === 'end') {
        const podiumEmojis = ['🥇', '🥈', '🥉'];
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <h2 className="title title-gradient" style={{ fontSize: 'var(--text-2xl)' }}>🏆 {t('player.gameEnded')}</h2>
                    {myRank && (
                        <div className="glass-card">
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{t('player.finalRank') || 'Tu posición final'}</p>
                            <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 900 }}>
                                {myRank <= 3 ? podiumEmojis[myRank - 1] : `#${myRank}`}
                            </p>
                        </div>
                    )}
                    <button className="btn btn-primary btn-large" onClick={handleLeave}>
                        🏠 {t('home.backBtn') || 'Volver al Inicio'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

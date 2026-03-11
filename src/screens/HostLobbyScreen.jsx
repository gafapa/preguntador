import React, { useState, useEffect, useRef } from 'react';
import { getQuiz } from '../game/QuizStore.js';
import { GameEngine } from '../game/GameEngine.js';
import { isQuizPlayable } from '../game/QuizSchema.js';
import { HostConnection } from '../network/HostConnection.js';
import { useLanguage } from '../i18n.jsx';
import { QRCodeCanvas } from 'qrcode.react';

export default function HostLobbyScreen({ navigate, quizId }) {
    const { t } = useLanguage();
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [status, setStatus] = useState('...');
    const [error, setError] = useState('');

    const hostRef = useRef(null);
    const engineRef = useRef(null);
    const quizRef = useRef(null);

    const isStartingRef = useRef(false);

    useEffect(() => {
        const quiz = getQuiz(quizId);
        if (!quiz) {
            setError(t('lobby.errorMissingQuiz'));
            return;
        }
        if (!isQuizPlayable(quiz)) {
            setError(t('lobby.errorInvalidQuiz'));
            return;
        }
        quizRef.current = quiz;

        const host = new HostConnection();
        const engine = new GameEngine(quiz);
        hostRef.current = host;
        engineRef.current = engine;

        // Listen for host events
        host.on((event, data) => {
            if (event === 'room-created') {
                setRoomCode(data.code);
                setStatus(t('lobby.waiting'));
            }
            if (event === 'message' && data.type === 'player-join') {
                const added = engine.addPlayer(data.peerId, data.payload.name);
                if (added) {
                    setPlayers(engine.getPlayerList());
                    host.sendTo(data.peerId, {
                        type: 'join-confirmed',
                        payload: { name: data.payload.name, playerId: data.peerId },
                    });
                } else {
                    host.sendTo(data.peerId, {
                        type: 'join-rejected',
                        payload: { code: 'game-in-progress' },
                    });
                }
            }
            if (event === 'player-disconnected') {
                engine.removePlayer(data.peerId);
                setPlayers(engine.getPlayerList());
            }
            if (event === 'error') {
                setError(t('lobby.errorGeneric'));
            }
        });

        host.create().catch((err) => {
            setError(err?.message ? `${t('lobby.errorGeneric')}: ${err.message}` : t('lobby.errorGeneric'));
        });

        return () => {
            if (!isStartingRef.current) {
                host.destroy();
                engine.destroy();
            }
        };
    }, [quizId]);

    const handleStart = () => {
        if (players.length === 0) return;
        isStartingRef.current = true;
        navigate('host-game', {
            quiz: quizRef.current,
            hostConnection: hostRef.current,
            gameEngine: engineRef.current,
        });
    };

    const joinUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    joinUrl.searchParams.set('code', roomCode);

    return (
        <div className="screen">
            <div className="flex-col items-center gap-xl text-center" style={{ maxWidth: 600 }}>
                {error ? (
                    <>
                        <div style={{ fontSize: '3rem' }}>❌</div>
                        <p style={{ color: 'var(--color-red)', fontWeight: 700 }}>{error}</p>
                        <button className="btn btn-secondary" onClick={() => navigate('home')}>{t('lobby.backBtn')}</button>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="subtitle" style={{ marginBottom: 'var(--space-sm)' }}>{status}</p>
                            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                {quizRef.current?.title}
                            </h2>
                        </div>

                        {roomCode && (
                            <>
                                <div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                        {t('lobby.roomCode')}
                                    </p>
                                    <div className="room-code" style={{ marginBottom: 'var(--space-md)' }}>{roomCode}</div>
                                    <div style={{ background: '#fff', padding: 10, borderRadius: 8, display: 'inline-block' }}>
                                        <QRCodeCanvas value={joinUrl.toString()} size={160} />
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                    <p>{t('lobby.joinHint', { url: joinUrl.toString() })}</p>
                                </div>
                            </>
                        )}

                        {players.length > 0 && (
                            <div className="flex-col items-center gap-md w-full">
                                <p style={{ fontWeight: 700 }}>
                                    {t('lobby.players')} ({players.length})
                                </p>
                                <div className="player-list">
                                    {players.map((p) => (
                                        <div className="player-chip" key={p.id}>
                                            <div className="avatar" style={{ background: p.color }}>{p.name[0].toUpperCase()}</div>
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-row gap-md">
                            <button className="btn btn-secondary" onClick={() => navigate('home')}>{t('lobby.backBtn')}</button>
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleStart}
                                disabled={players.length === 0}
                            >
                                {t('lobby.startBtn')} ({players.length})
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

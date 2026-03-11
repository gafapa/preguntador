import React, { useState } from 'react';
import { PlayerConnection } from '../network/PlayerConnection.js';
import { useLanguage } from '../i18n.jsx';

export default function JoinScreen({ navigate }) {
    const { t } = useLanguage();
    const [code, setCode] = useState(() => {
        const urlParams = new URL(window.location.href).searchParams;
        return (urlParams.get('code') || '').toUpperCase().slice(0, 6);
    });
    const [name, setName] = useState(() => localStorage.getItem('preguntador_playerName') || '');
    const [status, setStatus] = useState('');
    const [connecting, setConnecting] = useState(false);

    const handleJoin = async () => {
        if (!code.trim() || !name.trim()) return;
        setConnecting(true);
        setStatus(t('join.connecting'));

        const playerConnection = new PlayerConnection();
        const finalName = name.trim();
        localStorage.setItem('preguntador_playerName', finalName);

        try {
            const { playerId } = await playerConnection.connect(code.trim(), finalName);
            setStatus(t('join.connected'));
            navigate('player-game', { playerConnection, playerName: finalName, playerId });
        } catch (err) {
            setStatus('');
            setConnecting(false);
            alert(`${t('join.errorPrefix')}: ${getJoinErrorMessage(t, err)}`);
            playerConnection.destroy();
        }
    };

    const handleCodeChange = (e) => {
        const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setCode(v);
    };

    return (
        <div className="screen">
            <div className="flex-col items-center gap-xl text-center max-w-sm">
                <div>
                    <div style={{ fontSize: '3rem' }}>🎮</div>
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>{t('join.title')}</h2>
                </div>

                <div className="flex-col gap-md w-full">
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>
                            {t('join.codeLabel')}
                        </label>
                        <input
                            className="input input-code"
                            placeholder={t('join.codePlaceholder')}
                            value={code}
                            onChange={handleCodeChange}
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', textAlign: 'left', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>
                            {t('join.nameLabel')}
                        </label>
                        <input
                            className="input"
                            placeholder={t('join.namePlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 20))}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                    </div>
                </div>

                {status && (
                    <p style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>{status}</p>
                )}

                <div className="flex-col gap-md w-full">
                    <button
                        className="btn btn-primary btn-large btn-block"
                        onClick={handleJoin}
                        disabled={!code.trim() || !name.trim() || connecting}
                    >
                        {connecting ? t('join.connecting') : t('join.joinBtn')}
                    </button>
                    <button className="btn btn-secondary btn-block" onClick={() => navigate('home')}>
                        {t('join.backBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
}

function getJoinErrorMessage(t, error) {
    const errorCode = error?.code || error?.type;

    switch (errorCode) {
        case 'peer-unavailable':
        case 'peer-unavailable-id':
        case 'unavailable-id':
            return t('join.errorInvalidCode');
        case 'game-in-progress':
            return t('join.errorGameInProgress');
        case 'join-rejected':
            return t('join.errorRejected');
        case 'connection-closed':
            return t('join.errorConnectionClosed');
        case 'connection-timeout':
            return t('join.errorTimeout');
        default:
            return t('join.errorUnknown');
    }
}

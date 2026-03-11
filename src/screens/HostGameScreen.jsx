import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../game/GameEngine.js';
import { useLanguage } from '../i18n.jsx';

const SHAPES = ['▲', '◆', '●', '■'];
const ANSWER_COLORS = ['var(--color-red)', 'var(--color-blue)', 'var(--color-yellow)', 'var(--color-green)'];

export default function HostGameScreen({ navigate, quiz, hostConnection, gameEngine }) {
    const { t } = useLanguage();
    const [phase, setPhase] = useState('starting'); // starting, countdown, question, results, leaderboard, end
    const [questionData, setQuestionData] = useState(null);
    const [resultsData, setResultsData] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timeTotal, setTimeTotal] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [countdownNum, setCountdownNum] = useState(3);

    const advanceTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    useEffect(() => {
        if (!gameEngine || !hostConnection) return;

        const unsubHost = hostConnection.on((event, data) => {
            if (event === 'message' && data.type === 'answer') {
                gameEngine.receiveAnswer(data.peerId, data.payload.answerIndex);
            }
        });

        const unsubEngine = gameEngine.on((event, data) => {
            if (event === 'state-change') {
                switch (data.state) {
                    case GameState.COUNTDOWN: {
                        clearInterval(countdownIntervalRef.current);
                        setPhase('countdown');
                        setCountdownNum(3);
                        hostConnection.broadcast({ type: 'countdown', payload: { questionIndex: data.questionIndex, total: quiz.questions.length } });
                        let c = 3;
                        countdownIntervalRef.current = setInterval(() => {
                            c--;
                            setCountdownNum(c);
                            if (c <= 0) {
                                clearInterval(countdownIntervalRef.current);
                                countdownIntervalRef.current = null;
                            }
                        }, 1000);
                        break;
                    }
                    case GameState.QUESTION: {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                        setPhase('question');
                        setQuestionData(data.question);
                        setTimeRemaining(data.question.timeLimit);
                        setTimeTotal(data.question.timeLimit);
                        setAnsweredCount(0);
                        hostConnection.broadcast({
                            type: 'question',
                            payload: {
                                answers: data.question.answers,
                                timeLimit: data.question.timeLimit,
                                index: data.question.index,
                                total: data.question.total,
                            },
                        });
                        break;
                    }
                    case GameState.RESULTS: {
                        setPhase('results');
                        setResultsData(data.results);
                        data.results.playerResults.forEach((pr) => {
                            hostConnection.sendTo(pr.peerId, {
                                type: 'result',
                                payload: { correct: pr.correct, points: pr.points, streak: pr.streak },
                            });
                        });
                        advanceTimerRef.current = setTimeout(() => {
                            gameEngine.showLeaderboard();
                        }, 5000);
                        break;
                    }
                    case GameState.LEADERBOARD: {
                        setPhase('leaderboard');
                        setLeaderboardData(data);
                        hostConnection.broadcast({
                            type: 'leaderboard',
                            payload: { leaderboard: data.leaderboard, isLast: data.isLast },
                        });
                        break;
                    }
                    case GameState.END: {
                        setPhase('end');
                        const finalLeaderboard = gameEngine.getLeaderboard();
                        setLeaderboardData({ leaderboard: finalLeaderboard, isLast: true });
                        hostConnection.broadcast({
                            type: 'game-end',
                            payload: { leaderboard: finalLeaderboard },
                        });
                        spawnConfetti();
                        break;
                    }
                }
            }
            if (event === 'timer-tick') {
                setTimeRemaining(data.remaining);
            }
            if (event === 'answer-received') {
                setAnsweredCount(data.totalAnswers);
            }
        });

        gameEngine.startGame();

        return () => {
            unsubHost();
            unsubEngine();
            clearTimeout(advanceTimerRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, [gameEngine, hostConnection, quiz]);

    const handleNext = () => {
        clearTimeout(advanceTimerRef.current);
        if (phase === 'results') {
            gameEngine.showLeaderboard();
        } else if (phase === 'leaderboard') {
            gameEngine.nextQuestion();
        }
    };

    const handleEndGame = () => {
        hostConnection.broadcast({ type: 'game-end', payload: { leaderboard: gameEngine.getLeaderboard() } });
        hostConnection.destroy();
        gameEngine.destroy();
        navigate('home');
    };

    if (phase === 'starting' || phase === 'countdown') {
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center">
                    <p className="subtitle">{t('game.ready')}</p>
                    <div className="timer-number" style={{ fontSize: 'var(--text-5xl)', animation: 'popIn 0.4s var(--ease-bounce)' }} key={countdownNum}>
                        {countdownNum > 0 ? countdownNum : t('game.go')}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'question' && questionData) {
        const fraction = timeRemaining / timeTotal;
        return (
            <div className="screen" style={{ justifyContent: 'space-between', padding: 'var(--space-lg)', overflow: 'hidden' }}>
                <div className="w-full flex-col gap-md items-center" style={{ flexShrink: 0 }}>
                    <div className="flex-row items-center gap-md w-full" style={{ justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>
                            {questionData.index + 1} / {questionData.total}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>
                            {answeredCount} / {gameEngine.players.size} {t('game.answers')}
                        </span>
                    </div>
                    <div className="timer-bar w-full">
                        <div className="timer-bar-fill" style={{ width: `${fraction * 100}%` }} />
                    </div>
                </div>

                <div className="flex-col items-center gap-sm text-center w-full" style={{ flex: 1, justifyContent: 'center', minHeight: 0, overflow: 'hidden', padding: 'var(--space-sm) 0' }}>
                    <div className="flex-col gap-sm items-center" style={{ flexShrink: 0 }}>
                        <div className="timer-number" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, padding: 0, fontSize: 'var(--text-2xl)' }}>{timeRemaining}</div>
                        <h2 className="title" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>{questionData.text}</h2>
                    </div>
                    {questionData.image && (
                        <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 'var(--space-sm)' }}>
                            <img src={questionData.image} alt={t('game.questionImageAlt')} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }} />
                        </div>
                    )}
                </div>

                <div className="answer-grid" style={{ flexShrink: 0 }}>
                    {questionData.answers.map((text, i) => (
                        text && (
                            <div className={`answer-btn answer-${i}`} key={i} style={{ cursor: 'default' }}>
                                <span className="answer-shape">{SHAPES[i]}</span>
                                {text}
                            </div>
                        )
                    ))}
                </div>
            </div>
        );
    }

    if (phase === 'results' && resultsData) {
        const maxCount = Math.max(1, ...resultsData.answerCounts);
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center" style={{ maxWidth: 700, width: '100%' }}>
                    <h2 className="title" style={{ fontSize: 'var(--text-2xl)' }}>{t('game.results')}</h2>
                    <div className="results-chart">
                        {resultsData.answers.map((text, i) => (
                            text && (
                                <div className="results-bar-wrapper" key={i}>
                                    <span className="results-bar-count">{resultsData.answerCounts[i]}</span>
                                    <div
                                        className="results-bar"
                                        style={{ height: `${(resultsData.answerCounts[i] / maxCount) * 100}%`, background: ANSWER_COLORS[i], opacity: i === resultsData.correctIndex ? 1 : 0.4 }}
                                    />
                                    <span className="results-bar-label">
                                        {i === resultsData.correctIndex ? '✅ ' : ''}{SHAPES[i]} {text}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>

                    <button className="btn btn-primary btn-large" onClick={handleNext}>
                        {t('game.next')}
                    </button>
                </div>
            </div>
        );
    }

    if ((phase === 'leaderboard' || phase === 'end') && leaderboardData) {
        const { leaderboard, isLast } = leaderboardData;
        const podiumEmojis = ['🥇', '🥈', '🥉'];
        return (
            <div className="screen">
                <div className="flex-col items-center gap-xl text-center" style={{ maxWidth: 500, width: '100%' }}>
                    <h2 className="title title-gradient" style={{ fontSize: 'var(--text-2xl)' }}>
                        {phase === 'end' ? t('game.finalResults') : t('player.leaderboard')}
                    </h2>

                    <div className="leaderboard">
                        {leaderboard.slice(0, 10).map((p, i) => (
                            <div className={`leaderboard-row ${i < 3 ? `podium-${i + 1}` : ''}`} key={p.id} style={{ animationDelay: `${i * 0.1}s` }}>
                                <span className="leaderboard-rank">{i < 3 ? podiumEmojis[i] : i + 1}</span>
                                <span className="leaderboard-name">{p.name}</span>
                                <span className="leaderboard-score">{p.score}</span>
                            </div>
                        ))}
                    </div>

                    {phase !== 'end' ? (
                        <button className="btn btn-primary btn-large" onClick={handleNext}>
                            {t('game.nextQuestion')}
                        </button>
                    ) : (
                        <button className="btn btn-primary btn-large" onClick={handleEndGame}>
                            🏠 {t('home.backBtn')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}

function spawnConfetti() {
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#e84393', '#6c5ce7', '#ffd32a'];
    for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = (2 + Math.random() * 3) + 's';
        el.style.animationDelay = Math.random() * 2 + 's';
        el.style.width = (6 + Math.random() * 8) + 'px';
        el.style.height = (6 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 6000);
    }
}

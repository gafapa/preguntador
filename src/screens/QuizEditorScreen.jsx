import React, { useState, useEffect } from 'react';
import { getQuiz, saveQuiz, createDefaultQuiz } from '../game/QuizStore.js';
import { coerceQuizShape, isQuizPlayable } from '../game/QuizSchema.js';
import { useLanguage } from '../i18n.jsx';

const TIME_OPTIONS = [10, 15, 20, 30];
const SHAPES = ['▲', '◆', '●', '■'];

export default function QuizEditorScreen({ navigate, quizId }) {
    const [quiz, setQuiz] = useState(() => {
        if (quizId) {
            const existing = getQuiz(quizId);
            if (existing) return coerceQuizShape(existing, { id: existing.id });
        }
        return createDefaultQuiz();
    });

    const [activeQIdx, setActiveQIdx] = useState(0);

    const updateQuiz = (updates) => {
        setQuiz((prev) => ({ ...prev, ...updates }));
    };

    const updateQuestion = (qIdx, updates) => {
        setQuiz((prev) => {
            const questions = [...prev.questions];
            questions[qIdx] = { ...questions[qIdx], ...updates };
            return { ...prev, questions };
        });
    };

    const updateAnswer = (qIdx, aIdx, text) => {
        setQuiz((prev) => {
            const questions = [...prev.questions];
            const answers = [...questions[qIdx].answers];
            answers[aIdx] = { ...answers[aIdx], text };
            questions[qIdx] = { ...questions[qIdx], answers };
            return { ...prev, questions };
        });
    };

    const setCorrect = (qIdx, aIdx) => {
        setQuiz((prev) => {
            const questions = [...prev.questions];
            const answers = questions[qIdx].answers.map((a, i) => ({ ...a, correct: i === aIdx }));
            questions[qIdx] = { ...questions[qIdx], answers };
            return { ...prev, questions };
        });
    };

    const addQuestion = () => {
        setQuiz((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: '',
                    image: '',
                    answers: [
                        { text: '', correct: true },
                        { text: '', correct: false },
                        { text: '', correct: false },
                        { text: '', correct: false },
                    ],
                    timeLimit: 20,
                },
            ],
        }));
        setActiveQIdx(quiz.questions.length);
    };

    const removeQuestion = (qIdx) => {
        if (quiz.questions.length <= 1) return;
        setQuiz((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== qIdx),
        }));
        if (activeQIdx >= quiz.questions.length - 1) {
            setActiveQIdx(Math.max(0, quiz.questions.length - 2));
        }
    };

    const handleImageUpload = (qIdx, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxDim = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                updateQuestion(qIdx, { image: dataUrl });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        saveQuiz(quiz);
    }, [quiz]);

    const handlePlay = () => {
        navigate('host-lobby', { quizId: quiz.id });
    };

    const { t } = useLanguage();

    const isValid = isQuizPlayable(quiz);

    const activeQ = quiz.questions[activeQIdx];

    return (
        <div className="quiz-editor-layout">
            {/* Sidebar */}
            <div className="quiz-editor-sidebar">
                <div className="flex-row items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => navigate('home')} title={t('app.title')}>←</button>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-secondary btn-icon" onClick={addQuestion} title={t('editor.addQuestion')}>➕</button>
                    <button className="btn btn-primary btn-icon" onClick={handlePlay} title={t('home.play')} disabled={!isValid}>▶</button>
                </div>

                <input
                    className="input"
                    placeholder={t('editor.quizTitle') + "..."}
                    value={quiz.title}
                    onChange={(e) => updateQuiz({ title: e.target.value })}
                    style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}
                />

                <div className="flex-col gap-sm mt-md" style={{ flex: 1, overflowY: 'auto' }}>
                    {quiz.questions.map((q, idx) => (
                        <div
                            key={idx}
                            className={`sidebar-question-item ${activeQIdx === idx ? 'active' : ''}`}
                            onClick={() => setActiveQIdx(idx)}
                        >
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {idx + 1}. {q.text || t('editor.question')}
                            </span>
                            {quiz.questions.length > 1 && (
                                <button
                                    className="btn btn-icon"
                                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                                    title={t('editor.removeQuestion')}
                                    style={{ background: 'transparent', color: 'var(--color-text-muted)', width: 24, height: 24, fontSize: '0.8rem' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="quiz-editor-main" style={{ justifyContent: 'center' }}>
                {activeQ && (
                    <div className="question-card" style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%' }}>
                        <div className="question-header">
                            <span className="question-number">{t('editor.question')} {activeQIdx + 1}</span>
                            <div className="flex-row gap-sm items-center">
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t('editor.timeLimit')}</span>
                                <div className="time-selector">
                                    {TIME_OPTIONS.map((time) => (
                                        <button
                                            key={time}
                                            className={`time-option ${activeQ.timeLimit === time ? 'active' : ''}`}
                                            onClick={() => updateQuestion(activeQIdx, { timeLimit: time })}
                                        >
                                            {time}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <input
                            className="input"
                            placeholder={t('editor.question') + "..."}
                            value={activeQ.text}
                            onChange={(e) => updateQuestion(activeQIdx, { text: e.target.value })}
                            style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}
                        />

                        <div className="flex-col gap-sm w-full">
                            <div className="flex-row items-center gap-md">
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        className="input"
                                        placeholder={t('editor.imageUrl')}
                                        value={activeQ.image && !activeQ.image.startsWith('data:image') ? activeQ.image : ''}
                                        onChange={(e) => updateQuestion(activeQIdx, { image: e.target.value })}
                                        style={{ paddingRight: 'var(--space-2xl)' }}
                                    />
                                    {activeQ.image && (
                                        <button
                                            className="btn btn-icon"
                                            onClick={() => updateQuestion(activeQIdx, { image: '' })}
                                            style={{
                                                position: 'absolute',
                                                right: 'var(--space-xs)',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                color: 'var(--color-text-muted)'
                                            }}
                                            title={t('editor.removeImage')}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <label className="btn btn-secondary btn-icon" style={{ flexShrink: 0, textAlign: 'center', cursor: 'pointer', margin: 0 }} title={t('editor.uploadImage')}>
                                    🖼️
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageUpload(activeQIdx, e.target.files[0])}
                                    />
                                </label>
                            </div>
                        </div>

                        {activeQ.image ? (
                            <div style={{ width: '100%', height: 200, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-bg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={activeQ.image} alt={t('editor.imagePreviewAlt')} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: 200, borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-muted)', gap: 'var(--space-sm)', background: 'var(--color-bg-glass)', opacity: 0.6 }}>
                                <span style={{ fontSize: '2rem' }}>🖼️</span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t('editor.noImage')}</span>
                            </div>
                        )}

                        <div className="answer-editor-grid">
                            {activeQ.answers.map((a, aIdx) => (
                                <div className={`answer-editor-item a-${aIdx}`} key={aIdx}>
                                    <input
                                        type="radio"
                                        name={`correct-${activeQIdx}`}
                                        checked={a.correct}
                                        onChange={() => setCorrect(activeQIdx, aIdx)}
                                    />
                                    <span className="answer-shape">{SHAPES[aIdx]}</span>
                                    <input
                                        type="text"
                                        placeholder={t('editor.answerPlaceholder', { number: aIdx + 1 })}
                                        value={a.text}
                                        onChange={(e) => updateAnswer(activeQIdx, aIdx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

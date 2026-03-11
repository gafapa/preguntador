import React from 'react';
import { loadQuizzes, deleteQuiz, saveQuiz, generateId } from '../game/QuizStore.js';
import { isQuizPlayable, parseImportedQuiz } from '../game/QuizSchema.js';
import { useLanguage } from '../i18n.jsx';
import { useTheme } from '../ThemeProvider.jsx';

export default function HomeScreen({ navigate }) {
    const [quizzes, setQuizzes] = React.useState(() => loadQuizzes());
    const { t, language, changeLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm(t('home.deleteConfirm'))) {
            deleteQuiz(id);
            setQuizzes(loadQuizzes());
        }
    };

    const handleExport = (q, e) => {
        e.stopPropagation();
        const exportData = { ...q };
        delete exportData.id;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${q.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedQuiz = parseImportedQuiz(JSON.parse(event.target.result), generateId);
                saveQuiz(importedQuiz);
                setQuizzes(loadQuizzes());
            } catch {
                alert(t('home.importError'));
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const [showGptModal, setShowGptModal] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [gptInput, setGptInput] = React.useState('');
    const promptText = t('home.aiPromptTemplate');

    const handleCopyPrompt = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(promptText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleCreateFromGpt = () => {
        try {
            const importedQuiz = parseImportedQuiz(JSON.parse(gptInput), generateId);
            saveQuiz(importedQuiz);
            setQuizzes(loadQuizzes());
            setShowGptModal(false);
            setGptInput('');
            navigate('editor', { quizId: importedQuiz.id });
        } catch {
            alert(t('home.aiJsonError'));
        }
    };

    return (
        <div className="screen">
            {/* Top Right Controls */}
            <div className="nav-controls">
                <select
                    className="nav-select"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    <option value="es">{t('language.es')}</option>
                    <option value="en">{t('language.en')}</option>
                    <option value="gl">{t('language.gl')}</option>
                </select>
                <button className="nav-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? '🌞' : '🌙'}
                </button>
            </div>

            <div className="flex-col items-center gap-xl text-center" style={{ maxWidth: 500, width: '100%', paddingBottom: 60 }}>
                <div className="flex-col items-center gap-md">
                    <div style={{ fontSize: '4rem' }}>🧠</div>
                    <h1 className="title title-gradient">{t('app.title')}</h1>
                    <p className="subtitle">{t('app.subtitle')}</p>
                </div>

                <div className="flex-col gap-md w-full">
                    <button className="btn btn-primary btn-large btn-block" onClick={() => navigate('editor')}>
                        {t('home.createQuiz')}
                    </button>
                    <label className="btn btn-secondary btn-block" style={{ cursor: 'pointer' }}>
                        {t('home.importQuiz')}
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                    </label>
                    <button className="btn btn-secondary btn-large btn-block" onClick={() => navigate('join')} style={{ marginTop: 'var(--space-md)' }}>
                        {t('home.joinGame')}
                    </button>
                </div>

                {quizzes.length > 0 && (
                    <div className="w-full mt-lg">
                        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)', textAlign: 'left' }}>
                            {t('home.myQuizzes')}
                        </h3>
                        <div className="quiz-list">
                            {quizzes.map((q) => {
                                const canPlay = isQuizPlayable(q);
                                return (
                                <div className="quiz-list-item" key={q.id} onClick={() => navigate('editor', { quizId: q.id })}>
                                    <div className="quiz-list-item-info" style={{ textAlign: 'left' }}>
                                        <div className="quiz-list-item-title">{q.title}</div>
                                        <div className="quiz-list-item-meta">
                                            {q.questions.length} {q.questions.length === 1 ? t('home.question') : t('home.questions')}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-icon"
                                        title={canPlay ? t('home.play') : t('home.invalidQuizTitle')}
                                        disabled={!canPlay}
                                        onClick={(e) => { e.stopPropagation(); navigate('host-lobby', { quizId: q.id }); }}
                                    >
                                        ▶
                                    </button>
                                    <button className="btn btn-secondary btn-icon" title={t('home.edit')}
                                        onClick={(e) => { e.stopPropagation(); navigate('editor', { quizId: q.id }); }}>✏️</button>
                                    <button className="btn btn-secondary btn-icon" title={t('home.export')}
                                        onClick={(e) => handleExport(q, e)}>💾</button>
                                    <button className="btn btn-icon" title={t('home.delete')}
                                        style={{ background: 'rgba(231,76,60,0.15)', color: 'var(--color-red)' }}
                                        onClick={(e) => handleDelete(q.id, e)}>🗑️</button>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ChatGPT Prompt Generator Button in Bottom Right */}
            <button
                className="btn btn-secondary"
                onClick={() => setShowGptModal(true)}
                style={{ position: 'fixed', bottom: 'var(--space-md)', right: 'var(--space-md)', fontSize: '0.85rem', padding: 'var(--space-sm) var(--space-md)', zIndex: 100 }}
            >
                🤖 {t('home.chatgptPrompt')}
            </button>

            {/* Modal for Prompt Copying */}
            {showGptModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
                }} onClick={() => setShowGptModal(false)}>
                    <div style={{
                        background: 'var(--color-bg)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)',
                        width: '100%', maxWidth: 600, border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-lg)'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="flex-row items-center" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>🤖 {t('home.aiTitle')}</h3>
                            <button className="btn btn-icon btn-secondary" onClick={() => setShowGptModal(false)} style={{ border: 'none' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                            {t('home.aiStep1')}
                        </p>
                        <div style={{
                            background: 'var(--color-bg-card)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                            fontFamily: 'monospace', fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap', maxHeight: '20vh',
                            overflowY: 'auto', border: '1px solid var(--color-border)', marginBottom: 'var(--space-md)'
                        }}>
                            {promptText}
                        </div>
                        <button className={`btn btn-block ${copied ? 'btn-primary' : 'btn-secondary'}`} onClick={handleCopyPrompt} style={{ marginBottom: 'var(--space-xl)' }}>
                            {copied ? t('home.aiCopied') : t('home.aiCopy')}
                        </button>

                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                            {t('home.aiStep2')}
                        </p>
                        <textarea
                            className="input"
                            style={{ width: '100%', height: '120px', resize: 'vertical', fontFamily: 'monospace', marginBottom: 'var(--space-md)' }}
                            placeholder={t('home.aiPlaceholder')}
                            value={gptInput}
                            onChange={(e) => setGptInput(e.target.value)}
                        />
                        <button className="btn btn-primary btn-block btn-large" onClick={handleCreateFromGpt} disabled={!gptInput.trim()} style={{ background: 'linear-gradient(135deg, var(--color-primary), #a29bfe)', border: 'none' }}>
                            {t('home.aiCreate')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

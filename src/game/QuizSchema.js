const DEFAULT_TIME_LIMIT = 20;
const MIN_TIME_LIMIT = 5;
const MAX_TIME_LIMIT = 120;
const ANSWER_COUNT = 4;

function toText(value) {
    return typeof value === 'string' ? value : '';
}

function normalizeTimeLimit(value) {
    if (!Number.isFinite(value)) {
        return DEFAULT_TIME_LIMIT;
    }

    const rounded = Math.round(value);
    if (rounded < MIN_TIME_LIMIT || rounded > MAX_TIME_LIMIT) {
        return DEFAULT_TIME_LIMIT;
    }

    return rounded;
}

function normalizeAnswers(rawAnswers) {
    const source = Array.isArray(rawAnswers) ? rawAnswers.slice(0, ANSWER_COUNT) : [];
    const answers = source.map((answer) => ({
        text: toText(answer?.text),
        correct: Boolean(answer?.correct),
    }));

    while (answers.length < ANSWER_COUNT) {
        answers.push({ text: '', correct: false });
    }

    const correctIndex = answers.findIndex((answer) => answer.correct);
    const finalCorrectIndex = correctIndex >= 0 ? correctIndex : 0;

    return answers.map((answer, index) => ({
        ...answer,
        correct: index === finalCorrectIndex,
    }));
}

function normalizeQuestion(question) {
    return {
        text: toText(question?.text),
        image: toText(question?.image),
        answers: normalizeAnswers(question?.answers),
        timeLimit: normalizeTimeLimit(question?.timeLimit),
    };
}

export function coerceQuizShape(quiz, options = {}) {
    const questions = Array.isArray(quiz?.questions) && quiz.questions.length > 0
        ? quiz.questions.map(normalizeQuestion)
        : [normalizeQuestion({})];

    return {
        id: typeof quiz?.id === 'string' && quiz.id ? quiz.id : (options.id ?? ''),
        title: toText(quiz?.title),
        questions,
    };
}

export function parseImportedQuiz(quiz, generateId) {
    if (!quiz || typeof quiz !== 'object' || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error('invalid-quiz-format');
    }

    const normalizedQuiz = coerceQuizShape(quiz, { id: generateId() });
    normalizedQuiz.title = normalizedQuiz.title.trim();

    if (!normalizedQuiz.title) {
        throw new Error('invalid-quiz-format');
    }

    return normalizedQuiz;
}

export function isQuizPlayable(quiz) {
    if (!quiz?.title?.trim() || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return false;
    }

    return quiz.questions.every((question) => (
        question?.text?.trim()
        && Array.isArray(question.answers)
        && question.answers.filter((answer) => answer?.text?.trim()).length >= 2
        && question.answers.some((answer) => answer?.correct && answer?.text?.trim())
    ));
}

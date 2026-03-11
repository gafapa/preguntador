/**
 * QuizStore — CRUD de quizzes en localStorage
 */
import { coerceQuizShape } from './QuizSchema.js';

const STORAGE_KEY = 'preguntador_quizzes';

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function createDefaultQuiz() {
  return {
    id: generateId(),
    title: 'Nuevo Quiz',
    questions: [
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
  };
}

export function loadQuizzes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const quizzes = data ? JSON.parse(data) : [];
    if (!Array.isArray(quizzes)) return [];
    return quizzes.map((quiz) => coerceQuizShape(quiz, { id: generateId() }));
  } catch {
    return [];
  }
}

export function saveQuizzes(quizzes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

export function getQuiz(id) {
  return loadQuizzes().find((q) => q.id === id) || null;
}

export function saveQuiz(quiz) {
  const normalizedQuiz = coerceQuizShape(quiz, { id: quiz?.id || generateId() });
  const quizzes = loadQuizzes();
  const idx = quizzes.findIndex((q) => q.id === normalizedQuiz.id);
  if (idx >= 0) {
    quizzes[idx] = normalizedQuiz;
  } else {
    quizzes.push(normalizedQuiz);
  }
  saveQuizzes(quizzes);
}

export function deleteQuiz(id) {
  const quizzes = loadQuizzes().filter((q) => q.id !== id);
  saveQuizzes(quizzes);
}

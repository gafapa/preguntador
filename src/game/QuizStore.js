/**
 * QuizStore — CRUD de quizzes en localStorage
 */

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
    return data ? JSON.parse(data) : [];
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
  const quizzes = loadQuizzes();
  const idx = quizzes.findIndex((q) => q.id === quiz.id);
  if (idx >= 0) {
    quizzes[idx] = quiz;
  } else {
    quizzes.push(quiz);
  }
  saveQuizzes(quizzes);
}

export function deleteQuiz(id) {
  const quizzes = loadQuizzes().filter((q) => q.id !== id);
  saveQuizzes(quizzes);
}

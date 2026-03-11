/**
 * GameEngine — State machine and scoring for the quiz game
 *
 * States: LOBBY → COUNTDOWN → QUESTION → COLLECTING → RESULTS → LEADERBOARD → END
 */

export const GameState = {
    LOBBY: 'LOBBY',
    COUNTDOWN: 'COUNTDOWN',
    QUESTION: 'QUESTION',
    COLLECTING: 'COLLECTING',
    RESULTS: 'RESULTS',
    LEADERBOARD: 'LEADERBOARD',
    END: 'END',
};

export class GameEngine {
    constructor(quiz) {
        this.quiz = quiz;
        this.state = GameState.LOBBY;
        this.currentQuestionIndex = -1;
        this.players = new Map(); // peerId -> { name, score, streak }
        this.answers = new Map(); // peerId -> { answerIndex, timeMs }
        this.questionStartTime = 0;
        this.listeners = new Set();
        this.timerId = null;
        this.countdownTimeoutId = null;
        this.timeRemaining = 0;
    }

    on(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit(event, data) {
        this.listeners.forEach((fn) => fn(event, data));
    }

    addPlayer(peerId, name) {
        if (this.state !== GameState.LOBBY) return false;
        const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#e84393'];
        const color = colors[this.players.size % colors.length];
        this.players.set(peerId, { name, score: 0, streak: 0, color });
        this.emit('player-joined', { peerId, name, color });
        return true;
    }

    removePlayer(peerId) {
        this.players.delete(peerId);
        this.emit('player-left', { peerId });
    }

    getPlayerList() {
        return Array.from(this.players.entries()).map(([id, p]) => ({
            id,
            name: p.name,
            score: p.score,
            color: p.color,
            streak: p.streak,
        }));
    }

    getLeaderboard() {
        return this.getPlayerList().sort((a, b) => b.score - a.score);
    }

    startGame() {
        if (this.state !== GameState.LOBBY) return;
        this.currentQuestionIndex = -1;
        this.nextQuestion();
    }

    nextQuestion() {
        clearTimeout(this.countdownTimeoutId);
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.quiz.questions.length) {
            this.state = GameState.END;
            this.emit('state-change', { state: GameState.END });
            return;
        }
        // Brief countdown
        this.state = GameState.COUNTDOWN;
        this.emit('state-change', { state: GameState.COUNTDOWN, questionIndex: this.currentQuestionIndex });

        this.countdownTimeoutId = setTimeout(() => {
            this.showQuestion();
        }, 3000);
    }

    showQuestion() {
        const question = this.quiz.questions[this.currentQuestionIndex];
        this.answers.clear();
        this.state = GameState.QUESTION;
        this.questionStartTime = Date.now();
        this.timeRemaining = question.timeLimit;

        this.emit('state-change', {
            state: GameState.QUESTION,
            question: {
                text: question.text,
                image: question.image,
                answers: question.answers.map((a) => a.text),
                timeLimit: question.timeLimit,
                index: this.currentQuestionIndex,
                total: this.quiz.questions.length,
            },
        });

        // Start timer
        this.startTimer(question.timeLimit);
    }

    startTimer(seconds) {
        this.timeRemaining = seconds;
        clearInterval(this.timerId);
        this.timerId = setInterval(() => {
            this.timeRemaining--;
            this.emit('timer-tick', { remaining: this.timeRemaining, total: seconds });
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerId);
                this.showResults();
            }
        }, 1000);
    }

    receiveAnswer(peerId, answerIndex) {
        if (this.state !== GameState.QUESTION) return;
        if (this.answers.has(peerId)) return; // already answered

        const timeMs = Date.now() - this.questionStartTime;
        this.answers.set(peerId, { answerIndex, timeMs });
        this.emit('answer-received', { peerId, totalAnswers: this.answers.size, totalPlayers: this.players.size });

        // If all players answered, show results immediately
        if (this.answers.size >= this.players.size) {
            clearInterval(this.timerId);
            setTimeout(() => this.showResults(), 500);
        }
    }

    showResults() {
        clearInterval(this.timerId);
        this.state = GameState.RESULTS;
        const question = this.quiz.questions[this.currentQuestionIndex];
        const correctIndex = question.answers.findIndex((a) => a.correct);
        const timeLimitMs = question.timeLimit * 1000;

        // Calculate scores
        const answerCounts = new Array(question.answers.length).fill(0);
        const playerResults = [];

        this.answers.forEach((answer, peerId) => {
            const player = this.players.get(peerId);
            if (!player) return;

            answerCounts[answer.answerIndex]++;

            if (answer.answerIndex === correctIndex) {
                // Score: 500 base + up to 500 speed bonus
                const speedFraction = 1 - answer.timeMs / timeLimitMs;
                const points = Math.round(500 + 500 * Math.max(0, speedFraction));
                player.score += points;
                player.streak++;
                playerResults.push({ peerId, name: player.name, correct: true, points, streak: player.streak });
            } else {
                player.streak = 0;
                playerResults.push({ peerId, name: player.name, correct: false, points: 0, streak: 0 });
            }
        });

        // Players who didn't answer
        this.players.forEach((player, peerId) => {
            if (!this.answers.has(peerId)) {
                player.streak = 0;
                playerResults.push({ peerId, name: player.name, correct: false, points: 0, streak: 0, noAnswer: true });
            }
        });

        this.emit('state-change', {
            state: GameState.RESULTS,
            results: {
                correctIndex,
                answerCounts,
                answers: question.answers.map((a) => a.text),
                playerResults,
            },
        });
    }

    showLeaderboard() {
        this.state = GameState.LEADERBOARD;
        this.emit('state-change', {
            state: GameState.LEADERBOARD,
            leaderboard: this.getLeaderboard(),
            isLast: this.currentQuestionIndex >= this.quiz.questions.length - 1,
        });
    }

    destroy() {
        clearInterval(this.timerId);
        clearTimeout(this.countdownTimeoutId);
        this.listeners.clear();
    }
}

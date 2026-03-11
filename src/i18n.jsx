import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
    es: {
        'app.title': 'Preguntador',
        'app.subtitle': 'Crea tus quizzes y juega en tiempo real con amigos',
        'app.pageTitle': 'Preguntador | Quiz en vivo',
        'app.pageDescription': 'Juego de quiz en tiempo real sin backend. Crea preguntas y juega con amigos.',
        'app.repository': 'Repositorio',

        'language.es': 'Español',
        'language.en': 'Inglés',
        'language.gl': 'Galego',

        'home.createQuiz': '✏️ Crear nuevo quiz',
        'home.importQuiz': '📥 Importar quiz',
        'home.joinGame': '🎮 Unirse a una partida',
        'home.myQuizzes': '📚 Mis quizzes',
        'home.questions': 'preguntas',
        'home.question': 'pregunta',
        'home.play': 'Jugar',
        'home.edit': 'Editar',
        'home.export': 'Exportar',
        'home.delete': 'Eliminar',
        'home.deleteConfirm': '¿Eliminar este quiz?',
        'home.importError': 'No se pudo importar el quiz. Asegúrate de que el JSON tenga un título y preguntas válidas.',
        'home.chatgptPrompt': 'Generar con IA',
        'home.invalidQuizTitle': 'Completa el quiz antes de jugar',
        'home.aiTitle': 'Generar con IA',
        'home.aiStep1': '1. Copia este texto y pídele a ChatGPT u otra IA que genere un nuevo quiz.',
        'home.aiStep2': '2. Pega aquí el JSON de respuesta:',
        'home.aiCopy': '📋 Copiar al portapapeles',
        'home.aiCopied': '✅ Copiado',
        'home.aiCreate': '✨ Crear quiz',
        'home.aiPlaceholder': '{"title": "Nuevo Quiz", "questions": [...]}',
        'home.aiJsonError': 'No se pudo leer el JSON generado por la IA. Revisa el formato.',
        'home.aiPromptTemplate': `Actua como un creador de quizzes. Genera un archivo JSON con preguntas de trivia sobre el tema: [TEMA_AQUI].

Reglas:
1. El JSON debe tener exactamente esta estructura.
2. Cada pregunta debe tener 4 respuestas posibles y solo una con "correct": true.
3. "timeLimit" debe ser un numero entero positivo.
4. Puedes anadir una URL publica directa en "image" o dejarla en "".
5. Devuelve solo JSON valido, sin texto adicional.

Ejemplo:
{
  "title": "Titulo del quiz",
  "questions": [
    {
      "text": "Pregunta de ejemplo",
      "timeLimit": 20,
      "image": "",
      "answers": [
        { "text": "Opcion 1", "correct": false },
        { "text": "Opcion 2", "correct": false },
        { "text": "Opcion correcta", "correct": true },
        { "text": "Opcion 4", "correct": false }
      ]
    }
  ]
}`,

        'join.title': 'Unirse a partida',
        'join.codeLabel': 'Codigo de sala',
        'join.nameLabel': 'Tu nombre',
        'join.codePlaceholder': 'ABC123',
        'join.namePlaceholder': 'Tu nombre',
        'join.connecting': '⏳ Conectando...',
        'join.connected': '¡Conectado!',
        'join.joinBtn': '🚀 Unirse',
        'join.backBtn': '← Volver',
        'join.errorPrefix': 'Error',
        'join.errorInvalidCode': 'No se pudo conectar. Verifica el codigo de sala.',
        'join.errorRejected': 'La sala rechazo la conexion.',
        'join.errorGameInProgress': 'La partida ya ha empezado. No se pueden unir mas jugadores.',
        'join.errorConnectionClosed': 'La conexion se cerro antes de confirmar la entrada.',
        'join.errorTimeout': 'Se agoto el tiempo intentando entrar en la sala.',
        'join.errorUnknown': 'No se pudo completar la conexion con la sala.',

        'lobby.roomCode': 'Codigo de sala',
        'lobby.players': 'Jugadores',
        'lobby.waiting': 'Esperando jugadores...',
        'lobby.startBtn': '▶ Iniciar partida',
        'lobby.backBtn': '← Salir',
        'lobby.joinHint': 'Escanea para unirte o abre {url}',
        'lobby.errorMissingQuiz': 'No se encontro el quiz seleccionado.',
        'lobby.errorInvalidQuiz': 'Este quiz esta incompleto. Corrigelo antes de iniciar la partida.',
        'lobby.errorGeneric': 'No se pudo abrir la sala',

        'game.ready': 'Preparados...',
        'game.go': '¡Ya!',
        'game.answers': 'respuestas',
        'game.results': 'Resultados',
        'game.points': 'puntos',
        'game.next': 'Siguiente →',
        'game.finalResults': 'Resultados finales',
        'game.nextQuestion': 'Siguiente pregunta →',
        'game.questionCounter': 'Pregunta {current} / {total}',
        'game.questionImageAlt': 'Imagen de la pregunta',

        'player.disconnectedTitle': 'Conexion perdida',
        'player.disconnectedSub': 'Se ha perdido la conexion con el host',
        'player.in': '¡Estas dentro!',
        'player.greeting': 'Hola, {name}',
        'player.waitingLabel': 'Esperando a que el host inicie la partida...',
        'player.getReady': '¡Preparate!',
        'player.nextQuestionLabel': 'La siguiente pregunta esta a punto de aparecer',
        'player.sent': '¡Respuesta enviada!',
        'player.waitingOthers': 'Esperando a los demas...',
        'player.correct': '¡Correcto!',
        'player.incorrect': 'Incorrecto',
        'player.streak': 'Racha de',
        'player.leaderboard': 'Clasificacion',
        'player.rank': 'Tu posicion',
        'player.waitingNext': 'Esperando la siguiente pregunta...',
        'player.gameEnded': '¡Fin del juego!',
        'player.finalRank': 'Tu posicion final',

        'editor.quizTitle': 'Titulo del quiz',
        'editor.addQuestion': '➕ Anadir pregunta',
        'editor.question': 'Pregunta',
        'editor.removeQuestion': 'Eliminar pregunta',
        'editor.uploadImage': '📷 Subir imagen',
        'editor.removeImage': '❌ Quitar',
        'editor.timeLimit': 'Limite de tiempo',
        'editor.imageUrl': 'URL de la imagen...',
        'editor.noImage': 'Sin imagen',
        'editor.imagePreviewAlt': 'Vista previa de la imagen',
        'editor.answerPlaceholder': 'Respuesta {number}',
    },
    en: {
        'app.title': 'Preguntador',
        'app.subtitle': 'Create quizzes and play in real time with friends',
        'app.pageTitle': 'Preguntador | Live quiz',
        'app.pageDescription': 'Real-time quiz game without a backend. Create questions and play with friends.',
        'app.repository': 'Repository',

        'language.es': 'Spanish',
        'language.en': 'English',
        'language.gl': 'Galician',

        'home.createQuiz': '✏️ Create new quiz',
        'home.importQuiz': '📥 Import quiz',
        'home.joinGame': '🎮 Join a game',
        'home.myQuizzes': '📚 My quizzes',
        'home.questions': 'questions',
        'home.question': 'question',
        'home.play': 'Play',
        'home.edit': 'Edit',
        'home.export': 'Export',
        'home.delete': 'Delete',
        'home.deleteConfirm': 'Delete this quiz?',
        'home.importError': 'Could not import the quiz. Make sure the JSON contains a title and valid questions.',
        'home.chatgptPrompt': 'Generate with AI',
        'home.invalidQuizTitle': 'Finish the quiz before starting a game',
        'home.aiTitle': 'Generate with AI',
        'home.aiStep1': '1. Copy this prompt and ask ChatGPT or another AI to generate a new quiz.',
        'home.aiStep2': '2. Paste the JSON response here:',
        'home.aiCopy': '📋 Copy to clipboard',
        'home.aiCopied': '✅ Copied',
        'home.aiCreate': '✨ Create quiz',
        'home.aiPlaceholder': '{"title": "New Quiz", "questions": [...]}',
        'home.aiJsonError': 'Could not read the AI-generated JSON. Check the format.',
        'home.aiPromptTemplate': `Act as a quiz creator. Generate a JSON file with trivia questions about this topic: [TOPIC_HERE].

Rules:
1. The JSON must follow this exact structure.
2. Every question must have 4 possible answers and only one with "correct": true.
3. "timeLimit" must be a positive integer.
4. You may include a direct public image URL in "image" or leave it as "".
5. Return valid JSON only, with no extra text.

Example:
{
  "title": "Quiz title",
  "questions": [
    {
      "text": "Sample question",
      "timeLimit": 20,
      "image": "",
      "answers": [
        { "text": "Option 1", "correct": false },
        { "text": "Option 2", "correct": false },
        { "text": "Correct option", "correct": true },
        { "text": "Option 4", "correct": false }
      ]
    }
  ]
}`,

        'join.title': 'Join game',
        'join.codeLabel': 'Room code',
        'join.nameLabel': 'Your name',
        'join.codePlaceholder': 'ABC123',
        'join.namePlaceholder': 'Your name',
        'join.connecting': '⏳ Connecting...',
        'join.connected': 'Connected!',
        'join.joinBtn': '🚀 Join',
        'join.backBtn': '← Back',
        'join.errorPrefix': 'Error',
        'join.errorInvalidCode': 'Could not connect. Check the room code.',
        'join.errorRejected': 'The room rejected the connection.',
        'join.errorGameInProgress': 'The game has already started. New players cannot join now.',
        'join.errorConnectionClosed': 'The connection closed before your join was confirmed.',
        'join.errorTimeout': 'Timed out while trying to join the room.',
        'join.errorUnknown': 'Could not complete the room connection.',

        'lobby.roomCode': 'Room code',
        'lobby.players': 'Players',
        'lobby.waiting': 'Waiting for players...',
        'lobby.startBtn': '▶ Start game',
        'lobby.backBtn': '← Leave',
        'lobby.joinHint': 'Scan to join or open {url}',
        'lobby.errorMissingQuiz': 'The selected quiz could not be found.',
        'lobby.errorInvalidQuiz': 'This quiz is incomplete. Fix it before starting the game.',
        'lobby.errorGeneric': 'Could not open the room',

        'game.ready': 'Ready...',
        'game.go': 'Go!',
        'game.answers': 'answers',
        'game.results': 'Results',
        'game.points': 'points',
        'game.next': 'Next →',
        'game.finalResults': 'Final results',
        'game.nextQuestion': 'Next question →',
        'game.questionCounter': 'Question {current} / {total}',
        'game.questionImageAlt': 'Question image',

        'player.disconnectedTitle': 'Connection lost',
        'player.disconnectedSub': 'Connection to the host was lost',
        'player.in': "You're in!",
        'player.greeting': 'Hi, {name}',
        'player.waitingLabel': 'Waiting for the host to start the game...',
        'player.getReady': 'Get ready!',
        'player.nextQuestionLabel': 'The next question is about to appear',
        'player.sent': 'Answer sent!',
        'player.waitingOthers': 'Waiting for the others...',
        'player.correct': 'Correct!',
        'player.incorrect': 'Incorrect',
        'player.streak': 'Streak of',
        'player.leaderboard': 'Leaderboard',
        'player.rank': 'Your rank',
        'player.waitingNext': 'Waiting for the next question...',
        'player.gameEnded': 'Game over!',
        'player.finalRank': 'Your final rank',

        'editor.quizTitle': 'Quiz title',
        'editor.addQuestion': '➕ Add question',
        'editor.question': 'Question',
        'editor.removeQuestion': 'Remove question',
        'editor.uploadImage': '📷 Upload image',
        'editor.removeImage': '❌ Remove',
        'editor.timeLimit': 'Time limit',
        'editor.imageUrl': 'Image URL...',
        'editor.noImage': 'No image',
        'editor.imagePreviewAlt': 'Image preview',
        'editor.answerPlaceholder': 'Answer {number}',
    },
    gl: {
        'app.title': 'Preguntador',
        'app.subtitle': 'Crea os teus quizzes e xoga en tempo real cos teus amigos',
        'app.pageTitle': 'Preguntador | Quiz en vivo',
        'app.pageDescription': 'Xogo de quiz en tempo real sen backend. Crea preguntas e xoga cos teus amigos.',
        'app.repository': 'Repositorio',

        'language.es': 'Español',
        'language.en': 'Inglés',
        'language.gl': 'Galego',

        'home.createQuiz': '✏️ Crear novo quiz',
        'home.importQuiz': '📥 Importar quiz',
        'home.joinGame': '🎮 Unirse a unha partida',
        'home.myQuizzes': '📚 Os meus quizzes',
        'home.questions': 'preguntas',
        'home.question': 'pregunta',
        'home.play': 'Xogar',
        'home.edit': 'Editar',
        'home.export': 'Exportar',
        'home.delete': 'Eliminar',
        'home.deleteConfirm': 'Eliminar este quiz?',
        'home.importError': 'Non se puido importar o quiz. Asegurate de que o JSON teña un titulo e preguntas validas.',
        'home.chatgptPrompt': 'Xerar con IA',
        'home.invalidQuizTitle': 'Completa o quiz antes de iniciar a partida',
        'home.aiTitle': 'Xerar con IA',
        'home.aiStep1': '1. Copia este texto e pídelle a ChatGPT ou a outra IA que xere un novo quiz.',
        'home.aiStep2': '2. Pega aqui o JSON de resposta:',
        'home.aiCopy': '📋 Copiar ao portapapeis',
        'home.aiCopied': '✅ Copiado',
        'home.aiCreate': '✨ Crear quiz',
        'home.aiPlaceholder': '{"title": "Novo Quiz", "questions": [...]}',
        'home.aiJsonError': 'Non se puido ler o JSON xerado pola IA. Revisa o formato.',
        'home.aiPromptTemplate': `Actua como creador de quizzes. Xera un ficheiro JSON con preguntas de trivia sobre este tema: [TEMA_AQUI].

Regras:
1. O JSON debe seguir exactamente esta estrutura.
2. Cada pregunta debe ter 4 respostas posibles e so unha con "correct": true.
3. "timeLimit" debe ser un numero enteiro positivo.
4. Podes engadir unha URL publica directa en "image" ou deixala en "".
5. Devolve so JSON valido, sen texto adicional.

Exemplo:
{
  "title": "Titulo do quiz",
  "questions": [
    {
      "text": "Pregunta de exemplo",
      "timeLimit": 20,
      "image": "",
      "answers": [
        { "text": "Opcion 1", "correct": false },
        { "text": "Opcion 2", "correct": false },
        { "text": "Opcion correcta", "correct": true },
        { "text": "Opcion 4", "correct": false }
      ]
    }
  ]
}`,

        'join.title': 'Unirse a partida',
        'join.codeLabel': 'Codigo da sala',
        'join.nameLabel': 'O teu nome',
        'join.codePlaceholder': 'ABC123',
        'join.namePlaceholder': 'O teu nome',
        'join.connecting': '⏳ Conectando...',
        'join.connected': 'Conectado!',
        'join.joinBtn': '🚀 Unirse',
        'join.backBtn': '← Volver',
        'join.errorPrefix': 'Erro',
        'join.errorInvalidCode': 'Non se puido conectar. Revisa o codigo da sala.',
        'join.errorRejected': 'A sala rexeitou a conexion.',
        'join.errorGameInProgress': 'A partida xa comezou. Xa non poden entrar mais xogadores.',
        'join.errorConnectionClosed': 'A conexion pechouse antes de confirmar a entrada.',
        'join.errorTimeout': 'Esgotouse o tempo intentando entrar na sala.',
        'join.errorUnknown': 'Non se puido completar a conexion coa sala.',

        'lobby.roomCode': 'Codigo da sala',
        'lobby.players': 'Xogadores',
        'lobby.waiting': 'Agardando polos xogadores...',
        'lobby.startBtn': '▶ Comezar partida',
        'lobby.backBtn': '← Saír',
        'lobby.joinHint': 'Escanea para unirte ou abre {url}',
        'lobby.errorMissingQuiz': 'Non se atopou o quiz seleccionado.',
        'lobby.errorInvalidQuiz': 'Este quiz esta incompleto. Corrixeo antes de iniciar a partida.',
        'lobby.errorGeneric': 'Non se puido abrir a sala',

        'game.ready': 'Preparados...',
        'game.go': 'Xa!',
        'game.answers': 'respostas',
        'game.results': 'Resultados',
        'game.points': 'puntos',
        'game.next': 'Seguinte →',
        'game.finalResults': 'Resultados finais',
        'game.nextQuestion': 'Seguinte pregunta →',
        'game.questionCounter': 'Pregunta {current} / {total}',
        'game.questionImageAlt': 'Imaxe da pregunta',

        'player.disconnectedTitle': 'Conexion perdida',
        'player.disconnectedSub': 'Perdeuse a conexion co host',
        'player.in': 'Estas dentro!',
        'player.greeting': 'Ola, {name}',
        'player.waitingLabel': 'Agardando a que o host inicie a partida...',
        'player.getReady': 'Prepárate!',
        'player.nextQuestionLabel': 'A seguinte pregunta esta a piques de aparecer',
        'player.sent': 'Resposta enviada!',
        'player.waitingOthers': 'Agardando polos demais...',
        'player.correct': 'Correcto!',
        'player.incorrect': 'Incorrecto',
        'player.streak': 'Racha de',
        'player.leaderboard': 'Clasificacion',
        'player.rank': 'A tua posicion',
        'player.waitingNext': 'Agardando pola seguinte pregunta...',
        'player.gameEnded': 'Fin do xogo!',
        'player.finalRank': 'A tua posicion final',

        'editor.quizTitle': 'Titulo do quiz',
        'editor.addQuestion': '➕ Engadir pregunta',
        'editor.question': 'Pregunta',
        'editor.removeQuestion': 'Eliminar pregunta',
        'editor.uploadImage': '📷 Subir imaxe',
        'editor.removeImage': '❌ Quitar',
        'editor.timeLimit': 'Limite de tempo',
        'editor.imageUrl': 'URL da imaxe...',
        'editor.noImage': 'Sen imaxe',
        'editor.imagePreviewAlt': 'Vista previa da imaxe',
        'editor.answerPlaceholder': 'Resposta {number}',
    },
};

const LanguageContext = createContext();

function interpolate(template, params = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => (
        Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
    ));
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('preguntador_lang') || 'es');

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('preguntador_lang', lang);
    };

    const t = (key, params) => {
        const template = translations[language]?.[key] || translations.es[key] || key;
        return typeof template === 'string' ? interpolate(template, params) : template;
    };

    useEffect(() => {
        document.documentElement.lang = language;
        document.title = t('app.pageTitle');
        const description = document.querySelector('meta[name="description"]');
        if (description) {
            description.setAttribute('content', t('app.pageDescription'));
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

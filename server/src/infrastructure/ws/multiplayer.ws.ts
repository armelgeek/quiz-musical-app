import { Server as SocketIOServer } from 'socket.io'
import { MultiplayerRepository } from '../repositories/multiplayer.repository'
import { QuizRepository } from '../repositories/quiz.repository'

let io: SocketIOServer | null = null

// In-memory state for live games (could be moved to Redis for scale)
const liveGames: Record<string, any> = {}

export function attachMultiplayerSocket(server: any) {
  if (io) return io
  io = new SocketIOServer(server, {
    path: '/ws/multiplayer',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  const multiplayerRepo = new MultiplayerRepository()
  // const quizRepo = new QuizRepository() // (peut être utilisé pour enrichir les questions plus tard)

  io.on('connection', (socket) => {
    // Join room
    socket.on('join', (sessionId: string) => {
      socket.join(sessionId)
      socket.emit('joined', { sessionId })
      // Optionally send current game state
      if (liveGames[sessionId]) {
        socket.emit('game_state', liveGames[sessionId].publicState())
      }
    })

    // L'admin lance la partie
    socket.on('start_game', async ({ sessionId }) => {
      // Récupérer la session et les questions
      const session = await multiplayerRepo.getSession(Number(sessionId))
      if (!session) return
      const questions = Array.isArray(session.questions) ? session.questions : []
      if (!questions.length) return
      // Initialiser l'état en mémoire
      if (io) {
        liveGames[sessionId] = createLiveGame(sessionId, questions, io)
        liveGames[sessionId].start()
      }
    })

    // Réponse d'un joueur
    socket.on('answer', ({ sessionId, userId, answer }) => {
      const game = liveGames[sessionId]
      if (game) game.receiveAnswer(userId, answer)
    })

    socket.on('disconnect', () => {
      // Optionnel : gestion des déconnexions
    })
  })

  return io
}

// --- LOGIQUE DE PARTIE LIVE ---
function createLiveGame(sessionId: string, questions: any[], io: SocketIOServer) {
  let currentQuestion = 0
  let timer: NodeJS.Timeout | null = null
  let answers: Record<string, any> = {}
  let scores: Record<string, number> = {}
  let started = false
  const QUESTION_TIME = 20 // secondes

  function start() {
    started = true
    currentQuestion = 0
    scores = {}
    nextQuestion()
  }

  function nextQuestion() {
    answers = {}
    if (currentQuestion >= questions.length) {
      return endGame()
    }
    io.to(sessionId).emit('question', {
      index: currentQuestion,
      question: questions[currentQuestion],
      time: QUESTION_TIME
    })
    timer = setTimeout(() => {
      resolveQuestion()
    }, QUESTION_TIME * 1000)
  }

  function receiveAnswer(userId: string, answer: any) {
    if (answers[userId]) return // ignore double answers
    answers[userId] = answer
    // Optionnel : valider la réponse ici
    // Si tous les joueurs ont répondu, on passe à la suite
    // (Pour la démo, on suppose 2 joueurs, à adapter)
    if (Object.keys(answers).length >= 2) {
      if (timer) clearTimeout(timer)
      resolveQuestion()
    }
  }

  function resolveQuestion() {
    // Correction : compare la réponse du joueur à la bonne réponse de la question courante
    const currentQ = questions[currentQuestion]
    Object.entries(answers).forEach(([userId, answerObj]) => {
      // On attend answerObj = { value: string }
      if (answerObj && typeof answerObj.value === 'string' && currentQ && answerObj.value === currentQ.answer) {
        scores[userId] = (scores[userId] || 0) + 1
      }
    })
    io.to(sessionId).emit('result', {
      index: currentQuestion,
      answers,
      scores,
      correctAnswer: currentQ ? currentQ.answer : null
    })
    currentQuestion++
    setTimeout(nextQuestion, 3000) // Pause avant la prochaine question
  }

  function endGame() {
    io.to(sessionId).emit('game_over', {
      scores,
      ranking: Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([userId, score], i) => ({ userId, score, rank: i + 1 }))
    })
    // Optionnel : cleanup
    delete liveGames[sessionId]
  }

  function publicState() {
    return {
      started,
      currentQuestion,
      scores
    }
  }

  return { start, receiveAnswer, publicState }
}

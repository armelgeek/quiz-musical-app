import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
  CompleteGameSessionUseCase,
  GetActiveGameSessionUseCase,
  StartGameSessionUseCase
} from '../../application/use-cases/game-session'
import {
  CreateQuizUseCase,
  DeleteQuizUseCase,
  GetAllQuizzesUseCase,
  GetAllQuizzesWithSecretUseCase,
  GetQuizByIdUseCase,
  GetQuizzesByUserUseCase,
  UpdateQuizIsPublicUseCase,
  UpdateQuizUseCase
} from '../../application/use-cases/quiz'
import { GameSessionRepository } from '../repositories/game-session.repository'
import { QuizRepository } from '../repositories/quiz.repository'
import type { Routes } from '../../domain/types/route.type'

const GameSessionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  quizzes: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      instruction: z.string(),
      passingScore: z.number(),
      maxScore: z.number(),
      xpReward: z.number(),
      subject: z.string(),
      topic: z.string(),
      duration: z.string(),
      code: z.string(),
      createdBy: z.number(),
      isPublic: z.boolean(),
      questions: z.array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          answer: z.string()
        })
      ),
      createdAt: z.string(),
      updatedAt: z.string()
    })
  ),
  status: z.enum(['active', 'completed']),
  startedAt: z.string(),
  endedAt: z.string().optional()
})

export class QuizController implements Routes {
  public controller: OpenAPIHono

  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  private quizRepo = new QuizRepository()
  private gameSessionRepo = new GameSessionRepository()
  private startGameSession = new StartGameSessionUseCase(this.gameSessionRepo, this.quizRepo)
  private getActiveGameSession = new GetActiveGameSessionUseCase(this.gameSessionRepo)
  private completeGameSession = new CompleteGameSessionUseCase(this.gameSessionRepo)
  private getAllQuizzes = new GetAllQuizzesUseCase(this.quizRepo)
  private getAllQuizzesWithSecret = new GetAllQuizzesWithSecretUseCase(this.quizRepo)
  private getQuizById = new GetQuizByIdUseCase(this.quizRepo)
  private getQuizzesByUser = new GetQuizzesByUserUseCase(this.quizRepo)
  private createQuiz = new CreateQuizUseCase(this.quizRepo)
  private updateQuiz = new UpdateQuizUseCase(this.quizRepo)
  private deleteQuiz = new DeleteQuizUseCase(this.quizRepo)
  private updateQuizIsPublic = new UpdateQuizIsPublicUseCase(this.quizRepo)

  private QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string()
  })

  private QuizSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: 'Sample Quiz' }),
    instruction: z.string(),
    passingScore: z.number(),
    maxScore: z.number(),
    xpReward: z.number(),
    subject: z.string(),
    topic: z.string(),
    duration: z.string(),
    code: z.string(),
    createdBy: z.number(),
    isPublic: z.boolean(),
    questions: z.array(this.QuizQuestionSchema),
    createdAt: z.string(),
    updatedAt: z.string()
  })

  public initRoutes() {
    // GET /game-sessions/active
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/game-sessions/active',
        tags: ['GameSession'],
        summary: 'Récupérer la session de jeu active de l’utilisateur',
        responses: {
          200: {
            description: 'Session active',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), session: GameSessionSchema, error: z.string().optional() })
              }
            }
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const result = await this.getActiveGameSession.execute(user.id)
        return c.json(result, result.success ? 200 : 404)
      }
    )

    // POST /game-sessions/:id/complete
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/game-sessions/:id/complete',
        tags: ['GameSession'],
        summary: 'Marquer une session de jeu comme terminée',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Session complétée',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), session: GameSessionSchema, error: z.string().optional() })
              }
            }
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const sessionId = Number(c.req.param('id'))
        const result = await this.completeGameSession.execute(sessionId)
        return c.json(result, result.success ? 200 : 404)
      }
    )
    // POST /game-sessions/start
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/game-sessions/start',
        tags: ['GameSession'],
        summary: 'Démarrer une session de jeu (tirage quizs aléatoires)',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({ quizCount: z.number().min(1).max(50).default(5) })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Session de jeu démarrée',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), session: GameSessionSchema, error: z.string().optional() })
              }
            }
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const { quizCount = 5 } = await c.req.json()
        const result = await this.startGameSession.execute(user.id, quizCount)
        return c.json(result, result.success ? 200 : 400)
      }
    )
    // GET /quizzes (public)
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/quizzes',
        tags: ['Quiz'],
        summary: 'Get all public quizzes',
        responses: {
          200: {
            description: 'List of public quizzes',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), quizzes: z.array(this.QuizSchema) })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const result = await this.getAllQuizzes.execute()
        return c.json(result)
      }
    )

    // GET /quizzes/with-secret (admin)
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/quizzes/with-secret',
        tags: ['Quiz'],
        summary: 'Get all quizzes (admin/secret)',
        responses: {
          200: {
            description: 'List of all quizzes',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), quizzes: z.array(this.QuizSchema) })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const result = await this.getAllQuizzesWithSecret.execute()
        return c.json(result)
      }
    )

    // GET /quizzes/:id
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/quizzes/:id',
        tags: ['Quiz'],
        summary: 'Get quiz by ID',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Quiz by ID',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  quiz: this.QuizSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = Number(c.req.param('id'))
        const result = await this.getQuizById.execute(id)
        return c.json(result)
      }
    )

    // GET /quizzes/user (user's quizzes)
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/quizzes/user',
        tags: ['Quiz'],
        summary: 'Get quizzes by current user',
        responses: {
          200: {
            description: 'User quizzes',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), quizzes: z.array(this.QuizSchema) })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const result = await this.getQuizzesByUser.execute(user.id)
        return c.json(result)
      }
    )

    // POST /quizzes
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/quizzes',
        tags: ['Quiz'],
        summary: 'Create a new quiz',
        request: {
          body: {
            content: {
              'application/json': {
                schema: this.QuizSchema.omit({ id: true, createdBy: true, createdAt: true, updatedAt: true })
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Quiz created',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), quiz: this.QuizSchema })
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const body = await c.req.json()
        const quiz = { ...body, createdBy: user.id }
        const result = await this.createQuiz.execute(quiz)
        return c.json(result, result.success ? 201 : 400)
      }
    )

    // PUT /quizzes/:id
    this.controller.openapi(
      createRoute({
        method: 'put',
        path: '/quizzes/:id',
        tags: ['Quiz'],
        summary: 'Update a quiz',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': {
                schema: this.QuizSchema.partial().omit({ id: true, createdBy: true, createdAt: true, updatedAt: true })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Quiz updated',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  quiz: this.QuizSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const id = Number(c.req.param('id'))
        const body = await c.req.json()
        const result = await this.updateQuiz.execute(id, user.id, body)
        return c.json(result, result.success ? 200 : 403)
      }
    )

    // DELETE /quizzes/:id
    this.controller.openapi(
      createRoute({
        method: 'delete',
        path: '/quizzes/:id',
        tags: ['Quiz'],
        summary: 'Delete a quiz',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Quiz deleted',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string().optional() })
              }
            }
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const id = Number(c.req.param('id'))
        const result = await this.deleteQuiz.execute(id, user.id)
        return c.json(result, result.success ? 200 : 403)
      }
    )

    // PATCH /quizzes/:id/is-public
    this.controller.openapi(
      createRoute({
        method: 'patch',
        path: '/quizzes/:id/is-public',
        tags: ['Quiz'],
        summary: 'Update quiz public status',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': {
                schema: z.object({ isPublic: z.boolean() })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Quiz public status updated',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  quiz: this.QuizSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const id = Number(c.req.param('id'))
        const { isPublic } = await c.req.json()
        const result = await this.updateQuizIsPublic.execute(id, user.id, isPublic)
        return c.json(result, result.success ? 200 : 403)
      }
    )
  }
}

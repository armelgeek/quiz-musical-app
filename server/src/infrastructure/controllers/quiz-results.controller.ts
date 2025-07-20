import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { Routes } from '@/domain/types'
import { GetQuizResultsByCodeUseCase, GetQuizResultsByUserUseCase, SaveQuizResultUseCase } from '../../application/use-cases/quiz-results/quiz-results.use-case'
import { DrizzleQuizResultsRepository } from '../../infrastructure/repositories/drizzle-quiz-results.repository'
import { GetQuizByCodeUseCase } from '@/application/use-cases/quiz'

const quizResultSchema = z
  .object({
    quizId: z.string().openapi({ example: 'quiz_123' }),
    score: z.number().openapi({ example: 8 }),
    passed: z.boolean().openapi({ example: true }),
    title: z.string().openapi({ example: 'Quiz sur le JavaScript' }),
    passingScore: z.number().openapi({ example: 7 }),
    code: z.string().openapi({ example: 'JS-2025' }),
    maxScore: z.number().openapi({ example: 10 }),
    subject: z.string().openapi({ example: 'Programmation' }),
    topic: z.string().openapi({ example: 'JavaScript' }),
    duration: z.string().openapi({ example: '00:10:00' }),
    selectedAnswers: z.record(z.string()).openapi({ example: { q1: 'a', q2: 'b' } }),
    timeLeft: z.number().openapi({ example: 120 })
  })
  .openapi('QuizResult')

const quizResultResponseSchema = z.object({
  success: z.boolean(),
  data: quizResultSchema.optional(),
  error: z.any().optional()
})

const quizResultsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(quizResultSchema).optional(),
  error: z.any().optional()
})

export class QuizResultsController implements Routes {
  public controller: OpenAPIHono
  private readonly saveQuizResult: SaveQuizResultUseCase
  private readonly getQuizResultsByUser: GetQuizResultsByUserUseCase
  private readonly getQuizResultsByCode: GetQuizResultsByCodeUseCase
  constructor() {
    const repo = new DrizzleQuizResultsRepository()
    this.saveQuizResult = new SaveQuizResultUseCase(repo)
    this.getQuizResultsByUser = new GetQuizResultsByUserUseCase(repo)
    this.getQuizResultsByCode = new GetQuizResultsByCodeUseCase(repo)
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    // GET /v1/quiz-results/by-code/:code - get quiz result for user and quiz code
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/quiz-results/by-code/{code}',
        tags: ['QuizResults'],
        summary: 'Récupérer le résultat du quiz pour un utilisateur et un code',
        request: {
          params: z.object({
            code: z.string().openapi({ example: '6YYZ1-09234' })
          })
        },
        responses: {
          200: {
            description: 'Résultat du quiz pour ce code',
            content: {
              'application/json': {
                schema: quizResultResponseSchema
              }
            }
          },
          404: {
            description: 'Aucun résultat trouvé',
            content: {
              'application/json': {
                schema: quizResultResponseSchema
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const user = c.get('user')
          if (!user || !user.id) {
            return c.json({ success: false, error: 'User not authenticated' }, 401)
          }
          const { code } = c.req.param()
          const result = await this.getQuizResultsByCode.execute(code)
          if (!result) {
            return c.json({ success: false, error: 'No result found for this quiz code' }, 404)
          }
          return c.json({ success: true, data: result })
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )
    // end GET /by-code endpoint
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/quiz-results',
        tags: ['QuizResults'],
        summary: "Enregistrer le résultat d'un quiz pour un utilisateur",
        request: {
          body: {
            content: {
              'application/json': {
                schema: quizResultSchema
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Résultat du quiz enregistré',
            content: {
              'application/json': {
                schema: quizResultResponseSchema
              }
            }
          },
          400: {
            description: 'Erreur de validation',
            content: {
              'application/json': {
                schema: quizResultResponseSchema
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const user = c.get('user')
          if (!user || !user.id) {
            return c.json({ success: false, error: 'User not authenticated' }, 401)
          }
          const body = await c.req.json()
          const parsed = quizResultSchema.safeParse(body)
          if (!parsed.success) {
            return c.json({ success: false, error: parsed.error.flatten() }, 400)
          }
          const result = await this.saveQuizResult.execute(user.id, parsed.data)
          return c.json({ success: true, data: result })
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/quiz-results',
        tags: ['QuizResults'],
        summary: 'Récupérer les résultats de quiz pour un utilisateur',
        responses: {
          200: {
            description: 'Liste des résultats de quiz',
            content: {
              'application/json': {
                schema: quizResultsListResponseSchema
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const user = c.get('user')
          if (!user || !user.id) {
            return c.json({ success: false, error: 'User not authenticated' }, 401)
          }
          const results = await this.getQuizResultsByUser.execute(user.id)
          return c.json({ success: true, data: results })
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )
  }

  public getRouter() {
    return this.controller
  }
}

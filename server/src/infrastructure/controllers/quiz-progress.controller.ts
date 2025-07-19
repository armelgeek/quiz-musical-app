import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
  DeleteUserQuizProgressUseCase,
  GetUserQuizProgressUseCase,
  SaveUserQuizProgressUseCase
} from '../../application/use-cases/quiz-progress'
import { DrizzleQuizProgressRepository } from '../repositories/quiz-progress.repository'

const QuizProgressSchema = z.object({
  id: z.number().optional(),
  quizId: z.number(),
  userId: z.string(),
  currentQuestion: z.number(),
  selectedAnswers: z.record(z.string(), z.string()),
  timeLeft: z.number(),
  updatedAt: z.string().datetime().optional()
})

export class QuizProgressController {
  public controller: OpenAPIHono
  private readonly getProgressUseCase: GetUserQuizProgressUseCase
  private readonly saveProgressUseCase: SaveUserQuizProgressUseCase
  private readonly deleteProgressUseCase: DeleteUserQuizProgressUseCase

  constructor() {
    const repo = new DrizzleQuizProgressRepository()
    this.getProgressUseCase = new GetUserQuizProgressUseCase(repo)
    this.saveProgressUseCase = new SaveUserQuizProgressUseCase(repo)
    this.deleteProgressUseCase = new DeleteUserQuizProgressUseCase(repo)
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/quiz-progress/:quizId',
        tags: ['QuizProgress'],
        summary: 'Get user quiz progress',
        description: 'Retrieve the progress of a user for a specific quiz',
        request: {
          params: z.object({
            quizId: z.string()
          })
        },
        responses: {
          200: {
            description: 'Quiz progress retrieved',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string(),
                  progress: QuizProgressSchema
                })
              }
            }
          },
          404: {
            description: 'No progress found',
            content: {
              'application/json': {
                schema: z.object({ message: z.string() })
              }
            }
          },
          400: {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: z.object({ message: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const { quizId } = c.req.param()
        const user = c.get('user')
        if (!user || !user.id || !quizId) {
          return c.json({ message: 'Missing required parameters: user or quizId!' }, 400)
        }
        const progress = await this.getProgressUseCase.execute(user.id, Number(quizId))
        if (!progress) {
          return c.json({ message: 'No progress found for this quiz!' }, 404)
        }
        return c.json({ message: 'Quiz progress retrieved successfully!', progress })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/quiz-progress',
        tags: ['QuizProgress'],
        summary: 'Save user quiz progress',
        description: 'Save or update the progress of a user for a quiz',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  quizId: z.number(),
                  currentQuestion: z.number(),
                  selectedAnswers: z.record(z.string(), z.string()),
                  timeLeft: z.number()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Progress saved',
            content: {
              'application/json': {
                schema: z.object({ message: z.string(), progress: QuizProgressSchema })
              }
            }
          },
          400: {
            description: 'Missing required fields',
            content: {
              'application/json': {
                schema: z.object({ message: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        const { quizId, currentQuestion, selectedAnswers, timeLeft } = await c.req.json()
        if (!user || !user.id || !quizId || currentQuestion === undefined || timeLeft === undefined) {
          return c.json({ message: 'Missing required fields or user!' }, 400)
        }
        const progress = await this.saveProgressUseCase.execute({
          userId: user.id,
          quizId: Number(quizId),
          currentQuestion,
          selectedAnswers,
          timeLeft
        })
        return c.json({ message: 'Progress saved successfully!', progress })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'delete',
        path: '/v1/quiz-progress/:quizId',
        tags: ['QuizProgress'],
        summary: 'Delete user quiz progress',
        description: 'Delete the progress of a user for a specific quiz',
        request: {
          params: z.object({
            quizId: z.string()
          })
        },
        responses: {
          200: {
            description: 'Progress deleted',
            content: {
              'application/json': {
                schema: z.object({ message: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const { quizId } = c.req.param()
        const user = c.get('user')
        if (!user || !user.id || !quizId) {
          return c.json({ message: 'Missing required parameters: user or quizId!' }, 400)
        }
        await this.deleteProgressUseCase.execute(user.id, Number(quizId))
        return c.json({ message: 'Progress deleted successfully!' })
      }
    )
  }

  public getRouter() {
    return this.controller
  }
}

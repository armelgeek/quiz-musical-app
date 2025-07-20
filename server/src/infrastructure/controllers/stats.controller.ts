import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { GetUserStatsUseCase } from '@/application/use-cases/stats/get-user-stats.usecase'
import { UserStatsRepository } from '../repositories/user-stats.repository'

export class StatsController {
  public controller: OpenAPIHono
  private readonly userStatsRepo: UserStatsRepository
  private readonly getUserStatsUseCase: GetUserStatsUseCase

  constructor() {
    this.controller = new OpenAPIHono()
    this.userStatsRepo = new UserStatsRepository()
    this.getUserStatsUseCase = new GetUserStatsUseCase(this.userStatsRepo)
    this.initRoutes()
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/stats/user',
        tags: ['Stats'],
        security: [{ Bearer: [] }],
        summary: 'Get user stats',
        description: 'Get the number of quizzes completed and achievements for the current user',
        responses: {
          200: {
            description: 'User stats',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    userId: z.string(),
                    quizzesCompleted: z.number(),
                    achievements: z.array(z.any())
                  })
                })
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const user = c.get('user')
          if (!user?.id) return c.json({ success: false, error: 'Unauthorized' }, 401)
          const stats = await this.getUserStatsUseCase.execute(user.id)
          return c.json({ success: true, data: stats })
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

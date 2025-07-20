import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { GetLeaderboardUseCase, GetPodiumUseCase } from '../../application/use-cases/leaderboard'
import { QuizResultsRepository } from '../repositories/quiz-results.repository'

const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  totalScore: z.number(),
  user: z.object({
    name: z.string(),
    image: z.string().nullable()
  })
})

export class LeaderboardController {
  public controller: OpenAPIHono
  private leaderboardUseCase: GetLeaderboardUseCase
  private podiumUseCase: GetPodiumUseCase

  constructor() {
    const repo = new QuizResultsRepository()
    this.leaderboardUseCase = new GetLeaderboardUseCase(repo)
    this.podiumUseCase = new GetPodiumUseCase(repo)
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    // GET /leaderboard/podium
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/leaderboard/podium',
        tags: ['Leaderboard'],
        summary: 'Top 3 joueurs du jour',
        responses: {
          200: {
            description: 'Podium du jour',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), podium: z.array(LeaderboardEntrySchema) })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const podium = await this.podiumUseCase.execute()
        return c.json({ success: true, podium })
      }
    )

    // GET /leaderboard?period=day|week|month|all
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/leaderboard',
        tags: ['Leaderboard'],
        summary: 'Classement (jour, semaine, mois, général)',
        request: {
          query: z.object({ period: z.enum(['day', 'week', 'month', 'all']).default('all') })
        },
        responses: {
          200: {
            description: 'Classement',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), leaderboard: z.array(LeaderboardEntrySchema) })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const { period = 'all' } = c.req.query()
        const leaderboard = await this.leaderboardUseCase.execute(period)
        return c.json({ success: true, leaderboard })
      }
    )
  }
}

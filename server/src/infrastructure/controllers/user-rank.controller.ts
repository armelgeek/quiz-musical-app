import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { UserRepository } from '../repositories/user.repository'
import type { Routes } from '../../domain/types/route.type'

export class UserRankController implements Routes {
  public controller: OpenAPIHono
  private userRepo = new UserRepository()

  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'put',
        path: '/rank',
        tags: ['User'],
        summary: 'Mettre à jour le rank, le niveau et l’XP d’un utilisateur',
        description: 'Met à jour le rank, le niveau et l’XP pour un utilisateur donné',
        operationId: 'updateUserRank',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  xp: z.number(),
                  rank: z.string(),
                  level: z.number()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Rank utilisateur mis à jour',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.any().optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)
        const { xp, rank, level } = await c.req.json()
        if (typeof xp !== 'number' || typeof rank !== 'string' || typeof level !== 'number') {
          return c.json({ success: false, error: 'Invalid payload' }, 400)
        }
        const result = await this.userRepo.update(user.id, { xp, rank, level })
        if (!result) {
          return c.json({ success: false, error: 'User not found or update failed' }, 404)
        }
        return c.json({ success: true, data: result })
      }
    )
  }
}

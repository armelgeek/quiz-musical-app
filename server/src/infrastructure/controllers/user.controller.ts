import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetTopUsersByXpUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase
} from '../../application/use-cases/user'
import {
  AwardBadgeToUserUseCase,
  GetAllBadgesUseCase,
  GetUserBadgesUseCase
} from '../../application/use-cases/user/badge.usecase'
import { BadgeRepository } from '../repositories/badge.repository'
import { UserRepository } from '../repositories/user.repository'
import type { Routes } from '../../domain/types/route.type'

export class UserController implements Routes {
  public controller: OpenAPIHono

  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }
  private userRepo = new UserRepository()
  private badgeRepo = new BadgeRepository()
  private getAllUsers = new GetAllUsersUseCase(this.userRepo)
  private getUserById = new GetUserByIdUseCase(this.userRepo)
  private getUserByEmail = new GetUserByEmailUseCase(this.userRepo)
  private updateUser = new UpdateUserUseCase(this.userRepo)
  private deleteUser = new DeleteUserUseCase(this.userRepo)
  private getAllBadges = new GetAllBadgesUseCase(this.badgeRepo)
  private getUserBadges = new GetUserBadgesUseCase(this.badgeRepo)
  private awardBadgeToUser = new AwardBadgeToUserUseCase(this.badgeRepo, this.userRepo)
  private BadgeSchema = z.object({
    id: z.string().openapi({ example: 'first_win' }),
    name: z.string().openapi({ example: 'First Win' }),
    description: z.string().openapi({ example: 'Awarded for your first win.' }),
    icon: z.string().optional().openapi({ example: '🥇' }),
    createdAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' }),
    updatedAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' })
  })
  private UserBadgeSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    userId: z.string().openapi({ example: 'user_ABC123' }),
    badgeId: z.string().openapi({ example: 'first_win' }),
    awardedAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' }),
    badge: z.any().optional()
  })

  private UserSchema = z.object({
    id: z.string().openapi({ example: 'user_ABC123' }),
    name: z.string().openapi({ example: 'Armel Wanes' }),
    firstname: z.string().optional().openapi({ example: 'Armel' }),
    lastname: z.string().optional().openapi({ example: 'Wanes' }),
    email: z.string().email().openapi({ example: 'armelgeek5@gmail.com' }),
    emailVerified: z.boolean().openapi({ example: false }),
    image: z.string().optional().openapi({ example: 'https://example.com/avatar.jpg' }),
    isAdmin: z.boolean().openapi({ example: false }),
    createdAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' }),

    updatedAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' })
  })
  private UserUpdateSchema = this.UserSchema.partial().omit({ id: true, createdAt: true })

  public initRoutes() {
    // Badge endpoints
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/badges',
        tags: ['Badge'],
        summary: 'Liste des badges',
        description: 'Récupère la liste de tous les badges disponibles',
        operationId: 'getAllBadges',
        responses: {
          200: {
            description: 'Liste des badges',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  badges: z.array(this.BadgeSchema)
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const result = await this.getAllBadges.execute()
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/users/:id/badges',
        tags: ['Badge'],
        summary: 'Liste des badges utilisateur',
        description: 'Récupère la liste des badges obtenus par un utilisateur',
        operationId: 'getUserBadges',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Liste des badges utilisateur',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  badges: z.array(this.UserBadgeSchema)
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const userId = c.req.param('id')
        const result = await this.getUserBadges.execute(userId)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/users/:id/badges',
        tags: ['Badge'],
        summary: 'Attribuer un badge à un utilisateur',
        description: 'Attribue un badge à un utilisateur',
        operationId: 'awardBadgeToUser',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': {
                schema: z.object({ badgeId: z.string() })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Badge attribué',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  userBadge: this.UserBadgeSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const userId = c.req.param('id')
        const { badgeId } = await c.req.json()
        const result = await this.awardBadgeToUser.execute(userId, badgeId)
        return c.json(result)
      }
    )
    // End badge endpoints
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/users/top-xp',
        tags: ['User'],
        summary: 'Top utilisateurs par XP',
        description: "Récupère les 20 utilisateurs avec le plus de points d'expérience (xp)",
        operationId: 'getTopUsersByXp',
        request: {
          query: z.object({ limit: z.string().optional() })
        },
        responses: {
          200: {
            description: 'Top utilisateurs par XP',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  users: z.array(this.UserSchema.extend({ xp: z.number() }))
                })
              }
            }
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), error: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const getTopUsersByXp = new GetTopUsersByXpUseCase(this.userRepo)
        const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 20
        const result = await getTopUsersByXp.execute(limit)
        return c.json(result, result.success ? 200 : 500)
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/users',
        tags: ['User'],
        summary: 'Liste des utilisateurs',
        description: 'Récupère la liste paginée des utilisateurs',
        operationId: 'getAllUsers',
        request: {
          query: z.object({
            page: z.string().optional(),
            limit: z.string().optional()
          })
        },
        responses: {
          200: {
            description: 'Liste des utilisateurs',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z
                    .object({
                      items: z.array(this.UserSchema),
                      total: z.number(),
                      page: z.number(),
                      limit: z.number(),
                      totalPages: z.number()
                    })
                    .optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const page = Number(c.req.query('page') ?? '1')
        const limit = Number(c.req.query('limit') ?? '10')
        const result = await this.getAllUsers.execute(page, limit)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/users/:id',
        tags: ['User'],
        summary: 'Utilisateur par ID',
        description: 'Récupère un utilisateur par son identifiant',
        operationId: 'getUserById',
        request: {
          params: z.object({ id: z.string() })
        },
        responses: {
          200: {
            description: 'Utilisateur par ID',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.UserSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const result = await this.getUserById.execute(id)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/users/email/:email',
        tags: ['User'],
        summary: 'Utilisateur par email',
        description: 'Récupère un utilisateur par son email',
        operationId: 'getUserByEmail',
        request: {
          params: z.object({ email: z.string().email() })
        },
        responses: {
          200: {
            description: 'Utilisateur par email',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.UserSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const email = c.req.param('email')
        const result = await this.getUserByEmail.execute(email)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'put',
        path: '/users/:id',
        tags: ['User'],
        summary: 'Mettre à jour un utilisateur',
        description: 'Met à jour un utilisateur existant',
        operationId: 'updateUser',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': {
                schema: this.UserUpdateSchema
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Mettre à jour un utilisateur',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.UserSchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const body = await c.req.json()
        const result = await this.updateUser.execute(id, body)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'delete',
        path: '/users/:id',
        tags: ['User'],
        summary: 'Supprimer un utilisateur',
        description: 'Supprime un utilisateur existant',
        operationId: 'deleteUser',
        request: {
          params: z.object({ id: z.string() })
        },
        responses: {
          200: {
            description: 'Supprimer un utilisateur',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const result = await this.deleteUser.execute(id)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/users/session',
        tags: ['User'],
        summary: 'Retrieve the user session information',
        description: 'Retrieve the session info of the currently logged in user.',
        operationId: 'getUserSession',
        responses: {
          200: {
            description: 'Session information successfully retrieved',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean().openapi({
                    description: 'Indicates whether the operation was successful',
                    type: 'boolean',
                    example: true
                  }),
                  data: z.object({
                    user: this.UserSchema
                  })
                })
              }
            }
          }
        }
      }),
      (ctx: any) => {
        const user = ctx.get('user')
        if (!user) {
          return ctx.json({ error: 'Unauthorized' }, 401)
        }
        return ctx.json({ success: true, data: { user } })
      }
    )
  }
}

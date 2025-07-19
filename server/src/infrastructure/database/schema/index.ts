import { relations, type InferModel } from 'drizzle-orm'
import { roles, userRoles } from './auth'

export { accounts, activityLogs, roleResources, roles, sessions, userRoles, users, verifications } from './auth'

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(roles, {
    fields: [userRoles.userId],
    references: [roles.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  })
}))

export { quizProgress, quizResults, quizzes } from './quiz'

export type Role = InferModel<typeof roles>
export type UserRole = InferModel<typeof userRoles>

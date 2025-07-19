import { betterAuth, type User } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, openAPI } from 'better-auth/plugins'
import { Hono } from 'hono'
import { db } from '../database/db'
import {
  emailTemplates,
  sendChangeEmailVerification,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
} from './mail.config'

export const auth = betterAuth({
  plugins: [
    openAPI(),
    emailOTP({
      expiresIn: 300,
      otpLength: 6,
      async sendVerificationOTP({ email, otp }) {
        const template = await emailTemplates.otpLogin(otp)
        await sendEmail({
          to: email,
          ...template
        })
      }
    })
  ],
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  baseURL: Bun.env.BETTER_AUTH || 'http://localhost:3000',
  trustedOrigins: [Bun.env.BETTER_AUTH || 'http://localhost:3000', Bun.env.REACT_APP_URL || 'http://localhost:5173'],
  user: {
    modelName: 'users',
    additionalFields: {
      firstname: { type: 'string', default: '', returned: true },
      lastname: { type: 'string', default: '', returned: true },
      isAdmin: { type: 'boolean', default: false, returned: true },
      rank: { type: 'string', default: '🥚 Brainy Beginnings', returned: true },
      favouriteTopic: { type: 'string', default: '', returned: true },
      level: { type: 'string', default: '', returned: true },
      xp: { type: 'string', default: '', returned: true }
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, token }) => {
        await sendChangeEmailVerification({
          email: newEmail,
          verificationUrl: token
        })
      }
    }
  },
  session: {
    modelName: 'sessions'
  },
  account: {
    modelName: 'accounts'
  },
  verification: {
    modelName: 'verifications'
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    password: {
      hash: async (password) => {
        return await Bun.password.hash(password, {
          algorithm: 'bcrypt',
          cost: 10
        })
      },
      verify: async ({ password, hash }) => {
        return await Bun.password.verify(password, hash)
      }
    },
    requireEmailVerification: false,
    emailVerification: {
      sendVerificationEmail: async ({ user, token }: { user: User; token: string }) => {
        await sendVerificationEmail({
          email: user.email,
          verificationUrl: token
        })
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600 // 1 hour
    },
    sendResetPassword: async ({ user, token }) => {
      await sendResetPasswordEmail({
        email: user.email,
        verificationUrl: token
      })
    }
  }
})

const router = new Hono({
  strict: false
})

router.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

export default router

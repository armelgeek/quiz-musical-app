import process from 'node:process'
import { serve } from '@hono/node-server'
import { App } from './app'
import {
  BattleRoyaleController,
  LeaderboardController,
  QuizController,
  QuizProgressController,
  UserController
} from './infrastructure/controllers'

import { attachBattleRoyaleSocket } from './infrastructure/ws/battle-royale.ws'
import { attachMultiplayerSocket } from './infrastructure/ws/multiplayer.ws'
import { attachNotificationSocket } from './infrastructure/ws/notification.ws'

const app = new App([
  new UserController(),
  new QuizProgressController(),
  new QuizController(),
  new LeaderboardController(),
  new BattleRoyaleController()
]).getApp()

const port = Number(process.env.PORT) || 3000

const server = serve(
  {
    fetch: app.fetch,
    port
  },
  () => {
    console.info(`🚀 Server is running on port ${port}`)
    console.info(`📚 API Documentation: http://localhost:${port}/docs`)
    console.info(`🔍 OpenAPI Schema: http://localhost:${port}/swagger`)
  }
)
// Attach WebSocket handlers
attachBattleRoyaleSocket(server)
attachNotificationSocket(server)
// Attach multiplayer WebSocket handler
attachMultiplayerSocket(server)

import process from 'node:process'
import { serve } from '@hono/node-server'
import { App } from './app'
import {
  BattleRoyaleController,
  LeaderboardController,
  QuizController,
  QuizProgressController,
  StatsController,
  UserController,
  UserRankController
} from './infrastructure/controllers'
import { QuizResultsController } from './infrastructure/controllers/quiz-results.controller'

import { attachBattleRoyaleSocket } from './infrastructure/ws/battle-royale.ws'
import { attachNotificationSocket } from './infrastructure/ws/notification.ws'
import { attachMultiplayerSocket } from './infrastructure/ws/multiplayer.ws'



const app = new App([
  new UserController(),
  new UserRankController(),
  new QuizProgressController(),
  new QuizController(),
  new LeaderboardController(),
  new BattleRoyaleController(),
  new UserRankController(),
  new QuizResultsController(),
  new StatsController()
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
attachBattleRoyaleSocket(server)
attachNotificationSocket(server)
attachMultiplayerSocket(server)

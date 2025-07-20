import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { quizzes } from '../database/schema/quiz'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'

export const generateUniqueQuizCode = async (): Promise<string> => {
  let code: string = ''
  let exists = true

  while (exists) {
    // Génère 5 caractères alphanumériques
    const firstPart = Array.from({ length: 5 }, () =>
      Math.random() > 0.5
        ? LETTERS[Math.floor(Math.random() * LETTERS.length)]
        : NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
    ).join('')
    // Génère 5 chiffres
    const secondPart = Array.from({ length: 5 }, () => NUMBERS[Math.floor(Math.random() * NUMBERS.length)]).join('')
    code = `${firstPart}-${secondPart}`
    // Vérifie l'unicité dans la base
    const existing = await db.select().from(quizzes).where(eq(quizzes.code, code))
    exists = existing.length > 0
  }
  return code
}

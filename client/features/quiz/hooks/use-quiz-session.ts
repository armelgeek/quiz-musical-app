import { useQuery } from '@tanstack/react-query';
import { quizService } from '../quiz.service';
import type { Quiz } from '../quiz.service';



export function useQuizSession(code: string | undefined) {
  return useQuery<Quiz, Error>({
    queryKey: ['quiz-session', code],
    queryFn: async () => {
      if (!code) throw new Error('Code quiz manquant');
      const quiz = await quizService.getQuizByCode(code);
      if (!quiz) throw new Error('Quiz introuvable');
      return quiz;
    },
    enabled: !!code,
  });
}

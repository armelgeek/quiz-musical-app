import { useQuery } from '@tanstack/react-query';
import { quizResultsService } from '../quiz-results.service';
import { QuizResult } from '@shared/types';

export function useQuizResultByCode(code: string | undefined) {
  return useQuery<QuizResult | null>({
    queryKey: ['quizResult', code],
    queryFn: () => (code ? quizResultsService.getByCode(code) : Promise.resolve(null)),
    enabled: !!code,
  });
}

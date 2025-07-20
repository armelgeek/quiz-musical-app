import { useQuery } from '@tanstack/react-query';
import { quizService } from '../quiz.service';

export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizService.getAllQuizzes(),
  });
}

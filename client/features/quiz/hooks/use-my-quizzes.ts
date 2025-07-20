import { useQuery } from '@tanstack/react-query';
import { quizService } from '../quiz.service';

export function useMyQuizzes() {
  return useQuery({
    queryKey: ['my-quizzes'],
    queryFn: () => quizService.getMyQuizzes(),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../quiz.service';

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => quizService.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
    },
  });
}

export function useToggleQuizVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) => quizService.toggleVisibility(id, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
    },
  });
}

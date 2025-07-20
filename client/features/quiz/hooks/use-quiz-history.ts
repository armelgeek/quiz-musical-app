import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/shared/domain/base.service';

export interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  completedAt?: string;
  title: string;
  passingScore: number;
  code: string;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
}

export interface QuizResultsPage {
  items: QuizResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export function useQuizHistory(page: number = 1, limit: number = 10) {
  return useQuery<QuizResultsPage, Error>({
    queryKey: ['quizResults', page, limit],
    queryFn: async () => {
      const res = await fetchData<{ success: boolean; data: QuizResultsPage; error?: string }>(
        `/v1/quiz-results?page=${page}&limit=${limit}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.success) throw new Error(res.error || 'Erreur API');
      return res.data;
    },
  });
}

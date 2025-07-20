
// import { API_ENDPOINTS } from '@/shared/config/api';
import { BaseServiceImpl } from '@/shared/domain/base.service';

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Quiz {
  id: number;
  title: string;
  instruction: string;
  passingScore: number;
  maxScore: number;
  xpReward: number;
  subject: string;
  topic: string;
  duration: string;
  code: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  isPublic: boolean;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export class QuizService extends BaseServiceImpl<Quiz, Partial<Quiz>> {
  protected endpoints = {
    base: '/quizzes',
    list: () => '/quizzes',
    create: '/quizzes',
    detail: (id: string) => `/quizzes/${id}`,
    update: (id: string) => `/quizzes/${id}`,
    delete: (id: string) => `/quizzes/${id}`,
  };
  protected serializeParams(): string {
    return '';
  }


  async getMyQuizzes(): Promise<Quiz[]> {
    return this.get<{ success: boolean; quizzes: Quiz[] }>(`/quizzes/user`).then(res => res.quizzes);
  }

  async getQuizById(id: string): Promise<Quiz> {
    return this.get<{ success: boolean; quiz: Quiz }>(`/quizzes/${id}`).then(res => res.quiz);
  }

  async getQuizByCode(code: string): Promise<Quiz | null> {
    return this.get<{ success: boolean; quiz: Quiz }>(`/quizzes/code/${code}`).then(res => res.quiz || null);
  }
  async deleteQuiz(id: number): Promise<void> {
    await this.delete<void>(`/api/quizzes/${id}`);
  }

  async toggleVisibility(id: number, isPublic: boolean): Promise<Quiz> {
    return this.put<{ success: boolean; quiz: Quiz }>(`/api/quizzes/${id}/isPublic`, { isPublic })
      .then(res => res.quiz);
  }
  async getAllQuizzes(): Promise<Quiz[]> {
    return this.get<{ success: boolean; quizzes: Quiz[] }>(`/quizzes`).then(res => res.quizzes);
  }
}

export const quizService = new QuizService();

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { QuizResult, ApiResponse } from '@shared/types';
import { API_ENDPOINTS } from '@/shared/config/api';
import { BaseServiceImpl } from '@/shared/domain/base.service';

const endpoints = {
    base: API_ENDPOINTS.quizzes + '/results',
    list: (qs: string) => `${API_ENDPOINTS.quizzes}/results?${qs}`,
    create: `${API_ENDPOINTS.quizzes}/results`,
    detail: (code: string) => `/v1/quiz-results/by-code/${code}`,
    update: (code: string) => `${API_ENDPOINTS.endpoint.baseUrl}/v1/quiz-results/${code}`,
    delete: (code: string) => `${API_ENDPOINTS.endpoint.baseUrl}/v1/quiz-results/${code}`,
};


export class QuizResultsService extends BaseServiceImpl<QuizResult, Partial<QuizResult>> {
    protected endpoints = endpoints;

    protected serializeParams(): string {
        return '';
    }

    async getByCode(code: string): Promise<QuizResult | null> {
        try {
            const data = await this.get<ApiResponse>(this.endpoints.detail(code));
            //@ts-expect-error
            return data && data.data ? data.data : null;
        } catch {
            return null;
        }
    }
}

export const quizResultsService = new QuizResultsService();

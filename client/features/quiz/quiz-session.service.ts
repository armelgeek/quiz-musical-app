import { BaseServiceImpl } from "@/shared/domain/base.service";

export class QuizSessionService extends BaseServiceImpl<unknown, unknown> {

    protected endpoints = {
        base: '',
        list: () => '',
        create: '',
        detail: () => '',
        update: () => '',
        delete: () => '',
    };
    protected serializeParams(): string { return ""; }


    async saveProgress(quizId: number, data: {
        currentQuestion: number;
        selectedAnswers: Record<string, string>;
        timeLeft: number;
    }) {
        return this.post(`/v1/quiz-progress`, {
            quizId,
            ...data,
        });
    }

    async saveResult(data: {
        quizId: string;
        score: number;
        passed: boolean;
        title: string;
        passingScore: number;
        code: string;
        maxScore: number;
        subject: string;
        topic: string;
        duration: string;
        selectedAnswers: Record<string, string>;
        timeLeft: number;
    }) {
        return this.post(`/v1/quiz-results`, data);
    }
}

export const quizSessionService = new QuizSessionService();

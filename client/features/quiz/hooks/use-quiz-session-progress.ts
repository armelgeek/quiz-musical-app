import { useMutation } from "@tanstack/react-query";
import { quizSessionService } from "../quiz-session.service";

export function useQuizSessionProgress(
    quizId: number,
    options?: {
        onResultSuccess?: () => void;
    }
) {

    const saveProgress = useMutation({
        mutationFn: (data: {
            currentQuestion: number;
            selectedAnswers: Record<string, string>;
            timeLeft: number;
            started: boolean;
            quizCompleted: boolean;
        }) => quizSessionService.saveProgress(quizId, data),
    });


    const saveResult = useMutation({
        mutationFn: (data: {
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
        }) => quizSessionService.saveResult({
            ...data, quizId: quizId.toString()
        }),
        onSuccess: options?.onResultSuccess,
    });

    return { saveProgress, saveResult };
}

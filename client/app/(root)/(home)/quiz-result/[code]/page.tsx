"use client";

import { CheckCircle, ChevronLeft, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { useQuizResultByCode } from "@/features/quiz/hooks/use-quiz-results";
import { useQuizSession } from "@/features/quiz/hooks/use-quiz-session";

// Local type for quiz question normalization
type QuizQuestion = {
  id: string | number;
  question: string;
  answer: string;
  options: string[];
  points: number;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}


function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams() ?? {};
  const code = typeof params.code === "string" ? params.code : Array.isArray(params.code) ? params.code[0] : undefined;
  const { data: result, isLoading } = useQuizResultByCode(code);

  const { data: quiz, isLoading: quizLoading } = useQuizSession(code);

  const questions: QuizQuestion[] = quiz && Array.isArray(quiz.questions)
    ? (quiz.questions as unknown[]).map((q, idx) => {
        const obj = q as Record<string, unknown>;
        let id: string | number = idx;
        if (typeof obj.id === 'string' || typeof obj.id === 'number') id = obj.id;
        else if (typeof obj._id === 'string' || typeof obj._id === 'number') id = obj._id;
        return {
          id,
          question: typeof obj.question === 'string' ? obj.question : typeof obj.questionText === 'string' ? obj.questionText as string : '',
          answer: typeof obj.answer === 'string' ? obj.answer : typeof obj.correctAnswer === 'string' ? obj.correctAnswer as string : '',
          options: Array.isArray(obj.options) ? obj.options as string[] : [],
          points: typeof obj.points === 'number' ? obj.points as number : 1,
        };
      })
    : [];

  const createdBy = quiz && quiz.createdBy ? (quiz.createdBy as Record<string, unknown>) : { name: '' };
  const createdByName = typeof createdBy.name === 'string' ? createdBy.name : '';
  const createdByFavouriteTopic = typeof createdBy.favouriteTopic === 'string' ? createdBy.favouriteTopic : '';
  const createdByRank = typeof createdBy.rank === 'string' ? createdBy.rank : '';
  const selectedAnswers = result && result.selectedAnswers ? result.selectedAnswers : {};
  const isPassed = result && typeof result.passed === 'boolean' ? result.passed : false;
 
  if (isLoading || quizLoading) {
    return (
      <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        <div className='flex justify-center items-center h-64'>
          <div className='border-rose-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[70vh]'>
        <div className='text-center'>
          <h2 className='mb-4 font-bold text-2xl'>Quiz non trouvé</h2>
          <p className='mb-6 text-gray-500'>Aucun résultat trouvé pour ce quiz.</p>
          <Link
            href='/quizzes'
            className='inline-flex justify-center items-center bg-rose-500 hover:bg-rose-600 px-6 py-2 rounded-full font-medium text-white transition-colors'
          >
            Parcourir les quiz
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className='gap-8 grid md:grid-cols-3 mx-auto  px-4 md:px-6 py-8 md:py-12 max-w-7xl container'>
      {/* Results Section */}
      <div className='md:col-span-2 bg-white shadow-md border border-rose-100 rounded-xl overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-rose-100 border-b'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => router.back()}
              className='hover:bg-rose-50 p-2 rounded-full transition-colors'
            >
              <ChevronLeft className='w-5 h-5 text-gray-500' />
            </button>
            <h1 className='font-bold text-xl'>{quiz.title}</h1>
          </div>
          <div className='flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full'>
            <Clock className='w-4 h-4 text-rose-500' />
            <span className='font-medium text-rose-500'>
              {formatTime(result.timeLeft || 0)}
            </span>
          </div>
        </div>

        <div className='flex justify-between items-center mt-2 p-6'>
          <div className='flex items-center gap-1'>
            <span className='font-medium text-sm'>
              Score: {result.score}/{result.maxScore}
            </span>
            {isPassed ? (
              <CheckCircle className='w-4 h-4 text-green-500' />
            ) : (
              <XCircle className='w-4 h-4 text-red-500' />
            )}
          </div>
          <div className='text-gray-500 text-xs'>
            Score requis: {result.passingScore}%
          </div>
        </div>

        <div className='space-y-10 p-6'>
          {questions.map((question, qIndex) => {
            const selected = selectedAnswers[question.id];

            console.log('qst',selectedAnswers);
            const isCorrect = selected === question.answer;
            return (
              <div key={question.id} className='pb-8 border-b'>
                <h2 className='mb-4 font-semibold text-lg'>
                  Question {qIndex + 1}: {question.question}
                </h2>
                <div className='space-y-3 mb-4'>
                  {question.options.map((option: string, index: number) => {
                    const isSelected = selected === option;
                    const isAnswer = option === question.answer;
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-colors
                          ${
                            isSelected
                              ? isCorrect
                                ? "bg-green-100 border-green-500 text-green-700"
                                : !isCorrect && !isAnswer
                                ? "bg-red-100 border-red-500 text-red-700"
                                : "bg-green-100 border-green-500 text-green-700"
                              : "border-gray-200"
                          }
                        `}
                      >
                        {option}
                        {isAnswer && (
                          <span className='ml-2 font-medium text-green-500'>
                            (Bonne réponse)
                          </span>
                        )}
                        {isSelected && !isCorrect && !isAnswer && (
                          <span className='ml-2 font-medium text-red-500'>
                            (Votre réponse)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className='text-gray-500 text-sm'>
                  Points: {question.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz/Creator Info */}
      <div className='md:col-span-1'>
        <div className='bg-white shadow-sm p-6 border border-rose-100 rounded-xl'>
          <div className='bg-rose-50 mb-6 p-4 rounded-lg'>
            <h2 className='font-bold text-xl'>Instructions</h2>
            <p className='text-gray-700'>{quiz.instruction}</p>
          </div>
          <div className='mb-6 p-4 border border-rose-100 rounded-lg'>
            <h3 className='mb-2 font-bold text-lg'>Créateur du quiz</h3>
            <div className='flex items-center gap-3'>
              <div className='relative border-4 border-rose-100 rounded-full w-16 h-16 overflow-hidden'>
                <div className='flex justify-center items-center bg-rose-50 w-full h-full font-medium text-rose-500 text-xl'>
                  {getInitials(createdByName)}
                </div>
              </div>
              <div>
                <p className='font-medium text-xl'>{createdByName}</p>
                <p className='text-gray-500 text-sm'>
                  {createdByFavouriteTopic} {createdByRank ? `• ${createdByRank}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

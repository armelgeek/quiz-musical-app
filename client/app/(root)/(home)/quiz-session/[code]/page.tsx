"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuizSessionProgress } from "@/features/quiz/hooks/use-quiz-session-progress";
import Link from "next/link";
import { ChevronLeft, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from '@tanstack/react-query';
import { useQuizSession } from "@/features/quiz/hooks/use-quiz-session";

import { useUserInfo } from "@/shared/hooks/use-user-info";
import { useRank } from "@/shared/providers/rank-provider";

function durationToSeconds(duration: string): number {
  const parts = duration.split(" ");
  if (parts.length === 2) {
    const value = Number.parseInt(parts[0]);
    const unit = parts[1].toLowerCase();
    if (unit.includes("minute")) return value * 60;
    if (unit.includes("hour")) return value * 60 * 60;
  }
  return 30 * 60;
}

export default function Page() {
  const params = useParams() ?? {};
  const code = typeof params.code === "string" ? params.code : Array.isArray(params.code) ? params.code[0] : undefined;
  const { data: quiz, isLoading, error } = useQuizSession(code);
  const queryClient = useQueryClient();
  const quizData =  quiz || {
    id: 0,
    title: "",
    instruction: "",
    duration: "30 minutes",
    passingScore: 50,
    xpReward: 100,
    subject: "",
    topic: "",
    createdBy: { name: "", email: "" },
    code: "",
    questions: []
  };
  const questions = quizData.questions || [];
  const user = useUserInfo();
  const { updateXPAndRank } = useRank();
  const { saveProgress, saveResult } = useQuizSessionProgress(quizData.id);

  function saveProgressToBackend() {
    if (!quizData?.code || !user.user?.id) return;
    // Cast selectedAnswers to Record<string, string>
    const selectedAnswersStr: Record<string, string> = Object.fromEntries(
      Object.entries(selectedAnswers).map(([k, v]) => [String(k), v])
    );
    saveProgress.mutate({
      currentQuestion,
      selectedAnswers: selectedAnswersStr,
      timeLeft,
      started,
      quizCompleted,
    });
  }

  function saveQuizResultToBackend(finalScore: number) {
    if (!quizData?.code || !user.user?.id) return;
    const selectedAnswersStr: Record<string, string> = Object.fromEntries(
      Object.entries(selectedAnswers).map(([k, v]) => [String(k), v])
    );
    saveResult.mutate({
      score: finalScore,
      passed: finalScore >= quizData.passingScore,
      title: quizData.title,
      passingScore: quizData.passingScore,
      code: quizData.code,
      maxScore: questions.length,
      subject: quizData.subject,
      topic: quizData.topic,
      duration: quizData.duration,
      selectedAnswers: selectedAnswersStr,
      timeLeft,
    });
  }
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0); // percent
  const [totalScore, setTotalScore] = useState<number>(0); // points
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!started || quizCompleted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setQuizCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, quizCompleted]);

  const saveProgressToLocal = useCallback(() => {
    if (!quizData?.code) return;
    const progress = {
      currentQuestion,
      selectedAnswers,
      timeLeft,
      started,
      quizCompleted,
    };
    localStorage.setItem(`quizProgress-${quizData.code}`, JSON.stringify(progress));
  }, [quizData?.code, currentQuestion, selectedAnswers, timeLeft, started, quizCompleted]);

  const restoreProgressFromLocal = () => {
    if (!quizData?.code) return;
    const saved = localStorage.getItem(`quizProgress-${quizData.code}`);
    if (!saved) return;
    try {
      const { currentQuestion, selectedAnswers, timeLeft, started, quizCompleted } = JSON.parse(saved);
      setCurrentQuestion(currentQuestion ?? 0);
      setSelectedAnswers(selectedAnswers ?? {});
      setTimeLeft(timeLeft ?? durationToSeconds(quizData.duration));
      setStarted(started ?? false);
      setQuizCompleted(quizCompleted ?? false);
    } catch {

    }
  };

  // Nettoyage de la progression
  const deleteProgressFromLocal = () => {
    if (!quizData?.code) return;
    localStorage.removeItem(`quizProgress-${quizData.code}`);
  };

  useEffect(() => {
    if (!quizData?.code) return;
    saveProgressToLocal();
  }, [currentQuestion, selectedAnswers, timeLeft, started, quizCompleted, quizData?.code, saveProgressToLocal]);

  useEffect(() => {
    if (!quizData?.code) return;
    restoreProgressFromLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData?.code]);

  useEffect(() => {
    if (quizCompleted) deleteProgressFromLocal();
    return () => { deleteProgressFromLocal(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizCompleted, quizData?.code]);

  if (isLoading) return <div className="p-8 text-center text-lg">Chargement du quiz...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error.message}</div>;
  if (!quiz) return <div className="p-8 text-center text-red-500">Aucun quiz trouvé pour ce code.</div>;

  function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function selectAnswer(questionId: string, answer: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  function prevQuestion() {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : 0));
  }

  function nextQuestion() {
    setCurrentQuestion((prev) => (prev < questions.length - 1 ? prev + 1 : prev));
  }

  async function submitQuiz() {
    let earnedPoints = 0;
    let maxPoints = 0;
    questions.forEach((q) => {
      const pts = typeof (q as { points?: number }).points === 'number' ? (q as { points?: number }).points! : 1;
      maxPoints += pts;
      if (selectedAnswers[q.id] === q.answer) {
        earnedPoints += pts;
      }
    });
    setTotalScore(earnedPoints);
    const finalScore = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    setScore(finalScore);
    setQuizCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    saveProgressToBackend();
    await saveQuizResultToBackend(finalScore);
    updateXPAndRank(earnedPoints);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  const question = questions[currentQuestion];
  const creator = quizData.createdBy;

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl container'>
      {!started ? (
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <h1 className='font-bold text-3xl mb-4'>{quizData.title}</h1>
          <div className='mb-4 text-gray-700 text-lg'>{quizData.instruction}</div>
          <div className='mb-8 flex flex-wrap gap-4 justify-center'>
            <span className='inline-flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-sm font-medium'><Clock className='w-4 h-4' /> {quizData.duration}</span>
            <span className='inline-flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-sm font-medium'><ChevronRight className='w-4 h-4' /> {questions.length} questions</span>
            <span className='inline-flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-sm font-medium'><CheckCircle className='w-4 h-4' /> {quizData.passingScore}% requis</span>
            <span className='inline-flex items-center gap-1 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-sm font-medium'><XCircle className='w-4 h-4' /> {quizData.xpReward} XP</span>
          </div>
          <button
            className='bg-rose-500 hover:bg-rose-600 px-8 py-3 rounded-full text-white font-bold text-lg transition-colors shadow-lg'
            onClick={() => {
 
              if (code) queryClient.invalidateQueries({ queryKey: ['quizResult', code] });
              setCurrentQuestion(0);
              setSelectedAnswers({});
              setQuizCompleted(false);
              setScore(0);
              setTotalScore(0);
              setTimeLeft(durationToSeconds(quizData.duration));
              setStarted(true);
            }}
          >
            Commencer le quiz
          </button>
        </div>
      ) : !quizCompleted ? (
        <div className='gap-8 grid md:grid-cols-3'>
          <div className='md:col-span-2 bg-white shadow-md border border-rose-100 rounded-xl overflow-hidden'>
            <div className='flex justify-between items-center p-6 border-rose-100 border-b'>
              <div className='flex items-center gap-2'>
                <Link
                  href="/quizzes"
                  className='hover:bg-rose-50 p-2 rounded-full transition-colors flex items-center'
                  aria-label="Retour aux quiz"
                >
                  <ChevronLeft className='w-5 h-5 text-gray-500' />
                </Link>
                <h1 className='font-bold text-xl'>{quizData.title}</h1>
              </div>
              <div className='flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full'>
                <Clock className='w-4 h-4 text-rose-500' />
                <span className='font-medium text-rose-500'>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className='p-6'>
              <div className='mb-6'>
                <div className='bg-gray-100 rounded-full w-full h-2'>
                  <div
                    className='bg-rose-500 rounded-full h-full'
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <div className='mt-2 text-gray-500 text-sm text-right'>
                  Question {currentQuestion + 1} sur {questions.length}
                </div>
              </div>
              {question && (
                <div>
                  <h2 className='mb-6 font-medium text-lg'>{question.question}</h2>
                  <div className='space-y-3 mb-6'>
                    {question.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAnswers[question.id] === option
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "border-gray-200 hover:border-rose-200 hover:bg-rose-50"
                          }`}
                        onClick={() => selectAnswer(question.id, option)}
                      >
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-between'>
                    <button
                      className={`px-6 py-2 rounded-full border ${currentQuestion === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Précédent
                    </button>
                    {currentQuestion < questions.length - 1 ? (
                      <button
                        className='bg-rose-500 hover:bg-rose-600 px-6 py-2 rounded-full text-white transition-colors'
                        onClick={nextQuestion}
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        className='bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full text-white transition-colors'
                        onClick={submitQuiz}
                      >
                        Soumettre
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='md:col-span-1'>
            <div className='bg-white shadow-sm p-6 border border-rose-100 rounded-xl'>
              <div className='bg-rose-50 mb-6 p-4 rounded-lg'>
                <h2 className='font-bold text-xl'>Instructions</h2>
                <p className='text-gray-700'>{quizData.instruction}</p>
              </div>
              <div className='mb-6 p-4 border border-rose-100 rounded-lg'>
                <h3 className='mb-2 font-bold text-lg'>Créateur du quiz</h3>
                <div className='flex items-center gap-3'>
                  <div className='relative border-4 border-rose-100 rounded-full w-16 h-16 overflow-hidden'>
                    <div className='flex justify-center items-center bg-rose-50 w-full h-full font-medium text-rose-500 text-xl'>
                      {getInitials(creator.name || "")}
                    </div>
                  </div>
                  <div>
                    <p className='font-medium text-xl'>{creator.name}</p>
                    <p className='text-gray-500 text-sm'>{creator.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-white shadow-md border border-rose-100 rounded-xl overflow-hidden'>
          <div className='p-8 text-center'>
            <h2 className='mb-4 font-bold text-2xl'>Quiz terminé !</h2>
            <div className='mb-6 font-bold text-rose-500 text-6xl'>{score}%</div>
            {score >= quizData.passingScore ? (
              <div className='bg-green-50 mb-6 p-4 border border-green-200 rounded-lg'>
                <div className='flex justify-center items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                  <p className='font-medium text-green-700'>
                    Félicitations ! Vous avez réussi le quiz et gagné {quizData.xpReward} XP.
                  </p>
                </div>
              </div>
            ) : (
              <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg'>
                <div className='flex justify-center items-center gap-2'>
                  <XCircle className='w-5 h-5 text-red-500' />
                  <p className='font-medium text-red-700'>
                    Vous n&apos;avez pas atteint le score requis de {quizData.passingScore}%. Essayez encore !
                  </p>
                </div>
              </div>
            )}
            <p className='mb-8 text-lg'>
              Vous avez obtenu {totalScore} points.
            </p>
            <div className='flex sm:flex-row flex-col justify-center gap-4'>
              <button
                className='inline-flex justify-center items-center bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-full font-medium text-white transition-colors'
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setScore(0);
                  setTotalScore(0);
                  setTimeLeft(durationToSeconds(quizData.duration));
                  setQuizCompleted(false);
                  setStarted(false);
                }}
              >
                Recommencer le quiz
              </button>
               <Link
                href={`/quiz-result/${quiz.code}`}
                className='inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full font-medium text-white transition-colors'
              >
                View Result
              </Link>
              <Link
                href='/quizzes'
                className='inline-flex justify-center items-center bg-white hover:bg-rose-50 px-6 py-3 border border-rose-200 rounded-full font-medium text-rose-500 transition-colors'
              >
                Retour aux quiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
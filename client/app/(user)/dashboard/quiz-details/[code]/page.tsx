"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Brain,
  Award,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Share2,
} from "lucide-react";
import { useState, use as usePromise } from "react";
import { quizService } from '@/features/quiz/quiz.service';

export default function QuizDetailsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = usePromise<{ code: string }>(params);
  const [copiedCode, setCopiedCode] = useState("");
  const router = useRouter();

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ["quiz", code],
    queryFn: () => quizService.getQuizByCode(code),
    enabled: !!code,
  });


  const handleShare = () => {
    const shareUrl = `${window.location.origin}/dashboard/quiz-details/${quiz?.code}`;
    if (navigator.share) {
      navigator.share({
        title: quiz?.title,
        text: `Essayez ce quiz : ${quiz?.title}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedCode(`share-${quiz?.code}`);
      setTimeout(() => setCopiedCode(""), 2000);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Chargement du quiz...</div>;
  }
  if (isError || !quiz) {
    return (
      <div className="text-center py-12 text-red-500">
        Erreur lors du chargement du quiz.
        <button onClick={() => router.back()} className="block mt-4 text-red-400 underline">Retour</button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 md:px-6 py-10 container">
      <Link
        href="/dashboard/my-quizzes"
        className="inline-flex items-center mb-6 text-red-500 hover:underline"
      >
        <ChevronLeft className="mr-1 w-4 h-4" /> Retour à mes quiz
      </Link>

      <div className="gap-8 grid md:grid-cols-3">
        <div className="md:col-span-2 bg-white shadow-sm p-6 border border-red-100 rounded-xl">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <span className="inline-block bg-red-100 px-3 py-1 rounded-full font-medium text-red-600 text-xs">
              {quiz.subject}
            </span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="mr-1 w-4 h-4" />
              {quiz.duration}
            </div>
          </div>

          <h1 className="mb-2 font-bold text-2xl">{quiz.title}</h1>

          <div className="flex items-center mb-2 text-gray-600 text-sm">
            <Brain className="mr-1 w-4 h-4" /> {quiz.topic}
          </div>
          <div className="flex items-center mb-2 text-gray-600 text-sm">
            <ListTodo className="mr-1 w-4 h-4" /> {quiz.questions.length} Questions
          </div>

          <div className="flex items-center mb-4 text-gray-600 text-sm">
            <Award className="mr-1 w-4 h-4 text-red-500" /> {quiz.xpReward} XP à gagner
          </div>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/quiz-session/${quiz.code}`}
              className="inline-flex flex-1 justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors"
            >
              Commencer <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex justify-center items-center bg-white hover:bg-red-50 px-3 py-2 border border-red-200 rounded-full font-medium text-red-500 transition-colors"
              title="Partager le quiz"
            >
              {copiedCode === `share-${quiz.code}` ? (
                <span className="text-green-500 text-xs">Lien copié !</span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Infos créateur et instructions */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-sm p-6 border border-red-100 rounded-xl">
            {quiz.instruction && (
              <div className="bg-red-50 mb-6 p-4 border border-red-100 rounded-lg text-red-800 text-sm">
                <h2 className="mb-2 font-semibold text-xl">Instructions</h2>
                <p>{quiz.instruction}</p>
              </div>
            )}
              {/*
                TODO: Pour afficher les infos du créateur, il faut que quiz.createdBy soit un objet User.
                Actuellement, c'est un id (number). On masque la section pour éviter les erreurs.
              */}
              <div className="mb-6 p-4 border border-red-100 rounded-lg">
                <h3 className="mb-2 font-bold text-lg">Créateur du quiz</h3>
                <div className="flex items-center gap-3">
                    <div>
                        <p className="font-medium text-sm">{quiz.createdBy.name}</p>
                        <p className="text-gray-500 text-sm">{quiz.createdBy.email}</p>
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

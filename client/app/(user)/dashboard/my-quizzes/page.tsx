"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Eye,
  Copy,
  Clock,
  Brain,
  Award,
  Lock,
  Globe,
} from "lucide-react";
import { useMyQuizzes } from '@/features/quiz/hooks/use-my-quizzes';



export default function MyQuizzesPage() {
  const [copiedCode, setCopiedCode] = useState("");
  const { data: quizzes = [], isLoading, isError } = useMyQuizzes();

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto px-4  max-w-6xl">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Mes Quiz</h1>
          <p className="text-gray-500">
            Gérez les quiz que vous avez créés et partagez-les avec d&apos;autres utilisateurs.
          </p>
        </div>
        <Link
          href="/dashboard/create-quiz"
          className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 mt-4 md:mt-0 px-4 py-2 rounded-full font-medium text-white transition-colors"
        >
          <Plus className="mr-1 w-4 h-4" /> Créer un quiz
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Chargement des quiz...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Erreur lors du chargement des quiz.</div>
      ) : quizzes.length === 0 ? (
        <div className="bg-red-50 py-12 rounded-xl text-center">
          <div className="inline-flex justify-center items-center bg-red-100 mb-4 rounded-full w-12 h-12">
            <Plus className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="mb-2 font-semibold text-xl">Aucun quiz pour l&apos;instant</h3>
          <p className="mb-4 text-gray-500">
            Vous n&apos;avez pas encore créé de quiz. Créez votre premier quiz pour commencer !
          </p>
          <Link
            href="/dashboard/create-quiz"
            className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors"
          >
            <Plus className="mr-1 w-4 h-4" /> Créer un quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white shadow-sm hover:shadow-md border border-red-100 rounded-xl overflow-hidden transition-all"
            >
              <div className="p-6">
                <div className="flex md:flex-row flex-col justify-between md:items-center mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-red-100 px-3 py-1 rounded-full font-medium text-red-600 text-xs">
                        {quiz.subject}
                      </span>
                      <span className="text-gray-500 text-xs">
                        Créé le {formatDate(quiz.createdAt)}
                      </span>
                      {quiz.isPublic ? (
                        <span className="inline-flex items-center font-medium text-green-600 text-xs">
                          <Globe className="mr-1 w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center font-medium text-orange-600 text-xs">
                          <Lock className="mr-1 w-3 h-3" /> Privé
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 font-semibold text-xl">{quiz.title}</h3>
                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                      <div className="flex items-center">
                        <Brain className="mr-1 w-4 h-4" /> {quiz.topic}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 w-4 h-4" /> {quiz.duration}
                      </div>
                      <div className="flex items-center">
                        <Award className="mr-1 w-4 h-4 text-red-500" /> {quiz.xpReward} XP
                      </div>
                      <div>{quiz.questions.length} questions</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500 text-xs">Code du quiz :</span>
                    <span className="bg-red-50 px-2 py-1 rounded-md font-medium text-red-600 text-xs">
                      {quiz.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCodeToClipboard(quiz.code)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Copier le code du quiz"
                  >
                    {copiedCode === quiz.code ? (
                      <span className="text-green-500 text-xs">Copié !</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/quiz-details/${quiz.code}`}
                    className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors"
                  >
                    <Eye className="mr-1 w-4 h-4" /> Voir le quiz
                  </Link>
                  <Link
                    href={`/edit-quiz/${quiz.id}`}
                    className="inline-flex justify-center items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-full font-medium text-gray-700 transition-colors"
                  >
                    <Edit className="mr-1 w-4 h-4" /> Modifier
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

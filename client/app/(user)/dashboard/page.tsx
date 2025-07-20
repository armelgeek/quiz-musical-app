
"use client";

import { useUserInfo } from "@/shared/hooks/use-user-info";
import { CheckCircle, XCircle, Clock, BookMarked } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';
import { useQuizHistory } from '@/features/quiz/hooks/use-quiz-history';

export default function UserDashboardPage() {
  const { user } = useUserInfo();
  const [page, setPage] = useState(1);
  const limit = 6;
  const { data, isLoading, isFetching } = useQuizHistory(page, limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bonjour, {user?.name || "Utilisateur"} 👋
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Voici un aperçu de votre activité aujourd&apos;hui
          </p>
        </div>
      </div>

      <section>
        <div className="sticky top-0 z-10 bg-gray-50 pb-2">
          <h2 className="text-lg font-bold mb-2 tracking-tight text-rose-600 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-rose-500" /> Historique de vos quiz
          </h2>
        </div>
        {isLoading ? (
          <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
            <div className='flex justify-center items-center h-64'>
              <div className='border-rose-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
            </div>
          </div>
  ) : !data?.items?.length ? (
          <div className="text-center text-gray-500 py-12">Aucun quiz complété pour l’instant.</div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.items.map((quiz) => {
              let percent = quiz.maxScore > 0 ? Math.round((quiz.score / quiz.maxScore) * 100) : 0;
              if (percent > 100) percent = 100;
              return (
                <div
                  key={quiz.quizId + quiz.code}
                  className="group bg-white shadow-md border border-rose-100 rounded-xl p-5 transition-transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{quiz.passed ? 'Réussi' : 'Échoué'}</span>
                    <span className="text-xs text-gray-400">{quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : ''}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate" title={quiz.title}>{quiz.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{quiz.subject} • {quiz.topic}</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{quiz.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">Score:</span>
                    <span className="font-bold text-base text-rose-600">{quiz.score}/{quiz.maxScore}</span>
                    <span className="text-xs text-gray-400">({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
                    <div className={`h-full rounded-full ${quiz.passed ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Link href={`/quiz-result/${quiz.code}`} className="inline-flex items-center gap-2 text-red-600 font-medium text-sm hover:underline">
                      <BookMarked className="w-4 h-4" />
                      <span>{quiz.code}</span>
                    </Link>
                    <span className="text-xs text-gray-500">Seuil: {quiz.passingScore}%</span>
                  </div>
                  <div className="absolute right-4 top-4">
                    {quiz.passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mb-8 items-center gap-2 mt-10 select-none">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              onClick={() => setPage(1)}
              disabled={page === 1 || isFetching}
              aria-label="Première page"
            >
              «
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              aria-label="Page précédente"
            >
              ←
            </button>
            {/* Page numbers, show up to 3 before/after current */}
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === data.totalPages)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [] as (number | 'ellipsis')[])
              .map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={"ellipsis-" + idx} className="px-1 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition font-semibold ${p === page ? 'bg-rose-500 text-white border-rose-500 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    onClick={() => setPage(p as number)}
                    disabled={isFetching}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              onClick={() => setPage((p) => (data.totalPages ? Math.min(data.totalPages, p + 1) : p + 1))}
              disabled={data.page === data.totalPages || isFetching}
              aria-label="Page suivante"
            >
              →
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
              onClick={() => setPage(data.totalPages)}
              disabled={page === data.totalPages || isFetching}
              aria-label="Dernière page"
            >
              »
            </button>
          </div>
          </>
        )}
      </section>
    </div>
  );
}

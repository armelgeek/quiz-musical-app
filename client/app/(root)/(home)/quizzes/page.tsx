"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Brain,
  Clock,
  Award,
  ChevronRight,
  Share2,
  Copy,
  User as UserIcon,
} from "lucide-react";
import { useQuizzes } from '@/features/quiz/hooks/use-quizzes';

export default function QuizzesPage() {
  const { data: quizzes = [], isLoading } = useQuizzes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  // Filtrage local (search/subject)
  const filtered = quizzes.filter((quiz) => {
    const matchesSearch =
      !searchTerm ||
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || quiz.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(quizzes.map((q) => q.subject)));

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container">
      <section className="mb-10">
        <div className="bg-white border border-red-100 rounded-2xl shadow-sm px-6 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 text-3xl shadow-sm">
              🎲
            </span>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight text-red-600 mb-1">Explorer les quiz</h1>
              <p className="text-gray-500 text-base max-w-md">Découvrez, recherchez et rejoignez des quiz créés par la communauté. Entrez un code ou filtrez par matière !</p>
            </div>
          </div>
          <Link
            href="/dashboard/my-quizzes"
            className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full font-semibold text-white shadow transition-all whitespace-nowrap"
          >
            <Award className="mr-2 w-5 h-5" /> Mes quiz
          </Link>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="py-2.5 pr-4 pl-10 border border-red-200 focus:border-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200 w-full bg-white shadow-sm"
              placeholder="🔍 Rechercher par titre, code ou matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <select
              className="py-2.5 pr-8 pl-10 border border-red-200 focus:border-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200 w-full appearance-none bg-white text-gray-700 shadow-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">🎯 Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              ▼
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 animate-pulse">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <div className="h-6 w-40 bg-red-100 rounded mb-2" />
          <div className="h-4 w-64 bg-red-50 rounded" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white py-16 rounded-2xl text-center shadow-inner border border-red-100">
          <div className="inline-flex justify-center items-center bg-red-100 mb-4 rounded-full w-16 h-16 shadow">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="mb-2 font-bold text-2xl text-red-600">Aucun quiz trouvé</h3>
          <p className="mb-6 text-gray-500">Essayez une autre recherche ou parcourez tous les quiz.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject("");
            }}
            className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-full font-semibold text-white shadow transition-all"
          >
            Voir tous les quiz
          </button>
        </div>
      ) : (
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-white/90 shadow-md hover:shadow-xl border border-red-100 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:scale-[1.025] relative"
            >
              <div className="p-7 pt-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="inline-block bg-red-100 px-3 py-1 rounded-full font-semibold text-red-600 text-xs tracking-wide shadow-sm">
                    {quiz.subject}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs font-medium">
                    <Clock className="mr-1 w-4 h-4" />
                    {quiz.duration}
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-xl line-clamp-1 text-gray-800 group-hover:text-red-600 transition-colors">
                  {quiz.title}
                </h3>
                <div className="flex items-center mb-2 text-gray-500 text-sm">
                  <Brain className="mr-1 w-4 h-4" /> {quiz.topic} • {quiz.questions.length} questions
                </div>
                <div className="flex items-center mb-2 text-gray-400 text-xs">
                  <UserIcon className="mr-1 w-4 h-4" /> Créateur #{typeof quiz.createdBy.name}
                </div>
                <div className="flex items-center mb-4 text-gray-500 text-sm">
                  <Award className="mr-1 w-5 h-5 text-red-500" />
                  <span>Gagnez <span className="font-bold text-sm px-1 text-red-600">{quiz.xpReward} XP</span> à la fin</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-400 text-xs">Code du quiz :</span>
                    <span className="bg-red-50 px-2 py-1 rounded-md font-semibold text-red-600 text-xs tracking-wider shadow-sm">
                      {quiz.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCodeToClipboard(quiz.code)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Copier le code du quiz"
                  >
                    {copiedCode === quiz.code ? (
                      <span className="text-green-500 text-xs font-semibold">Copié !</span>
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/quiz-details/${quiz.code}`}
                    className="inline-flex flex-1 justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-semibold text-white shadow-md transition-all"
                  >
                    Voir le quiz <ChevronRight className="ml-1 w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/quizzes/${quiz.code}`;
                      if (navigator.share) {
                        navigator.share({
                          title: quiz.title,
                          text: `Teste ce quiz : ${quiz.title}`,
                          url: shareUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedCode(`share-${quiz.code}`);
                        setTimeout(() => setCopiedCode(""), 2000);
                      }
                    }}
                    className="inline-flex justify-center items-center bg-white hover:bg-red-50 px-3 py-2 border border-red-200 rounded-full font-semibold text-red-500 shadow transition-all"
                    title="Partager le quiz"
                  >
                    {copiedCode === `share-${quiz.code}` ? (
                      <span className="text-green-500 text-xs font-semibold">Copié !</span>
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

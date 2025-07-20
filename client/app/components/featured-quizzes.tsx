"use client";

import Link from "next/link";
import { Brain, Clock, Award, ChevronRight } from "lucide-react";

const featuredQuizzes = [
  {
    id: 1,
    title: "Quiz Fondamentaux des Statistiques",
    subject: "Mathématiques",
    topic: "Statistiques",
    duration: "30 minutes",
    xpReward: 50,
    questions: 4,
  },
  {
    id: 2,
    title: "Quiz Probabilités",
    subject: "Mathématiques",
    topic: "Probabilités",
    duration: "30 minutes",
    xpReward: 40,
    questions: 5,
  },
  {
    id: 3,
    title: "Quiz Noms Propres",
    subject: "Anglais",
    topic: "Noms propres",
    duration: "20 minutes",
    xpReward: 45,
    questions: 4,
  },
];

export default function FeaturedQuizzes() {
  return (
    <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
      {featuredQuizzes.map((quiz) => (
        <div
          key={quiz.id}
          className='bg-white shadow-sm hover:shadow-md border border-red-100 rounded-xl overflow-hidden transition-all'
        >
          <div className='p-6'>
            <div className='flex justify-between items-center mb-3'>
              <span className='inline-block bg-red-100 px-3 py-1 rounded-full font-medium text-red-600 text-xs'>
                {quiz.subject}
              </span>
              <div className='flex items-center text-gray-500 text-sm'>
                <Clock className='mr-1 w-3 h-3' />
                {quiz.duration}
              </div>
            </div>
            <h3 className='mb-2 font-semibold text-lg line-clamp-1'>
              {quiz.title}
            </h3>
            <div className='flex items-center mb-4 text-gray-500 text-sm'>
              <Brain className='mr-1 w-3 h-3' /> {quiz.topic} • {quiz.questions} questions
            </div>
            <div className='flex items-center mb-4 text-gray-500 text-sm'>
              <Award className='mr-1 w-4 h-4 text-red-500' />
              <span>Gagnez {quiz.xpReward} XP à la fin</span>
            </div>
            <Link
              href={`/quiz/${quiz.id}`}
              className='inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full w-full font-medium text-white transition-colors'
            >
              Faire le quiz <ChevronRight className='ml-1 w-4 h-4' />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

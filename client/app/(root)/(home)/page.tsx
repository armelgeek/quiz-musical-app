import Link from "next/link";
import { BookOpen, Award, Brain, ChevronRight } from "lucide-react";
import FeaturedQuizzes from "@/app/components/featured-quizzes";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <section
          className="relative py-12 md:py-24 lg:py-32 w-full overflow-hidden"
          style={{
            background: "linear-gradient(120deg, #fff 0%, #fdf2f8 60%, #ffe4e6 100%)"
          }}
        >
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='inline-block bg-rose-100 px-3 py-1 rounded-full font-medium text-rose-600 text-sm shadow-sm'>
                Apprends et progresse avec des quiz ludiques
              </div>
              <h1 className='font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter text-gray-900'>
                Teste tes connaissances avec {" "}
                <span className='text-rose-500'>Quiz</span>
              </h1>
              <p className='max-w-[700px] text-gray-500 md:text-xl'>
                Joue à des quiz sur de nombreux sujets, gagne de l&apos;XP et grimpe dans le classement !
              </p>
              <div className='flex sm:flex-row flex-col gap-4 mt-2'>
                <Link
                  href='/quizzes'
                  className='inline-flex justify-center items-center bg-rose-500 hover:bg-rose-600 px-7 py-3 rounded-full font-semibold text-white shadow-md transition-all text-lg'
                >
                  Commencer un quiz <ChevronRight className='ml-2 w-5 h-5' />
                </Link>
                <Link
                  href='/register'
                  className='inline-flex justify-center items-center bg-white hover:bg-rose-50 px-7 py-3 border border-rose-200 rounded-full font-semibold text-rose-500 shadow-md transition-all text-lg'
                >
                  Inscription gratuite
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className='py-12 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block bg-rose-100 px-3 py-1 rounded-full font-medium text-rose-600 text-sm shadow-sm'>
                  Fonctionnalités
                </div>
                <h2 className='font-extrabold text-3xl md:text-4xl tracking-tighter text-gray-900'>
                  Pourquoi choisir Quiz ?
                </h2>
                <p className='max-w-[700px] text-gray-500 md:text-xl'>
                  Notre plateforme propose une façon ludique et engageante d&apos;apprendre et de tester tes connaissances.
                </p>
              </div>
            </div>
            <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto mt-8 max-w-5xl'>
              <div className='bg-white shadow-md hover:shadow-lg p-6 border border-rose-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-rose-100 mb-4 rounded-full w-12 h-12'>
                  <BookOpen className='w-6 h-6 text-rose-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Sujets variés</h3>
                <p className='text-gray-500'>
                  Découvre des quiz sur de nombreux sujets, des mathématiques à l&apos;anglais et bien plus.
                </p>
              </div>
              <div className='bg-white shadow-md hover:shadow-lg p-6 border border-rose-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-rose-100 mb-4 rounded-full w-12 h-12'>
                  <Award className='w-6 h-6 text-rose-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Gagne de l&apos;XP &amp; des niveaux</h3>
                <p className='text-gray-500'>
                  Réalise des quiz pour gagner de l&apos;XP et faire évoluer ton profil.
                </p>
              </div>
              <div className='bg-white shadow-md hover:shadow-lg p-6 border border-rose-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-rose-100 mb-4 rounded-full w-12 h-12'>
                  <Brain className='w-6 h-6 text-rose-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Crée tes propres quiz</h3>
                <p className='text-gray-500'>
                  Crée et partage tes propres quiz grâce à notre éditeur simple et intuitif.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='bg-rose-50 py-12 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block bg-rose-100 px-3 py-1 rounded-full font-medium text-rose-600 text-sm shadow-sm'>
                  Quiz à la une
                </div>
                <h2 className='font-extrabold text-3xl md:text-4xl tracking-tighter text-gray-900'>
                  Les plus populaires du moment
                </h2>
                <p className='max-w-[700px] text-gray-500 md:text-xl'>
                  Découvre les quiz tendances de notre collection.
                </p>
              </div>
            </div>
            <div className='mx-auto mt-8'>
              <FeaturedQuizzes />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

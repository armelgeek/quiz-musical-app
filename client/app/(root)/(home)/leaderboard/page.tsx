"use client";

import { usePodium, useLeaderboard } from '@/features/leaderboard/hooks/use-leaderboard';
import { useUserLeaderboard } from '@/features/user/hooks/use-user-leaderboard';
import Image from 'next/image';


import { useState } from 'react';



export function PodiumCard() {
  const { data, isLoading, error } = usePodium();
  // Podium sportif : 2e - 1er - 3e
  const podium = data && data.length >= 3 ? [data[1], data[0], data[2]] : data;
  return (
    <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-xl p-6 flex-1 min-w-[320px] border border-amber-100 relative overflow-visible">
      <h3 className="font-bold text-xl mb-6 text-pink-600 text-center tracking-tight">Podium du jour</h3>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <div className="relative flex flex-col items-center">
          {/* Noms et badges */}
          <div className="flex w-full justify-center gap-12 mb-2">
            {podium?.[0] && <div className="flex flex-col items-center w-20">
              <span className="font-semibold text-sm text-gray-700 mb-1 truncate">{podium[0].user.name}</span>
              <span className="text-xs text-gray-400">1 victoire</span>
            </div>}
            {podium?.[1] && <div className="flex flex-col items-center w-20">
              <span className="font-semibold text-sm text-gray-700 mb-1 truncate">{podium[1].user.name}</span>
              <span className="text-xs text-gray-400">1 victoire</span>
            </div>}
            {podium?.[2] && <div className="flex flex-col items-center w-20">
              <span className="font-semibold text-sm text-gray-700 mb-1 truncate">{podium[2].user.name}</span>
              <span className="text-xs text-gray-400">1 victoire</span>
            </div>}
          </div>
          {/* Avatars sur socle */}
          <div className="relative flex items-end justify-center gap-12 h-28 w-full">
            {/* 2e */}
            {podium?.[0] && (
              <div className="flex flex-col items-center z-10" style={{ bottom: '0.5rem' }}>
                {podium[0].user.image ? (
                  <Image src={podium[0].user.image} alt={podium[0].user.name} width={48} height={48} className="rounded-full border-2 border-pink-400 shadow-md" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-pink-300 shadow-md">{podium[0].user.name[0]}</span>
                )}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">2</span>
              </div>
            )}
            {/* 1er */}
            {podium?.[1] && (
              <div className="flex flex-col items-center z-20" style={{ bottom: '1.5rem' }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">⭐</span>
                {podium[1].user.image ? (
                  <Image src={podium[1].user.image} alt={podium[1].user.name} width={64} height={64} className="rounded-full border-4 border-pink-500 shadow-xl" />
                ) : (
                  <span className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border-4 border-pink-400 shadow-xl">{podium[1].user.name[0]}</span>
                )}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">1</span>
              </div>
            )}
            {/* 3e */}
            {podium?.[2] && (
              <div className="flex flex-col items-center z-10" style={{ bottom: '0rem' }}>
                {podium[2].user.image ? (
                  <Image src={podium[2].user.image} alt={podium[2].user.name} width={44} height={44} className="rounded-full border-2 border-pink-300 shadow-md" />
                ) : (
                  <span className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border-2 border-pink-300 shadow-md">{podium[2].user.name[0]}</span>
                )}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">3</span>
              </div>
            )}
            {/* Socle SVG */}
            <svg viewBox="0 0 220 60" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[220px] h-[60px] z-0" fill="none">
              <rect x="0" y="40" width="60" height="20" rx="4" fill="#e5e7eb" />
              <rect x="80" y="20" width="60" height="40" rx="6" fill="#fbbf24" />
              <rect x="160" y="40" width="60" height="20" rx="4" fill="#e5e7eb" />
              <text x="30" y="55" textAnchor="middle" fontSize="22" fill="#888" fontWeight="bold">2</text>
              <text x="110" y="50" textAnchor="middle" fontSize="32" fill="#f59e42" fontWeight="bold" stroke="#fff" strokeWidth="2">1</text>
              <text x="190" y="55" textAnchor="middle" fontSize="22" fill="#888" fontWeight="bold">3</text>
            </svg>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">Suite du classement</div>
        </div>
      )}
    </div>
  );
}

export function LeaderboardCard() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data, isLoading, error } = useLeaderboard(period, page, limit);;

  return (
    <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl shadow-lg p-5 flex-1 min-w-[260px] border border-rose-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-rose-600 flex items-center gap-2">
          🥇 Leaderboard
        </h3>
        <div className="flex gap-1">
          {[
            { label: 'Jour', value: 'day' },
            { label: 'Semaine', value: 'week' },
            { label: 'Mois', value: 'month' },
            { label: 'Tout', value: 'all' },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition
                ${period === value
                  ? 'bg-rose-500 text-white border-rose-500 shadow'
                  : 'bg-white text-rose-500 border-rose-200 hover:bg-rose-100'}
              `}
              onClick={() => { setPeriod(value as typeof period); setPage(1); }}
              aria-pressed={period === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <>
          <ol className="space-y-3">
            {data?.items?.map((entry: typeof data.items[0], idx: number) => (
              <li key={entry.userId} className="flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-rose-100/40 transition">
                <span className="font-bold w-7 text-center text-rose-400 text-lg">{(page - 1) * (data.limit || 5) + idx + 1}</span>
                {entry.user.image ? (
                  <Image src={entry.user.image} alt={entry.user.name} width={32} height={32} className="rounded-full border border-rose-200" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-rose-100">{entry.user.name[0]}</span>
                )}
                <span className="truncate font-medium text-base">{entry.user.name}</span>
                <span className="ml-auto text-rose-600 font-semibold">{entry.totalScore} pts</span>
              </li>
            ))}
          </ol>
        
        </>
      )}
    </div>
  );
}

export function TopXpCard() {
  const { data, isLoading, error } = useUserLeaderboard();
  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-5 flex-1 min-w-[260px] border border-green-100">
      <h3 className="font-bold text-lg mb-3 text-green-600 flex items-center gap-2">
        🌱 Top XP
      </h3>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <ol className="space-y-3">
          {data?.slice(0, 5).map((user, idx) => (
            <li key={user.id} className="flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-green-100/40 transition">
              <span className="font-bold w-7 text-center text-green-400 text-lg">{idx + 1}</span>
              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-green-100">{user.name[0]}</span>
              <span className="truncate font-medium text-base">{user.name}</span>
              <span className="ml-auto text-green-600 font-semibold">{user.xp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen pb-16">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-rose-100 shadow-sm py-4 mb-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
          <span className="text-3xl">🏅</span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Classements</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-2 flex flex-col gap-10">
        {/* Podium en haut, centré */}
        <div className="flex justify-center mb-2">
          <div className="w-full max-w-2xl">
            <PodiumCard />
          </div>
        </div>
        {/* Leaderboard + XP côte à côte */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-1">
            <LeaderboardCard />
          </div>
          <div className="flex-1">
            <TopXpCard />
          </div>
        </div>
      </main>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute right-0 bottom-0 w-[300px] h-[300px] bg-green-100/30 rounded-full blur-2xl opacity-40" />
        <div className="absolute left-0 top-0 w-[200px] h-[200px] bg-rose-100/30 rounded-full blur-2xl opacity-40" />
      </div>
    </div>
  );
}

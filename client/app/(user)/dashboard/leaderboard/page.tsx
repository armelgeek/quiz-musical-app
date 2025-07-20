"use client";

import { usePodium, useLeaderboard } from '@/features/leaderboard/hooks/use-leaderboard';
import { useUserLeaderboard } from '@/features/user/hooks/use-user-leaderboard';
import Image from 'next/image';

function PodiumCard() {
  const { data, isLoading, error } = usePodium();
  return (
    <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[260px]">
      <h3 className="font-bold text-lg mb-2 text-amber-600">Podium du jour</h3>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <ol className="space-y-2">
          {data?.map((entry, idx) => (
            <li key={entry.userId} className="flex items-center gap-2">
              <span className={`font-bold text-xl w-6 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-500' : 'text-yellow-700'}`}>{idx + 1}</span>
              {entry.user.image ? (
                <Image src={entry.user.image} alt={entry.user.name} width={32} height={32} className="rounded-full" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{entry.user.name[0]}</span>
              )}
              <span className="font-medium truncate">{entry.user.name}</span>
              <span className="ml-auto text-rose-600 font-bold">{entry.totalScore} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function LeaderboardCard() {
  const { data, isLoading, error } = useLeaderboard('all');
  return (
    <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[260px]">
      <h3 className="font-bold text-lg mb-2 text-rose-600">Leaderboard général</h3>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <ol className="space-y-2">
          {data?.slice(0, 5).map((entry, idx) => (
            <li key={entry.userId} className="flex items-center gap-2">
              <span className="font-bold w-6 text-center text-gray-400">{idx + 1}</span>
              {entry.user.image ? (
                <Image src={entry.user.image} alt={entry.user.name} width={28} height={28} className="rounded-full" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{entry.user.name[0]}</span>
              )}
              <span className="truncate">{entry.user.name}</span>
              <span className="ml-auto text-gray-600 font-semibold">{entry.totalScore} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TopXpCard() {
  const { data, isLoading, error } = useUserLeaderboard();
  return (
    <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[260px]">
      <h3 className="font-bold text-lg mb-2 text-green-600">Top XP</h3>
      {isLoading ? <div>Chargement…</div> : error ? <div className="text-red-500">Erreur</div> : (
        <ol className="space-y-2">
          {data?.slice(0, 5).map((user, idx) => (
            <li key={user.id} className="flex items-center gap-2">
              <span className="font-bold w-6 text-center text-gray-400">{idx + 1}</span>
              <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{user.name[0]}</span>
              <span className="truncate">{user.name}</span>
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
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Classements</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <PodiumCard />
        <LeaderboardCard />
        <TopXpCard />
      </div>
    </div>
  );
}

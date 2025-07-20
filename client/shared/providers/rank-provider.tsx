"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";


import { useUserInfo } from '@/shared/hooks/use-user-info';
import { useUpdateRank } from '@/shared/hooks/use-update-rank';

interface RankData {
  rank: string;
  minXP: number;
  maxXP: number;
  description: string;
}

interface RankContextType {
  xp: number;
  rank: string;
  level: number;
  updateXPAndRank: (earnedXp: number) => void;
  calculateNextLevelXP: (xp: number) => number;
}

// Rank data with levels assigned by order
const rankData: RankData[] = [
  {
    rank: "🥚 Nouvelle Note",
    minXP: 0,
    maxXP: 99,
    description:
      "Chaque virtuose commence par accorder son instrument… tu viens de faire ta première note !",
  },
  {
    rank: "🐣 Petit Percussionniste",
    minXP: 100,
    maxXP: 299,
    description:
      "Tu explores les premières gammes du quiz musical — l’aventure commence à swinguer !",
  },
  {
    rank: "📚 Lecteur de Partitions",
    minXP: 300,
    maxXP: 599,
    description:
      "Tu déchiffres les partitions et découvres de nouveaux styles. L’échauffement est musical !",
  },
  {
    rank: "🌱 Jeune Improvisateur",
    minXP: 600,
    maxXP: 999,
    description: "Tu commences à improviser tes solos et à trouver ton rythme dans le quiz !",
  },
  {
    rank: "💡 Oreille Affûtée",
    minXP: 1000,
    maxXP: 1499,
    description:
      "Tu reconnais les mélodies dès les premières notes. L’oreille musicale s’affine !",
  },
  {
    rank: "🧪 Mixeur de Styles",
    minXP: 1500,
    maxXP: 2499,
    description: "Tu mixes les styles et samples les époques. Le groove est en toi !",
  },
  {
    rank: "🎮 Maestro du Blind Test",
    minXP: 2500,
    maxXP: 3999,
    description:
      "Tu restes concentré même quand le tempo s’accélère. Les blind tests n’ont plus de secret pour toi !",
  },
  {
    rank: "🧠 Mémoire Musicale",
    minXP: 4000,
    maxXP: 5999,
    description:
      "Tu reconnais les artistes à la première mesure. Ta mémoire musicale est affûtée !",
  },
  {
    rank: "📜 Encyclopédiste du Son",
    minXP: 6000,
    maxXP: 7999,
    description:
      "Ta playlist de victoires s’allonge. Tu deviens un vrai encyclopédiste du son !",
  },
  {
    rank: "🚀 Voyageur des Genres",
    minXP: 8000,
    maxXP: 9999,
    description:
      "Tu explores tous les genres, du classique au rap, sans fausse note !",
  },
  {
    rank: "⚡ Roi du Refrain",
    minXP: 10000,
    maxXP: 12999,
    description:
      "Tu buzze plus vite que la lumière. Les refrains n’ont plus de secret pour toi !",
  },
  {
    rank: "🏛️ Chef d'Orchestre",
    minXP: 13000,
    maxXP: 15999,
    description:
      "Tes analyses sont dignes d’un chef d’orchestre. Tu joues chaque manche en maestro !",
  },
  {
    rank: "👑 Star de la Scène",
    minXP: 16000,
    maxXP: 19999,
    description:
      "Tu es la star de la scène, acclamé pour ta culture musicale et ta régularité !",
  },
  {
    rank: "🌌 Légende Harmonique",
    minXP: 20000,
    maxXP: Infinity,
    description:
      "Tu as atteint le sommet ! Ton esprit résonne comme une symphonie de génie musical !",
  },
];

// Calculate rank and corresponding level based on XP
const calculateRankAndLevel = (xp: number): { rank: string; level: number } => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      return { rank: rankData[i].rank, level: i + 1 }; // Level is based on rank index +1
    }
  }
  return { rank: "🚀 Grandmaster of Knowledge", level: rankData.length }; // Highest rank & level
};

// Calculate XP needed to reach the next level
const calculateNextLevelXP = (xp: number): number => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      if (i + 1 < rankData.length) {
        return rankData[i + 1].minXP - xp;
      }
    }
  }
  return 0;
};

const RankContext = createContext<RankContextType | undefined>(undefined);

interface RankProviderProps {
  children: ReactNode;
}

export const RankProvider = ({ children }: RankProviderProps) => {
  const { user } = useUserInfo();
  const [xp, setXp] = useState<number>(user?.xp ?? 0);
  const [currentRank, setCurrentRank] = useState<string>("");
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  const updateRankMutation = useUpdateRank();

  useEffect(() => {
    if (user && typeof user.xp === 'number') {
      const { rank, level } = calculateRankAndLevel(user.xp);
      setXp(user.xp);
      setCurrentRank(rank);
      setCurrentLevel(level);
    }
  }, [user]);

  const updateXPAndRank = (earnedXp: number) => {
    const newXP = xp + earnedXp;
    const { rank: newRank, level: newLevel } = calculateRankAndLevel(newXP);
    setXp(newXP);
    setCurrentRank(newRank);
    setCurrentLevel(newLevel);
    updateRankMutation.mutate({ xp: newXP, rank: newRank, level: newLevel });
  };


  return (
    <RankContext.Provider
      value={{
        xp,
        rank: currentRank,
        level: currentLevel,
        updateXPAndRank,
        calculateNextLevelXP,
      }}
    >
      {children}
    </RankContext.Provider>
  );
};

export const useRank = (): RankContextType => {
  const context = useContext(RankContext);
  if (!context) {
    throw new Error("useRank must be used within a RankProvider");
  }
  return context;
};

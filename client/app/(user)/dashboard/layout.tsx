"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserInfo } from '@/shared/hooks/use-user-info'
import {
  Home,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  Menu,
  X,
  Award
} from "lucide-react";
import { Button } from "@/shared/components/atoms/ui/button";
import { Logo } from "@/shared/components/atoms/ui/logo";
import Image from 'next/image';
import { useAuth } from "@/shared/providers/auth-provider";
import { useRank } from "@/shared/providers/rank-provider";

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: "Accueil", href: "/dashboard" },
  { icon: User, label: "Profil", href: "/dashboard/profile" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useUserInfo();
  const { calculateNextLevelXP } = useRank();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-52">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Menu Mobile */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <Logo size="md" variant="compact" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">Mon espace</span>
                  <span className="text-xs text-gray-500 font-medium">Personnel</span>
                </div>
              </Link>
            </div>

            {/* Actions de navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user?.name || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
              </div>


              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {/* Profile Section Mobile */}
            <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl mb-4'>
              <div className='flex lg:flex-row flex-col items-center gap-4 pb-4'>
                <div className='relative border-4 border-pink-100 rounded-full w-20 h-20 overflow-hidden'>
                  {user?.image ? (
                    <Image
                      src={user?.image || "/images/placeholder.png"}
                      alt={user?.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-xl'>
                      {getInitials(user?.name || '')}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className='font-bold text-xl'>{user?.name || ""}</h2>
                  <p className='text-gray-500 text-sm'>{user?.rank || ""}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Home className="w-4 h-4 text-primary" />
                Navigation
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="space-y-2">
                <Button
                  className="w-full justify-start gap-2 h-9"
                  variant="ghost"
                  size="sm"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Button>

                <Button
                  className="w-full justify-start gap-2 h-9"
                  variant="ghost"
                  size="sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  Aide & Support
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Layout Principal */}
      <div className="flex mt-4 sm:mt-6 lg:mt-10 px-4 sm:px-6 lg:px-8 xl:px-52">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-80  rounded-lg shadow-sm border border-gray-100 h-fit">
          {/* Profile Section */}
          <div className='p-6 border bg-white border-red-100 mb-4'>
            <div className='flex lg:flex-row flex-col items-center gap-4'>
              <div className='relative border-4 border-red-100 rounded-full w-20 h-20 overflow-hidden'>
                {user?.image ? (
                  <Image
                    src={user.image || "/images/placeholder.png"}
                    alt={user.name || ""}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex justify-center items-center bg-red-50 w-full h-full font-medium text-red-500 text-xl'>
                    {getInitials(user?.name || '')}
                  </div>
                )}
              </div>
              <div>
                <h2 className='font-bold text-xl'>{user?.name}</h2>
                <p className='text-gray-500 text-sm'>{user?.rank}</p>
              </div>
            </div>
            <div className='space-y-4 mt-5'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <Award className='mr-2 w-5 h-5 text-red-500' />
                    <span className='font-medium'>Level {user?.level}</span>
                  </div>
                  <span className='text-gray-500 text-sm'>
                    {user?.xp}/{calculateNextLevelXP(user?.xp ?? 0)} XP
                  </span>
                </div>
                <div className='bg-red-100 rounded-full w-full h-2 overflow-hidden'>
                  <div
                    className='bg-red-500 rounded-full h-full'
                    style={{
                      width: `${user?.xp && calculateNextLevelXP(user?.xp) !== 0
                          ? (user.xp /
                            (calculateNextLevelXP(user.xp) + user.xp)) *
                          100
                          : 0
                        }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>


          <div className="p-4 border border-red-100 bg-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Home className="w-4 h-4 text-primary" />
              Navigation
            </div>
          </div>

          <nav className="p-4 border-red-100 border">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border  border-red-100">
            <div className="space-y-2">
              <Button
                className="w-full justify-start gap-2 h-9"
                variant="ghost"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </Button>

              <Button
                className="w-full justify-start gap-2 h-9"
                variant="ghost"
              >
                <HelpCircle className="w-4 h-4" />
                Aide & Support
              </Button>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-6">
          <div className="lg:px-6 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { Logo } from "@/shared/components/atoms/ui/logo";

export function Footer({ bg = "bg-gray-50", text = "text-gray-500" }: { bg?: string; text?: string }) {
  return (
    <footer className={`${bg} ${text} py-6`}>
      <div className="flex flex-col items-center justify-center gap-2">
        <Logo size="lg" />
        <div className="text-xs">© 2024 Quiz Musical. Tous droits réservés.</div>
      </div>
    </footer>
  );
}

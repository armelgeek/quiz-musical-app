import { Metadata } from "next";
import { ReactNode } from "react";
import { Footer } from "@/shared/components/atoms/ui/footer";
import { kAppName } from "@/shared/lib/constants/app.constant";

type Props = { children: ReactNode };

export const metadata: Metadata = {
  title: {
    template: `%s - Account - ${kAppName}`,
    default: `Account - ${kAppName}`,
  },
};

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col mt-3">
      <div className="flex-1">
          {children}
      </div>
      <Footer/>
    </div>
  );
}

import type { ReactNode } from "react";
import { getCurrentAccess } from "@/lib/auth/access";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const access = await getCurrentAccess();
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_80%_-10%,rgba(100,8,11,.28),transparent_26rem)] text-foreground">
      <Sidebar role={access.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header firstName={access.firstName} lastName={access.lastName} role={access.role} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

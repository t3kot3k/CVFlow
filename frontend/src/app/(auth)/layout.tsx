import { AuthHeader } from "@/components/layout/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <AuthHeader />

      {/* Main Content Area */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        {children}
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
}

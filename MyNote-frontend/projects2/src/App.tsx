import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AuthExperience } from "./components/auth/AuthExperience";
import { AmbientBackground } from "./components/landing/AmbientBackground";
import { FeatureSummarySection } from "./components/story/FeatureSummarySection";
import { HeroSection } from "./components/story/HeroSection";
import { ScrollStoryContainer } from "./components/story/ScrollStoryContainer";
import { NotesWorkspace } from "./components/workspace/NotesWorkspace";
import { coreFeatures } from "./data/features";
import { getCurrentUser, getDisplayName, logout } from "./utils/api";

type AppView = "landing" | "auth" | "workspace";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("landing");
  const [currentUserName, setCurrentUserName] = useState("访客");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeView]);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setCurrentUserName(getDisplayName(currentUser));
        setActiveView("workspace");
      } catch {
        setActiveView("landing");
      } finally {
        setIsCheckingSession(false);
      }
    };

    void bootstrapSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
    } finally {
      setCurrentUserName("访客");
      setActiveView("auth");
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#F8F9FA] text-[#1D1D1F]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <AmbientBackground />

      {isCheckingSession ? (
        <main className="relative z-20 flex min-h-screen items-center justify-center px-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 text-center shadow-[0_24px_70px_rgba(124,58,237,0.14)] backdrop-blur-2xl">
            <p className="text-sm text-slate-500">正在检查登录状态...</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">MyNote</h1>
          </div>
        </main>
      ) : (
        <AnimatePresence mode="wait">
          {activeView === "landing" ? (
            <motion.main
              key="landing-view"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20"
            >
              <HeroSection onDirectLogin={() => setActiveView("auth")} />
              <ScrollStoryContainer />
              <FeatureSummarySection features={coreFeatures} onStart={() => setActiveView("auth")} />
            </motion.main>
          ) : null}

          {activeView === "auth" ? (
            <motion.main
              key="auth-view"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20"
            >
              <AuthExperience
                onBack={() => setActiveView("landing")}
                onLoginSuccess={(account) => {
                  setCurrentUserName(account);
                  setActiveView("workspace");
                }}
              />
            </motion.main>
          ) : null}

          {activeView === "workspace" ? (
            <motion.main
              key="workspace-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20"
            >
              <NotesWorkspace userName={currentUserName} onSignOut={handleSignOut} />
            </motion.main>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  );
}

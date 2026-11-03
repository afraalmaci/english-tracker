import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { isConfigured } from "./api/supabase";
import { useAuth } from "./auth/AuthProvider";
import { Layout } from "./components/Layout";
import { GrammarPage } from "./pages/GrammarPage";
import { ConfigMissingPage, LoginPage, NewPasswordPage } from "./pages/LoginPage";
import { PhrasesPage } from "./pages/PhrasesPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TestsPage } from "./pages/TestsPage";
import { TodayPage } from "./pages/TodayPage";
import { VocabPage } from "./pages/VocabPage";
import { WeeklyPage } from "./pages/WeeklyPage";
import { WritingPage } from "./pages/WritingPage";

export function App() {
  const { user, loading, recovering } = useAuth();
  if (!isConfigured) return <ConfigMissingPage />;
  if (loading) return null;
  if (recovering) return <NewPasswordPage />;
  if (!user) return <LoginPage />;

  // HashRouter: GitHub Pages has no server-side rewrites, so routes live after the #.
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="kaynaklar" element={<ResourcesPage />} />
          <Route path="kelime" element={<VocabPage />} />
          <Route path="grammar" element={<GrammarPage />} />
          <Route path="writing" element={<WritingPage />} />
          <Route path="hafta" element={<WeeklyPage />} />
          <Route path="testler" element={<TestsPage />} />
          <Route path="soyleyemediklerim" element={<PhrasesPage />} />
          <Route path="ayarlar" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

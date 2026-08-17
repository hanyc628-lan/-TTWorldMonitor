import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CategoryDetailPage } from '@/pages/CategoryDetailPage';
import { LiveHubPage } from '@/pages/LiveHubPage';
import { EmbedStreamPage } from '@/pages/EmbedStreamPage';
import { MotionLabPage } from '@/pages/MotionLabPage';
import { EvolutionPage } from '@/pages/EvolutionPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { PrivacyPage, TermsPage, AboutPage } from '@/pages/LegalPages';
import { VisitTracker } from '@/components/VisitTracker';

export default function App() {
  return (
    <>
      <VisitTracker />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/category/:slug" element={<CategoryDetailPage />} />
        <Route path="/live" element={<LiveHubPage />} />
        <Route path="/motion-lab" element={<MotionLabPage />} />
        <Route path="/evolution" element={<EvolutionPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/embed/:streamId" element={<EmbedStreamPage />} />
      </Routes>
    </>
  );
}

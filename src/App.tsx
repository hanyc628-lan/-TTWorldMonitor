import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LiveHubPage } from '@/pages/LiveHubPage';
import { EmbedStreamPage } from '@/pages/EmbedStreamPage';
import { MotionLabPage } from '@/pages/MotionLabPage';
import { EvolutionPage } from '@/pages/EvolutionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/live" element={<LiveHubPage />} />
      <Route path="/motion-lab" element={<MotionLabPage />} />
      <Route path="/evolution" element={<EvolutionPage />} />
      <Route path="/embed/:streamId" element={<EmbedStreamPage />} />
    </Routes>
  );
}

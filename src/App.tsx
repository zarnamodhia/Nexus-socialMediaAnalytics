import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';

// Analytics & Intelligence Pages
import { Overview } from './pages/Overview';
import { Timeline } from './pages/Timeline';
import { SentimentEmotion } from './pages/SentimentEmotion';
import { TrendExplorer } from './pages/TrendExplorer';
import { AudienceIntelligence } from './pages/AudienceIntelligence';
import { NetworkGraph } from './pages/NetworkGraph';
import { NarrativeInvestigation } from './pages/NarrativeInvestigation';
import { EvidenceProvenance } from './pages/EvidenceProvenance';
import { DataSources } from './pages/DataSources';
import { Settings } from './pages/Settings';

// Public & Methodology Pages
import { HomePage } from './pages/website/HomePage';
import { CaseStudiesPage } from './pages/website/CaseStudiesPage';
import { MethodologyPage } from './pages/website/MethodologyPage';
import { ApiDocsPage } from './pages/website/ApiDocsPage';
import { AboutPage } from './pages/website/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Primary Product Routes */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/analytics" element={<TrendExplorer />} />
            <Route path="/content" element={<Timeline />} />
            <Route path="/audience" element={<AudienceIntelligence />} />
            <Route path="/insights" element={<SentimentEmotion />} />
            <Route path="/reports" element={<NarrativeInvestigation />} />
            <Route path="/network" element={<NetworkGraph />} />
            <Route path="/evidence" element={<EvidenceProvenance />} />
            <Route path="/sources" element={<DataSources />} />
            <Route path="/settings" element={<Settings />} />

            {/* Editorial, Methodology & Documentation Routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Legacy URL Aliases & Redirects */}
            <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="/timeline" element={<Navigate to="/content" replace />} />
            <Route path="/trends" element={<Navigate to="/analytics" replace />} />
            <Route path="/sentiment" element={<Navigate to="/insights" replace />} />
            <Route path="/investigation" element={<Navigate to="/reports" replace />} />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

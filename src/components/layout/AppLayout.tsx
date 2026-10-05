import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WebsiteNavbar } from './WebsiteNavbar';
import { GlobalFilterBar } from './GlobalFilterBar';
import { WebsiteFooter } from './WebsiteFooter';
import { PostDetailModal } from '../modals/PostDetailModal';
import { DatabaseConfigModal } from '../modals/DatabaseConfigModal';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Determine whether to show the GlobalFilterBar (show on core analytics routes)
  const isAnalyticsRoute = [
    '/dashboard',
    '/analytics',
    '/content',
    '/audience',
    '/insights',
    '/reports',
    '/network',
    '/evidence',
    '/sources',
    '/settings',
  ].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Universal Enterprise Navbar */}
      <WebsiteNavbar />

      {/* Global Filter Bar (Sticky on Analytics Routes) */}
      {isAnalyticsRoute && (
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
          <GlobalFilterBar />
        </div>
      )}

      {/* Main Routed Viewport with Subtle Route Transition */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
        <Outlet />
      </main>

      {/* Universal Professional Footer */}
      <WebsiteFooter />

      {/* Post Detail Inspector Modal */}
      <PostDetailModal />

      {/* Supabase & Prisma Database Configuration Modal */}
      <DatabaseConfigModal />
    </div>
  );
};

import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { SurveyAdminDashboard } from '@/components/survey-admin-dashboard';
import { ChevronLeft } from 'lucide-react';

export default function SurveyAdminPage() {
  return (
    <div className="min-h-screen bg-canvas text-content p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4 border-b border-hairline mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs font-bold text-content-muted hover:text-content transition-colors bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Fleet Command
          </Link>
          <SjyCabsLogo size="md" />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs font-bold text-brand hover:underline"
          >
            🌐 View Public Landing Page
          </Link>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto">
        <SurveyAdminDashboard />
      </main>

    </div>
  );
}

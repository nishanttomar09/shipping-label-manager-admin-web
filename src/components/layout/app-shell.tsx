import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { RouteAnnouncer } from '@/components/ui/route-announcer';

export function AppShell() {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">
        {t('skipToContent')}
      </a>
      <Sidebar />
      <div className="lg:pl-60">
        <Header />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="p-4 lg:p-6 outline-none"
        >
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <RouteAnnouncer />
    </div>
  );
}

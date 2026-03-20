import { NavLink, useLocation } from 'react-router-dom';
import { Users, FileText, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { to: '/users', label: t('nav.users'), icon: Users },
    { to: '/audit-logs', label: t('nav.auditLogs'), icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-60 flex-col border-r bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold tracking-tight">{t('appName')}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2" aria-label={t('nav.main')}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

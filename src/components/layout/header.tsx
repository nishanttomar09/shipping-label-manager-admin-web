import { LogOut, Menu, ShieldCheck, Users, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const mobileNavItems = [
    { to: '/users', label: t('nav.users'), icon: Users },
    { to: '/audit-logs', label: t('nav.auditLogs'), icon: FileText },
  ];

  function getBreadcrumb(pathname: string): { label: string; to?: string }[] {
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] === 'users') {
      return [{ label: t('breadcrumb.users') }];
    }
    if (parts[0] === 'audit-logs') {
      if (parts[1]) return [{ label: t('breadcrumb.auditLogs'), to: '/audit-logs' }, { label: t('breadcrumb.details') }];
      return [{ label: t('breadcrumb.auditLogs') }];
    }
    return [{ label: t('breadcrumb.dashboard') }];
  }

  const breadcrumbs = getBreadcrumb(location.pathname);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('openNavigation')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetHeader className="px-5 pt-5 pb-2">
              <SheetTitle className="flex items-center gap-2.5 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                {t('appName')}
              </SheetTitle>
            </SheetHeader>
            <nav className="px-3 pt-2" aria-label={t('nav.main')}>
              {mobileNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
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
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-muted-foreground/40" aria-hidden="true">/</span>
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-5" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 gap-2 rounded-full pl-1.5 pr-2.5">
              <Avatar className="h-6 w-6" size="sm">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium sm:inline-block">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {t(`permissions.${({ ADMIN: 'adminRole', OPERATOR: 'operatorRole', VIEWER: 'viewerRole' } as const)[user.role]}`)}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('notFound.pageTitle');
  }, [t]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="text-center">
        <p className="text-6xl font-bold tracking-tighter text-primary tabular-nums">404</p>
        <h1 className="mt-3 text-lg font-semibold">{t('notFound.heading')}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          {t('notFound.description')}
        </p>
      </div>

      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <Link to="/users">
          <ArrowLeft className="h-4 w-4" />
          {t('notFound.backLink')}
        </Link>
      </Button>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('notFound.pageTitle');
  }, [t]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold">{t('notFound.heading')}</h1>
      <p className="text-muted-foreground text-center max-w-md">
        {t('notFound.description')}
      </p>
      <Button asChild>
        <Link to="/users">{t('notFound.backLink')}</Link>
      </Button>
    </div>
  );
}

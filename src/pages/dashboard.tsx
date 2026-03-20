import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    document.title = t('dashboard.pageTitle');
  }, [t]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {t('dashboard.welcome')}, {user?.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('dashboard.description')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/users">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{t('dashboard.manageUsers')}</CardTitle>
              <CardDescription>{t('dashboard.manageUsersDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/audit-logs">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{t('dashboard.viewAuditLogs')}</CardTitle>
              <CardDescription>{t('dashboard.viewAuditLogsDesc')}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuditLog } from '@/hooks/use-audit-log';
import { ActionBadge } from '@/components/audit-logs/action-badge';
import { StatusBadge } from '@/components/audit-logs/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('auditLogs');
  const { data: log, isLoading, error } = useAuditLog(id!);

  useEffect(() => {
    if (log) {
      document.title = `${log.action} ${log.entityType} - ShipLabel Admin`;
    }
  }, [log]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <div className="text-center">
          <p className="font-medium">{t('detail.notFound')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('detail.notFoundDescription')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/audit-logs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('detail.backTo')}
        </Button>
      </div>
    );
  }

  const fields = [
    { label: t('detail.id'), value: <span className="font-mono text-xs">{log.id}</span> },
    { label: t('detail.userEmail'), value: log.userEmail },
    { label: t('detail.userId'), value: <span className="font-mono text-xs">{log.userId}</span> },
    { label: t('detail.action'), value: <ActionBadge action={log.action} /> },
    { label: t('detail.entityType'), value: log.entityType },
    { label: t('detail.entityId'), value: log.entityId ? <span className="font-mono text-xs">{log.entityId}</span> : <span className="text-muted-foreground">{t('detail.notApplicable')}</span> },
    { label: t('detail.route'), value: <span className="font-mono text-xs">{log.route}</span> },
    { label: t('detail.statusCode'), value: <StatusBadge success={log.success} statusCode={log.statusCode} /> },
    { label: t('detail.duration'), value: t('duration.ms', { value: log.durationMs }) },
    { label: t('detail.timestamp'), value: formatDateTime(log.createdAt, i18n.language) },
    { label: t('detail.ipAddress'), value: <span className="font-mono text-xs">{log.ipAddress}</span> },
    { label: t('detail.userAgent'), value: <span className="text-xs leading-relaxed">{log.userAgent}</span> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 mt-0.5"
          onClick={() => navigate('/audit-logs')}
          aria-label={t('detail.backTo')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">{t('detail.title')}</h1>
            <ActionBadge action={log.action} />
            <StatusBadge success={log.success} statusCode={log.statusCode} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {log.userEmail} &middot; {formatDateTime(log.createdAt, i18n.language)}
          </p>
        </div>
      </div>

      {/* Detail fields */}
      <div className="rounded-lg border">
        <div className="grid gap-0 sm:grid-cols-2">
          {fields.map((field, i) => (
            <div
              key={field.label}
              className={`flex flex-col gap-1 px-4 py-3 ${
                i < fields.length - (fields.length % 2 === 0 ? 2 : 1) ? 'border-b' : ''
              } ${i % 2 === 0 ? 'sm:border-r' : ''}`}
            >
              <span className="text-[13px] font-medium text-muted-foreground">
                {field.label}
              </span>
              <span className="text-sm break-all">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {log.errorMessage && (
        <div className="rounded-lg border border-red-200 dark:border-red-800">
          <div className="px-4 py-3 border-b border-red-200 dark:border-red-800">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">{t('detail.errorMessage')}</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{log.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Request body */}
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">{t('detail.requestBody')}</h2>
        </div>
        <div className="p-4">
          {log.requestBody ? (
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto leading-relaxed">
              {JSON.stringify(log.requestBody, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('detail.noRequestBody')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import type { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { ActionBadge } from './action-badge';
import { StatusBadge } from './status-badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface AuditLogDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export function AuditLogDetail({ open, onOpenChange, log }: AuditLogDetailProps) {
  const { t, i18n } = useTranslation('auditLogs');

  if (!log) return null;

  const fields = [
    { label: t('detail.id'), value: log.id },
    { label: t('detail.userId'), value: log.userId },
    { label: t('detail.userEmail'), value: log.userEmail },
    { label: t('detail.action'), value: <ActionBadge action={log.action} /> },
    { label: t('detail.entityType'), value: log.entityType },
    { label: t('detail.entityId'), value: log.entityId || t('detail.notApplicable') },
    { label: t('detail.route'), value: log.route },
    { label: t('detail.statusCode'), value: <StatusBadge statusCode={log.statusCode} /> },
    { label: t('detail.duration'), value: t('duration.ms', { value: log.duration }) },
    { label: t('detail.timestamp'), value: formatDateTime(log.createdAt, i18n.language) },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('detail.title')}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-muted-foreground">
                {field.label}
              </span>
              <span className="text-sm break-all">
                {typeof field.value === 'string' ? field.value : field.value}
              </span>
            </div>
          ))}

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-muted-foreground">
              {t('detail.requestBody')}
            </span>
            {log.requestBody ? (
              <pre className="mt-1 rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                {JSON.stringify(log.requestBody, null, 2)}
              </pre>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                {t('detail.noRequestBody')}
              </span>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

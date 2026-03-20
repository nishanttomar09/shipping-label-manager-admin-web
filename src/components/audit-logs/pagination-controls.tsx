import { useTranslation } from 'react-i18next';
import type { PaginationMeta } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationControls({ meta, onPageChange, onLimitChange }: PaginationControlsProps) {
  const { t } = useTranslation('auditLogs');

  const from = (meta.page - 1) * meta.perPage + 1;
  const to = Math.min(meta.page * meta.perPage, meta.total);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {t('pagination.showing', { from, to, total: meta.total })}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pagination.perPage')}</span>
          <Select
            value={String(meta.perPage)}
            onValueChange={(val: string) => onLimitChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            aria-label={t('pagination.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            aria-label={t('pagination.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

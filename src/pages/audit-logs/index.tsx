import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLogFilters } from '@/types';
import { ActionBadge } from '@/components/audit-logs/action-badge';
import { StatusBadge } from '@/components/audit-logs/status-badge';
import { PaginationControls } from '@/components/audit-logs/pagination-controls';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, X, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('auditLogs');
  const { t: tc } = useTranslation();
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, perPage: 25 });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters = Boolean(
    filters.search || filters.action || filters.entityType ||
    filters.success !== undefined || filters.startDate || filters.endDate
  );

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, perPage: filters.perPage });
    setSearchInput('');
  }, [filters.perPage]);

  const stableFilters = useMemo(() => ({ ...filters }), [filters]);
  const { data: logs, meta, isLoading } = useAuditLogs(stableFilters);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="relative shrink-0 w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
            aria-label={t('searchLabel')}
          />
        </div>
        <Select
          value={filters.action || 'ALL'}
          onValueChange={(value: string) =>
            setFilters((prev) => ({
              ...prev,
              action: value === 'ALL' ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-36 h-9 shrink-0">
            <SelectValue placeholder={t('allActions')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allActions')}</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.entityType || 'ALL'}
          onValueChange={(value: string) =>
            setFilters((prev) => ({
              ...prev,
              entityType: value === 'ALL' ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-44 h-9 shrink-0">
            <SelectValue placeholder={t('allEntityTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allEntityTypes')}</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
            <SelectItem value="Delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.success === undefined ? 'ALL' : filters.success ? 'true' : 'false'}
          onValueChange={(value: string) =>
            setFilters((prev) => ({
              ...prev,
              success: value === 'ALL' ? undefined : value === 'true',
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-36 h-9 shrink-0">
            <SelectValue placeholder={t('allOutcomes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allOutcomes')}</SelectItem>
            <SelectItem value="true">{t('filters.success')}</SelectItem>
            <SelectItem value="false">{t('filters.failure')}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 shrink-0">
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined, page: 1 }))
            }
            className="w-36 h-9"
            aria-label={t('filters.startDate')}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined, page: 1 }))
            }
            className="w-36 h-9"
            aria-label={t('filters.endDate')}
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={clearFilters} aria-label={t('filters.reset')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" aria-busy={isLoading}>
        <Table>
          <TableCaption className="sr-only">{t('table.caption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">{t('table.timestamp')}</TableHead>
              <TableHead className="font-medium">{t('table.user')}</TableHead>
              <TableHead className="font-medium">{t('table.action')}</TableHead>
              <TableHead className="font-medium">{t('table.entityType')}</TableHead>
              <TableHead className="font-medium hidden lg:table-cell">{t('table.route')}</TableHead>
              <TableHead className="font-medium">{t('table.status')}</TableHead>
              <TableHead className="font-medium hidden sm:table-cell">{t('table.duration')}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                    <div className="text-center">
                      <p className="text-sm font-medium">{t('empty.title')}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {hasActiveFilters
                          ? t('empty.filtered')
                          : t('empty.none')}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  tabIndex={0}
                  role="link"
                  aria-label={t('table.viewDetails')}
                  className="cursor-pointer group focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]"
                  onClick={() => navigate(`/audit-logs/${log.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/audit-logs/${log.id}`); } }}
                >
                  <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                    {formatDateTime(log.createdAt, i18n.language)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.userEmail}</TableCell>
                  <TableCell><ActionBadge action={log.action} /></TableCell>
                  <TableCell className="text-muted-foreground">{log.entityType}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
                    {log.route}
                  </TableCell>
                  <TableCell><StatusBadge success={log.success} statusCode={log.statusCode} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground tabular-nums">
                    {t('duration.ms', { value: log.durationMs })}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <PaginationControls
          meta={meta}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onLimitChange={(perPage) => setFilters((prev) => ({ ...prev, perPage, page: 1 }))}
        />
      )}

      {/* Screen reader result count announcement */}
      {!isLoading && logs && (
        <div role="status" className="sr-only">
          {tc('resultsLoaded', { count: logs.length })}
        </div>
      )}

    </div>
  );
}

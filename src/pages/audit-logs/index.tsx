import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLog, AuditLogFilters } from '@/types';
import { ActionBadge } from '@/components/audit-logs/action-badge';
import { StatusBadge } from '@/components/audit-logs/status-badge';
import { AuditLogDetail } from '@/components/audit-logs/audit-log-detail';
import { PaginationControls } from '@/components/audit-logs/pagination-controls';
import { Input } from '@/components/ui/input';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogsPage() {
  const { t, i18n } = useTranslation('auditLogs');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const filters = useMemo<AuditLogFilters>(() => {
    const f: AuditLogFilters = { page, limit };
    if (debouncedSearch) f.search = debouncedSearch;
    if (actionFilter !== 'all') f.action = actionFilter;
    if (entityTypeFilter !== 'all') f.entityType = entityTypeFilter;
    if (outcomeFilter !== 'all') f.outcome = outcomeFilter;
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    return f;
  }, [debouncedSearch, actionFilter, entityTypeFilter, outcomeFilter, startDate, endDate, page, limit]);

  const { data: logs, meta, isLoading } = useAuditLogs(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('filters.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
            aria-label={t('filters.search')}
          />
        </div>
        <Select value={actionFilter} onValueChange={handleFilterChange(setActionFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('filters.action')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.action')}</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityTypeFilter} onValueChange={handleFilterChange(setEntityTypeFilter)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder={t('filters.entityType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.entityType')}</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
            <SelectItem value="Delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={handleFilterChange(setOutcomeFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('filters.outcome')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.outcome')}</SelectItem>
            <SelectItem value="success">{t('filters.success')}</SelectItem>
            <SelectItem value="failure">{t('filters.failure')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="h-10 w-[160px] text-sm"
          aria-label={t('filters.startDate')}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="h-10 w-[160px] text-sm"
          aria-label={t('filters.endDate')}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {debouncedSearch || actionFilter !== 'all' || entityTypeFilter !== 'all' || outcomeFilter !== 'all'
              ? t('empty.description')
              : t('empty.noLogs')}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <caption className="sr-only">{t('table.caption')}</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.timestamp')}</TableHead>
                  <TableHead>{t('table.user')}</TableHead>
                  <TableHead>{t('table.action')}</TableHead>
                  <TableHead>{t('table.entityType')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('table.route')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('table.duration')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt, i18n.language)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.userEmail}</TableCell>
                    <TableCell><ActionBadge action={log.action} /></TableCell>
                    <TableCell className="text-muted-foreground">{log.entityType}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
                      {log.route}
                    </TableCell>
                    <TableCell><StatusBadge statusCode={log.statusCode} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {t('duration.ms', { value: log.duration })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta && (
            <PaginationControls
              meta={meta}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            />
          )}
        </>
      )}

      {/* Detail Sheet */}
      <AuditLogDetail
        open={!!selectedLog}
        onOpenChange={(open) => { if (!open) setSelectedLog(null); }}
        log={selectedLog}
      />
    </div>
  );
}

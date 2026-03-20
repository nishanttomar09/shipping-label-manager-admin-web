import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/hooks/use-users';
import { UserRole } from '@/types';
import type { User, UserFilters } from '@/types';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { UpdateUserDialog } from '@/components/users/update-user-dialog';
import { UserRoleBadge } from '@/components/users/user-role-badge';
import { UserStatusIndicator } from '@/components/users/user-status-indicator';
import { Button } from '@/components/ui/button';
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Users as UsersIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
  const { t, i18n } = useTranslation('users');
  const { t: tc } = useTranslation();
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const stableFilters = useMemo(() => ({ ...filters }), [filters]);
  const { data: users, isLoading, refetch } = useUsers(stableFilters);

  const stats = useMemo(() => {
    if (!users) return null;
    return {
      total: users.length,
      admins: users.filter((u) => u.role === UserRole.ADMIN).length,
      operators: users.filter((u) => u.role === UserRole.OPERATOR).length,
      viewers: users.filter((u) => u.role === UserRole.VIEWER).length,
    };
  }, [users]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t('createUser')}
        </Button>
      </div>

      {/* Inline stats */}
      {stats && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="tabular-nums">
            <span className="font-semibold">{stats.total}</span>
            <span className="text-muted-foreground ml-1">{t('stats.total')}</span>
          </span>
          <span className="text-border">|</span>
          <span className="tabular-nums">
            <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.admins}</span>
            <span className="text-muted-foreground ml-1">{t('stats.admins')}</span>
          </span>
          <span className="text-border">|</span>
          <span className="tabular-nums">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.operators}</span>
            <span className="text-muted-foreground ml-1">{t('stats.operators')}</span>
          </span>
          <span className="text-border">|</span>
          <span className="tabular-nums">
            <span className="font-semibold text-slate-600 dark:text-slate-400">{stats.viewers}</span>
            <span className="text-muted-foreground ml-1">{t('stats.viewers')}</span>
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
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
          value={filters.role || 'ALL'}
          onValueChange={(value: string) =>
            setFilters((prev) => ({
              ...prev,
              role: value === 'ALL' ? undefined : (value as UserFilters['role']),
            }))
          }
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder={t('filters.allRoles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.allRoles')}</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive || 'ALL'}
          onValueChange={(value: string) =>
            setFilters((prev) => ({
              ...prev,
              isActive: value === 'ALL' ? undefined : value,
            }))
          }
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder={t('filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.allStatuses')}</SelectItem>
            <SelectItem value="true">{t('filters.active')}</SelectItem>
            <SelectItem value="false">{t('filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" aria-busy={isLoading}>
        <Table>
          <TableCaption className="sr-only">{t('table.caption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">{t('table.name')}</TableHead>
              <TableHead className="font-medium">{t('table.email')}</TableHead>
              <TableHead className="font-medium">{t('table.role')}</TableHead>
              <TableHead className="font-medium">{t('table.status')}</TableHead>
              <TableHead className="font-medium">{t('table.created')}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <UsersIcon className="h-8 w-8 text-muted-foreground/40" />
                    <div className="text-center">
                      <p className="text-sm font-medium">{t('empty.title')}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {searchInput || filters.role || filters.isActive
                          ? t('empty.filtered')
                          : t('empty.none')}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="py-1.5 font-medium">
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {t('table.you')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="py-1.5"><UserRoleBadge role={user.role} /></TableCell>
                    <TableCell className="py-1.5"><UserStatusIndicator isActive={user.isActive} /></TableCell>
                    <TableCell className="py-1.5 text-muted-foreground tabular-nums">
                      {formatDate(user.createdAt, i18n.language)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditUser(user)}
                        disabled={isCurrentUser}
                        aria-label={t('table.edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Screen reader result count announcement */}
      {!isLoading && users && (
        <div role="status" className="sr-only">
          {tc('resultsLoaded', { count: users.length })}
        </div>
      )}

      {/* Dialogs */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refetch}
      />
      <UpdateUserDialog
        open={!!editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null); }}
        user={editUser}
        onSuccess={refetch}
      />
    </div>
  );
}

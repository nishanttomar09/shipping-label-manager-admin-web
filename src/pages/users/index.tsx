import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/hooks/use-users';
import type { User, UserFilters, UserRole } from '@/types';
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
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = useMemo<UserFilters>(() => {
    const f: UserFilters = {};
    if (debouncedSearch) f.search = debouncedSearch;
    if (roleFilter !== 'all') f.role = roleFilter as UserRole;
    if (statusFilter !== 'all') f.isActive = statusFilter;
    return f;
  }, [debouncedSearch, roleFilter, statusFilter]);

  const { data: users, isLoading, refetch } = useUsers(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createUser')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('filters.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
            aria-label={t('filters.search')}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.role')}</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.status')}</SelectItem>
            <SelectItem value="true">{t('filters.active')}</SelectItem>
            <SelectItem value="false">{t('filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* SR result announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {!isLoading && t('resultsLoaded', { count: users.length, ns: 'common' })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
            <UsersIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {debouncedSearch || roleFilter !== 'all' || statusFilter !== 'all'
              ? t('empty.description')
              : t('empty.noUsers')}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <caption className="sr-only">{t('table.caption')}</caption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.role')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.created')}</TableHead>
                <TableHead className="w-[80px]">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {t('table.you')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell><UserRoleBadge role={user.role} /></TableCell>
                    <TableCell><UserStatusIndicator isActive={user.isActive} /></TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt, i18n.language)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditUser(user)}
                        disabled={isCurrentUser}
                        aria-label={t('table.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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

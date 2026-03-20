import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const roleStyles: Record<UserRole, { className: string; dot: string }> = {
  ADMIN: {
    className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  OPERATOR: {
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  VIEWER: {
    className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800',
    dot: 'bg-slate-500',
  },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation();
  const config = roleStyles[role];

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {t(`roles.${role}`)}
    </Badge>
  );
}

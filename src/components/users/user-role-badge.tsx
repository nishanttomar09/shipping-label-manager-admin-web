import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@/types';

const roleVariants: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  OPERATOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation();

  return (
    <Badge variant="outline" className={roleVariants[role]}>
      {t(`roles.${role}`)}
    </Badge>
  );
}

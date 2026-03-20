import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';
import { useUpdateUser } from '@/hooks/use-update-user';
import { UserRole } from '@/types';
import type { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function UpdateUserDialog({ open, onOpenChange, user, onSuccess }: UpdateUserDialogProps) {
  const { t } = useTranslation('users');
  const { update, isLoading } = useUpdateUser();
  const [role, setRole] = useState<string>(user?.role || UserRole.VIEWER);
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'demotion' | 'deactivation' | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive);
      setApiError(null);
      setConfirmAction(null);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    // Check for admin demotion
    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN && !confirmAction) {
      setConfirmAction('demotion');
      return;
    }

    // Check for deactivation
    if (user.isActive && !isActive && !confirmAction) {
      setConfirmAction('deactivation');
      return;
    }

    setApiError(null);
    try {
      await update(user.id, { role: role as User['role'], isActive });
      toast.success(t('updateDialog.success'));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Failed to update user';
        if (message.toLowerCase().includes('last admin') || message.toLowerCase().includes('at least one')) {
          setApiError(t('updateDialog.lastAdminError'));
        } else if (message.toLowerCase().includes('self') || message.toLowerCase().includes('own')) {
          setApiError(t('updateDialog.selfModifyError'));
        } else {
          setApiError(message);
        }
      } else {
        setApiError('An unexpected error occurred');
      }
    }
  };

  const handleConfirm = () => {
    setConfirmAction(null);
    handleSubmit();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmAction(null);
      setApiError(null);
    }
    onOpenChange(newOpen);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('updateDialog.title')}</DialogTitle>
          <DialogDescription>{t('updateDialog.description', { name: user.name })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertDescription className="text-[13px]">{apiError}</AlertDescription>
            </Alert>
          )}

          {confirmAction && (
            <Alert>
              <AlertDescription className="text-[13px]">
                {confirmAction === 'demotion'
                  ? t('updateDialog.confirmDemotion')
                  : t('updateDialog.confirmDeactivation')}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="update-role" className="text-[13px] font-medium">
              {t('updateDialog.role')}
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="update-role">
                <SelectValue placeholder={t('updateDialog.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.OPERATOR}>Operator</SelectItem>
                <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="update-active" className="text-sm font-medium">
                {t('updateDialog.active')}
              </Label>
              <p className="text-[13px] text-muted-foreground">
                {t('updateDialog.activeDescription')}
              </p>
            </div>
            <Switch
              id="update-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t('updateDialog.cancel')}
          </Button>
          {confirmAction ? (
            <Button onClick={handleConfirm} variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('updateDialog.saving')}
                </>
              ) : (
                t('updateDialog.save')
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

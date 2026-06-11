import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { zodResolver } from '@hookform/resolvers/zod';
import { IBusinessInviteResponse, IEmployeeResponse, EmployeeRole } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCircle2, Copy, RefreshCw, UserMinus, UserPlus, UserX, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod/v3';

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type InviteFormValues = z.infer<typeof inviteSchema>;

export default function EmployeesPage() {
  const { t } = useTranslation('employees');
  const { employeeService } = useServices();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const businessId = user?.businessId;

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'business', businessId],
    queryFn: () => employeeService.getByBusiness(businessId!),
    enabled: !!businessId,
  });

  const { data: pendingInvites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['invites', 'business', businessId],
    queryFn: () => employeeService.getInvites(businessId!),
    enabled: !!businessId,
  });

  const updateEmployee = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; role?: EmployeeRole; isActive?: boolean }) =>
      employeeService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees', 'business', businessId] }),
  });

  const removeEmployee = useMutation({
    mutationFn: (id: string) => employeeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees', 'business', businessId] }),
  });

  const createInvite = useMutation({
    mutationFn: (email: string) => employeeService.createInvite(businessId!, { email }),
    onSuccess: (invite) => {
      setGeneratedInvite(invite);
      inviteForm.reset();
      queryClient.invalidateQueries({ queryKey: ['invites', 'business', businessId] });
    },
  });

  const resendInvite = useMutation({
    mutationFn: (inviteId: string) => employeeService.resendInvite(businessId!, inviteId),
    onSuccess: (invite) => {
      setGeneratedInvite((prev) => (prev?.id === invite.id ? invite : prev));
      queryClient.invalidateQueries({ queryKey: ['invites', 'business', businessId] });
    },
  });

  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<IBusinessInviteResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  function fireInviteToast(promise: Promise<IBusinessInviteResponse>) {
    const id = toast.loading(t('team.invite.toastSending'));
    promise
      .then((invite) => {
        if (invite.mailSent) {
          toast.success(t('team.invite.mailSentSuccess', { email: invite.email }), { id });
        } else {
          toast.warning(t('team.invite.mailNotSent'), { id });
        }
      })
      .catch(() => toast.error(t('team.invite.error'), { id }));
  }

  function handleInviteSubmit(values: InviteFormValues) {
    fireInviteToast(createInvite.mutateAsync(values.email));
  }

  function handleResend(inviteId: string) {
    fireInviteToast(resendInvite.mutateAsync(inviteId));
  }

  function handleCopyLink(token: string) {
    const url = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function closeInvitePanel() {
    setShowInvitePanel(false);
    setGeneratedInvite(null);
    inviteForm.reset();
    createInvite.reset();
  }

  const watchedEmail = inviteForm.watch('email');
  const alreadyPendingInvite = pendingInvites.find(
    (inv) => inv.email.toLowerCase() === watchedEmail.toLowerCase() && watchedEmail.length > 0,
  );

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>{t('team.title')}</h1>
          <p className='text-muted-foreground text-sm'>{t('team.subtitle')}</p>
        </div>
        <Button onClick={() => setShowInvitePanel(true)} className='gap-2'>
          <UserPlus size={16} />
          {t('team.inviteButton')}
        </Button>
      </div>

      {/* Invite Panel */}
      {showInvitePanel && (
        <div className='mb-6 border rounded-lg p-5 bg-card'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-semibold'>{t('team.invite.panelHeading')}</h2>
            <button
              onClick={closeInvitePanel}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <X size={16} />
            </button>
          </div>

          {!generatedInvite ? (
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(handleInviteSubmit)} className='flex gap-3 items-end'>
                <FormField
                  control={inviteForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>{t('team.invite.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder={t('team.invite.emailPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                      {alreadyPendingInvite && (
                        <p className='text-sm text-amber-600 dark:text-amber-400'>
                          {t('team.invite.alreadyPending')}{' '}
                          <button
                            type='button'
                            className='underline underline-offset-2 font-medium'
                            onClick={() => handleResend(alreadyPendingInvite.id)}
                          >
                            {t('team.invite.resendInstead')}
                          </button>
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  disabled={createInvite.isPending || !!alreadyPendingInvite}
                >
                  {createInvite.isPending ? t('team.invite.generating') : t('team.invite.generate')}
                </Button>
              </form>
            </Form>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center gap-2 flex-wrap'>
                <p className='text-sm text-muted-foreground'>
                  {t('team.invite.shareText')} <span className='font-medium text-foreground'>{generatedInvite.email}</span>.
                  {' '}{t('team.invite.expiresText')}{' '}
                  <span className='font-medium text-foreground'>
                    {new Date(generatedInvite.expiresAt).toLocaleDateString()}
                  </span>
                  .
                </p>
                {generatedInvite.mailSent && (
                  <span className='inline-flex items-center gap-1 text-xs font-medium text-success bg-success/15 px-2 py-0.5 rounded-full shrink-0'>
                    <CheckCircle2 size={12} />
                    {t('team.invite.mailSentBadge')}
                  </span>
                )}
              </div>
              <div className='flex gap-2'>
                <Input
                  readOnly
                  value={`${window.location.origin}/register?invite=${generatedInvite.token}`}
                  className='text-xs font-mono'
                />
                <Button variant='outline' onClick={() => handleCopyLink(generatedInvite.token)} className='gap-2 shrink-0'>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' onClick={() => setGeneratedInvite(null)}>
                  {t('team.invite.inviteAnother')}
                </Button>
                {!generatedInvite.mailSent && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleResend(generatedInvite.id)}
                    disabled={resendInvite.isPending}
                    className='gap-1.5'
                  >
                    <RefreshCw size={13} />
                    {t('team.invite.resend')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {createInvite.isError && (
            <p className='mt-2 text-sm text-destructive'>{t('team.invite.error')}</p>
          )}
        </div>
      )}

      {/* Pending Invites */}
      {(invitesLoading || pendingInvites.length > 0) && (
        <div className='mb-6'>
          <h2 className='text-sm font-semibold mb-2'>{t('team.pendingInvites.title')}</h2>
          <div className='border rounded-lg overflow-hidden'>
            <div className='grid grid-cols-[1fr_auto_auto_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
              <span>{t('team.pendingInvites.emailHeader')}</span>
              <span>{t('team.pendingInvites.expiresHeader')}</span>
              <span>{t('team.pendingInvites.statusHeader')}</span>
              <span />
              <span />
            </div>

            {invitesLoading && (
              <>
                {[0, 1].map((i) => (
                  <div key={i} className='grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 border-b gap-4'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-5 w-14 rounded-full' />
                    <Skeleton className='h-7 w-7 rounded' />
                    <Skeleton className='h-7 w-7 rounded' />
                  </div>
                ))}
              </>
            )}

            {!invitesLoading && pendingInvites.map((invite) => (
              <PendingInviteRow
                key={invite.id}
                invite={invite}
                isResending={resendInvite.isPending && resendInvite.variables === invite.id}
                onCopy={() => handleCopyLink(invite.token)}
                onResend={() => handleResend(invite.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr_auto_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>{t('team.table.nameHeader')}</span>
          <span>{t('team.table.emailHeader')}</span>
          <span>{t('team.table.roleHeader')}</span>
          <span>{t('team.table.statusHeader')}</span>
          <span />
        </div>

        {employeesLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className='grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-3 border-b gap-4'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-7 w-28 rounded-md' />
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-6 w-6 rounded' />
              </div>
            ))}
          </>
        )}

        {!employeesLoading && employees.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            {t('team.table.empty')}
          </div>
        )}

        {employees.map((emp) => (
          <EmployeeRow
            key={emp.id}
            employee={emp}
            isCurrentUser={emp.identityId === user?.id}
            isPendingRemove={pendingRemove === emp.id}
            isUpdating={updateEmployee.isPending && updateEmployee.variables?.id === emp.id}
            isRemoving={removeEmployee.isPending && removeEmployee.variables === emp.id}
            onRoleChange={(role) => updateEmployee.mutate({ id: emp.id, role })}
            onToggleActive={() => updateEmployee.mutate({ id: emp.id, isActive: !emp.isActive })}
            onRemoveRequest={() => setPendingRemove(emp.id)}
            onRemoveConfirm={() => { removeEmployee.mutate(emp.id); setPendingRemove(null); }}
            onRemoveCancel={() => setPendingRemove(null)}
          />
        ))}
      </div>
    </div>
  );
}

interface PendingInviteRowProps {
  invite: IBusinessInviteResponse;
  isResending: boolean;
  onCopy: () => void;
  onResend: () => void;
}

function PendingInviteRow({ invite, isResending, onCopy, onResend }: PendingInviteRowProps) {
  const { t } = useTranslation('employees');
  return (
    <div className='grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
      <span className='text-sm truncate'>{invite.email}</span>
      <span className='text-xs text-muted-foreground'>{new Date(invite.expiresAt).toLocaleDateString()}</span>
      {invite.mailSent ? (
        <span className='inline-flex items-center gap-1 text-xs font-medium text-success bg-success/15 px-2 py-0.5 rounded-full'>
          <CheckCircle2 size={11} />
          {t('team.invite.mailSentBadge')}
        </span>
      ) : (
        <span className='inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full'>
          <X size={11} />
          {t('team.invite.mailNotSentBadge')}
        </span>
      )}
      <button
        onClick={onCopy}
        className='p-1.5 text-muted-foreground hover:text-foreground transition-colors'
        title='Copy link'
      >
        <Copy size={14} />
      </button>
      <button
        onClick={onResend}
        disabled={isResending}
        className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40'
        title={t('team.invite.resend')}
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
}

interface EmployeeRowProps {
  employee: IEmployeeResponse;
  isCurrentUser: boolean;
  isPendingRemove: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onRoleChange: (role: EmployeeRole) => void;
  onToggleActive: () => void;
  onRemoveRequest: () => void;
  onRemoveConfirm: () => void;
  onRemoveCancel: () => void;
}

function EmployeeRow({
  employee,
  isCurrentUser,
  isPendingRemove,
  isUpdating,
  isRemoving,
  onRoleChange,
  onToggleActive,
  onRemoveRequest,
  onRemoveConfirm,
  onRemoveCancel,
}: EmployeeRowProps) {
  const { t } = useTranslation('employees');
  return (
    <div className='grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
      <div>
        <span className='text-sm font-medium'>{employee.name}</span>
        {isCurrentUser && (
          <span className='ml-2 text-xs text-muted-foreground'>{t('team.table.you')}</span>
        )}
      </div>

      <span className='text-sm text-muted-foreground truncate'>{employee.email}</span>

      <Select
        value={employee.role}
        onValueChange={(v) => onRoleChange(v as EmployeeRole)}
        disabled={isCurrentUser || isUpdating || isRemoving}
      >
        <SelectTrigger className='h-8 w-28 text-xs'>
          <SelectValue>{(v: string) => v === EmployeeRole.Manager ? 'Manager' : 'Basic'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EmployeeRole.Manager} label={t('team.roles.manager')}>{t('team.roles.manager')}</SelectItem>
          <SelectItem value={EmployeeRole.Basic} label={t('team.roles.basic')}>{t('team.roles.basic')}</SelectItem>
        </SelectContent>
      </Select>

      <button
        onClick={onToggleActive}
        disabled={isCurrentUser || isUpdating || isRemoving}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
          employee.isActive
            ? 'bg-success/15 text-success hover:bg-success/25'
            : 'bg-destructive/15 text-destructive hover:bg-destructive/25'
        }`}
      >
        {employee.isActive ? (
          <>
            <UserMinus size={12} />
            {t('status.active', { ns: 'common' })}
          </>
        ) : (
          <>
            <UserPlus size={12} />
            {t('status.suspended', { ns: 'common' })}
          </>
        )}
      </button>

      <div className='flex items-center gap-1'>
        {isPendingRemove ? (
          <>
            <Button
              size='sm'
              variant='destructive'
              className='h-7 text-xs px-2'
              onClick={onRemoveConfirm}
              disabled={isRemoving}
            >
              {isRemoving ? '…' : t('actions.confirm', { ns: 'common' })}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='h-7 text-xs px-2'
              onClick={onRemoveCancel}
            >
              {t('actions.cancel', { ns: 'common' })}
            </Button>
          </>
        ) : (
          <button
            onClick={onRemoveRequest}
            disabled={isCurrentUser || isUpdating || isRemoving}
            className='p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30'
            title={t('team.removeTitle')}
          >
            <UserX size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

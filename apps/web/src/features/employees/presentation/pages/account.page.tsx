import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCurrentEmployee } from '../../application/use-current-employee.hook';
import { useServices } from '@/shared/infrastructure/di/service.context';

// Extension point: when Google OAuth or other SSO is added, derive capabilities
// from the identity provider returned by the API (e.g. canChangePassword = provider === 'local').
type AccountCapabilities = {
  canChangeName: boolean;
  canChangePassword: boolean;
};

const CAPABILITIES: AccountCapabilities = {
  canChangeName: true,
  canChangePassword: true,
};

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type NameFormValues = z.infer<typeof nameSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function ProfileSection() {
  const { employeeService } = useServices();
  const queryClient = useQueryClient();
  const { data: employee } = useCurrentEmployee();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    values: { name: employee?.name ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: NameFormValues) => employeeService.updateSelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'me'] });
      setFeedback({ type: 'success', message: 'Name updated successfully.' });
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to update name. Please try again.' });
    },
  });

  function onSubmit(values: NameFormValues) {
    setFeedback(null);
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>Profile</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Your name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {feedback && (
              <p className={feedback.type === 'success' ? 'text-sm text-success' : 'text-sm text-destructive'}>
                {feedback.message}
              </p>
            )}
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  const { authService } = useServices();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      form.reset();
      setFeedback({ type: 'success', message: 'Password changed successfully.' });
    },
    onError: (error: unknown) => {
      const isWrongPassword =
        error instanceof Response
          ? error.status === 401
          : (error as { status?: number })?.status === 401;
      setFeedback({
        type: 'error',
        message: isWrongPassword
          ? 'Current password is incorrect.'
          : 'Failed to change password. Please try again.',
      });
    },
  });

  function onSubmit(values: PasswordFormValues) {
    setFeedback(null);
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader className='px-6 pt-5 pb-0'>
        <CardTitle className='text-base'>Security</CardTitle>
      </CardHeader>
      <Separator className='mt-4' />
      <CardContent className='px-6 pt-4 pb-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {feedback && (
              <p className={feedback.type === 'success' ? 'text-sm text-success' : 'text-sm text-destructive'}>
                {feedback.message}
              </p>
            )}
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-xl font-semibold'>Account settings</h1>
        <p className='text-sm text-muted-foreground mt-1'>Manage your profile and security preferences.</p>
      </div>
      {CAPABILITIES.canChangeName && <ProfileSection />}
      {CAPABILITIES.canChangePassword && <SecuritySection />}
    </div>
  );
}

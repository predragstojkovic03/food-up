import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useLogin } from '@/features/auth/application/use-login.hook';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { HttpError } from '@/shared/infrastructure/http/http-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod/v3';
import { getRedirectPath } from './_redirect-path';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const login = useLogin();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const hasGoogleError = (location.state as { googleError?: boolean } | null)?.googleError;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (user) {
    return <Navigate to={getRedirectPath(user.type, user.role)} replace />;
  }

  function onSubmit({ email, password }: FormValues) {
    login.mutate({ email, password });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder={t('login.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.password')}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {login.isError && (
              <p className='text-destructive text-sm'>
                {login.error instanceof HttpError && login.error.status === 403
                  ? t('login.googleOnlyAccount')
                  : t('login.error')}
              </p>
            )}
            <Button type='submit' className='w-full' disabled={login.isPending}>
              {login.isPending ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className='flex items-center gap-3 px-6'>
        <div className='bg-border h-px flex-1' />
        <span className='text-muted-foreground text-xs'>{t('login.orDivider')}</span>
        <div className='bg-border h-px flex-1' />
      </div>
      <CardContent className='pt-0'>
        {hasGoogleError && (
          <p className='text-destructive mb-3 text-sm'>{t('login.googleError')}</p>
        )}
        <Button variant='outline' className='w-full gap-2' render={<a href='/api/auth/google' />}>
          <svg viewBox='0 0 24 24' className='size-4 shrink-0' aria-hidden='true'>
            <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
            <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
            <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
            <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
          </svg>
          {t('login.googleButton')}
        </Button>
      </CardContent>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>
          {t('login.noAccount')}&nbsp;
        </span>
        <Link to='/register' className='font-medium underline'>
          {t('login.signUp')}
        </Link>
      </CardFooter>
    </Card>
  );
}

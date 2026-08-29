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
import {
  useRegisterEmployee,
  useRegisterSupplier,
  useValidateInvite,
} from '@/features/auth/application/use-register.hook';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod/v3';

type AccountType = 'employee' | 'supplier';

// ── Schemas ────────────────────────────────────────────────────────────────

const employeeSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const supplierSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    contactInfo: z.string().min(1, 'Contact info is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmployeeValues = z.infer<typeof employeeSchema>;
type SupplierValues = z.infer<typeof supplierSchema>;

// ── Type selector ──────────────────────────────────────────────────────────

function AccountTypeSelector({
  onSelect,
}: {
  onSelect: (type: AccountType) => void;
}) {
  const { t } = useTranslation('auth');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('register.title')}</CardTitle>
        <CardDescription>{t('register.description')}</CardDescription>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-3'>
        <button
          onClick={() => onSelect('employee')}
          className='border-border hover:border-primary hover:bg-accent rounded-lg border-2 p-4 text-left transition-colors'
        >
          <div className='mb-1 text-2xl'>🧑‍💼</div>
          <div className='font-semibold'>{t('register.employee.type')}</div>
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('register.employee.typeDescription')}
          </p>
        </button>
        <button
          onClick={() => onSelect('supplier')}
          className='border-border hover:border-primary hover:bg-accent rounded-lg border-2 p-4 text-left transition-colors'
        >
          <div className='mb-1 text-2xl'>🍽️</div>
          <div className='font-semibold'>{t('register.supplier.type')}</div>
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('register.supplier.typeDescription')}
          </p>
        </button>
      </CardContent>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>{t('register.alreadyHaveAccount')}&nbsp;</span>
        <Link to='/login' className='font-medium underline'>
          {t('register.signIn')}
        </Link>
      </CardFooter>
    </Card>
  );
}

// ── Employee form ──────────────────────────────────────────────────────────

function GoogleButton({ inviteToken }: { inviteToken: string }) {
  const { t } = useTranslation('auth');
  return (
    <Button
      variant='outline'
      className='w-full gap-2'
      render={<a href={`/api/auth/google?inviteToken=${encodeURIComponent(inviteToken)}`} />}
    >
      <svg viewBox='0 0 24 24' className='size-4 shrink-0' aria-hidden='true'>
        <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
        <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
        <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
        <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
      </svg>
      {t('register.employee.googleButton')}
    </Button>
  );
}

function EmployeeRegisterForm({
  inviteToken,
  inviteEmail,
  googleError,
  onBack,
}: {
  inviteToken: string;
  inviteEmail: string;
  googleError: 'email_mismatch' | 'invalid_invite' | null;
  onBack: () => void;
}) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const register = useRegisterEmployee();

  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: inviteEmail, password: '', confirmPassword: '' },
  });

  function onSubmit({ confirmPassword: _cp, ...data }: EmployeeValues) {
    register.mutate({ ...data, inviteToken }, {
      onSuccess: () => navigate('/login'),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <button
            onClick={onBack}
            className='text-muted-foreground hover:text-foreground text-sm'
          >
            {t('actions.back', { ns: 'common' })}
          </button>
        </div>
        <CardTitle>{t('register.employee.formTitle')}</CardTitle>
        <CardDescription>{t('register.employee.formDescription')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <GoogleButton inviteToken={inviteToken} />
        {googleError === 'email_mismatch' && (
          <p className='text-destructive text-sm'>
            {t('register.employee.googleEmailMismatch', { email: inviteEmail })}
          </p>
        )}
        {googleError === 'invalid_invite' && (
          <p className='text-destructive text-sm'>
            {t('register.employee.googleInvalidInvite')}
          </p>
        )}
        <div className='flex items-center gap-3'>
          <Separator className='flex-1' />
          <span className='text-muted-foreground text-xs'>{t('login.orDivider')}</span>
          <Separator className='flex-1' />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.fields.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('register.employee.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.fields.email')}</FormLabel>
                  <FormControl>
                    <Input type='email' readOnly {...field} />
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
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.fields.confirmPassword')}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {register.isError && (
              <p className='text-destructive text-sm'>
                {t('register.employee.error')}
              </p>
            )}
            <Button type='submit' className='w-full' disabled={register.isPending}>
              {register.isPending ? t('register.actions.creating') : t('register.actions.create')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Invalid invite ─────────────────────────────────────────────────────────

function InvalidInvite() {
  const { t } = useTranslation('auth');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('register.employee.invalidInviteTitle')}</CardTitle>
        <CardDescription>
          {t('register.employee.invalidInviteDescription')}
        </CardDescription>
      </CardHeader>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>{t('register.alreadyHaveAccount')}&nbsp;</span>
        <Link to='/login' className='font-medium underline'>
          {t('register.signIn')}
        </Link>
      </CardFooter>
    </Card>
  );
}

// ── Supplier form ──────────────────────────────────────────────────────────

function SupplierRegisterForm({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const register = useRegisterSupplier();

  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', contactInfo: '' },
  });

  function onSubmit({ confirmPassword: _cp, ...data }: SupplierValues) {
    register.mutate(data, {
      onSuccess: () => navigate('/login'),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <button
            onClick={onBack}
            className='text-muted-foreground hover:text-foreground text-sm'
          >
            {t('actions.back', { ns: 'common' })}
          </button>
        </div>
        <CardTitle>{t('register.supplier.formTitle')}</CardTitle>
        <CardDescription>{t('register.supplier.formDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.supplier.businessNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('register.supplier.businessNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.fields.email')}</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder={t('login.emailPlaceholder')} {...field} />
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
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.fields.confirmPassword')}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='contactInfo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.supplier.contactLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('register.supplier.contactPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {register.isError && (
              <p className='text-destructive text-sm'>
                {t('register.supplier.error')}
              </p>
            )}
            <Button type='submit' className='w-full' disabled={register.isPending}>
              {register.isPending ? t('register.actions.creating') : t('register.actions.create')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const googleErrorParam = searchParams.get('googleError');
  const googleError =
    googleErrorParam === 'email_mismatch' || googleErrorParam === 'invalid_invite'
      ? googleErrorParam
      : null;

  const { data: inviteEmail, isPending: isValidating } = useValidateInvite(inviteToken);

  const [accountType, setAccountType] = useState<AccountType | null>(() =>
    inviteToken ? 'employee' : null,
  );

  if (accountType === 'employee') {
    if (googleError === 'invalid_invite' && !inviteToken) return <InvalidInvite />;
    if (!inviteToken || isValidating) return null;
    if (!inviteEmail) return <InvalidInvite />;
    return (
      <EmployeeRegisterForm
        inviteToken={inviteToken}
        inviteEmail={inviteEmail}
        googleError={googleError}
        onBack={() => setAccountType(null)}
      />
    );
  }

  if (accountType === 'supplier') {
    return <SupplierRegisterForm onBack={() => setAccountType(null)} />;
  }

  return <AccountTypeSelector onSelect={setAccountType} />;
}

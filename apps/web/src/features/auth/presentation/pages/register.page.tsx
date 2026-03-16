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
import {
  useRegisterEmployee,
  useRegisterSupplier,
  useValidateInvite,
} from '@/features/auth/application/use-register.hook';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod/v3';

type AccountType = 'employee' | 'supplier';

// ── Schemas ────────────────────────────────────────────────────────────────

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  contactInfo: z.string().min(1, 'Contact info is required'),
});

type EmployeeValues = z.infer<typeof employeeSchema>;
type SupplierValues = z.infer<typeof supplierSchema>;

// ── Type selector ──────────────────────────────────────────────────────────

function AccountTypeSelector({
  onSelect,
}: {
  onSelect: (type: AccountType) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>What best describes you?</CardDescription>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-3'>
        <button
          onClick={() => onSelect('employee')}
          className='border-border hover:border-primary hover:bg-accent rounded-lg border-2 p-4 text-left transition-colors'
        >
          <div className='mb-1 text-2xl'>🧑‍💼</div>
          <div className='font-semibold'>Employee</div>
          <p className='text-muted-foreground mt-1 text-xs'>
            I work at a business and want to select meals.
          </p>
        </button>
        <button
          onClick={() => onSelect('supplier')}
          className='border-border hover:border-primary hover:bg-accent rounded-lg border-2 p-4 text-left transition-colors'
        >
          <div className='mb-1 text-2xl'>🍽️</div>
          <div className='font-semibold'>Supplier</div>
          <p className='text-muted-foreground mt-1 text-xs'>
            I provide meals and manage menus for businesses.
          </p>
        </button>
      </CardContent>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>Already have an account?&nbsp;</span>
        <Link to='/login' className='font-medium underline'>
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

// ── Employee form ──────────────────────────────────────────────────────────

function EmployeeRegisterForm({
  inviteToken,
  inviteEmail,
  onBack,
}: {
  inviteToken: string;
  inviteEmail: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const register = useRegisterEmployee();

  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: inviteEmail, password: '' },
  });

  function onSubmit(data: EmployeeValues) {
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
            ← Back
          </button>
        </div>
        <CardTitle>Employee registration</CardTitle>
        <CardDescription>Create your employee account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder='Jane Doe' {...field} />
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {register.isError && (
              <p className='text-destructive text-sm'>
                Registration failed. The invite link may be invalid or expired.
              </p>
            )}
            <Button type='submit' className='w-full' disabled={register.isPending}>
              {register.isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Invalid invite ─────────────────────────────────────────────────────────

function InvalidInvite() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invalid invite link</CardTitle>
        <CardDescription>
          Employee registration requires a valid invite link from your business
          manager. Please ask them to generate one.
        </CardDescription>
      </CardHeader>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>Already have an account?&nbsp;</span>
        <Link to='/login' className='font-medium underline'>
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

// ── Supplier form ──────────────────────────────────────────────────────────

function SupplierRegisterForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const register = useRegisterSupplier();

  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', email: '', password: '', contactInfo: '' },
  });

  function onSubmit(data: SupplierValues) {
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
            ← Back
          </button>
        </div>
        <CardTitle>Supplier registration</CardTitle>
        <CardDescription>Create your supplier account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input placeholder='Tasty Catering Co.' {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='you@example.com' {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
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
                  <FormLabel>Contact info</FormLabel>
                  <FormControl>
                    <Input placeholder='+1 555 000 0000 or address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {register.isError && (
              <p className='text-destructive text-sm'>
                Registration failed. Please try again.
              </p>
            )}
            <Button type='submit' className='w-full' disabled={register.isPending}>
              {register.isPending ? 'Creating account…' : 'Create account'}
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

  const { data: inviteEmail, isPending: isValidating } = useValidateInvite(inviteToken);

  const [accountType, setAccountType] = useState<AccountType | null>(() =>
    inviteToken ? 'employee' : null,
  );

  if (accountType === 'employee') {
    if (!inviteToken || isValidating) return null;
    if (!inviteEmail) return <InvalidInvite />;
    return (
      <EmployeeRegisterForm
        inviteToken={inviteToken}
        inviteEmail={inviteEmail}
        onBack={() => setAccountType(null)}
      />
    );
  }

  if (accountType === 'supplier') {
    return <SupplierRegisterForm onBack={() => setAccountType(null)} />;
  }

  return <AccountTypeSelector onSelect={setAccountType} />;
}

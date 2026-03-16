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
import { useLogin } from '@/features/auth/application/use-login.hook';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod/v3';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const user = useAuthStore((s) => s.user);

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
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='you@example.com'
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {login.isError && (
              <p className='text-destructive text-sm'>
                Invalid email or password.
              </p>
            )}
            <Button type='submit' className='w-full' disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='justify-center text-sm'>
        <span className='text-muted-foreground'>
          Don&apos;t have an account?&nbsp;
        </span>
        <Link to='/register' className='font-medium underline'>
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}

import { EmployeeRole, IdentityType } from '@food-up/shared';

function getRedirectPath(type: IdentityType, role?: EmployeeRole): string {
  switch (type) {
    case IdentityType.Employee:
      return role === EmployeeRole.Manager ? '/employee/manager' : '/employee';
    case IdentityType.Supplier:
      return '/supplier';
    case IdentityType.Business:
      return '/business';
    case IdentityType.Admin:
      return '/admin';
  }
}

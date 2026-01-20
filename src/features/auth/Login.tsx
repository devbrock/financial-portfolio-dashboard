import { useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from '@tanstack/react-router';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Heading,
  Inline,
  Input,
  Stack,
  Text,
} from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSessionId } from '@/features/auth/authSlice';
import { generateSessionId } from '@/utils/generateSessionId';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const sessionId = useAppSelector(state => state.auth.sessionId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      email: user?.email ?? '',
      password: '',
    }),
    [user?.email]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  if (sessionId) {
    return <Navigate to="/dashboard" />;
  }

  const onSubmit = handleSubmit(values => {
    if (!user) {
      setSubmitError('No account found. Please create an account first.');
      return;
    }
    if (values.email.toLowerCase() !== user.email.toLowerCase()) {
      setSubmitError('Email and password do not match our records.');
      return;
    }
    if (values.password !== user.password) {
      setSubmitError('Email and password do not match our records.');
      return;
    }
    setSubmitError(null);
    dispatch(setSessionId(generateSessionId()));
    navigate({ to: '/dashboard' });
  });

  return (
    <div className="flex items-center justify-center overflow-auto">
      <Container className="relative h-full w-full sm:py-14">
        <div className="flex h-full items-center">
          <div className="grid w-full items-start gap-6 lg:grid-cols-2 lg:gap-10">
            <Card tone="inverse" elevation="md" className="relative overflow-hidden p-6 sm:p-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-(--ui-primary) opacity-20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-(--ui-accent) opacity-20 blur-3xl"
              />

              <Stack gap="lg" className="relative">
                <Stack gap="sm" className="p-6">
                  <Heading as="h2" tone="inverse">
                    Welcome back
                  </Heading>
                  <Text tone="inverse" className="text-white/80">
                    Sign in to continue managing your portfolio and performance insights.
                  </Text>
                </Stack>

                <Stack gap="sm" className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Text as="div" className="font-semibold text-white">
                    Security highlights
                  </Text>
                  <Stack gap="sm">
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text as="span" tone="inverse" className="text-sm text-white/85">
                        Session protections + device checks
                      </Text>
                    </Inline>
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text as="span" tone="inverse" className="text-sm text-white/85">
                        Your data stays local and private
                      </Text>
                    </Inline>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            <Card elevation="md" className="p-6 sm:p-8">
              <CardHeader className="pb-5">
                <Stack gap="sm">
                  <Heading as="h2">Sign in</Heading>
                  <Text tone="muted">Use your email and password to continue.</Text>
                </Stack>
              </CardHeader>

              <CardBody className="space-y-5">
                {submitError ? (
                  <Alert tone="danger" className="mb-4!">
                    <Stack gap="sm">
                      <Text as="div" className="font-semibold">
                        We couldn’t sign you in
                      </Text>
                      <Text as="div" tone="subtle">
                        {submitError}
                      </Text>
                    </Stack>
                  </Alert>
                ) : null}

                <Divider />

                <form onSubmit={onSubmit} className="mt-4! space-y-4!">
                  <Stack gap="sm">
                    <Text as="label" htmlFor="login-email" className="font-semibold">
                      Email
                    </Text>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@company.com"
                      disabled={isSubmitting}
                      {...register('email')}
                    />
                    {errors.email ? (
                      <Text size="caption" className="text-red-700 dark:text-red-200">
                        {errors.email.message}
                      </Text>
                    ) : null}
                  </Stack>

                  <Stack gap="sm">
                    <Inline align="center" justify="between" className="gap-3">
                      <Text as="label" htmlFor="login-password" className="font-semibold">
                        Password
                      </Text>
                    </Inline>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      {...register('password')}
                    />
                    {errors.password ? (
                      <Text size="caption" className="text-red-700 dark:text-red-200">
                        {errors.password.message}
                      </Text>
                    ) : null}
                  </Stack>

                  <Button className="w-full" loading={isSubmitting} type="submit">
                    Sign in
                  </Button>

                  <Text size="caption" tone="muted" className="text-center">
                    Need access? Register for a new account.
                  </Text>

                  <Button
                    variant="secondary"
                    className="w-full"
                    type="button"
                    onClick={() => navigate({ to: '/register' })}
                  >
                    Create account
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

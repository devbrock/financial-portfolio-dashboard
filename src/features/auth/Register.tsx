import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from '@tanstack/react-router';
import {
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
import { registerUser } from '@/features/auth/authSlice';
import { generateSessionId } from '@/utils/generateSessionId';
import OrionLogoLight from '@/assets/orion_logo_light.svg';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const sessionId = useAppSelector(state => state.auth.sessionId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  if (sessionId) {
    return <Navigate to="/dashboard" />;
  }

  if (user) {
    return <Navigate to="/login" />;
  }

  const onSubmit = handleSubmit(values => {
    dispatch(
      registerUser({
        ...values,
        sessionId: generateSessionId(),
      })
    );
    navigate({ to: '/dashboard' });
  });

  return (
    <div className="overflow-auto flex justify-center items-center">
      <Container className="relative h-full w-full sm:py-14">
        <div className="flex h-full items-center justify-center">
          <div className="grid w-full max-w-5xl items-start gap-6 lg:grid-cols-2 lg:gap-10">
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
                <img src={OrionLogoLight} alt="Orion" className="h-16 mb-4!" />
                  <Heading as="h2" tone="inverse">
                    Join Orion Wealth
                  </Heading>
                  <Text tone="inverse" className="text-white/80">
                    Create your account to track portfolio performance and market insights.
                  </Text>
                </Stack>

                <Stack gap="sm" className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Text as="div" className="font-semibold text-white">
                    What you get
                  </Text>
                  <Stack gap="sm">
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text as="span" tone="inverse" className="text-sm text-white/85">
                        Personalized portfolio insights
                      </Text>
                    </Inline>
                    <Inline align="center" className="gap-3 text-white/85">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-(--ui-primary)"
                      />
                      <Text as="span" tone="inverse" className="text-sm text-white/85">
                        Watchlists, alerts, and reports
                      </Text>
                    </Inline>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            <Card elevation="md" className="p-6 sm:p-8">
              <CardHeader className="pb-5">
                <Stack gap="sm">
                  <Heading as="h2">Create account</Heading>
                  <Text tone="muted">Set up your profile to get started.</Text>
                </Stack>
              </CardHeader>
                <Divider />
              <CardBody className="space-y-5 mt-4!">
                <form onSubmit={onSubmit} className="space-y-5">
                  <Stack gap="sm">
                    <Text as="label" htmlFor="register-first-name" className="font-semibold">
                      First Name
                    </Text>
                    <Input
                      id="register-first-name"
                      placeholder="First name"
                      disabled={isSubmitting}
                      {...register('firstName')}
                    />
                    {errors.firstName ? (
                      <Text size="caption" className="text-red-700 dark:text-red-200">
                        {errors.firstName.message}
                      </Text>
                    ) : null}
                  </Stack>

                  <Stack gap="sm">
                    <Text as="label" htmlFor="register-last-name" className="font-semibold">
                      Last Name
                    </Text>
                    <Input
                      id="register-last-name"
                      placeholder="Last name"
                      disabled={isSubmitting}
                      {...register('lastName')}
                    />
                    {errors.lastName ? (
                      <Text size="caption" className="text-red-700 dark:text-red-200">
                        {errors.lastName.message}
                      </Text>
                    ) : null}
                  </Stack>

                  <Stack gap="sm">
                    <Text as="label" htmlFor="register-email" className="font-semibold">
                      Email
                    </Text>
                    <Input
                      id="register-email"
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
                    <Text as="label" htmlFor="register-password" className="font-semibold">
                      Password
                    </Text>
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
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

                  <div className="space-y-2! pt-4!">
                    <Button className="w-full" loading={isSubmitting} type="submit">
                      Create account
                    </Button>
                  </div>
                </form>

                <div className="space-y-3 pt-2">
                  <Text size="caption" tone="muted" className="text-center">
                    Already have an account?
                  </Text>

                  <Button
                    variant="secondary"
                    className="w-full"
                    type="button"
                    onClick={() => navigate({ to: '/login' })}
                  >
                    Sign in
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

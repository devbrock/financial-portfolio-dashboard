import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  Inline,
  Input,
  Stack,
  Text,
} from '@components';
import type { LoginFormValues } from '../loginFormSchema';

type LoginFormCardProps = {
  submitError: string | null;
  isSubmitting: boolean;
  errors: FieldErrors<LoginFormValues>;
  register: UseFormRegister<LoginFormValues>;
  onSubmit: () => void;
  onCreateAccount: () => void;
};

export function LoginFormCard(props: LoginFormCardProps) {
  const { submitError, isSubmitting, errors, register, onSubmit, onCreateAccount } = props;
  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';

  return (
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
              aria-describedby={errors.email ? emailErrorId : undefined}
              aria-invalid={errors.email ? 'true' : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <Text
                id={emailErrorId}
                role="alert"
                size="caption"
                className="text-red-700 dark:text-red-200"
              >
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
              aria-describedby={errors.password ? passwordErrorId : undefined}
              aria-invalid={errors.password ? 'true' : undefined}
              {...register('password')}
            />
            {errors.password ? (
              <Text
                id={passwordErrorId}
                role="alert"
                size="caption"
                className="text-red-700 dark:text-red-200"
              >
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

          <Button variant="secondary" className="w-full" type="button" onClick={onCreateAccount}>
            Create account
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

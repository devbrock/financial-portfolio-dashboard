import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  Input,
  Stack,
  Text,
} from '@components';
import type { RegisterFormValues } from '../registerFormSchema';

type RegisterFormCardProps = {
  isSubmitting: boolean;
  errors: FieldErrors<RegisterFormValues>;
  register: UseFormRegister<RegisterFormValues>;
  onSubmit: () => void;
  onSignIn: () => void;
};

export function RegisterFormCard(props: RegisterFormCardProps) {
  const { isSubmitting, errors, register, onSubmit, onSignIn } = props;

  return (
    <Card elevation="md" className="p-6 sm:p-8">
      <CardHeader className="pb-5">
        <Stack gap="sm">
          <Heading as="h2">Create account</Heading>
          <Text tone="muted">Set up your profile to get started.</Text>
        </Stack>
      </CardHeader>
      <Divider />
      <CardBody className="mt-4! space-y-5">
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

          <Button variant="secondary" className="w-full" type="button" onClick={onSignIn}>
            Sign in
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { Container } from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSessionId } from '@/features/auth/authSlice';
import { generateSessionId } from '@/utils/generateSessionId';
import { loginSchema, type LoginFormValues } from './loginFormSchema';
import { LoginIntroCard } from './components/LoginIntroCard';
import { LoginFormCard } from './components/LoginFormCard';

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
            <LoginIntroCard />
            <LoginFormCard
              submitError={submitError}
              isSubmitting={isSubmitting}
              errors={errors}
              register={register}
              onSubmit={onSubmit}
              onCreateAccount={() => navigate({ to: '/register' })}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

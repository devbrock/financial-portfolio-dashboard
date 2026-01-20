import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { Container } from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/features/auth/authSlice';
import { generateSessionId } from '@/utils/generateSessionId';
import { registerSchema, type RegisterFormValues } from './registerFormSchema';
import { RegisterIntroCard } from './components/RegisterIntroCard';
import { RegisterFormCard } from './components/RegisterFormCard';

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
    <div className="flex items-center justify-center overflow-auto">
      <Container className="relative h-full w-full sm:py-14">
        <div className="flex h-full items-center justify-center">
          <div className="grid w-full max-w-5xl items-start gap-6 lg:grid-cols-2 lg:gap-10">
            <RegisterIntroCard />
            <RegisterFormCard
              isSubmitting={isSubmitting}
              errors={errors}
              register={register}
              onSubmit={onSubmit}
              onSignIn={() => navigate({ to: '/login' })}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAppSelector } from '@/store/hooks';

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth(props: RequireAuthProps) {
  const { children } = props;
  const user = useAppSelector(state => state.auth.user);
  const sessionId = useAppSelector(state => state.auth.sessionId);

  if (!user) {
    return <Navigate to="/register" />;
  }

  if (!sessionId) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

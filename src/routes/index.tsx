import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAppSelector } from '@/store/hooks';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const user = useAppSelector(state => state.auth.user);
  const sessionId = useAppSelector(state => state.auth.sessionId);

  if (sessionId) {
    return <Navigate to="/dashboard" />;
  }

  if (user) {
    return <Navigate to="/login" />;
  }

  return <Navigate to="/register" />;
}

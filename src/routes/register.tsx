import { createFileRoute } from '@tanstack/react-router';
import { Register } from '@/features/auth/Register';

export const Route = createFileRoute('/register')({
  component: RegisterRoute,
});

function RegisterRoute() {
  return <Register />;
}

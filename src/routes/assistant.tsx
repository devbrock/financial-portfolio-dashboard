import { createFileRoute } from '@tanstack/react-router';
import { Assistant } from '@/features/assistant/Assistant';
import { RequireAuth } from '@/features/auth/RequireAuth';

export const Route = createFileRoute('/assistant')({
  component: AssistantComponent,
});

function AssistantComponent() {
  return (
    <RequireAuth>
      <Assistant />
    </RequireAuth>
  );
}

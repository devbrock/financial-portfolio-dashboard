import { createFileRoute } from '@tanstack/react-router';
import { Assistant } from '@/features/assistant/Assistant';

export const Route = createFileRoute('/assistant')({
  component: AssistantComponent,
});

function AssistantComponent() {
  return <Assistant />;
}

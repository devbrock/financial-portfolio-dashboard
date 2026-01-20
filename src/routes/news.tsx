import { createFileRoute } from '@tanstack/react-router';
import { News } from '@/features/news/News';
import { RequireAuth } from '@/features/auth/RequireAuth';

export const Route = createFileRoute('/news')({
  component: NewsComponent,
});

function NewsComponent() {
  return (
    <RequireAuth>
      <News />
    </RequireAuth>
  );
}

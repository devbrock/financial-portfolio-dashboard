import { createFileRoute } from '@tanstack/react-router';
import { News } from '@/features/news/News';

export const Route = createFileRoute('/news')({
  component: NewsComponent,
});

function NewsComponent() {
  return <News />;
}

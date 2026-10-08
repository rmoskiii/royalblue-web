import { Link, Navigate, useParams } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';
import { articleBySlug } from './articles';

export function LearnArticlePage() {
  const { slug } = useParams();
  const article = articleBySlug(slug);
  if (!article) return <Navigate to={paths.learn} replace />;

  return (
    <div className="mx-auto min-w-0 max-w-xl">
      <p className="mb-2 text-[13px]">
        <Link to={paths.learn} className="text-ink-3 hover:text-brand">
          Learn
        </Link>
        <span className="text-ink-3"> / </span>
        <span>{article.title}</span>
      </p>
      <PageHeader title={article.title} subtitle={article.summary} />
      <Card className="grid gap-3 text-[15px] leading-relaxed text-ink-2">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Card>
      {article.href && (
        <Link to={article.href} className={cn(buttonClass(), 'mt-4 w-full sm:w-auto')}>
          Open in the app
        </Link>
      )}
    </div>
  );
}

import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Card, PageHeader } from '@/components/ui';
import { learnArticles } from './articles';

export function LearnPage() {
  return (
    <div className="mx-auto min-w-0 max-w-xl">
      <PageHeader title="Learn" subtitle="Short guides for the things you can already do in the app." />
      <ul className="grid gap-3">
        {learnArticles.map((article) => (
          <li key={article.slug}>
            <Link to={`${paths.learn}/${article.slug}`} className="block min-w-0">
              <Card className="flex items-start gap-3 hover:border-brand/40">
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">{article.title}</span>
                  <span className="mt-1 block text-[13px] text-ink-2">{article.summary}</span>
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-ink-3" />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

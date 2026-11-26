import { ExternalLink } from 'lucide-react';
import { NewsItem } from '@/services/stockMarketAPI';
import { formatRelativeTime } from '@/lib/time';

export function NewsCard({ newsItem }: { newsItem: NewsItem }) {
  // Article URLs come from a third party: only ever link to http(s).
  const href = /^https?:\/\//i.test(newsItem.url) ? newsItem.url : null;
  const when = formatRelativeTime(newsItem.publishedAt);

  return (
    <article className="w-full max-w-xl rounded-card border bg-card p-4 text-card-foreground">
      <h3 className="font-sans font-medium [overflow-wrap:anywhere]">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {newsItem.title}
            <ExternalLink className="ml-1.5 inline h-4 w-4 align-[-2px] text-muted-foreground" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          newsItem.title
        )}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {newsItem.source}
        {when && <> · <time dateTime={newsItem.publishedAt} title={new Date(newsItem.publishedAt).toLocaleString()}>{when}</time></>}
      </p>
    </article>
  );
}

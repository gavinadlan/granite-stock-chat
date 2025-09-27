import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { NewsItem } from '@/services/stockMarketAPI';

interface NewsCardProps {
  newsItem: NewsItem;
}

export function NewsCard({ newsItem }: NewsCardProps) {
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '📰';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Newspaper className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold line-clamp-2">{newsItem.title}</span>
          </div>
          {newsItem.sentiment && (
            <Badge className={`text-xs ${getSentimentColor(newsItem.sentiment)}`}>
              {getSentimentIcon(newsItem.sentiment)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3">
          {newsItem.description}
        </p>

        {/* Source and Date */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
          </div>
          <span className="font-medium">{newsItem.source}</span>
        </div>

        {/* Link */}
        {newsItem.url && newsItem.url !== '#' && (
          <div className="pt-2 border-t">
            <a 
              href={newsItem.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <span>Read more</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
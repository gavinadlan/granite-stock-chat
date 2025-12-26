import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { NewsItem } from '@/services/stockMarketAPI';

interface NewsCardProps {
  newsItem: NewsItem;
}

export function NewsCard({ newsItem }: NewsCardProps) {

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
            <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold line-clamp-2 break-words">{newsItem.title}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
            News
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2.5 sm:space-y-3 p-4 sm:p-6 pt-0">
        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {newsItem.description}
        </p>

        {/* Source and Date */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 flex-wrap gap-1">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="break-all">{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
          </div>
          <span className="font-medium break-all">{newsItem.source}</span>
        </div>

        {/* Link */}
        {newsItem.url && newsItem.url !== '#' && (
          <div className="pt-2 border-t">
            <a 
              href={newsItem.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800"
            >
              <span>Read more</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
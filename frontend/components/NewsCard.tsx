import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock } from 'lucide-react';

interface NewsCardProps {
  title: string;
  source: string;
  time: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ title, source, time }) => {
  return (
    <Card className="p-4 shadow-card hover:shadow-financial transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between space-x-3">
        <div className="flex-1">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center space-x-3 mt-2">
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Card>
  );
};
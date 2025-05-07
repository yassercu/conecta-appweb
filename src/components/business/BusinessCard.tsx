import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/types/business';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Card className="overflow-hidden">
      <a href={`/business/${business.id}`} className="block">
        <div className="aspect-video relative">
          <img
            src={business.image || '/assets/businesses/default.svg'}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          {business.promoted && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive">★ DESTACADO</Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{business.name}</CardTitle>
          <div className="flex items-center gap-1 text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="font-medium">{business.rating.toFixed(1)}</span>
          </div>
        </CardHeader>
      </a>
    </Card>
  );
}
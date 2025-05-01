'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Update search query state if the URL param changes (e.g., back button)
  useEffect(() => {
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    // Preserve other existing params like category, rating etc.
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full gap-2">
      <Input
        type="text"
        placeholder="Buscar negocios, servicios..."
        className="flex-grow bg-background" // Ensure input uses theme background
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Buscar negocios"
      />
      <Button type="submit" variant="secondary"> {/* Use secondary variant for contrast */}
        <Search className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Buscar</span>
      </Button>
    </form>
  );
}

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search) 
      : new URLSearchParams()
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Update search query state if the URL param changes (e.g., back button)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        setSearchParams(params);
        setSearchQuery(params.get('query') || initialQuery || '');
      }
    } catch (error) {
      console.error("Error al actualizar la consulta de búsqueda:", error);
      setSearchQuery(initialQuery || '');
    }
  }, [initialQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    try {
      // Si se pasó un callback onSearch, lo usamos
      if (onSearch) {
        onSearch(searchQuery);
        return;
      }

      // Si no hay callback, manejamos la navegación directamente
      const params = new URLSearchParams(searchParams);
      if (searchQuery.trim()) {
        params.set('query', searchQuery);
      } else {
        params.delete('query');
      }
      
      // Navigate to search page with query params
      window.location.href = `/search?${params.toString()}`;
    } catch (error) {
      console.error("Error al procesar la búsqueda:", error);
      // Intentamos navegar a la página de búsqueda sin parámetros
      window.location.href = '/search';
    }
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

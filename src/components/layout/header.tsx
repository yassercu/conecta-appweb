import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-6 w-6 text-accent" />
          <span>LocalSpark</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4"> {/* Reduced gap for smaller screens */}
          <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" className="text-sm md:text-base"> {/* Responsive text size */}
              Inicio
            </Button>
          </Link>
          <Link href="/search" passHref legacyBehavior>
            <Button variant="ghost" className="text-sm md:text-base">
              Buscar
            </Button>
          </Link>
           <Link href="/register" passHref legacyBehavior>
             <Button variant="secondary" className="text-sm md:text-base px-2 md:px-4"> {/* Responsive padding */}
               Registrar Negocio
             </Button>
           </Link>
        </nav>
      </div>
    </header>
  );
}

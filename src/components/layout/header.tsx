import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/search-bar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="hidden sm:inline">LocalSpark</span>
          </Link>
          {/* Search Bar integrated into the header */}
          <div className="flex-grow max-w-xl hidden md:block">
            <SearchBar />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" className="text-sm">
              Inicio
            </Button>
          </Link>
          <Link href="/search" passHref legacyBehavior>
            <Button variant="ghost" className="text-sm">
              Explorar
            </Button>
          </Link>
          <Link href="/register" passHref legacyBehavior>
            <Button variant="secondary" className="text-sm">
              Registrar Negocio
            </Button>
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Trigger & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Abrir menú</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                  <nav className="grid gap-4 text-lg p-4 mt-8">
                      <Link href="/" className="font-medium text-foreground hover:text-primary" passHref>
                         Inicio
                      </Link>
                      <Link href="/search" className="font-medium text-foreground hover:text-primary" passHref>
                         Explorar
                      </Link>
                      <Link href="/register" className="font-medium text-foreground hover:text-primary" passHref>
                         Registrar Negocio
                      </Link>
                      {/* Optionally add search bar here too */}
                       <div className="mt-4">
                           <SearchBar />
                       </div>
                  </nav>
              </SheetContent>
          </Sheet>
        </div>

      </div>
       {/* Search Bar visible on mobile below the main header */}
       <div className="container mx-auto px-4 pb-4 md:hidden">
            <SearchBar />
        </div>
    </header>
  );
}

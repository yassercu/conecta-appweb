import { Button } from '@/components/ui/button';
import { Sparkles, Menu, Home, Search, Store, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/search-bar';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="hidden sm:inline">LocalSpark</span>
          </a>
          {/* Search Bar integrated into the header - only visible on desktop */}
          <div className="flex-grow hidden md:block">
            <SearchBar />
          </div>
        </div>

        {/* Desktop Navigation - only visible on md screens and up */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" className="text-sm" asChild>
            <a href="/search">Explorar</a>
          </Button>
          <Button variant="secondary" className="text-sm" asChild>
            <a href="/register">Registrar Negocio</a>
          </Button>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Trigger & Theme Toggle - only visible on smaller than md screens */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-none bg-transparent hover:bg-secondary">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Abrir menú</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-l max-w-full sm:max-w-sm">
                  <div className="flex flex-col h-full">
                      {/* Header con botón de cierre */}
                      <div className="flex items-center justify-between p-4 border-b">
                          <h2 className="font-semibold text-lg flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" /> 
                              Menú
                          </h2>
                          <SheetClose className="rounded-full hover:bg-secondary p-1">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cerrar</span>
                          </SheetClose>
                      </div>
                      
                      {/* Navegación centrada */}
                      <nav className="flex flex-col items-stretch flex-grow">
                          <a href="/" className="flex items-center gap-3 py-4 px-6 border-b hover:bg-secondary/50 transition-colors">
                              <Home className="h-5 w-5 text-primary" />
                              <span>Inicio</span>
                          </a>
                          <a href="/search" className="flex items-center gap-3 py-4 px-6 border-b hover:bg-secondary/50 transition-colors">
                              <Search className="h-5 w-5 text-primary" />
                              <span>Explorar</span>
                          </a>
                          <a href="/register" className="flex items-center gap-3 py-4 px-6 border-b hover:bg-secondary/50 transition-colors">
                              <Store className="h-5 w-5 text-primary" />
                              <span>Registrar Negocio</span>
                          </a>
                      </nav>
                  </div>
              </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Barra de búsqueda visible en móvil debajo del header principal */}
      <div className="container mx-auto px-4 pb-4 md:hidden">
          <SearchBar />
      </div>
    </header>
  );
}


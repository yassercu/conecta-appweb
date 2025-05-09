import { Button } from '@/components/ui/button';
import { Sparkles, Menu, Home, Search, Store, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchBar } from '@/components/search-bar';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import type { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
  isHomePage?: boolean;
}

export function Header({ children, isHomePage = false }: HeaderProps) {
  return (
    <>
      {/* Espaciador para compensar la altura de la barra fija */}
      <div className="h-16"></div>

      {/* Barra de navegación - visible en todas las páginas */}
      <nav className="space-nav">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center ">
            <a href="/" className="flex items-center gap-2 text-xl font-bold whitespace-nowrap">
              {/* <span className="text-white   w-auto hidden sm:block">Orbita-Y ~</span> */}
              <img
                src="/assets/logo_conTexto.webp"
                alt="Orbita-Y Logo"
                className="h-24 pt-4 w-auto hidden sm:block"
              />
            </a>
          </div>

          <div className="flex-1  sm:px-10 mx-full">
            <SearchBar />
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-2">
            <Button variant="ghost" className="text-sm" asChild>
              <a href="/payment">Precios</a>
            </Button>
            <Button variant="ghost" className="text-sm" asChild>
              <a href="/search">Explorar</a>
            </Button>
            <Button variant="secondary" className="text-sm" asChild>
              <a href="/register">Registrar Negocio</a>
            </Button>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 md:hidden ml-2">
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
      </nav>

      {/* Hero espacial - visible solo en la página principal */}
      {isHomePage && (
        <header className="space-header relative">
          {/* Hero Section con efectos espaciales */}
          <div className="relative py-20 sm:py-28">
            {/* Estrellas flotantes animadas */}
            <div className="absolute inset-0 stars-field"></div>

            {/* Planetas flotantes decorativos */}
            <div className="absolute top-20 left-[5%] w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-700/20 blur-sm animate-float-slow hidden lg:block"></div>
            <div className="absolute bottom-40 right-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-700/20 blur-sm animate-float hidden lg:block"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-2xl mx-auto relative">
                {/* Logo hero reposicionado */}
                <div className="flex justify-center md:absolute md:-top-20 md:inset-x-0 md:z-0">
                  <img
                    src="/assets/logo_hero.webp"
                    alt="Orbita-Y Hero"
                    className="w-auto h-60 sm:h-32 md:h-96 object-cover mask-radial-at-center mask-radial-from-50% mask-radial-to-70% animate-float-slow md:opacity-20"
                  />
                </div>
                {/* Contenido del hero con z-index para estar sobre el logo en md */}
                <div className="relative md:z-10">
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    <span className="inline-block relative">
                      Orbita de Negocios
                      <span className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/10 blur-lg -z-10"></span>
                    </span>
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-300">
                    Descubre y conecta con los mejores negocios locales. Tu próxima experiencia extraordinaria está a solo un clic de distancia.
                  </p>
                  <div className="mt-10 flex items-center justify-center sm:gap-x-6 gap-2">
                    <Button size="lg" className="relative group" asChild>
                      <a href="/register">
                        Registra tu Negocio
                        <span className="absolute -inset-0.5 bg-primary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-300 -z-10"></span>
                      </a>
                    </Button>
                    <Button variant="outline" size="lg" className="text-blue border-white hover:bg-white/10" asChild>
                      <a href="/search">
                        Explorar Negocios
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divisor curvo - línea vectorial elegante y sutil */}
          <div className="absolute -bottom-[1px] left-0 right-0 overflow-hidden z-10 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 60"
              preserveAspectRatio="none"
              className="w-full"
              style={{ display: 'block', height: '60px' }}
            >
              <path
                d="M0,59 C360,10 1080,10 1440,59"
                fill="none"
                stroke="var(--background)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </header>
      )}

      {children}
    </>
  );
}


import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  // El tema por defecto es light
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Al cargar el componente, comprueba si hay una preferencia guardada
  React.useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      
      // Si hay una preferencia guardada, úsala
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        // Si no hay preferencia, comprueba la preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', prefersDark);
        try {
          localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        } catch (e) {
          console.warn("No se pudo guardar el tema en localStorage:", e);
        }
      }
    } catch (e) {
      console.warn("Error al inicializar el tema:", e);
      // Usar tema claro como fallback en caso de error
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Función para cambiar el tema
  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn("Error al cambiar el tema:", e);
      // Aún cambiamos el tema visualmente aunque falle localStorage
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
} 
import React, { lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string | number;
}

/**
 * Componente para cargar elementos de manera perezosa cuando están cerca del viewport
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <Skeleton className="w-full h-[200px] rounded-lg" />,
  threshold = 0.1,
  rootMargin = '200px',
  minHeight = '200px'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(currentRef);
          }
        });
      },
      { threshold, rootMargin }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);
  
  return (
    <div 
      ref={ref} 
      data-dynamic="true" 
      data-min-height={typeof minHeight === 'number' ? minHeight.toString() : minHeight}
      style={{ minHeight }}
    >
      {isVisible ? children : fallback}
    </div>
  );
};

/**
 * Crea un componente con carga diferida que solo se carga cuando es visible en la pantalla
 * 
 * @param importFn Función de importación dinámica
 * @param fallback Componente a mostrar mientras se carga
 * @returns Componente con carga diferida
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    threshold?: number;
    rootMargin?: string;
    minHeight?: string | number;
  } = {}
) {
  const LazyComponent = lazy(importFn);
  
  const defaultOptions = {
    fallback: <Skeleton className="w-full h-[200px] rounded-lg" />,
    threshold: 0.1,
    rootMargin: '200px',
    minHeight: '200px',
    ...options
  };
  
  return function LazyLoadedComponent(props: ComponentProps<T>) {
    return (
      <LazyLoad
        fallback={defaultOptions.fallback}
        threshold={defaultOptions.threshold}
        rootMargin={defaultOptions.rootMargin}
        minHeight={defaultOptions.minHeight}
      >
        <Suspense fallback={defaultOptions.fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyLoad>
    );
  };
}

export default LazyLoad; 
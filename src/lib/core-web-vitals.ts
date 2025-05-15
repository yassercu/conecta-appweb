/**
 * Biblioteca para optimizar y monitorear Core Web Vitals
 * 
 * Implementa optimizaciones para:
 * - FID (First Input Delay)
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift)
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Umbrales para calificaciones de métricas según Google
const THRESHOLDS = {
  LCP: {
    good: 2500,
    poor: 4000
  },
  FID: {
    good: 100,
    poor: 300
  },
  CLS: {
    good: 0.1,
    poor: 0.25
  }
};

// Función para determinar la calificación de una métrica
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value > threshold.poor) return 'poor';
  return 'needs-improvement';
};

// Función para enviar métricas a un servicio de análisis (mock)
const sendToAnalytics = (metric: WebVitalMetric) => {
  // En un entorno de producción, aquí enviaríamos los datos a un servicio de análisis
  console.log('Métrica Core Web Vital:', metric);
  
  // También podríamos enviar a Google Analytics o similar
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-ignore
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
};

// Optimizaciones para LCP - Largest Contentful Paint
export const optimizeLCP = () => {
  if (typeof window === 'undefined') return;

  // Priorizar carga de imágenes críticas
  const preloadImages = () => {
    const criticalImgs = document.querySelectorAll('img[data-critical="true"]');
    criticalImgs.forEach(img => {
      // @ts-ignore
      if (img.dataset.src) {
        // @ts-ignore
        img.src = img.dataset.src;
      }
      // @ts-ignore
      img.fetchPriority = 'high';
    });
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadImages);
  } else {
    preloadImages();
  }
};

// Optimizaciones para FID - First Input Delay
export const optimizeFID = () => {
  if (typeof window === 'undefined') return;

  // Desacoplar tareas pesadas del hilo principal
  const optimizeMainThread = () => {
    // Usar requestIdleCallback para tareas no críticas
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(() => {
        // Aquí podríamos inicializar analíticas o cargar scripts no críticos
        console.log('Inicializando recursos no críticos durante tiempo inactivo');
      });
    }
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeMainThread);
  } else {
    optimizeMainThread();
  }
};

// Optimizaciones para CLS - Cumulative Layout Shift
export const optimizeCLS = () => {
  if (typeof window === 'undefined') return;

  // Establecer dimensiones para elementos que pueden causar cambios de layout
  const preventLayoutShifts = () => {
    // Reservar espacio para imágenes
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      img.setAttribute('width', '100%');
      img.setAttribute('height', 'auto');
      (img as HTMLImageElement).style.aspectRatio = '16/9';
    });

    // Reservar espacio para componentes que cargan dinámicamente
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    dynamicElements.forEach(el => {
      // @ts-ignore
      if (el.dataset.minHeight) {
        // @ts-ignore
        el.style.minHeight = `${el.dataset.minHeight}px`;
      }
    });
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preventLayoutShifts);
  } else {
    preventLayoutShifts();
  }
};

// Configurar monitoreo de las métricas Web Vitals
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Monitorear LCP
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    const lcp = lastEntry.startTime;
    
    const metric: WebVitalMetric = {
      name: 'LCP',
      value: lcp,
      rating: getRating('LCP', lcp)
    };
    
    sendToAnalytics(metric);
  });
  
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // Monitorear FID
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      // @ts-ignore
      const fid = entry.processingStart - entry.startTime;
      
      const metric: WebVitalMetric = {
        name: 'FID',
        value: fid,
        rating: getRating('FID', fid)
      };
      
      sendToAnalytics(metric);
    });
  });
  
  fidObserver.observe({ type: 'first-input', buffered: true });

  // Monitorear CLS (implementación básica)
  let clsValue = 0;
  let clsEntries = [];

  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    
    entries.forEach(entry => {
      // No incluir si el usuario ha interactuado (scroll, zoom)
      // @ts-ignore
      if (!entry.hadRecentInput) {
        // @ts-ignore
        clsValue += entry.value;
        // @ts-ignore
        clsEntries.push(entry);
      }
    });
    
    const metric: WebVitalMetric = {
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue)
    };
    
    sendToAnalytics(metric);
  });
  
  clsObserver.observe({ type: 'layout-shift', buffered: true });
};

// Inicializar todas las optimizaciones
export const initWebVitalsOptimization = () => {
  optimizeLCP();
  optimizeFID();
  optimizeCLS();
  monitorWebVitals();
};

export default initWebVitalsOptimization; 
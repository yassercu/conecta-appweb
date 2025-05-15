import { initWebVitalsOptimization } from './core-web-vitals';

/**
 * Inicializa todas las optimizaciones de rendimiento
 * Este archivo debe importarse y ejecutarse en el punto de entrada principal de la aplicación
 */
export function initializeOptimizations() {
  // Optimización de Core Web Vitals
  if (typeof window !== 'undefined') {
    initWebVitalsOptimization();
    
    // Registro de Service Worker para PWA si está en producción
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registrado con éxito:', registration.scope);
          })
          .catch(error => {
            console.error('Error al registrar el Service Worker:', error);
          });
      });
    }
    
    // Precargar fuentes críticas
    const preloadFonts = () => {
      const fontUrls = [
        '/assets/fonts/main-font.woff2',
        '/assets/fonts/main-font-bold.woff2'
      ];
      
      fontUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };
    
    // Optimización de terceros: cargar scripts no críticos de forma diferida
    const loadNonCriticalScripts = () => {
      const scripts = [
        { src: 'https://analytics.example.com/script.js', async: true, defer: true },
        { src: 'https://other-service.example.com/widget.js', async: true, defer: true }
      ];
      
      // Usar requestIdleCallback para cargar scripts cuando el navegador esté inactivo
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          scripts.forEach(scriptData => {
            const script = document.createElement('script');
            script.src = scriptData.src;
            if (scriptData.async) script.async = true;
            if (scriptData.defer) script.defer = true;
            document.body.appendChild(script);
          });
        }, { timeout: 5000 });
      } else {
        // Fallback para navegadores que no soportan requestIdleCallback
        setTimeout(() => {
          scripts.forEach(scriptData => {
            const script = document.createElement('script');
            script.src = scriptData.src;
            if (scriptData.async) script.async = true;
            if (scriptData.defer) script.defer = true;
            document.body.appendChild(script);
          });
        }, 3000); // Cargar después de 3 segundos
      }
    };
    
    // Ejecutar optimizaciones de carga de fuentes
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', preloadFonts);
    } else {
      preloadFonts();
    }
    
    // Ejecutar carga diferida de scripts no críticos
    window.addEventListener('load', loadNonCriticalScripts);
    
    // Optimizar las imágenes que están fuera de la pantalla
    const optimizeOffscreenImages = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        // Asegurarse de que las imágenes tengan width y height para evitar CLS
        if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
          img.setAttribute('width', '100%');
          img.setAttribute('height', 'auto');
          (img as HTMLImageElement).style.aspectRatio = '16/9';
        }
      });
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeOffscreenImages);
    } else {
      optimizeOffscreenImages();
    }
  }
}

export default initializeOptimizations; 
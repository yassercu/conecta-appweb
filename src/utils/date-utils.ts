/**
 * Funciones de utilidad para formatear fechas y horas
 */

/**
 * Formatea una fecha en el formato DD/MM/YYYY
 * @param date La fecha a formatear
 * @returns La fecha formateada como string
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora en el formato HH:MM
 * @param date La fecha que contiene la hora a formatear
 * @returns La hora formateada como string
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
} 
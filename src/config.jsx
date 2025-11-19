// Centraliza la resolución de la URL base del API.
// Prioridad de fuentes:
// 1) variable de build: process.env.REACT_APP_API_URL (Create React App)
// 2) variable inyectada en runtime: window.__env.REACT_APP_API_URL (opcional, útil para contenedores/túneles)
// 3) fallback a la URL conocida para desarrollo rápido

const resolveApiBase = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch (e) {}

  try {
    if (typeof window !== 'undefined' && window.__env && window.__env.REACT_APP_API_URL) {
      return window.__env.REACT_APP_API_URL;
    }
  } catch (e) {}

  // Fallback fijo para desarrollo local
  return 'http://192.168.200.72:5000';
};

export const API_BASE_URL = resolveApiBase();

export default {
  API_BASE_URL,
};
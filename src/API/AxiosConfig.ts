import axios from 'axios';
import { authService } from '../Services/AuthService.ts';
import { isTokenExpired } from '../Utils/tokenUtils.ts';
import { notificationService } from '../Utils/notificationService.ts';

// Crear una instancia de axios
const axiosInstance = axios.create();

// Agregar un interceptor para verificar el token antes de cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    
    // Si hay un token, verificar que no esté expirado
    if (token) {
      // Verificar si el token está expirado
      if (isTokenExpired(token)) {
        console.log('Token expirado, cerrando sesión...');
        // Si está expirado, cerrar sesión
        authService.handleLogout();
        // Mostrar notificación
        notificationService.auth.sessionExpired();
        // Rechazar la solicitud
        return Promise.reject(new Error('Token expirado'));
      }
      
      // Si el token es válido, agregarlo al header
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Agregar un interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (Unauthorized), cerrar sesión
    if (error.response && error.response.status === 401) {
      console.log('Respuesta 401, cerrando sesión...');
      authService.handleLogout();
      notificationService.auth.sessionExpired();
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
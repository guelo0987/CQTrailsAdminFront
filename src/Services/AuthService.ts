import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axios from 'axios';
import { notificationService } from '../Utils/notificationService.ts';

interface LoginCredentials {
    email: string;
    passwordHash: string;
}


class AuthService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Login user with email and password
     * @param credentials User credentials (email and password)
     * @returns Promise with authentication response
     */
    // Update the login method to properly handle the authentication response
    async login(credentials: LoginCredentials) {
        try {
            // Transform credentials to match API expectations
            const { passwordHash, ...otherData } = credentials;
            const loginData = {
                ...otherData,
                password: passwordHash // API expects 'password', not 'passwordHash'
            };
            
            
            const response = await axios.post(`${this.baseURL}${endpoints.auth.login}`, loginData);
            const data = response.data;
            
           
            
            // Extract token from the nested data structure
            // The API returns: {success: true, message: 'Login exitoso', data: {access_token, user_id, etc}}
            const token = data.data?.access_token || data.data?.token || data.token || data.access_token;
            
            if (token) {
                // Create a normalized data object with the token
                const normalizedData = {
                    token: token,
                    user: {
                        idUsuario: data.data?.user_id || data.user_id,
                        nombre: data.data?.nombre,
                        apellido: data.data?.apellido,
                        email: data.data?.email
                    },
                    role: data.data?.role || data.role || 'Cliente'
                };
                
                console.log('Extracted authentication data:', normalizedData);
                
                // Store authentication data
                this.setAuthData(normalizedData);
                
                // Setup token expiration handler if that method exists
                if (this.setupTokenExpirationHandler) {
                    this.setupTokenExpirationHandler(token);
                }
                
                // Notify successful login
                notificationService.auth.loginSuccess();
                
                return normalizedData;
            } else {
                console.error('No token received in login response. Response structure:', JSON.stringify(data, null, 2));
                throw new Error('No se recibió token de autenticación');
            }
        } catch (error) {
            console.error('Error en login:', error);
            // Log additional error details if available
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            throw error;
        }
    }

  
  

    

    

    /**
     * Logout user and clear local storage
     */
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('auth');
        notificationService.auth.logoutSuccess();
        window.location.href = '/';
    }

    /**
     * Check if user is authenticated
     * @returns Boolean indicating if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    /**
     * Get current user data
     * @returns User data object or null
     */
    getCurrentUser() {
        try {
            const userStr = window.localStorage.getItem('user');
            const token = window.localStorage.getItem('token');
            const auth = window.localStorage.getItem('auth');
            
            if (!userStr || !token) {
                return null;
            }
            
            try {
                const userData = JSON.parse(userStr);
                return userData;
            } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
                
                // Try to clear and reset based on token
                if (token && auth === 'true') {
                    // In a real app, you might try to refresh the user data using the token
                    // But for now, we'll just clear the invalid data
                    localStorage.removeItem('user');
                }
                return null;
            }
        } catch (e) {
            console.error('Unexpected error in getCurrentUser:', e);
            return null;
        }
    }

    /**
     * Get user role
     * @returns User role or null
     */
    getUserRole(): string | null {
        return localStorage.getItem('role');
    }

    /**
     * Get authentication token
     * @returns Auth token or null
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Store authentication data in localStorage
     * @param data Authentication response data
     */
    private setAuthData(data: any) {
        try {
            // Ensure all data is valid before setting
            if (!data.token) {
                console.error('Missing token in auth data');
                throw new Error('Token de autenticación faltante');
            }
            
            // Extract user data or create default if missing
            let userData = data.user || {};
            
            // Extract user ID from token if it's missing in user data
            if (!userData.idUsuario) {
                try {
                    // Decode JWT token to see if it contains the ID
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(window.atob(base64));
                    
                    // Check if the payload contains an Id claim
                    if (payload.Id) {
                        userData = {
                            ...userData,
                            idUsuario: parseInt(payload.Id)
                        };
                    }
                } catch (tokenError) {
                    console.error('Error extracting user ID from token:', tokenError);
                }
            }
            
            // Save the data even if user ID is missing - better than nothing
            window.localStorage.setItem('token', data.token);
            window.localStorage.setItem('user', JSON.stringify(userData));
            window.localStorage.setItem('role', data.role || 'Cliente');
            window.localStorage.setItem('auth', 'true');
            
            return true;
        } catch (error) {
            console.error('Error setting auth data:', error);
            throw error;
        }
    }

    /**
     * Setup token expiration handler
     * @param token JWT token
     */
    private setupTokenExpirationHandler(token: string) {
        try {
            // Decode JWT token to get expiration time
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            // Calculate time until expiration (in milliseconds)
            const expiresIn = (payload.exp * 1000) - Date.now();
            
            // Setup timer to auto logout when token expires
            setTimeout(() => {
                console.log('Token expirado. Cerrando sesión automáticamente...');
                this.handleLogout();
            }, expiresIn);
        } catch (error) {
            console.error('Error al configurar el manejador de expiración del token:', error);
        }
    }

   
}

export const authService = new AuthService();
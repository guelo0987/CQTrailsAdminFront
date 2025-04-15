import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface User {
    idUsuario?: number;
    nombre: string;
    apellido: string;
    email: string;
    idRol?: number;
    // Add other user fields as needed
}

interface UserQueryParams {
    skip?: number;
    limit?: number;
    activo?: boolean;
    // Add other query parameters as needed
}

class UserService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all users with optional query parameters
     * @param params Query parameters (skip, limit, activo)
     * @returns Promise with users list
     */
    async getUsers(params: UserQueryParams = { skip: 0, limit: 100, activo: true }) {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params.skip !== undefined) {
                queryParams.append('skip', params.skip.toString());
            }
            
            if (params.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }
            
            if (params.activo !== undefined) {
                queryParams.append('activo', params.activo.toString());
            }
            
            const queryString = queryParams.toString();
            const url = `${this.baseURL}${endpoints.users.list}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param id User ID
     * @returns Promise with user data
     */
    async getUserById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.users.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new user
     * @param user User data
     * @returns Promise with created user
     */
    async createUser(user: User) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.users.list}`, user);
            notificationService.showSuccess('Usuario creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing user
     * @param id User ID
     * @param user Updated user data
     * @returns Promise with updated user
     */
    async updateUser(id: number, user: User) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.users.porId(id)}`, user);
            notificationService.showSuccess('Usuario actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete user
     * @param id User ID
     * @returns Promise with deletion result
     */
    async deleteUser(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.users.porId(id)}`);
            notificationService.showSuccess('Usuario eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }
}

export const userService = new UserService();
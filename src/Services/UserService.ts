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
     * Get all users (not just clients) with optional query parameters
     * @param params Query parameters (skip, limit, activo)
     * @returns Promise with all users list
     */
    async getAllUsers(params: UserQueryParams = { skip: 0, limit: 100, activo: true }) {
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
            const url = `${this.baseURL}${endpoints.users.allUsers}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
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
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.users.create}`, user);
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
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.users.update(id)}`, user);
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
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.users.delete(id)}`);
            notificationService.showSuccess('Usuario eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Change user role
     * @param id User ID
     * @param roleId New role ID
     * @returns Promise with updated user
     */
    async changeUserRole(id: number, roleId: number) {
        try {
            const response = await axiosInstance.patch(`${this.baseURL}${endpoints.users.changeRole(id)}`, {
                idRol: roleId
            });
            notificationService.showSuccess('Rol de usuario actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error changing role for user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al cambiar el rol del usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Change user activation status
     * @param id User ID
     * @param isActive New activation status
     * @returns Promise with updated user
     */
    async changeUserStatus(id: number, isActive: boolean) {
        try {
            const response = await axiosInstance.patch(`${this.baseURL}${endpoints.users.changeStatus(id)}`, {
                activo: isActive
            });
            const statusMessage = isActive ? 'activado' : 'desactivado';
            notificationService.showSuccess(`Usuario ${statusMessage} exitosamente`);
            return response.data;
        } catch (error) {
            console.error(`Error changing status for user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Change user password
     * @param id User ID
     * @param newPassword New password
     * @param currentPassword Current password (for verification)
     * @returns Promise with result
     */
    async changeUserPassword(id: number, newPassword: string, currentPassword?: string) {
        try {
            const payload = {
                nuevaPassword: newPassword
            };
            
            if (currentPassword) {
                Object.assign(payload, { passwordActual: currentPassword });
            }
            
            const response = await axiosInstance.patch(`${this.baseURL}${endpoints.users.changePassword(id)}`, payload);
            notificationService.showSuccess('Contraseña actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error changing password for user with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña del usuario';
            notificationService.showError(errorMessage);
            throw error;
        }
    }
}

// Export a singleton instance
export const userService = new UserService();
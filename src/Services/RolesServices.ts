import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

// Define interfaces
interface Role {
    IdRol?: number;
    NombreRol: string;
    Descripcion?: string;
    // Add other role fields as needed
}

interface Permission {
    idPermiso: number;
    nombre: string;
    descripcion?: string;
}

interface RoleQueryParams {
    skip?: number;
    limit?: number;
    // Add other query parameters as needed
}

class RolesService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all roles with optional query parameters
     * @param params Query parameters (skip, limit)
     * @returns Promise with roles list
     */
    async getRoles(params: RoleQueryParams = { skip: 0, limit: 100 }) {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params.skip !== undefined) {
                queryParams.append('skip', params.skip.toString());
            }
            
            if (params.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }
            
            const queryString = queryParams.toString();
            const url = `${this.baseURL}${endpoints.roles.list}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }

    /**
     * Get role by ID
     * @param id Role ID
     * @returns Promise with role data
     */
    async getRoleById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.roles.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching role with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new role
     * @param role Role data
     * @returns Promise with created role
     */
    async createRole(role: Role) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.roles.create}`, role);
            notificationService.showSuccess('Rol creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing role
     * @param id Role ID
     * @param role Updated role data
     * @returns Promise with updated role
     */
    async updateRole(id: number, role: Role) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.roles.update(id)}`, role);
            notificationService.showSuccess('Rol actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating role with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete role
     * @param id Role ID
     * @returns Promise with deletion result
     */
    async deleteRole(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.roles.delete(id)}`);
            notificationService.showSuccess('Rol eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting role with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Add permission to role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Promise with updated role
     */
    async addPermissionToRole(roleId: number, permissionId: number) {
        try {
            const response = await axiosInstance.post(
                `${this.baseURL}${endpoints.roles.addPermission(roleId, permissionId)}`
            );
            notificationService.showSuccess('Permiso añadido exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error adding permission ${permissionId} to role ${roleId}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al añadir el permiso al rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Remove permission from role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Promise with updated role
     */
    async removePermissionFromRole(roleId: number, permissionId: number) {
        try {
            const response = await axiosInstance.delete(
                `${this.baseURL}${endpoints.roles.removePermission(roleId, permissionId)}`
            );
            notificationService.showSuccess('Permiso eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error removing permission ${permissionId} from role ${roleId}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el permiso del rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }
}

// Export a singleton instance
export const rolesService = new RolesService();

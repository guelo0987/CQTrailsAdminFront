import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

// Define interfaces for role permissions
interface RolPermiso {
    IdRol: number;
    IdPermiso: number;
    Crear: boolean;
    Editar: boolean;
    Leer: boolean;
    Eliminar: boolean;
    NombreRol?: string;
    NombrePermiso?: string;
}

interface RolPermisoCreate {
    IdRol: number;
    IdPermiso: number;
    Crear: boolean;
    Editar: boolean;
    Leer: boolean;
    Eliminar: boolean;
}

interface RolPermisoUpdate {
    Crear?: boolean;
    Editar?: boolean;
    Leer?: boolean;
    Eliminar?: boolean;
}

interface PermisosResumen {
    [tabla: string]: {
        tabla: string;
        crear: boolean;
        editar: boolean;
        leer: boolean;
        eliminar: boolean;
    };
}

interface RolPermisoQueryParams {
    skip?: number;
    limit?: number;
}

class RolesPermisosService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all role permissions with optional query parameters
     * @param params Query parameters (skip, limit)
     * @returns Promise with role permissions list
     */
    async getRolesPermisos(params: RolPermisoQueryParams = { skip: 0, limit: 100 }) {
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
            const url = `${this.baseURL}${endpoints.rolespermisos.list}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching role permissions:', error);
            throw error;
        }
    }

    /**
     * Get role permissions by role ID
     * @param roleId Role ID
     * @returns Promise with role permissions data
     */
    async getRolePermissionsById(roleId: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.rolespermisos.byRoleId(roleId)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching permissions for role with ID ${roleId}:`, error);
            throw error;
        }
    }

    /**
     * Get role permissions by role name
     * @param roleName Role name
     * @returns Promise with role permissions summary
     */
    async getRolePermissionsByName(roleName: string) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.rolespermisos.byRoleName(roleName)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching permissions for role "${roleName}":`, error);
            throw error;
        }
    }

    /**
     * Create new role permission
     * @param rolPermiso Role permission data
     * @returns Promise with created role permission
     */
    async createRolePermission(rolPermiso: RolPermisoCreate) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.rolespermisos.create}`, rolPermiso);
            notificationService.showSuccess('Permiso de rol creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating role permission:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el permiso de rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Get a specific role permission by role ID and permission ID
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Promise with specific role permission data
     */
    async getSpecificRolePermission(roleId: number, permissionId: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.rolespermisos.getSpecific(roleId, permissionId)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching specific permission (ID: ${permissionId}) for role with ID ${roleId}:`, error);
            throw error;
        }
    }

    /**
     * Update existing role permission
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @param rolPermiso Updated role permission data
     * @returns Promise with updated role permission
     */
    async updateRolePermission(roleId: number, permissionId: number, rolPermiso: RolPermisoUpdate) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.rolespermisos.update(roleId, permissionId)}`, rolPermiso);
            notificationService.showSuccess('Permiso de rol actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating permission for role ID ${roleId} and permission ID ${permissionId}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el permiso de rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete role permission
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Promise with deletion result
     */
    async deleteRolePermission(roleId: number, permissionId: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.rolespermisos.delete(roleId, permissionId)}`);
            notificationService.showSuccess('Permiso de rol eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting permission for role ID ${roleId} and permission ID ${permissionId}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el permiso de rol';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Check if a user has a specific permission
     * @param roleName Role name
     * @param permissionName Permission name
     * @param action Action type (crear, editar, leer, eliminar)
     * @returns Boolean indicating if user has permission
     */
    async checkPermission(roleName: string, permissionName: string, action: 'crear' | 'editar' | 'leer' | 'eliminar') {
        try {
            const response = await this.getRolePermissionsByName(roleName);
            
            if (response.success && response.data) {
                const permisos: PermisosResumen = response.data;
                
                // Check if the permission exists and the action is allowed
                if (permisos[permissionName]) {
                    return permisos[permissionName][action] === true;
                }
            }
            
            return false;
        } catch (error) {
            console.error(`Error checking permission for role "${roleName}" and permission "${permissionName}":`, error);
            return false;
        }
    }
}

// Export a singleton instance
export const rolesPermisosService = new RolesPermisosService();
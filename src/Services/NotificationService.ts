import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService as toastService } from '../Utils/notificationService.ts';

// Interfaces
interface Notification {
    IdNotificacion?: number;
    IdReservacion: number;
    TipoNotificacion: string;
    Contenido?: string;
    FechaNotificacion?: string;
}

interface QueryParams {
    skip?: number;
    limit?: number;
    id_reservacion?: number;
}

class NotificationService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all notifications with optional filters
     * @param params Query parameters (skip, limit, id_reservacion)
     * @returns Promise with notifications list
     */
    async getNotifications(params: QueryParams = {}) {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params.skip !== undefined) {
                queryParams.append('skip', params.skip.toString());
            }
            
            if (params.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }
            
            if (params.id_reservacion !== undefined) {
                queryParams.append('id_reservacion', params.id_reservacion.toString());
            }
            
            const queryString = queryParams.toString();
            const url = `${this.baseURL}${endpoints.notifications.list}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Get notification by ID
     * @param id Notification ID
     * @returns Promise with notification data
     */
    async getNotificationById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.notifications.getById(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching notification with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new notification
     * @param notification Notification data
     * @returns Promise with created notification
     */
    async createNotification(notification: Notification) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.notifications.create}`, notification);
            toastService.showSuccess('Notificación creada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear la notificación';
            toastService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Send confirmation email for a reservation
     * @param reservationId Reservation ID
     * @returns Promise with result
     */
    async sendConfirmationEmail(reservationId: number) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.notifications.sendConfirmation(reservationId)}`);
            toastService.showSuccess('Correo de confirmación enviado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error sending confirmation email for reservation ${reservationId}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al enviar el correo de confirmación';
            toastService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Mark notification as read
     * @param id Notification ID
     * @returns Promise with updated notification
     */
    async markAsRead(id: number) {
        try {
            const response = await axiosInstance.patch(`${this.baseURL}${endpoints.notifications.markAsRead(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
            throw error;
        }
    }

    /**
     * Delete notification
     * @param id Notification ID
     * @returns Promise with deletion result
     */
    async deleteNotification(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.notifications.delete(id)}`);
            toastService.showSuccess('Notificación eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting notification with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la notificación';
            toastService.showError(errorMessage);
            throw error;
        }
    }
}

// Export a singleton instance
export const notificationService = new NotificationService(); 
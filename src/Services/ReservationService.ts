import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface Reservation {
    idReservacion?: number;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    idUsuario?: number;
    idVehiculo?: number;
    // Add other reservation fields as needed
}

interface ReservationQueryParams {
    skip?: number;
    limit?: number;
    estado?: string;
    // Add other query parameters as needed
}

interface DashboardStatsParams {
    periodo_dias?: number;
}

interface DashboardStats {
    crecimiento_semanal: {
        porcentaje: number;
        porcentaje_formateado: string;
        mensaje: string;
        current_week_count: number;
        previous_week_count: number;
    };
    vehiculo_mas_reservado: {
        id_vehiculo: number;
        modelo: string;
        placa: string;
        tipo_vehiculo: string;
        total_reservas: number;
    } | null;
    destino_popular: string | null;
    total_reservaciones: number;
    periodo_dias: number;
}

// Add this interface to your existing interfaces
interface WeeklyReservationsData {
  semana_actual: {
    inicio: string;
    fin: string;
  };
  dias: {
    dia: string;
    fecha: string;
    total_reservaciones: number;
    es_hoy: boolean;
    reservaciones: any[];
  }[];
}

class ReservationService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all reservations with optional query parameters
     * @param params Query parameters (skip, limit, estado)
     * @returns Promise with reservations list
     */
    async getReservations(params: ReservationQueryParams = { skip: 0, limit: 100 }) {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params.skip !== undefined) {
                queryParams.append('skip', params.skip.toString());
            }
            
            if (params.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }
            
            if (params.estado !== undefined) {
                queryParams.append('estado', params.estado);
            }
            
            const queryString = queryParams.toString();
            const url = `${this.baseURL}${endpoints.reservations.list}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    }

    /**
     * Get reservation by ID
     * @param id Reservation ID
     * @returns Promise with reservation data
     */
    async getReservationById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.reservations.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservation with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new reservation
     * @param reservation Reservation data
     * @returns Promise with created reservation
     */
    async createReservation(reservation: Reservation) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.reservations.list}`, reservation);
            notificationService.showSuccess('Reservación creada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating reservation:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing reservation
     * @param id Reservation ID
     * @param reservation Updated reservation data
     * @returns Promise with updated reservation
     */
    async updateReservation(id: number, reservation: Reservation) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.reservations.porId(id)}`, reservation);
            notificationService.showSuccess('Reservación actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating reservation with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update reservation status
     * @param id Reservation ID
     * @param status New status
     * @returns Promise with updated reservation
     */
    async updateReservationStatus(id: number, status: string) {
        try {
            const response = await axiosInstance.patch(`${this.baseURL}${endpoints.reservations.porId(id)}`, { estado: status });
            notificationService.showSuccess(`Estado de reservación actualizado a: ${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error updating reservation status with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el estado de la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete reservation
     * @param id Reservation ID
     * @returns Promise with deletion result
     */
    async deleteReservation(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.reservations.porId(id)}`);
            notificationService.showSuccess('Reservación eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting reservation with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Get dashboard statistics
     * @param params Query parameters (periodo_dias)
     * @returns Promise with dashboard statistics
     */
    async getDashboardStats(params: DashboardStatsParams = { periodo_dias: 365 }) {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params.periodo_dias !== undefined) {
                queryParams.append('periodo_dias', params.periodo_dias.toString());
            }
            
            const queryString = queryParams.toString();
            const url = `${this.baseURL}${endpoints.reservations.dashboard}${queryString ? `?${queryString}` : ''}`;
            
           
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
            throw error;
        }
    }

    /**
     * Get weekly reservations statistics
     * @returns Promise with weekly reservations data
     */
    async getWeeklyReservations() {
        try {
            const url = `${this.baseURL}${endpoints.reservations.weeklyReservations}`;
            
           
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching weekly reservations:', error);
            throw error;
        }
    }

    /**
     * Approve a reservation
     * @param id Reservation ID
     * @param approvalData Optional approval data (reason, notes, etc.)
     * @returns Promise with approved reservation
     */
    async approveReservation(id: number, approvalData: any = {}) {
        try {
            const response = await axiosInstance.post(
                `${this.baseURL}${endpoints.reservations.approve(id)}`, 
                approvalData
            );
            notificationService.showSuccess('Reservación aprobada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error approving reservation with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al aprobar la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Reject a reservation
     * @param id Reservation ID
     * @param rejectionData Rejection data (reason, notes, etc.)
     * @returns Promise with rejected reservation
     */
    async rejectReservation(id: number, rejectionData: any = {}) {
        try {
            const response = await axiosInstance.post(
                `${this.baseURL}${endpoints.reservations.reject(id)}`, 
                rejectionData
            );
            notificationService.showSuccess('Reservación rechazada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error rejecting reservation with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al rechazar la reservación';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Get reservations by user ID
     * @param userId User ID
     * @param params Additional query parameters
     * @returns Promise with user's reservations
     */
    async getReservationsByUser(userId: number, params: ReservationQueryParams = {}) {
        try {
            const url = `${this.baseURL}${endpoints.reservations.byUser(userId)}`;
            // Add additional query params if needed
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get reservations by company ID
     * @param companyId Company ID
     * @param params Additional query parameters
     * @returns Promise with company's reservations
     */
    async getReservationsByCompany(companyId: number, params: ReservationQueryParams = {}) {
        try {
            const url = `${this.baseURL}${endpoints.reservations.byCompany(companyId)}`;
            // Add additional query params if needed
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations for company ${companyId}:`, error);
            throw error;
        }
    }

    /**
     * Get reservations by status
     * @param status Reservation status (Pendiente, Aprobada, Denegada)
     * @param params Additional query parameters
     * @returns Promise with filtered reservations
     */
    async getReservationsByStatus(status: string, params: ReservationQueryParams = {}) {
        try {
            const url = `${this.baseURL}${endpoints.reservations.byStatus(status)}`;
            // Add additional query params if needed
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations with status ${status}:`, error);
            throw error;
        }
    }

    /**
     * Get reservations by date range
     * @param startDate Start date (ISO format)
     * @param endDate End date (ISO format)
     * @param params Additional query parameters
     * @returns Promise with filtered reservations
     */
    async getReservationsByDateRange(startDate: string, endDate: string, params: ReservationQueryParams = {}) {
        try {
            const url = `${this.baseURL}${endpoints.reservations.byDateRange(startDate, endDate)}`;
            // Add additional query params if needed
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations between ${startDate} and ${endDate}:`, error);
            throw error;
        }
    }

    /**
     * Get reservations by city
     * @param startCityId Optional start city ID
     * @param endCityId Optional end city ID
     * @param params Additional query parameters
     * @returns Promise with filtered reservations
     */
    async getReservationsByCity(startCityId?: number, endCityId?: number, params: ReservationQueryParams = {}) {
        try {
            const url = `${this.baseURL}${endpoints.reservations.byCity(startCityId, endCityId)}`;
            // Add additional query params if needed
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations by city:`, error);
            throw error;
        }
    }
}

// Export a singleton instance
export const reservationService = new ReservationService();
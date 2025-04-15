import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface Vehicle {
    idVehiculo?: number;
    marca: string;
    modelo: string;
    anio: number;
    placa: string;
    capacidad: number;
    idEmpresa?: number;
    // Add other vehicle fields as needed
}

class VehicleService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all vehicles
     * @returns Promise with vehicles list
     */
    async getVehicles() {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.vehicles.list}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    }

    /**
     * Get vehicle by ID
     * @param id Vehicle ID
     * @returns Promise with vehicle data
     */
    async getVehicleById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.vehicles.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching vehicle with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new vehicle
     * @param vehicle Vehicle data
     * @returns Promise with created vehicle
     */
    async createVehicle(vehicle: Vehicle) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.vehicles.list}`, vehicle);
            notificationService.showSuccess('Vehículo creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el vehículo';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing vehicle
     * @param id Vehicle ID
     * @param vehicle Updated vehicle data
     * @returns Promise with updated vehicle
     */
    async updateVehicle(id: number, vehicle: Vehicle) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.vehicles.porId(id)}`, vehicle);
            notificationService.showSuccess('Vehículo actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating vehicle with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el vehículo';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete vehicle
     * @param id Vehicle ID
     * @returns Promise with deletion result
     */
    async deleteVehicle(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.vehicles.porId(id)}`);
            notificationService.showSuccess('Vehículo eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting vehicle with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el vehículo';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    // Add this method to your VehicleService class
    
    /**
     * Get count of vehicles by type
     * @returns Promise with vehicle type count data
     */
    async getVehicleTypeCount() {
        try {
            const url = `${this.baseURL}${endpoints.vehicles.typeCount}`;
            
            console.log('Fetching vehicle type count from:', url);
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle type count:', error);
            throw error;
        }
    }
}

export const vehicleService = new VehicleService();
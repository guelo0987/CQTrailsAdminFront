import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface Vehicle {
    IdVehiculo?: number;
    Placa: string;
    Modelo: string;
    TipoVehiculo: string;
    Capacidad: number;
    Ano: number;
    Price: number;
    Disponible?: boolean;
    Image_url?: {
        image1?: string;
        image2?: string;
    };
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
    async createVehicle(vehicle: Vehicle, imageFiles?: File[]) {
        try {
            // Create URL with query parameters
            let url = `${this.baseURL}${endpoints.vehicles.crear}?`;
            url += `Placa=${encodeURIComponent(vehicle.Placa)}`;
            url += `&Modelo=${encodeURIComponent(vehicle.Modelo)}`;
            url += `&TipoVehiculo=${encodeURIComponent(vehicle.TipoVehiculo)}`;
            url += `&Capacidad=${encodeURIComponent(vehicle.Capacidad)}`;
            url += `&Ano=${encodeURIComponent(vehicle.Ano)}`;
            url += `&Price=${encodeURIComponent(vehicle.Price)}`;
            url += `&Disponible=${vehicle.Disponible !== undefined ? vehicle.Disponible : true}`;
            
            const formData = new FormData();
            
            // Add image files if provided
            if (imageFiles && imageFiles.length > 0) {
                imageFiles.forEach((file, index) => {
                    formData.append('files', file);
                });
            }
            
            const response = await axiosInstance.post(url, formData);
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
    async updateVehicle(id: number, vehicle: Vehicle, imageFiles?: File[]) {
        try {
            // Create URL with query parameters instead of sending JSON body
            let url = `${this.baseURL}${endpoints.vehicles.porId(id)}?`;
            url += `Placa=${encodeURIComponent(vehicle.Placa)}`;
            url += `&Modelo=${encodeURIComponent(vehicle.Modelo)}`;
            url += `&TipoVehiculo=${encodeURIComponent(vehicle.TipoVehiculo)}`;
            url += `&Capacidad=${encodeURIComponent(vehicle.Capacidad)}`;
            url += `&Ano=${encodeURIComponent(vehicle.Ano)}`;
            url += `&Price=${encodeURIComponent(vehicle.Price)}`;
            url += `&Disponible=${vehicle.Disponible !== undefined ? vehicle.Disponible : true}`;
            
            let response;
            
            if (imageFiles && imageFiles.length > 0) {
                // If we have image files, use FormData
                const formData = new FormData();
                
                // Add each image file to the FormData
                imageFiles.forEach((file, index) => {
                    formData.append('files', file);
                });
                
                // Use multipart/form-data content type (axios sets this automatically with FormData)
                response = await axiosInstance.put(url, formData);
            } else {
                // No files to upload, just send the request with empty FormData
                response = await axiosInstance.put(url, new FormData());
            }
            
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

    /**
     * Update vehicle availability status
     * @param id Vehicle ID
     * @param disponible Availability status
     * @returns Promise with updated availability status
     */
    async updateVehicleAvailability(id: number, disponible: boolean) {
        try {
            const response = await axiosInstance.patch(
                `${this.baseURL}${endpoints.vehicles.updateDisponibilidad(id)}`, 
                { disponible }
            );
            notificationService.showSuccess('Disponibilidad del vehículo actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating availability for vehicle with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la disponibilidad del vehículo';
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
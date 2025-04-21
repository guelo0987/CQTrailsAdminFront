import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface City {
    idCiudad?: number;
    Nombre: string;
    Estado?: string;
    // Add other city fields as needed
}

class CityService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /** 
     * Get all cities
     * @returns Promise with cities list
     */
    async getCities() {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.ciudades.list}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            throw error;
        }
    }

    /**
     * Get city by ID
     * @param id City ID
     * @returns Promise with city data
     */
    async getCityById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.ciudades.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching city with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new city
     * @param city City data
     * @returns Promise with created city
     */
    async createCity(city: City) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.ciudades.crear}`, city);
            notificationService.showSuccess('Ciudad creada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating city:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear la ciudad';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing city
     * @param id City ID
     * @param city Updated city data
     * @returns Promise with updated city
     */
    async updateCity(id: number, city: City) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.ciudades.actualizar(id)}`, city);
            notificationService.showSuccess('Ciudad actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating city with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la ciudad';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete city
     * @param id City ID
     * @returns Promise with deletion result
     */
    async deleteCity(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.ciudades.eliminar(id)}`);
            notificationService.showSuccess('Ciudad eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting city with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la ciudad';
            notificationService.showError(errorMessage);
            throw error;
        }
    }
}

export const cityService = new CityService();
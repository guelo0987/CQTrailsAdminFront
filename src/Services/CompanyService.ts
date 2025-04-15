import { API_BASE_URL, endpoints } from '../API/Endpoints.ts';
import axiosInstance from '../API/AxiosConfig.ts';
import { notificationService } from '../Utils/notificationService.ts';

interface Company {
    idEmpresa?: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    // Add other company fields as needed
}

class CompanyService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get all companies
     * @returns Promise with companies list
     */
    async getCompanies() {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.empresa.list}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching companies:', error);
            throw error;
        }
    }

    /**
     * Get company by ID
     * @param id Company ID
     * @returns Promise with company data
     */
    async getCompanyById(id: number) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}${endpoints.empresa.porId(id)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching company with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create new company
     * @param company Company data
     * @returns Promise with created company
     */
    async createCompany(company: Company) {
        try {
            const response = await axiosInstance.post(`${this.baseURL}${endpoints.empresa.list}`, company);
            notificationService.showSuccess('Empresa creada exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating company:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear la empresa';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Update existing company
     * @param id Company ID
     * @param company Updated company data
     * @returns Promise with updated company
     */
    async updateCompany(id: number, company: Company) {
        try {
            const response = await axiosInstance.put(`${this.baseURL}${endpoints.empresa.porId(id)}`, company);
            notificationService.showSuccess('Empresa actualizada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error updating company with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar la empresa';
            notificationService.showError(errorMessage);
            throw error;
        }
    }

    /**
     * Delete company
     * @param id Company ID
     * @returns Promise with deletion result
     */
    async deleteCompany(id: number) {
        try {
            const response = await axiosInstance.delete(`${this.baseURL}${endpoints.empresa.porId(id)}`);
            notificationService.showSuccess('Empresa eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error deleting company with ID ${id}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la empresa';
            notificationService.showError(errorMessage);
            throw error;
        }
    }
}

export const companyService = new CompanyService();
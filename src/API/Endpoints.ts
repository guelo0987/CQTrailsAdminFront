export const API_BASE_URL = (import.meta as any).env?.API_URL || 'http://localhost:8000/';


export const endpoints = {

    auth: {
        login: 'auth/login'
    },

    empresa:{
        list: 'empresas',
       porId: (id: number) => `empresas/${id}`,
       crear: 'empresas',
       actualizar: (id: number) => `empresas/${id}`,
       eliminar: (id: number) => `empresas/${id}`
    },

    ciudades:{
        list: 'ciudades',
        porId: (id: number) => `ciudades/${id}`,
        crear: 'ciudades',
        actualizar: (id: number) => `ciudades/${id}`,
        eliminar: (id: number) => `ciudades/${id}`
    },

    users:{
        list: 'usuarios/clientes',
        porId: (id: number) => `usuarios/${id}`,
    },

    vehicles:{
        list: 'vehiculos',
        porId: (id: number) => `vehiculos/${id}`,
        typeCount: 'vehiculos/tipos/count',
        crear: 'vehiculos',
        actualizar: (id: number) => `vehiculos/${id}`,
        eliminar: (id: number) => `vehiculos/${id}`,
        updateDisponibilidad: (id: number) => `vehiculos/${id}/disponibilidad`
    },

    reservations:{
        list: 'reservaciones',
        porId: (id: number) => `reservaciones/${id}`,
        dashboard: 'reservaciones/estadisticas/dashboard',
        weeklyReservations: 'reservaciones/estadisticas/reservaciones-semana-actual',
        // New endpoints based on the FastAPI router
        approve: (id: number) => `reservaciones/${id}/aprobar`,
        reject: (id: number) => `reservaciones/${id}/denegar`,
        byUser: (userId: number) => `reservaciones?id_usuario=${userId}`,
        byCompany: (companyId: number) => `reservaciones?id_empresa=${companyId}`,
        byStatus: (status: string) => `reservaciones?estado=${status}`,
        byDateRange: (startDate: string, endDate: string) => 
            `reservaciones?fecha_inicio=${startDate}&fecha_fin=${endDate}`,
        byCity: (startCityId?: number, endCityId?: number) => {
            let query = 'reservaciones?';
            if (startCityId) query += `ciudadinicioid=${startCityId}`;
            if (endCityId) {
                if (startCityId) query += '&';
                query += `ciudadfinid=${endCityId}`;
            }
            return query;
        },
        update: (id: number) => `reservaciones/${id}`
    },
}
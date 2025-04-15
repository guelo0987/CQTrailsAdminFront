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
    },

    reservations:{
        list: 'reservaciones',
        porId: (id: number) => `reservaciones/${id}`,
        dashboard: 'reservaciones/estadisticas/dashboard',
        weeklyReservations: 'reservaciones/estadisticas/reservaciones-semana-actual',
    },
}
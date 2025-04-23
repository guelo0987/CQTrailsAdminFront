export const API_BASE_URL = (import.meta as any).env?.API_URL || 'https://cqtrailsadmincore-production.up.railway.app/';


export const endpoints = {

    auth: {
        login: 'auth/login'
    },

    empresa:{
        list: 'empresas/',
       porId: (id: number) => `empresas/${id}`,
       crear: 'empresas',
       actualizar: (id: number) => `empresas/${id}`,
       eliminar: (id: number) => `empresas/${id}`
    },

    ciudades:{
        list: 'ciudades/',
        porId: (id: number) => `ciudades/${id}`,
        crear: 'ciudades/',
        actualizar: (id: number) => `ciudades/${id}`,
        eliminar: (id: number) => `ciudades/${id}`
    },

    users:{
        list: 'usuarios/clientes',
        porId: (id: number) => `usuarios/${id}`,
        // New endpoints based on the FastAPI router
        allUsers: 'usuarios/',
        create: 'usuarios/',
        update: (id: number) => `usuarios/${id}`,
        delete: (id: number) => `usuarios/${id}`,
        changeRole: (id: number) => `usuarios/${id}/rol`,
        // Separate endpoints for activate and deactivate
        activate: (id: number) => `usuarios/${id}/activar`,
        deactivate: (id: number) => `usuarios/${id}/desactivar`,
        changePassword: (id: number) => `usuarios/${id}/password`,
    },

    roles: {
        list: 'roles/',
        porId: (id: number) => `roles/${id}`,
        create: 'roles/',
        update: (id: number) => `roles/${id}`,
        delete: (id: number) => `roles/${id}`,
        addPermission: (roleId: number, permissionId: number) => `roles/${roleId}/permisos/${permissionId}`,
        removePermission: (roleId: number, permissionId: number) => `roles/${roleId}/permisos/${permissionId}`,
    },

    rolespermisos: {
        list: 'rolespermisos',
        byRoleId: (id: number) => `rolespermisos/rol/${id}`,
        byRoleName: (name: string) => `rolespermisos/rolname/${name}`,
        create: 'rolespermisos',
        getSpecific: (roleId: number, permissionId: number) => `rolespermisos/${roleId}/${permissionId}`,
        update: (roleId: number, permissionId: number) => `rolespermisos/${roleId}/${permissionId}`,
        delete: (roleId: number, permissionId: number) => `rolespermisos/${roleId}/${permissionId}`
    },

    vehicles:{
        list: 'vehiculos/',
        porId: (id: number) => `vehiculos/${id}`,
        typeCount: 'vehiculos/tipos/count',
        crear: 'vehiculos/',
        actualizar: (id: number) => `vehiculos/${id}`,
        eliminar: (id: number) => `vehiculos/${id}`,
        updateDisponibilidad: (id: number) => `vehiculos/${id}/disponibilidad`
    },

    reservations:{
        list: 'reservaciones/',
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
        update: (id: number) => `reservaciones/${id}`,
        // Updated endpoint for changing reservation status
        changeStatus: (id: number) => `reservaciones/${id}/cambiar-estado`
    },

    notifications: {
        list: 'notificaciones/',
        getById: (id: number) => `notificaciones/${id}`,
        create: 'notificaciones/',
        update: (id: number) => `notificaciones/${id}`,
        delete: (id: number) => `notificaciones/${id}`,
        markAsRead: (id: number) => `notificaciones/${id}/marcar-leida`,
        sendConfirmation: (reservationId: number) => `notificaciones/${reservationId}/enviar-confirmacion`
    },
}
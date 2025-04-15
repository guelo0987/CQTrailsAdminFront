import { toast } from 'react-toastify';

export const notificationService = {
  showSuccess: (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  showError: (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  showLoading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
  },
  
  dismissLoading: (toastId: string) => {
    toast.dismiss(toastId);
  },
  
  // Funciones específicas para autenticación
  auth: {
    loginSuccess: () => {
      toast.success('Inicio de sesión exitoso', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: () => '✅',
        style: {
          background: '#059669',
          color: '#fff',
        },
      });
    },
    
    logoutSuccess: () => {
      toast.info('Sesión cerrada correctamente', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    
    sessionExpired: () => {
      toast.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }
};

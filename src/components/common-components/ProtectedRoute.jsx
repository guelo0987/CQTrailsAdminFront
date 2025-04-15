import { Navigate } from "react-router-dom"
import { authService } from "../../Services/AuthService.ts"
import { useEffect } from "react"

const ProtectedRoute = ({ children }) => {
  // Usar el método isAuthenticated de authService
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    // Verificar autenticación cuando el componente se monta
    if (!isAuthenticated) {
      
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute


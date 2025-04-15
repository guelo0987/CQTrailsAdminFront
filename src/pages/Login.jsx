"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import logo from "../assets/CQTRAILSLOGO.svg"
import { authService } from "../Services/AuthService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida"
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the handleSubmit function to properly handle authentication
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setLoading(true)
      
      try {
        // Preparar credenciales para el servicio de autenticación
        const credentials = {
          email,
          passwordHash: password // El servicio espera passwordHash pero lo transforma a password
        }
        
        
        
        // Llamar al servicio de autenticación
        const response = await authService.login(credentials)
        
      
        // Redirigir al usuario al dashboard
        navigate("/")
      } catch (error) {
        // Mostrar mensaje de error
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Error al iniciar sesión. Verifica tus credenciales."
        
        notificationService.showError(errorMessage)
        console.error("Error de inicio de sesión:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <img src={logo || "/placeholder.svg"} alt="CQ Trails Logo" />
        </div>
        <h1 className="auth-title">Panel de Administración</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@cqtrails.com"
            disabled={loading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            disabled={loading}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿Olvidaste tu contraseña? <span className="auth-link">Recuperar</span>
        </p>
      </div>
    </div>
  )
}

export default Login


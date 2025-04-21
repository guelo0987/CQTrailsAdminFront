"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import "../../../src/components/user-components/UserModal.css"

const UserModal = ({ user, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    Email: "",
    Nombre: "",
    Apellido: "",
    IdRol: "",
    Password: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        Email: user.Email || "",
        Nombre: user.Nombre || "",
        Apellido: user.Apellido || "",
        IdRol: user.IdRol || "",
        Password: "", // No mostramos la contraseña actual
      })
    } else {
      // Reset form para nuevo usuario
      setFormData({
        Email: "",
        Nombre: "",
        Apellido: "",
        IdRol: roles.length > 0 ? String(roles[0].IdRol) : "",
        Password: "",
      })
    }
  }, [user, roles])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.Email) {
      newErrors.Email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "El correo electrónico no es válido"
    }

    if (!formData.Nombre.trim()) {
      newErrors.Nombre = "El nombre es requerido"
    }

    if (!formData.Apellido.trim()) {
      newErrors.Apellido = "El apellido es requerido"
    }

    if (!formData.IdRol) {
      newErrors.IdRol = "Debe seleccionar un rol"
    }

    if (!user && !formData.Password) {
      newErrors.Password = "La contraseña es requerida para nuevos usuarios"
    } else if (formData.Password && formData.Password.length < 6) {
      newErrors.Password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Asegurar que IdRol sea numérico al guardarlo
      const dataToSave = {
        ...formData,
        IdRol: formData.IdRol ? parseInt(formData.IdRol, 10) : null,
        Activo: true // Por defecto, los usuarios nuevos son activos
      };
      onSave(dataToSave)
    }
  }

  // Verificar que hay roles disponibles
  

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{user ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="Email">Correo Electrónico</label>
              <input
                id="Email"
                name="Email"
                type="email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="ejemplo@cqtrails.com"
              />
              {errors.Email && <span className="error-message">{errors.Email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Nombre">Nombre</label>
              <input
                id="Nombre"
                name="Nombre"
                type="text"
                value={formData.Nombre}
                onChange={handleChange}
                placeholder="Nombre del usuario"
              />
              {errors.Nombre && <span className="error-message">{errors.Nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Apellido">Apellido</label>
              <input
                id="Apellido"
                name="Apellido"
                type="text"
                value={formData.Apellido}
                onChange={handleChange}
                placeholder="Apellido del usuario"
              />
              {errors.Apellido && <span className="error-message">{errors.Apellido}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="IdRol">Rol</label>
              <select 
                id="IdRol" 
                name="IdRol" 
                value={formData.IdRol} 
                onChange={handleChange}
              >
                <option value="">Seleccione un rol</option>
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role.IdRol} value={String(role.IdRol)}>
                      {role.NombreRol}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay roles disponibles</option>
                )}
              </select>
              {errors.IdRol && <span className="error-message">{errors.IdRol}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Password">
                {user ? "Contraseña (dejar en blanco para mantener la actual)" : "Contraseña"}
              </label>
              <input
                id="Password"
                name="Password"
                type="password"
                value={formData.Password}
                onChange={handleChange}
                placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña"}
              />
              {errors.Password && <span className="error-message">{errors.Password}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-submit">
              {user ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal


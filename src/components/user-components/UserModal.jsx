"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import "../../../src/components/user-components/UserModal.css"

const UserModal = ({ user, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    idRol: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        idRol: user.idRol || "",
        password: "", // No mostramos la contraseña actual
      })
    } else {
      // Reset form para nuevo usuario
      setFormData({
        email: "",
        nombre: "",
        apellido: "",
        idRol: roles.length > 0 ? String(roles[0].IdRol) : "",
        password: "",
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

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido"
    }

    if (!formData.idRol) {
      newErrors.idRol = "Debe seleccionar un rol"
    }

    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida para nuevos usuarios"
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Asegurar que idRol sea numérico al guardarlo
      const dataToSave = {
        ...formData,
        idRol: formData.idRol ? parseInt(formData.idRol, 10) : null
      };
      onSave(dataToSave)
    }
  }

  // Verificar que hay roles disponibles
  console.log("Roles disponibles:", roles);

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
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@cqtrails.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre del usuario"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido del usuario"
              />
              {errors.apellido && <span className="error-message">{errors.apellido}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idRol">Rol</label>
              <select 
                id="idRol" 
                name="idRol" 
                value={formData.idRol} 
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
              {errors.idRol && <span className="error-message">{errors.idRol}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                {user ? "Contraseña (dejar en blanco para mantener la actual)" : "Contraseña"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña"}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
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


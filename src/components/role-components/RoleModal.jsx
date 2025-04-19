"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"

const RoleModal = ({ role, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    NombreRol: "",
    Descripcion: ""
  })

  useEffect(() => {
    if (role) {
      setFormData({
        NombreRol: role.NombreRol || "",
        Descripcion: role.Descripcion || ""
      })
    }
  }, [role])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content role-modal">
        <div className="modal-header">
          <h2>{role ? "Editar Rol" : "Nuevo Rol"}</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="NombreRol">Nombre del Rol</label>
            <input
              type="text"
              id="NombreRol"
              name="NombreRol"
              value={formData.NombreRol}
              onChange={handleChange}
              className="form-control"
              placeholder="Ingrese el nombre del rol"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="Descripcion">Descripción</label>
            <textarea
              id="Descripcion"
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              className="form-control"
              placeholder="Ingrese una descripción para el rol"
              rows={4}
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-button">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleModal

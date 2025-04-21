"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"

const CityModal = ({ city, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    Nombre: "",
    Estado: "Activo",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (city) {
      setFormData({
        Nombre: city.Nombre || "",
        Estado: city.Estado || "Activo",
      })
    }
  }, [city])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.Nombre.trim()) {
      newErrors.Nombre = "El nombre de la ciudad es requerido"
    } else if (formData.Nombre.length > 20) {
      newErrors.Nombre = "El nombre no puede exceder los 20 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{city ? "Editar Ciudad" : "Nueva Ciudad"}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="Nombre">Nombre de la Ciudad</label>
              <input
                id="Nombre"
                name="Nombre"
                type="text"
                value={formData.Nombre}
                onChange={handleChange}
                placeholder="Ej: Santiago"
                maxLength={20}
              />
              {errors.Nombre && <span className="error-message">{errors.Nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Estado">Estado</label>
              <select id="Estado" name="Estado" value={formData.Estado} onChange={handleChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-submit">
              {city ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CityModal

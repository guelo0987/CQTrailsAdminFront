"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import "../user-components/UserModal.css" // Reutilizamos los estilos del UserModal

const RoleModal = ({ user, roles, onSave, onClose }) => {
  const [selectedRoleId, setSelectedRoleId] = useState("")

  useEffect(() => {
    // Inicializar con el rol actual del usuario
    if (user && user.IdRol) {
      setSelectedRoleId(user.IdRol.toString())
    }
  }, [user])

  const handleChange = (e) => {
    setSelectedRoleId(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(parseInt(selectedRoleId, 10))
  }

  // Verificar que hay roles disponibles
  console.log("Roles disponibles en RoleModal:", roles);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Cambiar Rol de Usuario</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>Selecciona un nuevo rol para <strong>{user?.Nombre} {user?.Apellido}</strong></p>
            
            <div className="form-group">
              <label htmlFor="role">Rol:</label>
              <select
                id="role"
                value={selectedRoleId}
                onChange={handleChange}
                className="role-select"
              >
                <option value="">Selecciona un rol</option>
                {roles && roles.length > 0 ? (
                  roles.map(role => (
                    <option key={role.IdRol} value={String(role.IdRol)}>
                      {role.NombreRol}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay roles disponibles</option>
                )}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modal-submit"
              disabled={!selectedRoleId}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleModal

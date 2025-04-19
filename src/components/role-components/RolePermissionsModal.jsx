"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import LockIcon from "@mui/icons-material/Lock"
import InfoIcon from "@mui/icons-material/Info"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import SecurityIcon from "@mui/icons-material/Security"
import SearchIcon from "@mui/icons-material/Search"
import Switch from "@mui/material/Switch"
import { FormControlLabel, Tooltip, Button, TextField, InputAdornment } from "@mui/material"

const RolePermissionsModal = ({ role, allPermissions, rolePermissions, onSave, onClose }) => {
  const [permissions, setPermissions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSection, setExpandedSection] = useState(null)

  useEffect(() => {
    // Combine all permissions with role permissions
    const combinedPermissions = allPermissions.map(permission => {
      const existingPermission = rolePermissions.find(p => p.IdPermiso === permission.IdPermiso)
      
      if (existingPermission) {
        return {
          ...permission,
          Crear: existingPermission.Crear,
          Editar: existingPermission.Editar,
          Leer: existingPermission.Leer,
          Eliminar: existingPermission.Eliminar
        }
      } else {
        return {
          ...permission,
          Crear: false,
          Editar: false,
          Leer: false,
          Eliminar: false
        }
      }
    })
    
    setPermissions(combinedPermissions)
  }, [allPermissions, rolePermissions])

  const handleTogglePermission = (permissionId, field) => {
    setPermissions(prevPermissions => 
      prevPermissions.map(permission => 
        permission.IdPermiso === permissionId 
          ? { ...permission, [field]: !permission[field] }
          : permission
      )
    )
  }

  const handleToggleAll = (permissionId) => {
    setPermissions(prevPermissions => 
      prevPermissions.map(permission => {
        if (permission.IdPermiso === permissionId) {
          const allEnabled = permission.Crear && permission.Editar && permission.Leer && permission.Eliminar
          return {
            ...permission,
            Crear: !allEnabled,
            Editar: !allEnabled,
            Leer: !allEnabled,
            Eliminar: !allEnabled
          }
        }
        return permission
      })
    )
  }

  const handleSave = () => {
    onSave(permissions)
  }

  // Group permissions by category (based on name convention)
  const groupPermissions = (permissions) => {
    const groups = {}
    
    permissions.forEach(permission => {
      // Use the permission name as the group
      const groupName = permission.NombrePermiso.toLowerCase()
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(permission)
    })
    
    return groups
  }

  // Filter permissions based on search term
  const filteredPermissions = permissions.filter(permission => 
    permission.NombrePermiso.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const groupedPermissions = groupPermissions(filteredPermissions)

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  const getPermissionSummary = (permission) => {
    const enabledCount = [
      permission.Crear,
      permission.Editar, 
      permission.Leer, 
      permission.Eliminar
    ].filter(Boolean).length
    
    return `${enabledCount}/4`
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content permissions-modal">
        <div className="modal-header">
          <div className="modal-title">
            <SecurityIcon className="modal-icon" />
            <h2>Permisos para el rol: {role.NombreRol}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-description">
          <InfoIcon fontSize="small" style={{ marginRight: '8px', color: '#2D9C5F' }} />
          <span>Configure los permisos para este rol. Cada permiso puede tener acciones de Leer, Crear, Editar y Eliminar.</span>
        </div>
        
        <div className="permissions-search">
          <TextField
            fullWidth
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            className="search-input"
          />
        </div>
        
        <div className="permissions-container">
          {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
            <div key={groupName} className="permission-section">
              <div 
                className="permission-section-header" 
                onClick={() => toggleSection(groupName)}
              >
                <div className="permission-section-title">
                  <LockIcon className="section-icon" />
                  <h3>{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</h3>
                </div>
                <div className="permission-section-summary">
                  {expandedSection === groupName ? '▼' : '►'}
                </div>
              </div>
              
              {expandedSection === groupName && (
                <div className="permission-items">
                  {groupPermissions.map((permission) => (
                    <div key={permission.IdPermiso} className="permission-card">
                      <div className="permission-header">
                        <h4>{permission.NombrePermiso}</h4>
                        <span className="permission-badge">
                          {getPermissionSummary(permission)}
                        </span>
                      </div>
                      
                      <div className="permission-toggles">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permission.Leer}
                              onChange={() => handleTogglePermission(permission.IdPermiso, "Leer")}
                              color="primary"
                              size="small"
                            />
                          }
                          label="Leer"
                          className={permission.Leer ? "permission-active" : "permission-inactive"}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permission.Crear}
                              onChange={() => handleTogglePermission(permission.IdPermiso, "Crear")}
                              color="success"
                              size="small"
                            />
                          }
                          label="Crear"
                          className={permission.Crear ? "permission-active" : "permission-inactive"}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permission.Editar}
                              onChange={() => handleTogglePermission(permission.IdPermiso, "Editar")}
                              color="info"
                              size="small"
                            />
                          }
                          label="Editar"
                          className={permission.Editar ? "permission-active" : "permission-inactive"}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permission.Eliminar}
                              onChange={() => handleTogglePermission(permission.IdPermiso, "Eliminar")}
                              color="error"
                              size="small"
                            />
                          }
                          label="Eliminar"
                          className={permission.Eliminar ? "permission-active" : "permission-inactive"}
                        />
                      </div>
                      
                      <div className="permission-actions">
                        <Tooltip title={
                          permission.Crear && permission.Editar && permission.Leer && permission.Eliminar
                            ? "Desactivar todos los permisos"
                            : "Activar todos los permisos"
                        }>
                          <Button
                            variant="outlined"
                            size="small"
                            color={
                              permission.Crear && permission.Editar && permission.Leer && permission.Eliminar
                                ? "error"
                                : "success"
                            }
                            onClick={() => handleToggleAll(permission.IdPermiso)}
                            className="toggle-all-button"
                          >
                            {permission.Crear && permission.Editar && permission.Leer && permission.Eliminar 
                              ? "Desmarcar todos" 
                              : "Marcar todos"}
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="modal-footer">
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={onClose}
            startIcon={<CloseIcon />}
            className="cancel-button"
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            startIcon={<CheckCircleIcon />}
            className="save-button"
          >
            Guardar
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .permissions-modal {
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #34a853 0%, #2D9C5F 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .modal-icon {
          font-size: 24px;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .modal-description {
          padding: 16px 24px;
          background-color: #fafafa;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          color: #555;
          font-size: 14px;
        }

        .permissions-search {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          background-color: white;
        }

        .search-input .MuiOutlinedInput-root {
          border-radius: 6px;
        }

        .search-input .MuiOutlinedInput-notchedOutline {
          border-color: #e0e0e0;
        }

        .search-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #2D9C5F;
        }

        .search-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #2D9C5F;
        }

        .permissions-container {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          background-color: #fafafa;
        }

        .permission-section {
          border-bottom: 1px solid #f0f0f0;
          background-color: white;
        }

        .permission-section-header {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .permission-section-header:hover {
          background-color: #f8f8f8;
        }

        .permission-section-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .permission-section-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .section-icon {
          color: #2D9C5F;
          font-size: 20px;
        }

        .permission-section-summary {
          color: #2D9C5F;
          font-size: 14px;
        }

        .permission-items {
          padding: 0 24px 16px;
          background-color: #fafafa;
        }

        .permission-card {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .permission-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }

        .permission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .permission-header h4 {
          margin: 0;
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }

        .permission-badge {
          background-color: #2D9C5F;
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .permission-toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 600px) {
          .permission-toggles {
            flex-direction: column;
            gap: 8px;
          }
        }

        .permission-active {
          font-weight: 500;
          color: #2D9C5F;
        }

        .permission-inactive {
          opacity: 0.7;
          color: #777;
        }

        .permission-actions {
          display: flex;
          justify-content: flex-end;
        }

        /* Estilo para los botones */
        .toggle-all-button.MuiButton-root {
          text-transform: none;
          font-size: 13px;
          border-radius: 4px;
          padding: 4px 12px;
        }

        .modal-footer {
          padding: 16px 24px;
          background-color: #fafafa;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .cancel-button.MuiButton-root {
          text-transform: none;
          color: #555;
          border-color: #e0e0e0;
          border-radius: 4px;
        }

        .cancel-button.MuiButton-root:hover {
          background-color: #f5f5f5;
          border-color: #d0d0d0;
        }

        .save-button.MuiButton-root {
          text-transform: none;
          background-color: #2D9C5F;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(45, 156, 95, 0.2);
        }

        .save-button.MuiButton-root:hover {
          background-color: #259352;
          box-shadow: 0 4px 8px rgba(45, 156, 95, 0.2);
        }

        /* Ajustes para los Switch de Material UI */
        .MuiSwitch-colorPrimary.Mui-checked {
          color: #2D9C5F !important;
        }
        
        .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track {
          background-color: #2D9C5F !important;
        }
        
        .MuiSwitch-colorSuccess.Mui-checked {
          color: #2D9C5F !important;
        }
        
        .MuiSwitch-colorSuccess.Mui-checked + .MuiSwitch-track {
          background-color: #2D9C5F !important;
        }

        .MuiSwitch-colorInfo.Mui-checked {
          color: #2D9C5F !important;
        }
        
        .MuiSwitch-colorInfo.Mui-checked + .MuiSwitch-track {
          background-color: #2D9C5F !important;
        }

        .MuiSwitch-colorError.Mui-checked {
          color: #e57373 !important;
        }
        
        .MuiSwitch-colorError.Mui-checked + .MuiSwitch-track {
          background-color: #e57373 !important;
        }
      `}} />
    </div>
  )
}

export default RolePermissionsModal

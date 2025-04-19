"use client"

import React, { useState, useEffect } from "react"
import RoleModal from "../components/role-components/RoleModal"
import DeleteRoleModal from "../components/role-components/DeleteRoleModal"
import RolePermissionsModal from "../components/role-components/RolePermissionsModal"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import LockIcon from "@mui/icons-material/Lock"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import { rolesService } from "../Services/RolesServices.ts"
import { rolesPermisosService } from "../Services/RolesPermisosService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [currentRole, setCurrentRole] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rolesPerPage] = useState(10)

  // Fetch roles and permissions from API
  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true)
      
      // Get all roles
      const rolesResponse = await rolesService.getRoles()
      
      if (rolesResponse.success && rolesResponse.data) {
        // Get all role permissions
        const permissionsResponse = await rolesPermisosService.getRolesPermisos()
        
        if (permissionsResponse.success && permissionsResponse.data) {
          // Group permissions by role
          const permissionsByRole = {}
          
          permissionsResponse.data.forEach(permission => {
            if (!permissionsByRole[permission.IdRol]) {
              permissionsByRole[permission.IdRol] = []
            }
            
            permissionsByRole[permission.IdRol].push({
              IdPermiso: permission.IdPermiso,
              NombrePermiso: permission.NombrePermiso,
              Crear: permission.Crear,
              Editar: permission.Editar,
              Leer: permission.Leer,
              Eliminar: permission.Eliminar
            })
          })
          
          // Combine roles with their permissions
          const rolesWithPermissions = rolesResponse.data.map(role => ({
            ...role,
            permisos: permissionsByRole[role.IdRol] || []
          }))
          
          setRoles(rolesWithPermissions)
          
          // Extract unique permissions for the permissions modal
          const uniquePermissions = []
          const permissionIds = new Set()
          
          permissionsResponse.data.forEach(perm => {
            if (!permissionIds.has(perm.IdPermiso)) {
              permissionIds.add(perm.IdPermiso)
              uniquePermissions.push({
                IdPermiso: perm.IdPermiso,
                NombrePermiso: perm.NombrePermiso
              })
            }
          })
          
          setAllPermissions(uniquePermissions)
        }
      }
    } catch (error) {
      console.error("Error fetching roles and permissions:", error)
      notificationService.showError("Error al cargar los roles y permisos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRolesAndPermissions()
  }, [])

  // Filtrar roles por búsqueda
  const filteredRoles = roles.filter(
    (role) =>
      role.NombreRol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.Descripcion && role.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Paginación
  const indexOfLastRole = currentPage * rolesPerPage
  const indexOfFirstRole = indexOfLastRole - rolesPerPage
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole)
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // La búsqueda ya se aplica automáticamente con el estado searchTerm
  }

  const handleAddRole = () => {
    setCurrentRole(null)
    setShowRoleModal(true)
  }

  const handleEditRole = (role) => {
    setCurrentRole(role)
    setShowRoleModal(true)
  }

  const handleDeleteRole = (role) => {
    setCurrentRole(role)
    setShowDeleteModal(true)
  }

  const handleManagePermissions = (role) => {
    setCurrentRole(role)
    setShowPermissionsModal(true)
  }

  const handleSaveRole = async (roleData) => {
    try {
      if (currentRole) {
        // Actualizar rol existente
        const response = await rolesService.updateRole(currentRole.IdRol, {
          NombreRol: roleData.NombreRol,
          Descripcion: roleData.Descripcion
        })
        
        if (response.success) {
          await fetchRolesAndPermissions()
          notificationService.showSuccess("Rol actualizado exitosamente")
        }
      } else {
        // Crear nuevo rol
        const response = await rolesService.createRole({
          NombreRol: roleData.NombreRol,
          Descripcion: roleData.Descripcion
        })
        
        if (response.success) {
          await fetchRolesAndPermissions()
          notificationService.showSuccess("Rol creado exitosamente")
        }
      }
      setShowRoleModal(false)
    } catch (error) {
      console.error("Error saving role:", error)
      notificationService.showError("Error al guardar el rol")
    }
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await rolesService.deleteRole(currentRole.IdRol)
      if (response.success) {
        await fetchRolesAndPermissions()
        notificationService.showSuccess("Rol eliminado exitosamente")
      }
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting role:", error)
      notificationService.showError("Error al eliminar el rol")
    }
  }

  const handleSavePermissions = async (updatedPermissions) => {
    try {
      // Get current permissions for this role
      const currentPermissions = currentRole.permisos || []
      
      // For each updated permission
      for (const permission of updatedPermissions) {
        const existingPermission = currentPermissions.find(p => p.IdPermiso === permission.IdPermiso)
        
        if (existingPermission) {
          // If permission exists and has changed, update it
          if (
            existingPermission.Crear !== permission.Crear ||
            existingPermission.Editar !== permission.Editar ||
            existingPermission.Leer !== permission.Leer ||
            existingPermission.Eliminar !== permission.Eliminar
          ) {
            await rolesPermisosService.updateRolePermission(
              currentRole.IdRol,
              permission.IdPermiso,
              {
                Crear: permission.Crear,
                Editar: permission.Editar,
                Leer: permission.Leer,
                Eliminar: permission.Eliminar
              }
            )
          }
        } else {
          // If permission doesn't exist and is enabled, create it
          if (permission.Crear || permission.Editar || permission.Leer || permission.Eliminar) {
            await rolesPermisosService.createRolePermission({
              IdRol: currentRole.IdRol,
              IdPermiso: permission.IdPermiso,
              Crear: permission.Crear || false,
              Editar: permission.Editar || false,
              Leer: permission.Leer || false,
              Eliminar: permission.Eliminar || false
            })
          }
        }
      }
      
      // Check if any existing permissions need to be completely removed
      // This happens when all permissions (Crear, Editar, Leer, Eliminar) are set to false
      for (const existingPermission of currentPermissions) {
        const updatedPermission = updatedPermissions.find(p => p.IdPermiso === existingPermission.IdPermiso)
        
        // If the permission still exists in updated permissions but all values are false, delete it
        if (updatedPermission && 
            !updatedPermission.Crear && 
            !updatedPermission.Editar && 
            !updatedPermission.Leer && 
            !updatedPermission.Eliminar) {
          await rolesPermisosService.deleteRolePermission(
            currentRole.IdRol,
            existingPermission.IdPermiso
          )
        }
        
        // If the permission is removed completely from the list
        if (!updatedPermission) {
          await rolesPermisosService.deleteRolePermission(
            currentRole.IdRol,
            existingPermission.IdPermiso
          )
        }
      }
      
      await fetchRolesAndPermissions()
      notificationService.showSuccess("Permisos actualizados exitosamente")
      setShowPermissionsModal(false)
    } catch (error) {
      console.error("Error saving permissions:", error)
      notificationService.showError("Error al guardar los permisos")
    }
  }

  // Función para verificar si un permiso está activo
  const isPermissionActive = (permiso) => {
    return permiso.Crear || permiso.Editar || permiso.Leer || permiso.Eliminar
  }

  // Función para contar permisos activos
  const countActivePermissions = (permisos) => {
    return permisos.filter(isPermissionActive).length
  }

  return (
    <div className="role-management">
      <div className="page-header">
        <h1 className="page-title">
          <AdminPanelSettingsIcon className="title-icon" />
          Administración de Roles
        </h1>
        <p className="page-description">
          Gestione los roles del sistema y sus permisos asociados
        </p>
      </div>

      <div className="user-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchIcon fontSize="small" />
            Buscar
          </button>
        </form>
        <button className="add-button" onClick={handleAddRole}>
          <AddIcon fontSize="small" />
          Nuevo Rol
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando roles...</p>
        </div>
      ) : (
        <>
          <div className="roles-grid">
            {currentRoles.map((role) => (
              <div key={role.IdRol} className="role-card">
                <div className="role-header">
                  <div className="role-title-container">
                    <AdminPanelSettingsIcon className="role-icon" />
                    <h3 className="role-title">{role.NombreRol}</h3>
                  </div>
                  <div className="role-badge">
                    ID: {role.IdRol}
                  </div>
                </div>

                <div className="role-description">
                  <p>{role.Descripcion || "Sin descripción"}</p>
                </div>

                <div className="role-permissions">
                  <div className="permissions-header">
                    <h4>
                      <LockIcon className="permissions-icon" />
                      Permisos
                    </h4>
                    <span className="permissions-count">
                      {countActivePermissions(role.permisos)}/{role.permisos.length}
                    </span>
                  </div>
                  <div className="permissions-list">
                    {role.permisos.length > 0 ? (
                      role.permisos.map((permiso) => (
                        <div
                          key={permiso.IdPermiso}
                          className={`permission-badge ${isPermissionActive(permiso) ? "permission-active" : "permission-inactive"}`}
                          title={`Leer: ${permiso.Leer ? 'Sí' : 'No'}, Crear: ${permiso.Crear ? 'Sí' : 'No'}, Editar: ${permiso.Editar ? 'Sí' : 'No'}, Eliminar: ${permiso.Eliminar ? 'Sí' : 'No'}`}
                        >
                          {permiso.NombrePermiso}
                          <div className="permission-indicators">
                            {permiso.Leer && <span className="indicator read">L</span>}
                            {permiso.Crear && <span className="indicator create">C</span>}
                            {permiso.Editar && <span className="indicator edit">E</span>}
                            {permiso.Eliminar && <span className="indicator delete">D</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-permissions">No hay permisos asignados</p>
                    )}
                  </div>
                </div>

                <div className="role-actions">
                  <button className="action-button edit-button" onClick={() => handleEditRole(role)}>
                    <EditIcon fontSize="small" />
                    Editar
                  </button>
                  <button className="action-button delete-button" onClick={() => handleDeleteRole(role)}>
                    <DeleteIcon fontSize="small" />
                    Eliminar
                  </button>
                  <button className="action-button permission-button" onClick={() => handleManagePermissions(role)}>
                    <LockIcon fontSize="small" />
                    Permisos
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button nav-button" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt; Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, and pages around current page
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  if(index > 0 && array[index-1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="pagination-ellipsis">...</span>
                        <button
                          className={`pagination-button ${currentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    )
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-button ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                })
              }
              
              <button 
                className="pagination-button nav-button" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente &gt;
              </button>
            </div>
          )}
        </>
      )}

      {showRoleModal && (
        <RoleModal role={currentRole} onSave={handleSaveRole} onClose={() => setShowRoleModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteRoleModal role={currentRole} onConfirm={handleConfirmDelete} onClose={() => setShowDeleteModal(false)} />
      )}

      {showPermissionsModal && (
        <RolePermissionsModal
          role={currentRole}
          allPermissions={allPermissions}
          rolePermissions={currentRole.permisos}
          onSave={handleSavePermissions}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .role-management {
          padding: 32px;
          background-color: #fafafa;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #333;
        }
        
        .page-header {
          margin-bottom: 40px;
        }
        
        .page-title {
          font-size: 28px;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #333;
          font-weight: 400;
        }
        
        .title-icon {
          color: #2D9C5F;
        }
        
        .page-description {
          margin: 0;
          color: #757575;
          font-size: 15px;
        }
        
        .user-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        @media (max-width: 768px) {
          .user-actions {
            flex-direction: column;
            gap: 16px;
          }
          
          .search-bar {
            max-width: 100% !important;
          }
        }
        
        .search-bar {
          display: flex;
          flex: 1;
          max-width: 400px;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 4px 0 0 4px;
          font-size: 14px;
          outline: none;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .search-input:focus {
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        
        .search-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background-color: white;
          color: #333;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .search-button:hover {
          background-color: #f5f5f5;
        }
        
        .add-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background-color: #2D9C5F;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(45,156,95,0.2);
        }
        
        .add-button:hover {
          background-color: #259352;
          box-shadow: 0 4px 8px rgba(45,156,95,0.2);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
        }
        
        .loading-spinner {
          border: 2px solid #f3f3f3;
          border-radius: 50%;
          border-top: 2px solid #2D9C5F;
          width: 30px;
          height: 30px;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        @media (max-width: 768px) {
          .roles-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .role-card {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          height: 100%;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        
        .role-header {
          padding: 24px;
          background: linear-gradient(135deg, #34a853 0%, #2D9C5F 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .role-title-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .role-icon {
          font-size: 20px;
        }
        
        .role-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .role-badge {
          background-color: rgba(255, 255, 255, 0.2);
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        
        .role-description {
          padding: 20px 24px;
          flex-grow: 1;
        }
        
        .role-description p {
          margin: 0;
          color: #555;
          line-height: 1.5;
        }
        
        .role-permissions {
          padding: 16px 24px 24px;
          background-color: #f9f9f9;
        }
        
        .permissions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .permissions-header h4 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }
        
        .permissions-icon {
          font-size: 18px;
          color: #2D9C5F;
        }
        
        .permissions-count {
          background-color: #2D9C5F;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .permission-badge {
          font-size: 12px;
          border-radius: 4px;
          padding: 4px 8px;
          transition: all 0.2s ease;
          background-color: #f1f1f1;
          color: #555;
        }
        
        .permission-active {
          background-color: #e8f5e9;
          color: #2D9C5F;
        }
        
        .permission-inactive {
          background-color: #f5f5f5;
          color: #aaa;
        }
        
        .permission-indicators {
          display: flex;
          margin-top: 4px;
          gap: 2px;
          justify-content: center;
        }
        
        .indicator {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #2D9C5F;
        }
        
        .read, .create, .edit, .delete {
          background-color: #2D9C5F;
          opacity: 0.7;
        }
        
        .no-permissions {
          font-style: italic;
          color: #aaa;
          margin: 0;
          font-size: 13px;
        }
        
        .role-actions {
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background-color: white;
        }
        
        @media (max-width: 480px) {
          .role-actions {
            flex-direction: column;
          }
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #f5f5f5;
          color: #555;
          font-weight: 500;
        }
        
        .action-button:hover {
          background-color: #eee;
        }
        
        .edit-button {
          color: #555;
        }
        
        .edit-button:hover {
          background-color: #f1c40f20;
          color: #333;
        }
        
        .delete-button {
          color: #555;
        }
        
        .delete-button:hover {
          background-color: #e74c3c20;
          color: #e74c3c;
        }
        
        .permission-button {
          background-color: #2D9C5F;
          color: white;
        }
        
        .permission-button:hover {
          background-color: #228c4e;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
        }
        
        .pagination-button {
          min-width: 36px;
          height: 36px;
          border: none;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          color: #555;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .pagination-button:hover:not(.active):not(:disabled) {
          background-color: #f5f5f5;
        }
        
        .pagination-button.active {
          background-color: #2D9C5F;
          color: white;
        }
        
        .nav-button {
          padding: 0 16px;
          font-weight: 500;
        }
        
        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .pagination-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          color: #555;
        }
      `}} />
    </div>
  )
}

export default RoleManagement

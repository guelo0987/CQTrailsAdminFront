"use client"

import { useState, useEffect } from "react"
import UserModal from "../components/user-components/UserModal"
import DeleteConfirmModal from "../components/user-components/DeleteConfirmModal"
import RoleModal from "../components/role-components/RoleModal"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import BlockIcon from "@mui/icons-material/Block"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import { userService } from "../Services/UserService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // Fetch users from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all users
        const response = await userService.getAllUsers()
        if (response.success && response.data) {
          setUsers(response.data)
        } else {
          notificationService.showError("Error al cargar los usuarios")
        }
        
        // For now, use mock roles
        // In a real implementation, you would fetch roles from an API
        setRoles([
          { id: 1, name: "Administrador" },
          { id: 2, name: "Operador" },
          { id: 3, name: "Cliente" },
        ])
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        notificationService.showError("Error al cargar los usuarios")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter users by search term
  const filteredUsers = users.filter(
    (user) =>
      (user.Email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.Apellido || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already applied automatically with the searchTerm state
  }

  const handleAddUser = () => {
    setCurrentUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setShowUserModal(true)
  }

  const handleDeleteUser = (user) => {
    setCurrentUser(user)
    setShowDeleteModal(true)
  }

  const handleChangeRole = (user) => {
    setCurrentUser(user)
    setShowRoleModal(true)
  }

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true)
      await userService.changeUserStatus(user.IdUsuario, !user.Activo)
      
      // Refresh user list
      const response = await userService.getAllUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error toggling user status:", error)
      setLoading(false)
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      setLoading(true)
      
      if (currentUser) {
        // Update existing user
        await userService.updateUser(currentUser.IdUsuario, userData)
      } else {
        // Create new user
        await userService.createUser(userData)
      }
      
      // Refresh user list
      const response = await userService.getAllUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
      
      setShowUserModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error saving user:", error)
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      
      await userService.deleteUser(currentUser.IdUsuario)
      
      // Refresh user list
      const response = await userService.getAllUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
      
      setShowDeleteModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      setLoading(false)
    }
  }

  const handleSaveRole = async (roleId) => {
    try {
      setLoading(true)
      
      await userService.changeUserRole(currentUser.IdUsuario, roleId)
      
      // Refresh user list
      const response = await userService.getAllUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
      
      setShowRoleModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error changing user role:", error)
      setLoading(false)
    }
  }

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &laquo;
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &lsaquo;
        </button>
        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          &raquo;
        </button>
      </div>
    )
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>
          <AdminPanelSettingsIcon /> Gestión de Usuarios
        </h1>
        <button className="add-button" onClick={handleAddUser}>
          <AddIcon /> Nuevo Usuario
        </button>
      </div>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <SearchIcon />
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.IdUsuario}>
                      <td>{user.IdUsuario}</td>
                      <td>{`${user.Nombre} ${user.Apellido}`}</td>
                      <td>{user.Email}</td>
                      <td>{user.Rol?.NombreRol || "Sin rol"}</td>
                      <td>
                        <span className={`status-badge ${user.Activo ? "active" : "inactive"}`}>
                          {user.Activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-button edit"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
                        >
                          <DeleteIcon />
                        </button>
                        <button
                          className="action-button role"
                          onClick={() => handleChangeRole(user)}
                          title="Cambiar rol"
                        >
                          <AdminPanelSettingsIcon />
                        </button>
                        <button
                          className={`action-button ${user.Activo ? "deactivate" : "activate"}`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.Activo ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.Activo ? <BlockIcon /> : <CheckCircleIcon />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}

      {showUserModal && (
        <UserModal
          user={currentUser}
          roles={roles}
          onSave={handleSaveUser}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          user={currentUser}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {showRoleModal && (
        <RoleModal
          user={currentUser}
          roles={roles}
          onSave={handleSaveRole}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </div>
  )
}

export default UserManagement


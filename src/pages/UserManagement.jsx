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
import PeopleIcon from "@mui/icons-material/People"
import PersonIcon from "@mui/icons-material/Person"
import GroupIcon from "@mui/icons-material/Group"
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"
import { userService } from "../Services/UserService.ts"
import { rolesService } from "../Services/RolesServices.ts"
import { notificationService } from "../Utils/notificationService.ts"
import "./UserManagement.css" // Crearemos este archivo CSS

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
  const [activeTab, setActiveTab] = useState("staff") // "staff" o "clients"

  // Función para obtener el nombre del rol basado en su ID
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.IdRol === roleId);
    return role ? role.NombreRol : "Sin rol";
  }

  // Verificar si un usuario es cliente
  const isClient = (user) => {
    const clientRole = roles.find(r => r.NombreRol && r.NombreRol.toLowerCase() === "cliente");
    return clientRole && user.IdRol === clientRole.IdRol;
  }

  // Fetch users and roles from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Obtener roles desde el servicio
        const rolesResponse = await rolesService.getRoles();
        if (rolesResponse.success && rolesResponse.data) {
          setRoles(rolesResponse.data);
        } else {
          notificationService.showError("Error al cargar los roles");
          // Configurar roles por defecto en caso de error
          setRoles([
            { IdRol: 1, NombreRol: "Cliente", Descripcion: null },
            { IdRol: 2, NombreRol: "Admin", Descripcion: null },
            { IdRol: 3, NombreRol: "Empleado", Descripcion: null },
          ]);
        }
        
        // En lugar de combinar usuarios y tener duplicados, obtendremos:
        // 1. Solo los usuarios NO clientes del endpoint allUsers 
        // 2. Solo los clientes del endpoint de clientes
        let allUsers = [];
        
        // Obtener todos los usuarios (activos e inactivos)
        const allUsersResponse = await userService.getAllUsers({ activo: undefined });
        
        if (allUsersResponse.success && allUsersResponse.data) {
          // Identificar el rol de cliente después de cargar los roles
          const clientRole = roles.find(r => r.NombreRol && r.NombreRol.toLowerCase() === "cliente");
          const clientRoleId = clientRole ? clientRole.IdRol : 1;
          
          // Filtrar para excluir a los usuarios con rol de cliente
          const adminUsers = allUsersResponse.data.filter(user => user.IdRol !== clientRoleId);
          allUsers = [...adminUsers];
        } else {
          notificationService.showError("Error al cargar los usuarios administrativos");
        }
        
        // Obtener clientes (activos e inactivos)
        const clientsResponse = await userService.getClients({ activo: undefined });
        
        if (clientsResponse.success && clientsResponse.data) {
          // Añadir los clientes a la lista de usuarios
          allUsers = [...allUsers, ...clientsResponse.data];
        } else {
          notificationService.showError("Error al cargar los clientes");
        }
        
        // Actualizar el estado con todos los usuarios
        setUsers(allUsers);
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        notificationService.showError("Error al cargar los usuarios")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar usuarios según el término de búsqueda y el tab activo
  const filteredUsers = users.filter(
    (user) => {
      // Primero filtrar por tipo de usuario (cliente o staff)
      const matchesTab = (activeTab === "clients" && isClient(user)) || 
                      (activeTab === "staff" && !isClient(user));
      
      if (!matchesTab) return false;
      
      // Luego filtrar por término de búsqueda
      return (user.Email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
             (user.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
             (user.Apellido || "").toLowerCase().includes(searchTerm.toLowerCase());
    }
  )

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
    // Adaptar el formato del usuario al esperado por el modal
    const formattedUser = {
      idUsuario: user.IdUsuario,
      email: user.Email,
      nombre: user.Nombre,
      apellido: user.Apellido,
      idRol: user.IdRol
    };
    setCurrentUser(formattedUser)
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

  const refreshUserList = async () => {
    try {
      // Identificar el rol de cliente
      const clientRole = roles.find(r => r.NombreRol && r.NombreRol.toLowerCase() === "cliente");
      const clientRoleId = clientRole ? clientRole.IdRol : 1;
      
      // En lugar de combinar usuarios y tener duplicados, obtendremos:
      // 1. Solo los usuarios NO clientes del endpoint allUsers 
      // 2. Solo los clientes del endpoint de clientes
      let allUsers = [];
      
      // Obtener todos los usuarios (activos e inactivos)
      const allUsersResponse = await userService.getAllUsers({ activo: undefined });
      
      if (allUsersResponse.success && allUsersResponse.data) {
        // Filtrar para excluir a los usuarios con rol de cliente
        const adminUsers = allUsersResponse.data.filter(user => user.IdRol !== clientRoleId);
        allUsers = [...adminUsers];
      }
      
      // Obtener clientes (activos e inactivos)
      const clientsResponse = await userService.getClients({ activo: undefined });
      
      if (clientsResponse.success && clientsResponse.data) {
        // Añadir los clientes a la lista de usuarios
        allUsers = [...allUsers, ...clientsResponse.data];
      }
      
      // Actualizar el estado con todos los usuarios
      setUsers(allUsers);
    } catch (error) {
      console.error("Error refreshing user list:", error);
      notificationService.showError("Error al actualizar la lista de usuarios");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      console.log(`Cambiando estado del usuario ${user.IdUsuario} de ${user.Activo} a ${!user.Activo}`);
      await userService.changeUserStatus(user.IdUsuario, !user.Activo);
      
      // Actualizar la lista de usuarios
      await refreshUserList();
    } catch (error) {
      console.error("Error toggling user status:", error);
      notificationService.showError("Error al cambiar el estado del usuario");
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      // The API expects capitalized property names
      const apiUserData = {
        Email: userData.Email,
        Nombre: userData.Nombre,
        Apellido: userData.Apellido,
        IdRol: userData.IdRol,
        Activo: userData.Activo,
        Password: userData.Password
      };

      console.log("Enviando datos de usuario:", apiUserData);

      if (currentUser) {
        // Update existing user
        await userService.updateUser(currentUser.idUsuario, apiUserData)
      } else {
        // Create new user
        await userService.createUser(apiUserData)
      }
      
      // Actualizar la lista de usuarios
      await refreshUserList();
      
      setShowUserModal(false)
    } catch (error) {
      console.error("Error saving user:", error)
      notificationService.showError(error.response?.data?.message || "Error al guardar el usuario")
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await userService.deleteUser(currentUser.IdUsuario)
      
      // Actualizar la lista de usuarios
      await refreshUserList();
      
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      notificationService.showError("Error al eliminar el usuario")
    }
  }

  const handleSaveRole = async (roleId) => {
    try {
      console.log(`Cambiando rol de usuario ${currentUser.idUsuario} a ${roleId}`);
      
      // Convertir roleId a número si viene como string
      const numericRoleId = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
      
      // Intentar cambiar el rol del usuario
      await userService.changeUserRole(currentUser.idUsuario, numericRoleId)
      
      // Actualizar la lista de usuarios
      await refreshUserList();
      
      setShowRoleModal(false)
    } catch (error) {
      console.error("Error changing user role:", error)
      notificationService.showError(error.response?.data?.message || "Error al cambiar el rol del usuario")
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

  // Renderizar tabla de usuarios según el tab activo
  const renderUserTable = () => {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              {activeTab === "staff" && <th>Rol</th>}
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "staff" ? "7" : "6"} className="no-data">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.IdUsuario}>
                  <td>{user.IdUsuario}</td>
                  <td>{`${user.Nombre} ${user.Apellido}`}</td>
                  <td>{user.Email}</td>
                  {activeTab === "staff" && <td>{getRoleName(user.IdRol)}</td>}
                  <td>
                    <span className={`status-badge ${user.Activo ? "active" : "inactive"}`}>
                      {user.Activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>{new Date(user.FechaRegistro).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {activeTab === "staff" && (
                      <>
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
                      </>
                    )}
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
    );
  };

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>
          <AdminPanelSettingsIcon /> Gestión de Usuarios
        </h1>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === "staff" ? "active" : ""}`} 
          onClick={() => setActiveTab("staff")}
        >
          <SupervisorAccountIcon /> Personal Administrativo
        </button>
        <button 
          className={`tab-button ${activeTab === "clients" ? "active" : ""}`} 
          onClick={() => setActiveTab("clients")}
        >
          <PeopleIcon /> Clientes
        </button>
      </div>

      <div className="user-actions-bar">
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

        {activeTab === "staff" && (
          <button className="add-button" onClick={handleAddUser}>
            <AddIcon /> Nuevo Usuario
          </button>
        )}
      </div>

      <div className="users-stats-summary">
        <div className="stat-card">
          <GroupIcon />
          <div className="stat-info">
            <h3>Total</h3>
            <p>{filteredUsers.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircleIcon />
          <div className="stat-info">
            <h3>Activos</h3>
            <p>{filteredUsers.filter(user => user.Activo).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <BlockIcon />
          <div className="stat-info">
            <h3>Inactivos</h3>
            <p>{filteredUsers.filter(user => !user.Activo).length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <div className="users-content">
          {renderUserTable()}
          {renderPagination()}
        </div>
      )}

      {showUserModal && (
        <UserModal
          user={currentUser}
          roles={activeTab === "clients" 
            ? roles.filter(role => role.NombreRol && role.NombreRol.toLowerCase() === "cliente") 
            : roles.filter(role => !role.NombreRol || role.NombreRol.toLowerCase() !== "cliente")
          }
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
          roles={roles.filter(role => !role.NombreRol || role.NombreRol.toLowerCase() !== "cliente")} // No mostrar el rol de cliente como opción
          onSave={handleSaveRole}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </div>
  )
}

export default UserManagement


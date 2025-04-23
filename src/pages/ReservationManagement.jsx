"use client"

import { useState, useEffect } from "react"
import ReservationDetailModal from "../components/reservation-components/ReservationDetailModal"
import ReservationStatusModal from "../components/reservation-components/ReservationStatusModal"
import SearchIcon from "@mui/icons-material/Search"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import FilterListIcon from "@mui/icons-material/FilterList"
import EventIcon from "@mui/icons-material/Event"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { reservationService } from "../Services/ReservationService"
import { notificationService } from "../Utils/notificationService"
import "./ReservationManagement.css"
import { notificationService as notificationAPI } from "../Services/NotificationService.ts"

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [currentReservation, setCurrentReservation] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [reservationsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Load real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch reservations
        const reservationsResponse = await reservationService.getReservations()
        if (reservationsResponse.success && reservationsResponse.data) {
          setReservations(reservationsResponse.data)
        }
        
        // Use mock cities instead of fetching from API
        // This avoids the 401 Unauthorized error
        setCities([
          { IdCiudad: 1, Nombre: "Santiago", Estado: "Activo" },
          { IdCiudad: 2, Nombre: "Valparaíso", Estado: "Activo" },
          { IdCiudad: 3, Nombre: "Cancún", Estado: "Activo" },
          { IdCiudad: 4, Nombre: "La Serena", Estado: "Inactivo" },
          { IdCiudad: 5, Nombre: "Antofagasta", Estado: "Activo" },
          { IdCiudad: 7, Nombre: "Samana", Estado: "Activo" },
        ])
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        notificationService.showError("Error al cargar los datos")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter reservations by search term, status, and city
  const filteredReservations = reservations.filter((reservation) => {
    const searchMatch =
      (reservation.Usuarios1?.nombre + " " + reservation.Usuarios1?.apellido || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (reservation.Empresas1?.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.RutaPersonalizada || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.CiudadInicio?.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.CiudadFin?.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase())

    const statusMatch = statusFilter === "all" || reservation.Estado.toLowerCase() === statusFilter.toLowerCase()

    const cityMatch =
      cityFilter === "all" ||
      reservation.ciudadinicioid === Number.parseInt(cityFilter) ||
      reservation.ciudadfinid === Number.parseInt(cityFilter)

    return searchMatch && statusMatch && cityMatch
  })

  // Pagination
  const indexOfLastReservation = currentPage * reservationsPerPage
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation)
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // The search is already applied automatically with the searchTerm state
  }

  const handleViewDetails = async (reservation) => {
    try {
      // Get detailed reservation data
      const response = await reservationService.getReservationById(reservation.IdReservacion)
      if (response.success && response.data) {
        // Set the current reservation with all the data from the API
        setCurrentReservation(response.data);
      } else {
        setCurrentReservation(reservation)
      }
      setShowDetailModal(true)
    } catch (error) {
      console.error("Error fetching reservation details:", error)
      notificationService.showError("Error al cargar los detalles de la reservación")
      // Fallback to using the reservation from the list
      setCurrentReservation(reservation)
      setShowDetailModal(true)
    }
  }

  const handleChangeStatus = (reservation) => {
    setCurrentReservation(reservation)
    setShowStatusModal(true)
  }

  const handleStatusChange = async (newStatus, motivoRechazo = null) => {
    try {
      setLoading(true)
      
      // Use the new changeReservationStatus endpoint
      await reservationService.changeReservationStatus(
        currentReservation.IdReservacion, 
        newStatus, 
        motivoRechazo
      );
      
      // If the status is "Aceptada", create a notification and send confirmation email
      if (newStatus.toLowerCase() === "aceptada") {
        try {
          // Create notification
          const notificationData = {
            IdReservacion: currentReservation.IdReservacion,
            TipoNotificacion: "Reservación Aceptada",
            Contenido: `La reservación #${currentReservation.IdReservacion} ha sido aceptada.`
          };
          
          await notificationAPI.createNotification(notificationData);
          
          // Send confirmation email
          await notificationAPI.sendConfirmationEmail(currentReservation.IdReservacion);
          
          notificationService.showSuccess("Se ha enviado una notificación de confirmación al cliente");
        } catch (notificationError) {
          console.error("Error al crear la notificación o enviar el correo:", notificationError);
          // Continue with the flow even if notification or email fails
        }
      }
      
      // Refresh reservations list
      const response = await reservationService.getReservations()
      if (response.success && response.data) {
        setReservations(response.data)
      }
      
      setShowStatusModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error updating reservation status:", error)
      notificationService.showError("Error al actualizar el estado de la reservación")
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "Aceptada":
        return "status-completed"
      case "pendiente":
        return "status-pending"
      case "denegada":
        return "status-rejected"
      default:
        return ""
    }
  }

  // Handle filter by status
  const handleStatusFilterChange = async (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
    
    if (status !== "all") {
      try {
        setLoading(true)
        const response = await reservationService.getReservationsByStatus(status)
        if (response.success && response.data) {
          setReservations(response.data)
        }
        setLoading(false)
      } catch (error) {
        console.error(`Error fetching reservations with status ${status}:`, error)
        notificationService.showError("Error al filtrar reservaciones por estado")
        setLoading(false)
      }
    } else {
      // If "all" is selected, fetch all reservations
      try {
        setLoading(true)
        const response = await reservationService.getReservations()
        if (response.success && response.data) {
          setReservations(response.data)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching all reservations:", error)
        notificationService.showError("Error al cargar las reservaciones")
        setLoading(false)
      }
    }
  }

  // Handle filter by city
  const handleCityFilterChange = async (cityId) => {
    setCityFilter(cityId)
    setCurrentPage(1)
    
    if (cityId !== "all") {
      try {
        setLoading(true)
        // You can decide whether to filter by start city, end city, or both
        const response = await reservationService.getReservationsByCity(cityId, cityId)
        if (response.success && response.data) {
          setReservations(response.data)
        }
        setLoading(false)
      } catch (error) {
        console.error(`Error fetching reservations for city ${cityId}:`, error)
        notificationService.showError("Error al filtrar reservaciones por ciudad")
        setLoading(false)
      }
    } else {
      // If "all" is selected, fetch all reservations
      try {
        setLoading(true)
        const response = await reservationService.getReservations()
        if (response.success && response.data) {
          setReservations(response.data)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching all reservations:", error)
        notificationService.showError("Error al cargar las reservaciones")
        setLoading(false)
      }
    }
  }

  return (
    <div className="reservation-management-container">
      <div className="page-header">
        <h1>
          <EventIcon style={{ color: "#2e7d32" }} /> Gestión de Reservaciones
        </h1>
      </div>

      <div className="actions-container">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Buscar por cliente, empresa, origen o destino..."
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

        <button
          className="filter-toggle-button"
          onClick={() => setShowFilters(!showFilters)}
          style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", borderColor: "#81c784" }}
        >
          <FilterListIcon /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-container" style={{ backgroundColor: "#f8f8f8", borderTop: "2px solid #81c784", borderBottom: "2px solid #81c784" }}>
          <div className="filter-group">
            <label className="filter-label" style={{ color: "#2e7d32" }}>Estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="filter-select"
              style={{ borderColor: "#81c784" }}
            >
              <option value="all">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="Aceptada">Aceptada</option>
              <option value="denegada">Denegada</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" style={{ color: "#2e7d32" }}>Ciudad:</label>
            <select
              value={cityFilter}
              onChange={(e) => handleCityFilterChange(e.target.value)}
              className="filter-select"
              style={{ borderColor: "#81c784" }}
            >
              <option value="all">Todas</option>
              {cities.map((city) => (
                <option key={city.IdCiudad} value={city.IdCiudad}>
                  {city.Nombre}
                </option>
              ))}
            </select>
          </div>

          {filteredReservations.length > 0 && (
            <div className="results-summary" style={{ color: "#2e7d32", fontWeight: "500" }}>
              Se encontraron {filteredReservations.length} reservaciones
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-container" style={{ color: "#2e7d32" }}>
          <div className="loading-spinner" style={{ borderTopColor: "#2e7d32" }}></div>
          <p>Cargando reservaciones...</p>
        </div>
      ) : (
        <>
          <table className="reservations-table" style={{ borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#ffffff", color: "white" }}>
                <th>ID</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Fecha de Inicio</th>
                <th>Fecha de Fin</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            {/* Table rendering section */}
            <tbody>
              {currentReservations.length > 0 ? (
                currentReservations.map((reservation, index) => (
                  <tr key={reservation.IdReservacion} style={{ backgroundColor: index % 2 === 0 ? "#f8f8f8" : "white", borderBottom: "1px solid #e0e0e0" }}>
                    <td>{reservation.IdReservacion}</td>
                    <td style={{ fontWeight: "500" }}>
                      {reservation.Usuario 
                        ? `${reservation.Usuario.Nombre} ${reservation.Usuario.Apellido}` 
                        : (reservation.Usuarios1 
                            ? `${reservation.Usuarios1.nombre} ${reservation.Usuarios1.apellido}` 
                            : "N/A")}
                    </td>
                    <td>{reservation.Empresa?.Nombre || reservation.Empresas1?.Nombre || "N/A"}</td>
                    <td>
                      <div className="city-cell">
                        <LocationOnIcon fontSize="small" className="city-icon" style={{ color: "#43a047" }} />
                        {reservation.CiudadInicio?.Nombre || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="city-cell">
                        <LocationOnIcon fontSize="small" className="city-icon" style={{ color: "#43a047" }} />
                        {reservation.CiudadFin?.Nombre || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <CalendarMonthIcon fontSize="small" className="date-icon" style={{ color: "#43a047" }} />
                        {formatDate(reservation.FechaInicio)}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <EventIcon fontSize="small" className="date-icon" style={{ color: "#43a047" }} />
                        {formatDate(reservation.FechaFin)}
                      </div>
                    </td>
                    <td>
                      <span className={`reservation-status ${getStatusClass(reservation.Estado)}`}>
                        {reservation.Estado}
                      </span>
                    </td>
                    <td className="price-cell" style={{ fontWeight: "bold", color: "#2e7d32" }}>${reservation.Total?.toLocaleString() || "0"}</td>
                    <td>
                      <div className="reservation-actions-cell">
                        <button
                          className="action-button view-button"
                          onClick={() => handleViewDetails(reservation)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon fontSize="small" />
                          Detalles
                        </button>
                        <button
                          className="action-button edit-button"
                          onClick={() => handleChangeStatus(reservation)}
                          title="Cambiar estado"
                        >
                          <EditIcon fontSize="small" />
                          Estado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data-message" style={{ padding: "20px", textAlign: "center", color: "#757575" }}>
                    No se encontraron reservaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "5px" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                  style={{ 
                    padding: "8px 12px", 
                    border: "1px solid #e0e0e0", 
                    backgroundColor: currentPage === page ? "#2e7d32" : "#f5f5f5",
                    color: currentPage === page ? "white" : "#333",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {showDetailModal && (
        <ReservationDetailModal
          reservation={currentReservation}
          onClose={() => setShowDetailModal(false)}
          formatDate={formatDate}
        />
      )}

      {showStatusModal && (
        <ReservationStatusModal
          reservation={currentReservation}
          onSave={handleStatusChange}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  )
}

export default ReservationManagement

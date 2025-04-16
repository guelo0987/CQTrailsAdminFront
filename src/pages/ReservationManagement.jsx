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
        // Add a default Total property if it doesn't exist
        setCurrentReservation({
          ...response.data,
          Total: response.data.Total || 0
        });
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
      
      if (newStatus === "Completada") {
        // Approve reservation
        await reservationService.approveReservation(currentReservation.IdReservacion, {
          mensaje: "Reservación aprobada por administrador"
        })
      } else if (newStatus === "Rechazada") {
        // Reject reservation
        await reservationService.rejectReservation(currentReservation.IdReservacion, {
          motivo: motivoRechazo
        })
      } else {
        // Update status (for Pendiente or other statuses)
        await reservationService.updateReservationStatus(currentReservation.IdReservacion, newStatus)
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
      case "completada":
        return "status-completed"
      case "pendiente":
        return "status-pending"
      case "rechazada":
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
    <div className="reservation-management">
      <div className="reservation-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar reservaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchIcon fontSize="small" />
            Buscar
          </button>
        </form>

        <div className="action-buttons">
          <button 
            className="filter-toggle-button" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon fontSize="small" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="vehicle-filters">
          <div className="filters-header">
            <h3>Filtros de búsqueda</h3>
            <button 
              className="reset-filters-button"
              onClick={() => {
                setStatusFilter("all");
                setCityFilter("all");
                // Reload all reservations
                const fetchAllReservations = async () => {
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
                fetchAllReservations()
              }}
            >
              Restablecer filtros
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>
                <FilterListIcon fontSize="small" />
                Estado de la reservación
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="completada">Completadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <LocationOnIcon fontSize="small" />
                Ciudad
              </label>
              <select 
                value={cityFilter} 
                onChange={(e) => handleCityFilterChange(e.target.value)}
              >
                <option value="all">Todas las ciudades</option>
                {cities.map((city) => (
                  <option key={city.IdCiudad} value={city.IdCiudad}>
                    {city.Nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredReservations.length > 0 && (
            <div className="results-summary">
              Se encontraron {filteredReservations.length} reservaciones
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p>Cargando reservaciones...</p>
      ) : (
        <>
          <table className="reservations-table">
            <thead>
              <tr>
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
                currentReservations.map((reservation) => (
                  <tr key={reservation.IdReservacion}>
                    <td>{reservation.IdReservacion}</td>
                    <td>
                      {reservation.Usuarios1 ? `${reservation.Usuarios1.nombre} ${reservation.Usuarios1.apellido}` : "N/A"}
                    </td>
                    <td>{reservation.Empresas1?.Nombre || "N/A"}</td>
                    <td>
                      <div className="city-cell">
                        <LocationOnIcon fontSize="small" className="city-icon" />
                        {reservation.CiudadInicio?.Nombre || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="city-cell">
                        <LocationOnIcon fontSize="small" className="city-icon" />
                        {reservation.CiudadFin?.Nombre || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <CalendarMonthIcon fontSize="small" className="date-icon" />
                        {formatDate(reservation.FechaInicio)}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <EventIcon fontSize="small" className="date-icon" />
                        {formatDate(reservation.FechaFin)}
                      </div>
                    </td>
                    <td>
                      <span className={`reservation-status ${getStatusClass(reservation.Estado)}`}>
                        {reservation.Estado}
                      </span>
                    </td>
                    <td className="price-cell">${reservation.Total?.toLocaleString() || "0"}</td>
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
                  <td colSpan="10" className="no-data-message">
                    No se encontraron reservaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-button ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
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

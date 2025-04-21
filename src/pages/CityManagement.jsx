"use client"

import { useState, useEffect } from "react"
import CityModal from "../components/city-components/CityModal"
import DeleteCityModal from "../components/city-components/DeleteCityModal"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import BlockIcon from "@mui/icons-material/Block"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LocationCityIcon from "@mui/icons-material/LocationCity"
import { cityService } from "../Services/CityService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const CityManagement = () => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCityModal, setShowCityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentCity, setCurrentCity] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [citiesPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        const response = await cityService.getCities()
        
        if (response.success && response.data) {
          // Transform data to match the expected format if needed
          const formattedCities = response.data.map(city => ({
            IdCiudad: city.IdCiudad,
            Nombre: city.Nombre,
            Estado: city.Estado || "Activo"
          }))
          setCities(formattedCities)
        } else {
          notificationService.showError("Error al cargar las ciudades")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching cities:", error)
        notificationService.showError("Error al cargar las ciudades")
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  // Filtrar ciudades por búsqueda y estado
  const filteredCities = cities.filter((city) => {
    const searchMatch = city.Nombre && city.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = statusFilter === "all" || (city.Estado && city.Estado.toLowerCase() === statusFilter.toLowerCase())
    return searchMatch && statusMatch
  })

  // Paginación
  const indexOfLastCity = currentPage * citiesPerPage
  const indexOfFirstCity = indexOfLastCity - citiesPerPage
  const currentCities = filteredCities.slice(indexOfFirstCity, indexOfLastCity)
  const totalPages = Math.ceil(filteredCities.length / citiesPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // La búsqueda ya se aplica automáticamente con el estado searchTerm
  }

  const handleAddCity = () => {
    setCurrentCity(null)
    setShowCityModal(true)
  }

  const handleEditCity = (city) => {
    setCurrentCity(city)
    setShowCityModal(true)
  }

  const handleDeleteCity = (city) => {
    setCurrentCity(city)
    setShowDeleteModal(true)
  }

  const handleToggleActive = async (city) => {
    try {
      setLoading(true)
      
      // Prepare city data for update
      const cityData = {
        Nombre: city.Nombre,
        Estado: city.Estado === "Activo" ? "Inactivo" : "Activo"
      }
      
      // Call API to update city
      await cityService.updateCity(city.IdCiudad, cityData)
      
      // Update local state
      const updatedCities = cities.map((c) => {
        if (c.IdCiudad === city.IdCiudad) {
          return { ...c, Estado: c.Estado === "Activo" ? "Inactivo" : "Activo" }
        }
        return c
      })
      
      setCities(updatedCities)
      setLoading(false)
    } catch (error) {
      console.error("Error updating city status:", error)
      notificationService.showError("Error al actualizar el estado de la ciudad")
      setLoading(false)
    }
  }

  const handleSaveCity = async (cityData) => {
    try {
      setLoading(true)
      
      // Prepare city data for API - using capitalized field names to match API
      const apiCityData = {
        Nombre: cityData.Nombre,
        Estado: cityData.Estado || "Activo"
      }
      
      if (currentCity) {
        // Update existing city
        await cityService.updateCity(currentCity.IdCiudad, apiCityData)
        
        // Update local state
        const updatedCities = cities.map((city) =>
          city.IdCiudad === currentCity.IdCiudad 
            ? { 
                ...city, 
                Nombre: cityData.Nombre,
                Estado: cityData.Estado
              } 
            : city
        )
        
        setCities(updatedCities)
      } else {
        // Create new city
        const response = await cityService.createCity(apiCityData)
        
        if (response.success && response.data) {
          const newCity = {
            IdCiudad: response.data.IdCiudad,
            Nombre: response.data.Nombre,
            Estado: response.data.Estado || "Activo"
          }
          
          setCities([...cities, newCity])
        }
      }
      
      setShowCityModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error saving city:", error)
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      
      // Call API to delete city
      await cityService.deleteCity(currentCity.IdCiudad)
      
      // Update local state
      const updatedCities = cities.filter((city) => city.IdCiudad !== currentCity.IdCiudad)
      setCities(updatedCities)
      
      setShowDeleteModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error deleting city:", error)
      notificationService.showError("Error al eliminar la ciudad")
      setLoading(false)
    }
  }

  return (
    <div className="city-management">
      <div className="user-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar ciudades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchIcon fontSize="small" />
            Buscar
          </button>
        </form>

        <div className="filter-container">
          <span>Estado:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
            <option value="all">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <button className="add-button" onClick={handleAddCity}>
          <AddIcon fontSize="small" />
          Nueva Ciudad
        </button>
      </div>

      {loading ? (
        <p>Cargando ciudades...</p>
      ) : (
        <>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCities.map((city) => (
                <tr key={city.IdCiudad}>
                  <td>{city.IdCiudad}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <LocationCityIcon fontSize="small" style={{ color: "var(--primary-color)" }} />
                      {city.Nombre}
                    </div>
                  </td>
                  <td>
                    <span className={`user-status ${city.Estado === "Activo" ? "active" : "inactive"}`}>
                      {city.Estado}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions-cell">
                      <button className="action-button edit-button" onClick={() => handleEditCity(city)}>
                        <EditIcon fontSize="small" />
                        Editar
                      </button>
                      <button className="action-button delete-button" onClick={() => handleDeleteCity(city)}>
                        <DeleteIcon fontSize="small" />
                        Eliminar
                      </button>
                      <button
                        className={`action-button ${
                          city.Estado === "Activo" ? "deactivate-button" : "activate-button"
                        }`}
                        onClick={() => handleToggleActive(city)}
                      >
                        {city.Estado === "Activo" ? (
                          <>
                            <BlockIcon fontSize="small" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon fontSize="small" />
                            Activar
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {showCityModal && (
        <CityModal city={currentCity} onSave={handleSaveCity} onClose={() => setShowCityModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteCityModal city={currentCity} onConfirm={handleConfirmDelete} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  )
}

export default CityManagement

"use client"

import { useState, useEffect } from "react"
import VehicleModal from "../components/vehicle-components/VehicleModal"
import DeleteVehicleModal from "../components/vehicle-components/DeleteVehicleModal"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import BlockIcon from "@mui/icons-material/Block"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import FilterListIcon from "@mui/icons-material/FilterList"
import TuneIcon from "@mui/icons-material/Tune"
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import { vehicleService } from "../Services/VehicleService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [vehiclesPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  // Estados para los filtros
  const [typeFilter, setTypeFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [capacityFilter, setCapacityFilter] = useState("all")
  const [minPriceFilter, setMinPriceFilter] = useState("")
  const [maxPriceFilter, setMaxPriceFilter] = useState("")

  // Opciones para los filtros
  const vehicleTypes = ["Sedán", "SUV", "Hatchback", "Pickup", "Minivan", "Deportivo", "Otro"]
  const yearOptions = ["all", ...Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString())]
  const capacityOptions = ["all", "2", "4", "5", "7", "8+"]

  // Cargar vehículos desde la API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await vehicleService.getVehicles()
        
        if (response.success && response.data) {
          // Transformar datos para que coincidan con el formato esperado
          const formattedVehicles = response.data.map(vehicle => ({
            id: vehicle.IdVehiculo,
            placa: vehicle.Placa,
            modelo: vehicle.Modelo,
            anio: vehicle.Ano,
            tipo: vehicle.TipoVehiculo || "Otro",
            capacidad: vehicle.Capacidad,
            precio: vehicle.Price || 0,
            activo: vehicle.Disponible !== undefined ? vehicle.Disponible : true,
            imagenes: vehicle.Image_url ? [
              { tipo: "general", url: vehicle.Image_url.image1 || "/placeholder.svg?height=200&width=300" },
              { tipo: "interior", url: vehicle.Image_url.image2 || "/placeholder.svg?height=200&width=300" },
              { tipo: "lateral", url: "/placeholder.svg?height=200&width=300" },
            ] : [
              { tipo: "general", url: "/placeholder.svg?height=200&width=300" },
              { tipo: "interior", url: "/placeholder.svg?height=200&width=300" },
              { tipo: "lateral", url: "/placeholder.svg?height=200&width=300" },
            ],
          }))
          setVehicles(formattedVehicles)
        } else {
          notificationService.showError("Error al cargar los vehículos")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        notificationService.showError("Error al cargar los vehículos")
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Filtrar vehículos por búsqueda y filtros adicionales
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtro por término de búsqueda
    const searchMatch =
      (vehicle.placa && vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.modelo && vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.tipo && vehicle.tipo.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por tipo de vehículo
    const typeMatch = typeFilter === "all" || (vehicle.tipo && vehicle.tipo === typeFilter)

    // Filtro por año
    const yearMatch = yearFilter === "all" || (vehicle.anio && vehicle.anio.toString() === yearFilter)

    // Filtro por capacidad
    let capacityMatch = true
    if (capacityFilter !== "all") {
      if (capacityFilter === "8+") {
        capacityMatch = vehicle.capacidad && vehicle.capacidad >= 8
      } else {
        capacityMatch = vehicle.capacidad && vehicle.capacidad === Number.parseInt(capacityFilter, 10)
      }
    }

    // Filtro por rango de precio
    const minPriceMatch = !minPriceFilter || (vehicle.precio && vehicle.precio >= Number.parseInt(minPriceFilter, 10))
    const maxPriceMatch = !maxPriceFilter || (vehicle.precio && vehicle.precio <= Number.parseInt(maxPriceFilter, 10))

    return searchMatch && typeMatch && yearMatch && capacityMatch && minPriceMatch && maxPriceMatch
  })

  // Paginación
  const indexOfLastVehicle = currentPage * vehiclesPerPage
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle)
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // La búsqueda ya se aplica automáticamente con el estado searchTerm
  }

  const handleAddVehicle = () => {
    setCurrentVehicle(null)
    setShowVehicleModal(true)
  }

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle)
    setShowVehicleModal(true)
  }

  const handleDeleteVehicle = (vehicle) => {
    setCurrentVehicle(vehicle)
    setShowDeleteModal(true)
  }

  const handleToggleActive = async (vehicle) => {
    try {
      setLoading(true)
      
      // Llamar a la API para actualizar la disponibilidad
      await vehicleService.updateVehicleAvailability(vehicle.id, !vehicle.activo)
      
      // Actualizar el estado local
      const updatedVehicles = vehicles.map((v) => {
        if (v.id === vehicle.id) {
          return { ...v, activo: !v.activo }
        }
        return v
      })
      
      setVehicles(updatedVehicles)
      setLoading(false)
    } catch (error) {
      console.error("Error updating vehicle availability:", error)
      notificationService.showError("Error al actualizar la disponibilidad del vehículo")
      setLoading(false)
    }
  }

  const handleSaveVehicle = async (vehicleData) => {
    try {
      setLoading(true);
      
      // Extract image files from the form data
      const imageFiles = vehicleData.imagenes
        .filter(img => img.file)
        .map(img => img.file);
      
      // Prepare vehicle data for the API using the correct field names
      const apiVehicleData = {
        Placa: vehicleData.placa,
        Modelo: vehicleData.modelo,
        Ano: vehicleData.anio,
        TipoVehiculo: vehicleData.tipo,
        Capacidad: vehicleData.capacidad,
        Price: vehicleData.precio,
        Disponible: true
      };
      
      let response;
      
      if (currentVehicle) {
        // Update existing vehicle
        response = await vehicleService.updateVehicle(currentVehicle.id, apiVehicleData, imageFiles);
        
        // Update local state with the response data
        if (response.success && response.data) {
          // Actualizar estado local
          const updatedVehicles = vehicles.map((vehicle) =>
            vehicle.id === currentVehicle.id 
              ? { 
                  ...vehicle, 
                  placa: response.data.Placa,
                  modelo: response.data.Modelo,
                  anio: response.data.Ano,
                  tipo: response.data.TipoVehiculo,
                  capacidad: response.data.Capacidad,
                  precio: response.data.Price
                } 
              : vehicle
          )
          
          setVehicles(updatedVehicles)
        }
      } else {
        // Create new vehicle
        response = await vehicleService.createVehicle(apiVehicleData, imageFiles);
        
        // Update local state with the response data
        if (response.success && response.data) {
          const newVehicle = {
            id: response.data.IdVehiculo,
            placa: response.data.Placa,
            modelo: response.data.Modelo,
            anio: response.data.Ano,
            tipo: response.data.TipoVehiculo || "Otro",
            capacidad: response.data.Capacidad,
            precio: response.data.Price || 0,
            activo: response.data.Disponible !== undefined ? response.data.Disponible : true,
            imagenes: response.data.Image_url ? [
              { tipo: "general", url: response.data.Image_url.image1 || "/placeholder.svg?height=200&width=300" },
              { tipo: "interior", url: response.data.Image_url.image2 || "/placeholder.svg?height=200&width=300" },
              { tipo: "lateral", url: "/placeholder.svg?height=200&width=300" },
            ] : [
              { tipo: "general", url: "/placeholder.svg?height=200&width=300" },
              { tipo: "interior", url: "/placeholder.svg?height=200&width=300" },
              { tipo: "lateral", url: "/placeholder.svg?height=200&width=300" },
            ],
          }
          
          setVehicles([...vehicles, newVehicle])
        }
      }
      
      setShowVehicleModal(false);
      setLoading(false);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      notificationService.showError("Error al guardar el vehículo");
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      
      // Llamar a la API para eliminar el vehículo
      await vehicleService.deleteVehicle(currentVehicle.id)
      
      // Actualizar estado local
      const updatedVehicles = vehicles.filter((vehicle) => vehicle.id !== currentVehicle.id)
      setVehicles(updatedVehicles)
      
      setShowDeleteModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      notificationService.showError("Error al eliminar el vehículo")
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setTypeFilter("all")
    setYearFilter("all")
    setCapacityFilter("all")
    setMinPriceFilter("")
    setMaxPriceFilter("")
  }

  // Resto del componente sin cambios
  return (
    <div className="vehicle-management">
      <div className="user-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar vehículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchIcon fontSize="small" />
            Buscar
          </button>
        </form>

        <div className="action-buttons">
          <button className="filter-toggle-button" onClick={() => setShowFilters(!showFilters)}>
            <TuneIcon fontSize="small" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          <button className="add-button" onClick={handleAddVehicle}>
            <AddIcon fontSize="small" />
            Nuevo Vehículo
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="vehicle-filters">
          <div className="filters-header">
            <h3>Filtros</h3>
            <button className="reset-filters-button" onClick={handleResetFilters}>
              Restablecer filtros
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>
                <FilterListIcon fontSize="small" /> Tipo de vehículo
              </label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Todos los tipos</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <CalendarTodayIcon fontSize="small" /> Año
              </label>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="all">Todos los años</option>
                {yearOptions.slice(1).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <AirlineSeatReclineNormalIcon fontSize="small" /> Capacidad
              </label>
              <select value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)}>
                <option value="all">Todas las capacidades</option>
                {capacityOptions.slice(1).map((capacity) => (
                  <option key={capacity} value={capacity}>
                    {capacity === "8+" ? "8 o más pasajeros" : `${capacity} pasajeros`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group price-range">
              <label>
                <AttachMoneyIcon fontSize="small" /> Rango de precio
              </label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={minPriceFilter}
                  onChange={(e) => setMinPriceFilter(e.target.value)}
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                  min={minPriceFilter || "0"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : (
        <>
          <div className="results-summary">
            <p>
              Mostrando {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehículo" : "vehículos"}
              {filteredVehicles.length !== vehicles.length && ` de ${vehicles.length} totales`}
            </p>
          </div>

          <div className="vehicles-grid">
            {currentVehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-images-grid">
                  <div className="vehicle-image main-image">
                    <img
                      src={vehicle.imagenes[0].url || "/placeholder.svg"}
                      alt={`${vehicle.modelo} - Vista general`}
                    />
                  </div>
                  <div className="vehicle-image">
                    <img src={vehicle.imagenes[1].url || "/placeholder.svg"} alt={`${vehicle.modelo} - Interior`} />
                  </div>
                  <div className="vehicle-image">
                    <img
                      src={vehicle.imagenes[2].url || "/placeholder.svg"}
                      alt={`${vehicle.modelo} - Vista lateral`}
                    />
                  </div>
                </div>
                <div className="vehicle-status-badge">
                  <span className={vehicle.activo ? "status-active" : "status-inactive"}>
                    {vehicle.activo ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <div className="vehicle-info">
                  <h3 className="vehicle-title">
                    <DirectionsCarIcon /> {vehicle.modelo}
                  </h3>
                  <p className="vehicle-plate">{vehicle.placa}</p>
                  <div className="vehicle-details">
                    <p>
                      <strong>Tipo:</strong> {vehicle.tipo}
                    </p>
                    <p>
                      <strong>Capacidad:</strong> {vehicle.capacidad} pasajeros
                    </p>
                    <p>
                      <strong>Año:</strong> {vehicle.anio}
                    </p>
                    <p>
                      <strong>Precio:</strong> ${vehicle.precio.toLocaleString()}
                    </p>
                  </div>
                  <div className="vehicle-actions">
                    <button className="action-button edit-button" onClick={() => handleEditVehicle(vehicle)}>
                      <EditIcon fontSize="small" />
                      Editar
                    </button>
                    <button className="action-button delete-button" onClick={() => handleDeleteVehicle(vehicle)}>
                      <DeleteIcon fontSize="small" />
                      Eliminar
                    </button>
                    <button
                      className={`action-button ${vehicle.activo ? "deactivate-button" : "activate-button"}`}
                      onClick={() => handleToggleActive(vehicle)}
                    >
                      {vehicle.activo ? (
                        <>
                          <BlockIcon fontSize="small" />
                          Deshabilitar
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon fontSize="small" />
                          Habilitar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="no-results">
              <p>No se encontraron vehículos con los criterios de búsqueda y filtros seleccionados.</p>
            </div>
          )}

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

      {showVehicleModal && (
        <VehicleModal vehicle={currentVehicle} onSave={handleSaveVehicle} onClose={() => setShowVehicleModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteVehicleModal
          vehicle={currentVehicle}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default VehicleManagement

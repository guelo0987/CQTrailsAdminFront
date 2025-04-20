"use client"
// Add this import at the top of your file
import { API_BASE_URL } from "../API/Endpoints.ts";
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
import ImageWithFallback from "../components/ImageWithFallback"

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
          const formattedVehicles = response.data.map(vehicle => {
            // Check if Image_url exists and has valid URLs
            let imageUrls = [
              { tipo: "general", url: "" },
              { tipo: "interior", url: "" },
              { tipo: "lateral", url: "" },
            ];
            
            if (vehicle.Image_url) {
              // If Image_url is a string, use it for the first image
              if (typeof vehicle.Image_url === 'string') {
                imageUrls[0].url = vehicle.Image_url;
              } 
              // If Image_url is an object with image1, image2, image3 properties
              else {
                if (vehicle.Image_url.image1) {
                  imageUrls[0].url = vehicle.Image_url.image1;
                }
                
                if (vehicle.Image_url.image2) {
                  imageUrls[1].url = vehicle.Image_url.image2;
                }
                
                if (vehicle.Image_url.image3) {
                  imageUrls[2].url = vehicle.Image_url.image3;
                }
              }
            }
            
            return {
              id: vehicle.IdVehiculo,
              placa: vehicle.Placa,
              modelo: vehicle.Modelo,
              anio: vehicle.Ano,
              tipo: vehicle.TipoVehiculo || "Otro",
              capacidad: vehicle.Capacidad,
              precio: vehicle.Price || 0,
              activo: vehicle.Disponible !== undefined ? vehicle.Disponible : true,
              imagenes: imageUrls,
            };
          });
          
          setVehicles(formattedVehicles);
        } else {
          notificationService.showError("Error al cargar los vehículos");
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
  // Filtrado de vehículos
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtro de búsqueda por texto
    const searchMatch = !searchTerm || (
      (vehicle.modelo && vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.placa && vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.tipo && vehicle.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Filtro por tipo de vehículo
    const typeMatch = typeFilter === "all" || (vehicle.tipo && vehicle.tipo === typeFilter)

    // Filtro por año
    let yearMatch = true
    if (yearFilter !== "all") {
      if (yearFilter === "8+") {
        yearMatch = vehicle.anio && vehicle.anio >= 8
      } else {
        // Convertir a número para comparación
        yearMatch = vehicle.anio && vehicle.anio === Number.parseInt(yearFilter, 10)
      }
    }

    // Filtro por capacidad
    let capacityMatch = true
    if (capacityFilter !== "all") {
      if (capacityFilter === "8+") {
        capacityMatch = vehicle.capacidad && vehicle.capacidad >= 8
      } else {
        // Convertir a número para comparación
        capacityMatch = vehicle.capacidad && vehicle.capacidad === Number.parseInt(capacityFilter, 10)
      }
    }

    // Filtro por rango de precio
    // Asegurarse de que los valores sean números para la comparación
    const minPrice = minPriceFilter ? Number.parseFloat(minPriceFilter) : 0;
    const maxPrice = maxPriceFilter ? Number.parseFloat(maxPriceFilter) : Infinity;
    
    // Verificar que el precio del vehículo esté dentro del rango especificado
    const priceMatch = vehicle.precio !== undefined && 
                      vehicle.precio >= minPrice && 
                      vehicle.precio <= maxPrice;

    return searchMatch && typeMatch && yearMatch && capacityMatch && priceMatch;
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

  // Update the handleSaveVehicle function to properly extract image files
  const handleSaveVehicle = async (vehicleData) => {
    try {
      setLoading(true);
      
      // Extract image files from the form data - make sure we're getting all files
      const imageFiles = vehicleData.imagenes
        .filter(img => img.file !== null)
        .map(img => ({
          index: vehicleData.imagenes.findIndex(i => i === img), // Guardar el índice original
          file: img.file
        }));
      
      // Determinar qué imágenes deben eliminarse
      const imagesToRemove = vehicleData.imagenes
        .filter(img => img.toBeRemoved === true)
        .map((img, index) => ({
          index: vehicleData.imagenes.findIndex(i => i === img),
          position: index
        }));
      
      console.log("Image files to upload:", imageFiles); // Debug log
      console.log("Images to remove:", imagesToRemove); // Debug log
      
      // Prepare vehicle data for the API using the correct field names
      const apiVehicleData = {
        Placa: vehicleData.placa,
        Modelo: vehicleData.modelo,
        Ano: vehicleData.anio,
        TipoVehiculo: vehicleData.tipo,
        Capacidad: vehicleData.capacidad,
        Price: vehicleData.precio,
        Disponible: true,
        ImagesToRemove: imagesToRemove.map(img => img.position) // Posiciones a eliminar
      };
      
      // Flag para indicar si estamos editando imágenes
      const isEditingImages = imageFiles.length > 0 || imagesToRemove.length > 0;
      
      let response;
      
      if (currentVehicle) {
        // Update existing vehicle
        const filesToUpload = imageFiles.map(f => f.file);
        
        // Siempre mantener las imágenes existentes, a menos que se indique explícitamente eliminarlas
        response = await vehicleService.updateVehicle(
          currentVehicle.id, 
          apiVehicleData, 
          filesToUpload,
          true // Siempre mantener imágenes existentes (las que no se marcan para eliminar)
        );
        
        if (response.success && response.data) {
          // Inicializamos el array con una copia profunda de las imágenes existentes
          let processedImages = JSON.parse(JSON.stringify(currentVehicle.imagenes));
          
          // Eliminar las imágenes marcadas para eliminación
          imagesToRemove.forEach(img => {
            if (img.index >= 0 && img.index < processedImages.length) {
              processedImages[img.index].url = ""; // Vaciar la URL
            }
          });
          
          // Si hay nuevas imágenes y el backend devuelve URLs
          if (isEditingImages && response.data.Image_url) {
            // Mapear las nuevas URLs a sus posiciones correspondientes
            const newUrlsMap = {};
            
            if (response.data.Image_url.image1) {
              newUrlsMap[0] = response.data.Image_url.image1;
            }
            
            if (response.data.Image_url.image2) {
              newUrlsMap[1] = response.data.Image_url.image2;
            }
            
            if (response.data.Image_url.image3) {
              newUrlsMap[2] = response.data.Image_url.image3;
            }
            
            // Actualizar solo las posiciones de las imágenes que fueron subidas
            imageFiles.forEach((imgFile, idx) => {
              const originalIndex = imgFile.index;
              
              if (newUrlsMap[idx] && originalIndex !== undefined) {
                // Solo actualizamos la URL si realmente hay una nueva
                processedImages[originalIndex].url = newUrlsMap[idx];
              }
            });
          }
          
          // Update local state with the response data
          const updatedVehicles = vehicles.map((vehicle) =>
            vehicle.id === currentVehicle.id 
              ? { 
                  ...vehicle, 
                  placa: response.data.Placa,
                  modelo: response.data.Modelo,
                  anio: response.data.Ano,
                  tipo: response.data.TipoVehiculo,
                  capacidad: response.data.Capacidad,
                  precio: response.data.Price,
                  imagenes: processedImages
                } 
              : vehicle
          );
          
          setVehicles(updatedVehicles);
        }
      } else {
        // Create new vehicle
        const filesToUpload = imageFiles.map(f => f.file);
        response = await vehicleService.createVehicle(apiVehicleData, filesToUpload);
        
        if (response.success && response.data) {
          // Process the image URLs
          let processedImages = [
            { tipo: "general", url: "" },
            { tipo: "interior", url: "" },
            { tipo: "lateral", url: "" },
          ];
          
          if (response.data.Image_url) {
            if (response.data.Image_url.image1) {
              processedImages[0].url = response.data.Image_url.image1;
            }
            
            if (response.data.Image_url.image2) {
              processedImages[1].url = response.data.Image_url.image2;
            }
            
            if (response.data.Image_url.image3) {
              processedImages[2].url = response.data.Image_url.image3;
            }
          }
          
          const newVehicle = {
            id: response.data.IdVehiculo,
            placa: response.data.Placa,
            modelo: response.data.Modelo,
            anio: response.data.Ano,
            tipo: response.data.TipoVehiculo || "Otro",
            capacidad: response.data.Capacidad,
            precio: response.data.Price || 0,
            activo: response.data.Disponible !== undefined ? response.data.Disponible : true,
            imagenes: processedImages,
          };
          
          setVehicles([...vehicles, newVehicle]);
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
                    {vehicle.imagenes && vehicle.imagenes[0] && vehicle.imagenes[0].url ? (
                      <ImageWithFallback 
                        url={vehicle.imagenes[0].url}
                        alt={`${vehicle.modelo} - Vista general`}
                        vehicleId={vehicle.id}
                        imageIndex={0}
                      />
                    ) : null}
                  </div>
                  <div className="vehicle-image">
                    {vehicle.imagenes && vehicle.imagenes[1] && vehicle.imagenes[1].url ? (
                      <ImageWithFallback 
                        url={vehicle.imagenes[1].url}
                        alt={`${vehicle.modelo} - Interior`}
                        vehicleId={vehicle.id}
                        imageIndex={1}
                      />
                    ) : null}
                  </div>
                  <div className="vehicle-image">
                    {vehicle.imagenes && vehicle.imagenes[2] && vehicle.imagenes[2].url ? (
                      <ImageWithFallback 
                        url={vehicle.imagenes[2].url}
                        alt={`${vehicle.modelo} - Vista lateral`}
                        vehicleId={vehicle.id}
                        imageIndex={2}
                      />
                    ) : null}
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
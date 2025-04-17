"use client"

import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import ImageIcon from "@mui/icons-material/Image"
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal"
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import ImageWithFallback from "../ImageWithFallback"

const VehicleModal = ({ vehicle, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    anio: new Date().getFullYear(),
    tipo: "Sedán",
    capacidad: 5,
    precio: 0,
    imagenes: [
      { tipo: "general", file: null, preview: null, originalUrl: null },
      { tipo: "interior", file: null, preview: null, originalUrl: null },
      { tipo: "lateral", file: null, preview: null, originalUrl: null },
    ],
  })
  const [errors, setErrors] = useState({})
  const [imagesComplete, setImagesComplete] = useState(false)

  const tiposVehiculo = ["Sedán", "SUV", "Hatchback", "Pickup", "Minivan", "Deportivo", "Otro"]

  useEffect(() => {
    if (vehicle) {
      // Si estamos editando, convertimos las URLs a previews y guardamos las URLs originales
      const imagenes = [
        { 
          tipo: "general", 
          file: null, 
          preview: vehicle.imagenes[0]?.url || null,
          originalUrl: vehicle.imagenes[0]?.url || null 
        },
        { 
          tipo: "interior", 
          file: null, 
          preview: vehicle.imagenes[1]?.url || null,
          originalUrl: vehicle.imagenes[1]?.url || null 
        },
        { 
          tipo: "lateral", 
          file: null, 
          preview: vehicle.imagenes[2]?.url || null,
          originalUrl: vehicle.imagenes[2]?.url || null 
        },
      ]

      setFormData({
        placa: vehicle.placa || "",
        modelo: vehicle.modelo || "",
        anio: vehicle.anio || new Date().getFullYear(),
        tipo: vehicle.tipo || "Sedán",
        capacidad: vehicle.capacidad || 5,
        precio: vehicle.precio || 0,
        imagenes,
      })

      // Verificar si hay al menos una imagen
      const hasAtLeastOneImage = imagenes.some(img => img.preview !== null);
      setImagesComplete(hasAtLeastOneImage);
    }
  }, [vehicle])

  useEffect(() => {
    // Verificar si hay al menos una imagen (archivo nuevo o URL original)
    const hasAtLeastOneImage = formData.imagenes.some(
      (img) => img.file !== null || img.originalUrl !== null
    );
    setImagesComplete(hasAtLeastOneImage);
  }, [formData.imagenes])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "anio" || name === "capacidad" || name === "precio" ? Number.parseInt(value, 10) || 0 : value,
    })
  }

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      const newImages = [...formData.imagenes];
      newImages[index] = {
        ...newImages[index],
        file: file, // Store the actual file object
        preview: reader.result,
        // Mantenemos la originalUrl para referencia
      };
      setFormData({ ...formData, imagenes: newImages });
      
      // Verificar si hay al menos una imagen (archivo nuevo o URL original)
      const hasAtLeastOneImage = newImages.some(
        (img) => img.file !== null || img.originalUrl !== null
      );
      setImagesComplete(hasAtLeastOneImage);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {}

    if (!formData.placa.trim()) {
      newErrors.placa = "La placa es requerida"
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = "El modelo es requerido"
    }

    if (!formData.anio || formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      newErrors.anio = "El año debe ser válido"
    }

    if (!formData.capacidad || formData.capacidad < 1) {
      newErrors.capacidad = "La capacidad debe ser al menos 1"
    }

    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.placa) newErrors.placa = "La placa es requerida";
    if (!formData.modelo) newErrors.modelo = "El modelo es requerido";
    if (!formData.tipo) newErrors.tipo = "El tipo de vehículo es requerido";
    if (!formData.capacidad) newErrors.capacidad = "La capacidad es requerida";
    if (!formData.precio) newErrors.precio = "El precio es requerido";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Preparar los datos para guardar
    const dataToSave = {
      ...formData,
      imagenes: formData.imagenes.map(img => {
        // Si hay un nuevo archivo, lo enviamos
        if (img.file) {
          return { 
            tipo: img.tipo, 
            file: img.file,
            url: img.originalUrl, // Mantenemos la URL original como referencia
            originalUrl: img.originalUrl,
            toBeRemoved: false
          };
        }
        // Si la imagen debe ser eliminada
        if (img.toBeRemoved) {
          return { 
            tipo: img.tipo, 
            file: null, 
            url: null,
            originalUrl: null,
            toBeRemoved: true
          };
        }
        // Si no hay nuevo archivo pero hay URL original, la mantenemos
        if (img.originalUrl) {
          return { 
            tipo: img.tipo, 
            file: null, 
            url: img.originalUrl,
            originalUrl: img.originalUrl,
            toBeRemoved: false
          };
        }
        // Si no hay archivo ni URL original, es un espacio vacío
        return { 
          tipo: img.tipo, 
          file: null,
          url: null,
          originalUrl: null,
          toBeRemoved: false
        };
      })
    };
    
    // Pass the complete form data including images to the parent component
    onSave(dataToSave);
  };

  const getImageIcon = (tipo) => {
    switch (tipo) {
      case "general":
        return <ImageIcon />
      case "interior":
        return <AirlineSeatReclineNormalIcon />
      case "lateral":
        return <DirectionsCarFilledIcon />
      default:
        return <ImageIcon />
    }
  }

  const getImageLabel = (tipo) => {
    switch (tipo) {
      case "general":
        return "Vista General"
      case "interior":
        return "Interior"
      case "lateral":
        return "Vista Lateral"
      default:
        return "Imagen"
    }
  }

  // Función para eliminar la imagen cargada o seleccionada
  const handleRemoveImage = (index) => {
    const newImages = [...formData.imagenes];
    newImages[index] = {
      ...newImages[index],
      file: null,
      preview: null,
      // Marcamos explícitamente que la imagen debe ser eliminada
      originalUrl: null,
      toBeRemoved: true // Nueva bandera para marcar explícitamente la eliminación
    };
    setFormData({ ...formData, imagenes: newImages });
    
    // Verificar si hay al menos una imagen (archivo nuevo o URL original)
    const hasAtLeastOneImage = newImages.some(
      (img) => img.file !== null || (img.originalUrl !== null && !img.toBeRemoved)
    );
    setImagesComplete(hasAtLeastOneImage);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal vehicle-modal">
        <div className="modal-header">
          <h2 className="modal-title">{vehicle ? "Editar Vehículo" : "Nuevo Vehículo"}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="placa">Placa</label>
                <input
                  id="placa"
                  name="placa"
                  type="text"
                  value={formData.placa}
                  onChange={handleChange}
                  placeholder="ABC123"
                />
                {errors.placa && <span className="error-message">{errors.placa}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="anio">Año</label>
                <input
                  id="anio"
                  name="anio"
                  type="number"
                  value={formData.anio}
                  onChange={handleChange}
                  placeholder="2023"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.anio && <span className="error-message">{errors.anio}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modelo">Modelo</label>
                <input
                  id="modelo"
                  name="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Toyota Corolla"
                />
                {errors.modelo && <span className="error-message">{errors.modelo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio (USD)</label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="25000"
                  min="0"
                />
                {errors.precio && <span className="error-message">{errors.precio}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Vehículo</label>
                <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                  {tiposVehiculo.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="capacidad">Capacidad (pasajeros)</label>
                <input
                  id="capacidad"
                  name="capacidad"
                  type="number"
                  value={formData.capacidad}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                />
                {errors.capacidad && <span className="error-message">{errors.capacidad}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Imágenes del Vehículo</label>
              <p className="image-help-text">Se requiere al menos una imagen. Puede dejar las imágenes actuales o cargar nuevas.</p>
              {errors.imagenes && <span className="error-message">{errors.imagenes}</span>}

              <style jsx>{`
                .remove-image-button {
                  position: absolute;
                  top: 5px;
                  right: 5px;
                  background-color: rgba(255, 0, 0, 0.7);
                  color: white;
                  border: none;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  font-size: 16px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10;
                }
                
                .remove-image-button:hover {
                  background-color: rgba(255, 0, 0, 0.9);
                }
                
                .image-upload-preview {
                  position: relative;
                  width: 100%;
                  height: 160px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                  border-radius: 8px;
                  margin-bottom: 10px;
                  background-color: #f0f0f0;
                  border: 1px solid #ddd;
                }
                
                .image-upload-preview img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                  display: block;
                  margin: auto;
                }
                
                .image-upload-preview .drive-preview-container {
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                }
                
                .image-upload-container {
                  flex: 1;
                  min-width: 150px;
                  margin: 0 5px;
                }
                
                .vehicle-images-upload {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 15px;
                  margin-bottom: 15px;
                }
                
                .image-upload-label {
                  display: block;
                  text-align: center;
                  cursor: pointer;
                  padding: 10px;
                  border-radius: 8px;
                  background-color: #f9f9f9;
                  transition: all 0.3s ease;
                }
                
                .image-upload-label:hover {
                  background-color: #f0f0f0;
                }
                
                .image-upload-input {
                  display: none;
                }
                
                .select-image-button {
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  text-align: center;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  transition: background-color 0.3s;
                  width: 100%;
                  margin-top: 5px;
                }
                
                .select-image-button:hover {
                  background-color: #45a049;
                }
                
                .no-image {
                  color: #999;
                  font-size: 14px;
                  padding: 20px;
                }
              `}</style>
              
              <div className="vehicle-images-upload">
                {formData.imagenes.map((imagen, index) => (
                  <div key={imagen.tipo} className="image-upload-container">
                    <label htmlFor={`imagen-${imagen.tipo}`} className="image-upload-label">
                      {getImageIcon(imagen.tipo)}
                      <span>{getImageLabel(imagen.tipo)}</span>
                      <div className="image-upload-preview">
                        {(imagen.preview || imagen.originalUrl) ? (
                          <>
                            {/* Si hay un preview de archivo nuevo, mostramos ese */}
                            {imagen.preview ? (
                              <img
                                src={imagen.preview}
                                alt={`Vista previa - ${getImageLabel(imagen.tipo)}`}
                              />
                            ) : imagen.originalUrl ? (
                              /* Si no hay preview pero sí url original, usamos ImageWithFallback */
                              <ImageWithFallback 
                                url={imagen.originalUrl}
                                alt={`${getImageLabel(imagen.tipo)}`}
                              />
                            ) : null}
                            
                            {/* Botón para eliminar la imagen */}
                            {(imagen.preview || imagen.originalUrl) && (
                              <button 
                                type="button" 
                                className="remove-image-button"
                                onClick={() => handleRemoveImage(index)}
                              >
                                ×
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="no-image">Sin imagen</div>
                        )}
                      </div>
                      <input
                        type="file"
                        id={`imagen-${imagen.tipo}`}
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="image-upload-input"
                      />
                      <button type="button" className="select-image-button">
                        Seleccionar imagen
                      </button>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-submit">
              {vehicle ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VehicleModal

"use client"

import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"

const ReservationStatusModal = ({ reservation, onSave, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(reservation.Estado)
  const [motivoRechazo, setMotivoRechazo] = useState(reservation.MotivoRechazo || "")
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar si se requiere motivo de rechazo
    if (selectedStatus === "Denegada" && !motivoRechazo.trim()) {
      setErrors({ motivoRechazo: "El motivo de rechazo es requerido" })
      return
    }

    onSave(selectedStatus, motivoRechazo)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Cambiar Estado de Reservación</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>
              Reservación #{reservation.IdReservacion} -
              {reservation.Usuario ? ` ${reservation.Usuario.nombre} ${reservation.Usuario.apellido}` : ""}
            </p>

            <div className="form-group">
              <label htmlFor="status">Seleccionar Estado</label>
              <div className="status-options">
                <label className={`status-option ${selectedStatus === "Pendiente" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Pendiente"
                    checked={selectedStatus === "Pendiente"}
                    onChange={() => setSelectedStatus("Pendiente")}
                  />
                  <HourglassEmptyIcon />
                  <span>Pendiente</span>
                </label>

                <label className={`status-option ${selectedStatus === "Aprobada" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Aprobada"
                    checked={selectedStatus === "Aprobada"}
                    onChange={() => setSelectedStatus("Aprobada")}
                  />
                  <CheckCircleIcon />
                  <span>Aprobada</span>
                </label>

                <label className={`status-option ${selectedStatus === "Denegada" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Denegada"
                    checked={selectedStatus === "Denegada"}
                    onChange={() => setSelectedStatus("Denegada")}
                  />
                  <CancelIcon />
                  <span>Denegada</span>
                </label>
              </div>
            </div>

            {selectedStatus === "Denegada" && (
              <div className="form-group">
                <label htmlFor="motivoRechazo">Motivo de Rechazo</label>
                <textarea
                  id="motivoRechazo"
                  name="motivoRechazo"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ingrese el motivo por el cual se rechaza la reservación"
                  rows={4}
                ></textarea>
                {errors.motivoRechazo && <span className="error-message">{errors.motivoRechazo}</span>}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`modal-submit ${selectedStatus === "Denegada" ? "modal-danger" : ""}`}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationStatusModal

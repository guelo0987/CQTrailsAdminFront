"use client"

import CloseIcon from "@mui/icons-material/Close"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import PersonIcon from "@mui/icons-material/Person"
import BusinessIcon from "@mui/icons-material/Business"
import RouteIcon from "@mui/icons-material/Route"
import DescriptionIcon from "@mui/icons-material/Description"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import LocationOnIcon from "@mui/icons-material/LocationOn"

const ReservationDetailModal = ({ reservation, onClose, formatDate }) => {
  // Obtener clase de estado para el estilo
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

  return (
    <div className="modal-backdrop">
      <div className="modal reservation-detail-modal">
        <div className="modal-header">
          <h2 className="modal-title">Detalles de la Reservación #{reservation.IdReservacion}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <div className="reservation-detail-status">
            <span className={`reservation-status ${getStatusClass(reservation.Estado)}`}>{reservation.Estado}</span>
          </div>

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <PersonIcon /> Información del Cliente
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">Cliente:</span>
                <span className="detail-value">
                  {reservation.Usuario ? `${reservation.Usuario.nombre} ${reservation.Usuario.apellido}` : "N/A"}
                </span>
              </div>
              {reservation.Empleado && (
                <div className="detail-info-item">
                  <span className="detail-label">Empleado asignado:</span>
                  <span className="detail-value">
                    {`${reservation.Empleado.nombre} ${reservation.Empleado.apellido}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <BusinessIcon /> Empresa
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{reservation.Empresa?.Nombre || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <LocationOnIcon /> Origen y Destino
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">Ciudad Origen:</span>
                <span className="detail-value">{reservation.CiudadOrigen?.Nombre || "N/A"}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">Ciudad Destino:</span>
                <span className="detail-value">{reservation.CiudadDestino?.Nombre || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <CalendarMonthIcon /> Fechas
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">Fecha de reservación:</span>
                <span className="detail-value">{formatDate(reservation.FechaReservacion)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">Fecha de inicio:</span>
                <span className="detail-value">{formatDate(reservation.FechaInicio)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">Fecha de fin:</span>
                <span className="detail-value">{formatDate(reservation.FechaFin)}</span>
              </div>
              {reservation.FechaConfirmacion && (
                <div className="detail-info-item">
                  <span className="detail-label">Fecha de confirmación:</span>
                  <span className="detail-value">{formatDate(reservation.FechaConfirmacion)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <RouteIcon /> Detalles del Viaje
            </h3>
            <div className="detail-info-grid">
              {reservation.RutaPersonalizada && (
                <div className="detail-info-item">
                  <span className="detail-label">Ruta personalizada:</span>
                  <span className="detail-value">{reservation.RutaPersonalizada}</span>
                </div>
              )}
              {reservation.RequerimientosAdicionales && (
                <div className="detail-info-item">
                  <span className="detail-label">Requerimientos adicionales:</span>
                  <span className="detail-value">{reservation.RequerimientosAdicionales}</span>
                </div>
              )}
            </div>
          </div>

          {reservation.MotivoRechazo && (
            <div className="reservation-detail-section">
              <h3 className="detail-section-title">
                <DescriptionIcon /> Motivo de Rechazo
              </h3>
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-value rejection-reason">{reservation.MotivoRechazo}</span>
                </div>
              </div>
            </div>
          )}

          <div className="reservation-detail-section">
            <h3 className="detail-section-title">
              <AttachMoneyIcon /> Información de Pago
            </h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-label">Subtotal:</span>
                <span className="detail-value">${reservation.SubTotal?.toLocaleString() || "0"}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-label">Total:</span>
                <span className="detail-value total-price">${reservation.Total?.toLocaleString() || "0"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationDetailModal

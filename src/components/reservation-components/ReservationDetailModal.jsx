"use client"

import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import PersonIcon from "@mui/icons-material/Person"
import BusinessIcon from "@mui/icons-material/Business"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import EventIcon from "@mui/icons-material/Event"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import DescriptionIcon from "@mui/icons-material/Description"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import InfoIcon from "@mui/icons-material/Info"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import BadgeIcon from "@mui/icons-material/Badge"
import "./ReservationDetailModal.css"

const ReservationDetailModal = ({ reservation, onClose, formatDate }) => {
  const [activeTab, setActiveTab] = useState("general")

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completada":
      case "aprobada":
      case "aceptada":
        return "status-completed"
      case "pendiente":
        return "status-pending"
      case "rechazada":
      case "denegada":
        return "status-rejected"
      default:
        return ""
    }
  }

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Format datetime for display
  const formatDisplayDateTime = (dateString) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content reservation-detail-modal">
        <div className="modal-header">
          <h2>Detalles de Reservación #{reservation.IdReservacion}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="reservation-detail-status">
          <span className={`reservation-status ${getStatusClass(reservation.Estado)}`}>
            {reservation.Estado}
          </span>
          <div className="reservation-id">ID: {reservation.IdReservacion}</div>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <EventIcon /> Información General
          </button>
          <button
            className={`tab-button ${activeTab === "client" ? "active" : ""}`}
            onClick={() => setActiveTab("client")}
          >
            <PersonIcon /> Cliente
          </button>
          <button
            className={`tab-button ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            <AttachMoneyIcon /> Pago y Facturación
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "general" && (
            <>
              <div className="reservation-detail-section">
                <div className="detail-section-title">
                  <CalendarMonthIcon /> Fechas
                </div>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Fecha de Inicio:</span>
                    <span className="detail-value highlight-value">{formatDisplayDateTime(reservation.FechaInicio)}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Fecha de Fin:</span>
                    <span className="detail-value highlight-value">{formatDisplayDateTime(reservation.FechaFin)}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Fecha de Reservación:</span>
                    <span className="detail-value">{formatDisplayDateTime(reservation.FechaReservacion)}</span>
                  </div>
                  {reservation.FechaConfirmacion && (
                    <div className="detail-info-item">
                      <span className="detail-label">Fecha de Confirmación:</span>
                      <span className="detail-value">{formatDisplayDateTime(reservation.FechaConfirmacion)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="reservation-detail-section">
                <div className="detail-section-title">
                  <LocationOnIcon /> Ubicación
                </div>
                <div className="location-container">
                  <div className="city-card start-city">
                    <div className="city-card-header">Ciudad de Origen</div>
                    <div className="city-card-content">
                      <div className="city-name">
                        {reservation.CiudadInicio?.Nombre || "No especificada"}
                      </div>
                      <div className="city-state">
                        {reservation.CiudadInicio?.Estado || ""}
                      </div>
                      <div className="city-id">ID: {reservation.ciudadinicioid}</div>
                    </div>
                  </div>
                  
                  <div className="route-arrow">→</div>
                  
                  <div className="city-card end-city">
                    <div className="city-card-header">Ciudad de Destino</div>
                    <div className="city-card-content">
                      <div className="city-name">
                        {reservation.CiudadFin?.Nombre || "No especificada"}
                      </div>
                      <div className="city-state">
                        {reservation.CiudadFin?.Estado || ""}
                      </div>
                      <div className="city-id">ID: {reservation.ciudadfinid}</div>
                    </div>
                  </div>
                </div>
                
                {reservation.RutaPersonalizada && (
                  <div className="detail-info-item full-width custom-route">
                    <span className="detail-label">Ruta Personalizada:</span>
                    <span className="detail-value route-description">{reservation.RutaPersonalizada}</span>
                  </div>
                )}
              </div>

              {reservation.RequerimientosAdicionales && (
                <div className="reservation-detail-section">
                  <div className="detail-section-title">
                    <DescriptionIcon /> Requerimientos Adicionales
                  </div>
                  <div className="detail-info-item full-width">
                    <span className="detail-value requirements-text">{reservation.RequerimientosAdicionales}</span>
                  </div>
                </div>
              )}

              {(reservation.Estado === "Denegada" || reservation.Estado === "Rechazada") && reservation.MotivoRechazo && (
                <div className="reservation-detail-section rejection-section">
                  <div className="detail-section-title rejection-title">
                    <InfoIcon /> Motivo de Rechazo
                  </div>
                  <div className="detail-info-item full-width">
                    <span className="detail-value rejection-reason">{reservation.MotivoRechazo}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "client" && (
            <>
              {reservation.Usuario && (
                <div className="reservation-detail-section user-section">
                  <div className="detail-section-title">
                    <PersonIcon /> Información del Cliente
                  </div>
                  <div className="user-card">
                    <div className="user-avatar">
                      <div className="avatar-placeholder">
                        {reservation.Usuario.Nombre?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div className="user-details">
                      <h3 className="user-name">{`${reservation.Usuario.Nombre || ""} ${reservation.Usuario.Apellido || ""}`}</h3>
                      <div className="user-contact">
                        <div className="user-contact-item">
                          <EmailIcon /> {reservation.Usuario.Email || "No disponible"}
                        </div>
                        <div className="user-contact-item">
                          <BadgeIcon /> ID: {reservation.Usuario.IdUsuario}
                        </div>
                        <div className="user-contact-item">
                          <AccessTimeIcon /> Registrado: {formatDisplayDate(reservation.Usuario.FechaRegistro)}
                        </div>
                        <div className="user-status-badge">
                          {reservation.Usuario.Activo ? "Activo" : "Inactivo"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reservation.Empresa && (
                <div className="reservation-detail-section">
                  <div className="detail-section-title">
                    <BusinessIcon /> Información de la Empresa
                  </div>
                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <span className="detail-label">Nombre:</span>
                      <span className="detail-value">{reservation.Empresa.Nombre}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-label">ID de Empresa:</span>
                      <span className="detail-value">{reservation.IdEmpresa}</span>
                    </div>
                  </div>
                </div>
              )}

              {reservation.Empleado && (
                <div className="reservation-detail-section">
                  <div className="detail-section-title">
                    <PersonIcon /> Información del Empleado
                  </div>
                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <span className="detail-label">ID de Empleado:</span>
                      <span className="detail-value">{reservation.IdEmpleado}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "payment" && (
            <div className="reservation-detail-section payment-section">
              <div className="detail-section-title">
                <AttachMoneyIcon /> Información de Pago
              </div>
              
              <div className="payment-card">
                <div className="payment-header">Resumen de Facturación</div>
                <div className="payment-details">
                  <div className="payment-row">
                    <span>Subtotal:</span>
                    <span>${reservation.SubTotal?.toLocaleString('es-ES', {minimumFractionDigits: 2}) || "0.00"}</span>
                  </div>
                  <div className="payment-row">
                    <span>Impuestos:</span>
                    <span>${((reservation.Total || 0) - (reservation.SubTotal || 0)).toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="payment-row total">
                    <span>Total:</span>
                    <span>${reservation.Total?.toLocaleString('es-ES', {minimumFractionDigits: 2}) || "0.00"}</span>
                  </div>
                </div>
              </div>
              
              <div className="payment-status">
                <div className="payment-status-label">Estado de Pago:</div>
                <div className={`payment-status-value ${reservation.Estado === "Aprobada" ? "paid" : "pending"}`}>
                  {reservation.Estado === "Aprobada" ? "Pagado" : "Pendiente"}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className={`status-action-button ${getStatusClass(reservation.Estado)}`} 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationDetailModal

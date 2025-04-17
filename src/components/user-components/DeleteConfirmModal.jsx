"use client"

import CloseIcon from "@mui/icons-material/Close"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import "../user-components/UserModal.css" // Reutilizamos los estilos generales

const DeleteConfirmModal = ({ user, onConfirm, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <div className="delete-warning">
            <DeleteForeverIcon className="delete-icon" />
            <p>¿Estás seguro de que deseas eliminar al usuario:</p>
            <p className="user-to-delete">{user?.Nombre} {user?.Apellido}</p>
            <p className="delete-warning-text">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-delete" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal


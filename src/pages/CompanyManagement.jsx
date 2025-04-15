"use client"

import { useState, useEffect } from "react"
import CompanyModal from "../components/company-components/CompanyModal"
import DeleteCompanyModal from "../components/company-components/DeleteCompanyModal"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import BlockIcon from "@mui/icons-material/Block"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BusinessIcon from "@mui/icons-material/Business"
import { companyService } from "../Services/CompanyService.ts"
import { notificationService } from "../Utils/notificationService.ts"

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentCompany, setCurrentCompany] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [companiesPerPage] = useState(10)

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await companyService.getCompanies()
        
        if (response.success && response.data) {
          // Transform data to match the expected format if needed
          const formattedCompanies = response.data.map(company => ({
            id: company.IdEmpresa,
            Nombre: company.Nombre,
            ContactoEmail: company.ContactoEmail,
            ContactoTelefono: company.ContactoTelefono,
            Activo: company.Activo
          }))
          setCompanies(formattedCompanies)
        } else {
          notificationService.showError("Error al cargar las empresas")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching companies:", error)
        notificationService.showError("Error al cargar las empresas")
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Filtrar empresas por búsqueda
  const filteredCompanies = companies.filter(
    (company) =>
      company.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ContactoEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ContactoTelefono.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginación
  const indexOfLastCompany = currentPage * companiesPerPage
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany)
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage)

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault()
    // La búsqueda ya se aplica automáticamente con el estado searchTerm
  }

  // Removing handleAddCompany function since we don't need it anymore

  const handleEditCompany = (company) => {
    setCurrentCompany(company)
    setShowCompanyModal(true)
  }

  const handleDeleteCompany = (company) => {
    setCurrentCompany(company)
    setShowDeleteModal(true)
  }

  const handleToggleActive = async (company) => {
    try {
      setLoading(true)
      
      // Prepare company data for update
      const companyData = {
        nombre: company.Nombre,
        email: company.ContactoEmail,
        telefono: company.ContactoTelefono,
        activo: !company.Activo
      }
      
      // Call API to update company
      await companyService.updateCompany(company.id, companyData)
      
      // Update local state
      const updatedCompanies = companies.map((c) => {
        if (c.id === company.id) {
          return { ...c, Activo: !c.Activo }
        }
        return c
      })
      
      setCompanies(updatedCompanies)
      setLoading(false)
    } catch (error) {
      console.error("Error updating company status:", error)
      notificationService.showError("Error al actualizar el estado de la empresa")
      setLoading(false)
    }
  }

  const handleSaveCompany = async (companyData) => {
    try {
      setLoading(true)
      
      // Prepare company data for API
      const apiCompanyData = {
        nombre: companyData.Nombre,
        email: companyData.ContactoEmail,
        telefono: companyData.ContactoTelefono,
        direccion: companyData.Direccion || "",
        activo: true
      }
      
      if (currentCompany) {
        // Update existing company
        await companyService.updateCompany(currentCompany.id, apiCompanyData)
        
        // Update local state
        const updatedCompanies = companies.map((company) =>
          company.id === currentCompany.id 
            ? { 
                ...company, 
                Nombre: companyData.Nombre,
                ContactoEmail: companyData.ContactoEmail,
                ContactoTelefono: companyData.ContactoTelefono
              } 
            : company
        )
        
        setCompanies(updatedCompanies)
      } else {
        // Create new company
        const response = await companyService.createCompany(apiCompanyData)
        
        if (response.success && response.data) {
          const newCompany = {
            id: response.data.IdEmpresa,
            Nombre: response.data.Nombre,
            ContactoEmail: response.data.Email,
            ContactoTelefono: response.data.Telefono,
            Activo: response.data.Activo || true
          }
          
          setCompanies([...companies, newCompany])
        }
      }
      
      setShowCompanyModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error saving company:", error)
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      
      // Call API to delete company
      await companyService.deleteCompany(currentCompany.id)
      
      // Update local state
      const updatedCompanies = companies.filter((company) => company.id !== currentCompany.id)
      setCompanies(updatedCompanies)
      
      setShowDeleteModal(false)
      setLoading(false)
    } catch (error) {
      console.error("Error deleting company:", error)
      notificationService.showError("Error al eliminar la empresa")
      setLoading(false)
    }
  }

  return (
    <div className="company-management">
      <div className="user-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchIcon fontSize="small" />
            Buscar
          </button>
        </form>
        {/* Removing the "Nueva Empresa" button */}
      </div>

      {loading ? (
        <p>Cargando empresas...</p>
      ) : (
        <>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email de Contacto</th>
                <th>Teléfono de Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.map((company) => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BusinessIcon fontSize="small" style={{ color: "var(--primary-color)" }} />
                      {company.Nombre}
                    </div>
                  </td>
                  <td>{company.ContactoEmail}</td>
                  <td>{company.ContactoTelefono}</td>
                  <td>
                    <span className={`user-status ${company.Activo ? "active" : "inactive"}`}>
                      {company.Activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions-cell">
                      <button className="action-button edit-button" onClick={() => handleEditCompany(company)}>
                        <EditIcon fontSize="small" />
                        Editar
                      </button>
                      <button className="action-button delete-button" onClick={() => handleDeleteCompany(company)}>
                        <DeleteIcon fontSize="small" />
                        Eliminar
                      </button>
                      <button
                        className={`action-button ${company.Activo ? "deactivate-button" : "activate-button"}`}
                        onClick={() => handleToggleActive(company)}
                      >
                        {company.Activo ? (
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

      {showCompanyModal && (
        <CompanyModal company={currentCompany} onSave={handleSaveCompany} onClose={() => setShowCompanyModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteCompanyModal
          company={currentCompany}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default CompanyManagement

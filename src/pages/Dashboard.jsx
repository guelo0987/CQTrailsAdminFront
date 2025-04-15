"use client"

import { useState, useEffect } from "react"
import {
  CalendarToday,
  DirectionsCar,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  Business,
} from "@mui/icons-material"
import { userService } from "../Services/UserService.ts"
import { companyService } from "../Services/CompanyService.ts"
import { vehicleService } from "../Services/VehicleService.ts"
import { reservationService } from "../Services/ReservationService.ts"

// Componente para las tarjetas de estadísticas
const StatCard = ({ icon, title, value, color, bgColor }) => (
  <div
    className="stat-card"
    style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "1.25rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius: "8px",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>{title}</h3>
    </div>
    <p
      style={{
        fontSize: "1.75rem",
        fontWeight: "bold",
        color: color,
        margin: "0.5rem 0 0 0",
      }}
    >
      {value}
    </p>
  </div>
)

// Componente para el gráfico de barras semanal
const WeeklyBarChart = ({ data }) => {
  const maxValue = Math.max(...data.values) + 5

  return (
    <div className="chart-container">
      <h3 className="chart-title">Reservas de la Semana</h3>
      <div className="chart-bars">
        {data.labels.map((day, index) => (
          <div key={day} className="chart-bar-container">
            <div className="chart-bar-label">{day}</div>
            <div className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{
                  height: `${(data.values[index] / maxValue) * 100}%`,
                  backgroundColor: "#008f39",
                }}
              ></div>
            </div>
            <div className="chart-bar-value">{data.values[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para el gráfico circular
const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativeAngle = 0
  const gradientStops = data.flatMap((item) => {
    const angle = (item.value / total) * 360
    const start = cumulativeAngle
    cumulativeAngle += angle
    return [`${item.color} ${start}deg`, `${item.color} ${cumulativeAngle}deg`]
  }).join(', ')

  const pieStyle = {
    background: `conic-gradient(${gradientStops})`,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  }

  return (
    <div className="pie-chart-container">
      <h3 className="chart-title">Distribución de Vehículos</h3>
      <div className="pie-chart-wrapper">
        <div className="pie-chart" style={pieStyle}></div>
      </div>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <div className="legend-label">{item.label}</div>
            <div className="legend-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Dashboard = () => {
  // Estado para los datos simulados
  const [weeklyData, setWeeklyData] = useState({
    labels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    values: [0, 0, 0, 0, 0, 0, 0],
  })

  const [vehicleDistribution, setVehicleDistribution] = useState([
    { label: "Sedán", value: 18, color: "#008f39" },
    { label: "SUV", value: 12, color: "#00bf4c" },
    { label: "Van", value: 8, color: "#4caf50" },
    { label: "Minibús", value: 4, color: "#8bc34a" },
  ])

  // Move all state declarations to the top level of the component
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State for counters
  const [totalUsers, setTotalUsers] = useState(0)
  const [registeredCompanies, setRegisteredCompanies] = useState(0)
  const [availableVehicles, setAvailableVehicles] = useState(0)
  const [activeReservations, setActiveReservations] = useState(0)
  
  // New state for dashboard statistics
  const [weeklyGrowth, setWeeklyGrowth] = useState({
    percentage: 0,
    formattedPercentage: "0%",
    message: "",
    currentWeekCount: 0,
    previousWeekCount: 0
  })
  const [mostReservedVehicle, setMostReservedVehicle] = useState({
    model: "No data",
    plate: "",
    type: "",
    totalReservations: 0
  })
  const [popularDestination, setPopularDestination] = useState("No data")
  const [totalReservations, setTotalReservations] = useState(0)

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Cargar datos reales desde la API
  // Update the useEffect function to fetch vehicle type data
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard statistics
        const dashboardStatsResponse = await reservationService.getDashboardStats()
        
        const dashboardStats = dashboardStatsResponse.data || {}
        
        // Update weekly growth data
        if (dashboardStats.crecimiento_semanal) {
          setWeeklyGrowth({
            percentage: dashboardStats.crecimiento_semanal.porcentaje,
            formattedPercentage: dashboardStats.crecimiento_semanal.porcentaje_formateado,
            message: dashboardStats.crecimiento_semanal.mensaje,
            currentWeekCount: dashboardStats.crecimiento_semanal.current_week_count,
            previousWeekCount: dashboardStats.crecimiento_semanal.previous_week_count
          })
        }
        
        // Fetch weekly reservations data
        const weeklyReservationsResponse = await reservationService.getWeeklyReservations()
        
        if (weeklyReservationsResponse.success && weeklyReservationsResponse.data) {
          const weeklyReservationsData = weeklyReservationsResponse.data
          
          // Extract day names and reservation counts
          const labels = weeklyReservationsData.dias.map(day => {
            // Shorten day names to 3 letters
            const shortDayName = day.dia.substring(0, 3)
            return shortDayName
          })
          
          const values = weeklyReservationsData.dias.map(day => day.total_reservaciones)
          
          // Update weekly data state
          setWeeklyData({
            labels,
            values
          })
        }
        
        // Fetch vehicle type count data
        const vehicleTypeCountResponse = await vehicleService.getVehicleTypeCount()
        
        if (vehicleTypeCountResponse.success && vehicleTypeCountResponse.data) {
          const vehicleTypeData = vehicleTypeCountResponse.data
          
          // Transform the data for the pie chart
          const colors = ["#008f39", "#00bf4c", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107"]
          
          const vehicleDistributionData = Object.entries(vehicleTypeData).map(([type, count], index) => ({
            label: type,
            value: count,
            color: colors[index % colors.length]
          }))
          
          // Update vehicle distribution state
          setVehicleDistribution(vehicleDistributionData)
        }
        
        // Update most reserved vehicle
        if (dashboardStats.vehiculo_mas_reservado) {
          setMostReservedVehicle({
            model: dashboardStats.vehiculo_mas_reservado.modelo,
            plate: dashboardStats.vehiculo_mas_reservado.placa,
            type: dashboardStats.vehiculo_mas_reservado.tipo_vehiculo,
            totalReservations: dashboardStats.vehiculo_mas_reservado.total_reservas
          })
        }
        
        // Update popular destination
        setPopularDestination(dashboardStats.destino_popular || "La Ciudad de Santo Domingo")
        
        // Update total reservations
        setTotalReservations(dashboardStats.total_reservaciones || 0)
        
        // Fetch recent reservations (limit to 5)
        const recentReservationsResponse = await reservationService.getReservations({
          limit: 5,
        })
        
        
        // Extract the data array from the response
        const recentReservations = recentReservationsResponse.data || []
        
        // Fetch registered users
        const registeredUsersResponse = await userService.getUsers()
        const registeredUsers = registeredUsersResponse.data || []
        
        // Fetch registered companies
        const registeredCompaniesResponse = await companyService.getCompanies()
        const registeredCompanies = registeredCompaniesResponse.data || []
        
        // Fetch vehicles
        const vehiclesResponse = await vehicleService.getVehicles()
        const vehicles = vehiclesResponse.data || []
        
        // Calculate statistics
        setTotalUsers(registeredUsers.length)
        setRegisteredCompanies(registeredCompanies.length)
        setAvailableVehicles(
          vehicles.filter((vehicle) => vehicle.Disponible === true).length
        )
        setActiveReservations(
          recentReservations.filter(
            (reservation) => reservation.Estado === "Pendiente"
          ).length
        )
        
        // Format recent reservations for display
        const formattedReservations = recentReservations.map((reservation) => {
          // Find the user who made the reservation
          const user = registeredUsers.find(
            (user) => user.IdUsuario === reservation.IdUsuario
          )
          
          return {
            id: reservation.IdReservacion,
            date: formatDate(reservation.FechaReservacion),
            status: reservation.Estado,
            userName: user
              ? `${user.Nombre} ${user.Apellido}`
              : "Usuario Desconocido",
            // Add placeholder data for table display
            cliente: user ? `${user.Nombre} ${user.Apellido}` : "Usuario Desconocido",
            origen: `${reservation.Origen}`,
            destino: `${reservation.Destino}`,
            fecha: formatDate(reservation.FechaInicio),
            hora: new Date(reservation.FechaInicio).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            estado: reservation.Estado
          }
        })
        
        setRecentReservations(formattedReservations)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData();
  }, []);

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmada":
        return { bg: "#e6f7ed", text: "#28a745", icon: <CheckCircle style={{ color: "#28a745" }} /> }
      case "En Proceso":
        return { bg: "#fff8e6", text: "#ffc107", icon: <Schedule style={{ color: "#ffc107" }} /> }
      case "Pendiente":
        return { bg: "#f8f9fa", text: "#6c757d", icon: <Schedule style={{ color: "#6c757d" }} /> }
      case "Cancelada":
        return { bg: "#feebee", text: "#dc3545", icon: <Warning style={{ color: "#dc3545" }} /> }
      default:
        return { bg: "#f8f9fa", text: "#6c757d", icon: null }
    }
  }

  return (
    <div className="dashboard-container">
      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <StatCard
          icon={<Person style={{ color: "green" }} />}
          title="Usuarios Activos"
          value={totalUsers.toString()}
          color="#008f39"
          bgColor="rgba(0, 143, 57, 0.1)"
        />
        <StatCard
          icon={<Business style={{ color: "green" }} />}
          title="Empresas Registradas"
          value={registeredCompanies.toString()}
          color="#008f39"
          bgColor="rgba(0, 143, 57, 0.1)"
        />
        <StatCard
          icon={<DirectionsCar style={{ color: "green" }} />}
          title="Vehículos Disponibles"
          value={availableVehicles.toString()}
          color="#008f39"
          bgColor="rgba(0, 143, 57, 0.1)"
        />
        <StatCard
          icon={<CalendarToday style={{ color: "green" }} />}
          title="Reservas Totales"
          value={totalReservations.toString()}
          color="#008f39"
          bgColor="rgba(0, 143, 57, 0.1)"
        />
      </div>

      {/* Resumen de Actividad */}
      <div className="activity-summary">
          <div className="section-header">
            <h2 className="section-title">Resumen de Actividad</h2>
          </div>

          <div className="activity-cards">
            <div className="activity-card">
              <div className="activity-icon" style={{ backgroundColor: "rgba(0, 143, 57, 0.1)" }}>
                <TrendingUp style={{ color: weeklyGrowth.percentage >= 0 ? "#008f39" : "#dc3545" }} />
              </div>
              <div className="activity-content">
                <h3>Crecimiento Semanal</h3>
                <p className="activity-value" style={{ color: weeklyGrowth.percentage >= 0 ? "#008f39" : "#dc3545" }}>
                  {weeklyGrowth.formattedPercentage}
                </p>
                <p className="activity-description">{weeklyGrowth.message}</p>
              </div>
            </div>

            <div className="activity-card">
              <div className="activity-icon" style={{ backgroundColor: "rgba(25, 118, 210, 0.1)" }}>
                <DirectionsCar style={{ color: "#1976d2" }} />
              </div>
              <div className="activity-content">
                <h3>Vehículo Más Reservado</h3>
                <p className="activity-value">{mostReservedVehicle.model}</p>
                <p className="activity-description">
                  {mostReservedVehicle.totalReservations > 0 
                    ? `${mostReservedVehicle.totalReservations} reservas (${mostReservedVehicle.type})`
                    : "No hay datos suficientes"}
                </p>
              </div>
            </div>

            <div className="activity-card">
              <div className="activity-icon" style={{ backgroundColor: "rgba(255, 152, 0, 0.1)" }}>
                <LocationOn style={{ color: "#ff9800" }} />
              </div>
              <div className="activity-content">
                <h3>Destino Popular</h3>
                <p className="activity-value">{popularDestination}</p>
                <p className="activity-description">
                  {popularDestination !== "No data" 
                    ? "Destino más frecuente" 
                    : "No hay datos suficientes"}
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Gráficos y Tablas */}
      <div className="dashboard-content">
        <div className="dashboard-charts">
          <div className="chart-card">
            <WeeklyBarChart data={weeklyData} />
          </div>
          <div className="chart-card">
            <PieChart data={vehicleDistribution} />
          </div>
        </div>

        {/* Tabla de Reservas Recientes */}
        <div className="recent-reservations">
          <div className="section-header">
            <h2 className="section-title">Últimas Reservaciones</h2>
            <button className="view-all-button">Ver todas</button>
          </div>

          {loading ? (
            <p>Cargando reservaciones...</p>
          ) : (
            <div className="reservations-table-container">
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((reservation) => {
                    const statusStyle = getStatusColor(reservation.estado)

                    return (
                      <tr key={reservation.id}>
                        <td>{reservation.id}</td>
                        <td>{reservation.cliente}</td>
                        <td>
                          <div className="location-cell">
                            <LocationOn fontSize="small" style={{ color: "#6c757d" }} />
                            <span>{reservation.origen}</span>
                          </div>
                        </td>
                        <td>
                          <div className="location-cell">
                            <LocationOn fontSize="small" style={{ color: "#008f39" }} />
                            <span>{reservation.destino}</span>
                          </div>
                        </td>
                        <td>{reservation.fecha}</td>
                        <td>{reservation.hora}</td>
                        <td>
                          <div
                            className="status-badge"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                            }}
                          >
                            {statusStyle.icon}
                            <span>{reservation.estado}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
      </div>
    </div>
  )
}

export default Dashboard

import { useState, useEffect } from "react";
import { API_BASE_URL } from "../API/Endpoints";
import "./ImageWithFallback.css";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Placeholder cuando falla la carga de la imagen
const NoImagePlaceholder = ({ fileId, originalUrl }) => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="no-image-placeholder">
      <p>No se pudo cargar la imagen</p>
      <div className="help-container">
        <button className="help-button" onClick={() => setShowHelp(!showHelp)}>
          <HelpOutlineIcon /> Ayuda
        </button>
        
        {showHelp && (
          <div className="help-popup">
            <h4>Configuración de imágenes en Google Drive</h4>
            <p>Si estás usando Google Drive, asegúrate que:</p>
            <ol>
              <li>La imagen esté compartida como "Cualquiera con el enlace"</li>
              <li>No tiene restricciones de acceso</li>
            </ol>
            <h5>URL original:</h5>
            <p className="url-display">{originalUrl}</p>
            <h5>ID extraído:</h5>
            <p className="url-display">{fileId || "No se pudo extraer ID"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar vista previa de Google Drive en un iframe
const DrivePreviewFrame = ({ fileId }) => {
  return (
    <div className="drive-preview-container">
      <iframe 
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title="Google Drive Preview"
        className="drive-preview-frame"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

/**
 * Componente que intenta cargar una imagen con múltiples URLs de respaldo en caso de fallo
 */
const ImageWithFallback = ({ url, alt, vehicleId, imageIndex }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [fileId, setFileId] = useState(null);
  const [useIframe, setUseIframe] = useState(false);
  
  // Función para extraer el ID de Google Drive de una URL
  const extractGoogleDriveId = (url) => {
    let fileId = null;
    
    // Patrón 1: URLs como https://drive.google.com/file/d/ID_DEL_ARCHIVO/view
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    // Patrón 2: URLs con id= parámetro
    if (!fileId && url.includes('id=')) {
      const match = url.match(/id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    // Patrón 3: URLs de compartir con drivesdk
    if (!fileId && url.includes('drivesdk')) {
      const match = url.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    return fileId;
  };

  // Construir URL según tipo de URL y contador de errores
  useEffect(() => {
    if (!url) {
      setImgSrc("");
      return;
    }
    
    if (url.includes('drive.google.com')) {
      const extractedFileId = extractGoogleDriveId(url);
      setFileId(extractedFileId);
      
      if (extractedFileId) {
        // Si ya probamos todos los intentos, usar iframe
        if (errorCount >= 5) {
          setUseIframe(true);
          return;
        }
        
        let newSrc = "";
        
        // Diferente URL según el contador de errores
        if (errorCount === 0) {
          // Opción 1: Previsualización con tamaño pequeño (generalmente funciona mejor)
          newSrc = `https://drive.google.com/thumbnail?id=${extractedFileId}&sz=w400`;
        } else if (errorCount === 1) {
          // Opción 2: Previsualización con tamaño más grande
          newSrc = `https://drive.google.com/thumbnail?id=${extractedFileId}&sz=w800`;
        } else if (errorCount === 2) {
          // Opción 3: URL con export=view (menos restringida que download)
          newSrc = `https://drive.google.com/uc?id=${extractedFileId}&export=view`;
        } else if (errorCount === 3) {
          // Opción 4: URL con caché forzado
          const timestamp = new Date().getTime();
          newSrc = `https://drive.google.com/thumbnail?id=${extractedFileId}&sz=w1000&t=${timestamp}`;
        } else if (errorCount === 4) {
          // Opción 5: URL directa 
          newSrc = `https://lh3.googleusercontent.com/d/${extractedFileId}`;
        }
        
        if (newSrc) {
          setImgSrc(newSrc);
          setUseIframe(false);
        }
      } else {
        // No se pudo extraer ID
        setImgSrc(url); // Intentar con la URL original
      }
    } else if (url.startsWith('http')) {
      // URL externa que no es de Google Drive
      setImgSrc(url);
    } else {
      // URL relativa de la API
      setImgSrc(`${API_BASE_URL}${url.replace(/^\//, '')}`);
    }
  }, [url, errorCount, vehicleId, imageIndex]);
  
  const handleImageError = () => {
    // Si ya probamos todas las opciones, no incrementamos más
    if (errorCount < 5) {
      setErrorCount(prev => prev + 1);
    }
  };
  
  // Si estamos usando iframe, mostrar el preview de Google Drive
  if (useIframe && fileId) {
    return <DrivePreviewFrame fileId={fileId} />;
  }
  
  return (
    <div className="image-container">
      {imgSrc ? (
        <>
          <img 
            src={imgSrc} 
            alt={alt} 
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </>
      ) : errorCount >= 5 ? (
        <NoImagePlaceholder fileId={fileId} originalUrl={url} />
      ) : (
        <div className="loading-placeholder">Cargando imagen...</div>
      )}
    </div>
  );
};

export default ImageWithFallback;
const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Endpoint para servir como proxy para imágenes de Google Drive
 * Evita los problemas de CORS solicitando las imágenes desde el servidor
 */
router.get('/proxy-image', async (req, res) => {
  const { url, id } = req.query;
  
  if (!url && !id) {
    return res.status(400).send('Se requiere al menos un parámetro: url o id');
  }

  try {
    let imageUrl = url;
    
    // Si se proporciona un ID, intentamos usar un formato directo
    if (id) {
      // Intentamos diferentes formatos si hay un ID
      const possibleUrls = [
        `https://drive.google.com/uc?export=view&id=${id}`,
        `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
        `https://drive.usercontent.google.com/download?id=${id}`
      ];
      
      // Si hay URL, la añadimos a las opciones
      if (url) {
        possibleUrls.unshift(url);
      }
      
      // Intentamos obtener la imagen con cada URL hasta que una funcione
      let response = null;
      let error = null;
      
      for (const testUrl of possibleUrls) {
        try {
          response = await axios.get(testUrl, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
          });
          
          if (response.status === 200) {
            imageUrl = testUrl;
            break;
          }
        } catch (e) {
          error = e;
          console.log(`Error al obtener imagen con URL ${testUrl}:`, e.message);
          continue;
        }
      }
      
      if (!response && error) {
        throw error;
      }
      
      // Si encontramos una respuesta, la enviamos
      if (response) {
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Caché por 1 día
        return res.send(response.data);
      }
    } else {
      // Si solo tenemos URL, la usamos directamente
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });
      
      const contentType = response.headers['content-type'];
      res.setHeader('Content-Type', contentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Caché por 1 día
      return res.send(response.data);
    }
  } catch (error) {
    console.error('Error en el proxy de imágenes:', error.message);
    return res.status(500).send('Error al obtener la imagen');
  }
});

module.exports = router; 
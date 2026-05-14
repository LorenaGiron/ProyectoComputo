// src/services/cloudinaryClient.js

// Reemplaza esto con tu Cloud Name y el nombre de tu Preset de Cloudinary
const CLOUD_NAME = "loregiron"; 
const UPLOAD_PRESET = "AURA_PRODUCTOS"; 

export const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  // Cloudinary requiere que enviemos la foto en un formato "FormData"
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    // Hacemos una petición POST directa a la API de Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    
    // Cloudinary nos devuelve un montón de datos, pero solo queremos la URL segura
    return data.secure_url; 
    
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    return null;
  }
};
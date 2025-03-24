import * as FileSystem from 'expo-file-system';
import { getCurrentUserId } from './firebase';

// Cloudinary configuration
const CLOUD_NAME = 'dbabzybcu'; // Replace with your cloud name
const UPLOAD_PRESET = 'collecti_user_uploads'; // Replace with your unsigned upload preset

/**
 * Upload an image to Cloudinary
 * @param {string} localUri - The local image URI
 * @returns {Promise<string>} The download URL of the uploaded image
 */
// Update your upload function with folder structure
export const uploadImageToCloudinary = async (localUri) => {
    try {
      // Create a unique filename
      const userId = getCurrentUserId();
      const filename = `user_${userId}_${Date.now()}`;
      
      // Create form data for upload
      const formData = new FormData();
      
      // Add file to form data
      formData.append('file', {
        uri: localUri,
        type: 'image/jpeg',
        name: `${filename}.jpg`
      });
      
      // Use the upload preset we configured
      formData.append('upload_preset', 'collecti_user_uploads');
      
      // Set folder structure: collecti/user_uploads/[userId]
      // This organizes images by user
      formData.append('folder', `collecti/user_uploads/${userId}`);
      
      // Make the upload request
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dbabzybcu/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };
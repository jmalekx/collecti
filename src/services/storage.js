//React and React Native core imports

//Third-party library external imports
import * as FileSystem from 'expo-file-system';

//Project services and utilities
import { getCurrentUserId } from './firebase';

/*
    Image Storage Service Module
    
    Implements image storage services for app. Abstracts image upload process and
    provides consistent interface for storing user-generated content in scalable cloud environment.
*/

//Cloudinary config
const CLOUD_NAME = 'dbabzybcu'; 
const UPLOAD_PRESET = 'collecti_user_uploads'; 

//Uploading image to Cloudinary
export const uploadImageToCloudinary = async (localUri) => {
    try {
      //Ceate a unique filename
      const userId = getCurrentUserId();
      const filename = `user_${userId}_${Date.now()}`;
      
      //Create form data for upload
      const formData = new FormData();
      
      //Add file to form data
      formData.append('file', {
        uri: localUri,
        type: 'image/jpeg',
        name: `${filename}.jpg`
      });
      
      //Using upload preset configured in Cloudinary
      formData.append('upload_preset', 'collecti_user_uploads');
      
      //Setting folder structure: collecti/user_uploads/[userId] to organise images by user
      formData.append('folder', `collecti/user_uploads/${userId}`);
      
      //Upload POST request
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
    } 
    catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_APP } from '../../FirebaseConfig';

// Upload image to Firebase Storage
export const uploadImageToFirebase = async (localUri) => {
  if (!localUri) return null;
  
  try {
    // If it's already a remote URL, just return it
    if (localUri.startsWith('https://')) {
      return localUri;
    }
    
    // Convert URI to blob
    const response = await fetch(localUri);
    const blob = await response.blob();
    
    // Create a unique filename
    const filename = `images/${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    // Get storage reference
    const storage = getStorage(FIREBASE_APP);
    const storageRef = ref(storage, filename);
    
    // Upload and get download URL
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
//React and React Native core imports
import { useState, useEffect } from 'react';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getBookmarks, removeBookmark } from '../services/bookmarks';

/*
    useBookmarks Hook  

    Obtains and manages bookmarks for the current user
    - Loads bookmarks from AsyncStorage
*/

export const useBookmarks = () => {
  const [bookmarkedCollections, setBookmarkedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  //Load bookmarks
  const loadBookmarks = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const bookmarks = await getBookmarks(currentUserId);
      setBookmarkedCollections(bookmarks);
    } 
    catch (error) {
      console.error('Error in useBookmarks:', error);
    } 
    finally {
      setLoading(false);
    }
  };

  //Remove a bookmark
  const handleRemoveBookmark = async (collectionId) => {
    if (!currentUserId) return;
    
    try {
      //Update UI immediately
      setBookmarkedCollections(prev => 
        prev.filter(collection => collection.id !== collectionId)
      );
      
      //Update storage
      await removeBookmark(currentUserId, collectionId);
    } 
    catch (error) {
      console.error('Error removing bookmark:', error);
      //Reload bookmarks if there's an error
      loadBookmarks();
    }
  };

  //Initialize on component mount
  useEffect(() => {
    if (currentUserId) {
      loadBookmarks();
    }
  }, [currentUserId]);

  return {
    bookmarkedCollections,
    loading,
    loadBookmarks,
    removeBookmark: handleRemoveBookmark,
    hasBookmarks: bookmarkedCollections.length > 0
  };
};
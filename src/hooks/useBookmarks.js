//React and React Native core imports
import { useState, useEffect, useCallback } from 'react';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getBookmarks, removeBookmark as removeBookmarkService, addBookmark as addBookmarkService, toggleBookmark as toggleBookmarkService } from '../services/bookmarks';

/*
    useBookmarks Hook  

    Obtains and manages bookmarks for the current user
    - Loads bookmarks from AsyncStorage
    - Add, remove, toggle bookmarks
    - Check if an item is bookmarked
*/

export const useBookmarks = () => {
  const [bookmarkedCollections, setBookmarkedCollections] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  //Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const bookmarks = await getBookmarks(currentUserId);
      setBookmarkedCollections(bookmarks);

      // Create a Set of IDs for efficient lookup
      const ids = new Set(bookmarks.map(bookmark => bookmark.id));
      setBookmarkedIds(ids);
    }
    catch (error) {
      console.error('Error in useBookmarks:', error);
    }
    finally {
      setLoading(false);
    }
  }, [currentUserId]);

  //Check if an item is bookmarked
  const isBookmarked = useCallback((collectionId) => {
    return bookmarkedIds.has(collectionId);
  }, [bookmarkedIds]);

  //Add a bookmark
  const addBookmark = useCallback(async (collection) => {
    if (!currentUserId) return;

    try {
      // First update the UI state optimistically
      setBookmarkedCollections(prev => {
        // Only add if not already in the list
        if (prev.some(item => item.id === collection.id)) {
          return prev;
        }
        return [...prev, collection];
      });

      // Update the IDs Set
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(collection.id);
        return newSet;
      });

      // Then update storage
      await addBookmarkService(currentUserId, collection);
      return true;
    }
    catch (error) {
      console.error('Error adding bookmark:', error);
      // If there's an error, reload to ensure UI and storage are in sync
      loadBookmarks();
      return false;
    }
  }, [currentUserId, loadBookmarks]);

  //Remove a bookmark
  const removeBookmark = useCallback(async (collectionId) => {
    if (!currentUserId) return;

    try {
      // First update the UI state optimistically
      setBookmarkedCollections(prev =>
        prev.filter(collection => collection.id !== collectionId)
      );

      // Update the IDs Set
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });

      // Then update storage
      await removeBookmarkService(currentUserId, collectionId);
      return true;
    }
    catch (error) {
      console.error('Error removing bookmark:', error);
      // If there's an error, reload to ensure UI and storage are in sync
      loadBookmarks();
      return false;
    }
  }, [currentUserId, loadBookmarks]);

  //Toggle a bookmark
  const toggleBookmark = useCallback(async (collection) => {
    if (!currentUserId) return { success: false };

    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(collection.id);

      if (isCurrentlyBookmarked) {
        // If currently bookmarked, remove it
        await removeBookmark(collection.id);
        return { success: true, added: false };
      } else {
        // If not bookmarked, add it
        await addBookmark(collection);
        return { success: true, added: true };
      }
    }
    catch (error) {
      console.error('Error toggling bookmark:', error);
      return { success: false, error };
    }
  }, [currentUserId, bookmarkedIds, addBookmark, removeBookmark]);

  //Initialize on component mount
  useEffect(() => {
    if (currentUserId) {
      loadBookmarks();
    }
  }, [currentUserId, loadBookmarks]);

  return {
    bookmarkedCollections,
    loading,
    loadBookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    hasBookmarks: bookmarkedCollections.length > 0
  };
};
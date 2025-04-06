//React and React Native core imports
import { useState, useEffect, useCallback } from 'react';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getBookmarks, removeBookmark as removeBookmarkService, addBookmark as addBookmarkService, toggleBookmark as toggleBookmarkService } from '../services/bookmarks';
import { showToast, TOAST_TYPES } from '../components/utilities/Toasts';

/*
  useBookmarks Hook  

  Obtains and manages bookmarks for the current user
  - Loads bookmarks from AsyncStorage
  - Add, remove, toggle bookmarks with feedback
  - Check if an item is bookmarked
*/

export const useBookmarks = () => {
  const [bookmarkedCollections, setBookmarkedCollections] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;
  const toast = useToast();

  //Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const bookmarks = await getBookmarks(currentUserId);
      setBookmarkedCollections(bookmarks);

      //Create a Set of IDs for efficient lookup
      const ids = new Set(bookmarks.map(bookmark => bookmark.id));
      setBookmarkedIds(ids);
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
    if (!currentUserId) return false;

    try {
      //First update the UI state optimistically
      setBookmarkedCollections(prev => {
        //Only add if not already in the list
        if (prev.some(item => item.id === collection.id)) {
          return prev;
        }
        return [...prev, collection];
      });

      //Update the IDs Set
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(collection.id);
        return newSet;
      });

      //Then update storage
      await addBookmarkService(currentUserId, collection);
      showToast(toast, "Collection added to bookmarks", { type: TOAST_TYPES.SUCCESS });
      return true;
    }
    catch (error) {
      //If there's an error, reload to ensure UI and storage are in sync
      loadBookmarks();
      showToast(toast, "Could not save bookmark", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [currentUserId, loadBookmarks, toast]);

  //Remove a bookmark
  const removeBookmark = useCallback(async (collectionId) => {
    if (!currentUserId) return false;

    try {
      setBookmarkedCollections(prev =>
        prev.filter(collection => collection.id !== collectionId)
      );

      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });

      await removeBookmarkService(currentUserId, collectionId);
      showToast(toast, "Collection removed from bookmarks", { type: TOAST_TYPES.INFO });
      return true;
    }
    catch (error) {
      loadBookmarks();
      showToast(toast, "Could not remove bookmark", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [currentUserId, loadBookmarks, toast]);

  //Toggle a bookmark
  const toggleBookmark = useCallback(async (collection) => {
    if (!currentUserId) return { success: false };

    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(collection.id);

      if (isCurrentlyBookmarked) {
        //If currently bookmarked, remove it
        await removeBookmarkService(currentUserId, collection.id);

        //Update UI state
        setBookmarkedCollections(prev =>
          prev.filter(item => item.id !== collection.id)
        );

        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(collection.id);
          return newSet;
        });

        showToast(toast, "Collection removed from bookmarks", { type: TOAST_TYPES.INFO });
        return { success: true, added: false };
      }
      else {
        //If not bookmarked, add it
        await addBookmarkService(currentUserId, collection);

        setBookmarkedCollections(prev => {
          if (prev.some(item => item.id === collection.id)) {
            return prev;
          }
          return [...prev, collection];
        });

        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(collection.id);
          return newSet;
        });

        showToast(toast, "Collection added to bookmarks", { type: TOAST_TYPES.SUCCESS });
        return { success: true, added: true };
      }
    }
    catch (error) {
      loadBookmarks();

      showToast(toast, "Could not save or remove this bookmark", { type: TOAST_TYPES.DANGER });
      return { success: false, error };
    }
  }, [currentUserId, bookmarkedIds, toast, loadBookmarks]);

  //Initialise on component mount
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
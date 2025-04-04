//Third-party library external imports
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
  Bookmarks Service
    
  Handles all bookmark-related data operations
*/

//Get all bookmarks for a user
export const getBookmarks = async (userId) => {
  try {
    const bookmarksJson = await AsyncStorage.getItem(`bookmarkedCollections_${userId}`);
    return bookmarksJson ? JSON.parse(bookmarksJson) : [];
  } 
  catch (error) {
    console.log('Error loading bookmarked collections:', error);
  }
};

//Add a bookmark
export const addBookmark = async (userId, collection) => {
  try {
    const currentBookmarks = await getBookmarks(userId);
    
    //Check if already bookmarked
    if (currentBookmarks.some(bookmark => bookmark.id === collection.id)) {
      return currentBookmarks;
    }
    
    const updatedBookmarks = [...currentBookmarks, collection];
    await AsyncStorage.setItem(`bookmarkedCollections_${userId}`, JSON.stringify(updatedBookmarks));
    
    return updatedBookmarks;
  } 
  catch (error) {
    console.error('Error adding bookmark:', error);
  }
};

//Remove a bookmark
export const removeBookmark = async (userId, collectionId) => {
  try {
    const currentBookmarks = await getBookmarks(userId);
    const updatedBookmarks = currentBookmarks.filter(
      collection => collection.id !== collectionId
    );
    
    await AsyncStorage.setItem(`bookmarkedCollections_${userId}`, JSON.stringify(updatedBookmarks));
    
    return updatedBookmarks;
  } 
  catch (error) {
    console.log('Error removing bookmark:', error);
  }
};

//Toggle bookmark state
export const toggleBookmark = async (userId, collection) => {
  try {
    const currentBookmarks = await getBookmarks(userId);
    const isBookmarked = currentBookmarks.some(bookmark => bookmark.id === collection.id);
    
    if (isBookmarked) {
      //If bookmarked, remove it
      const updatedBookmarks = currentBookmarks.filter(bookmark => bookmark.id !== collection.id);
      await AsyncStorage.setItem(`bookmarkedCollections_${userId}`, JSON.stringify(updatedBookmarks));
      return { bookmarks: updatedBookmarks, added: false };
    } 
    else {
      //If not bookmarked, add it
      const updatedBookmarks = [...currentBookmarks, collection];
      await AsyncStorage.setItem(`bookmarkedCollections_${userId}`, JSON.stringify(updatedBookmarks));
      return { bookmarks: updatedBookmarks, added: true };
    }
  } 
  catch (error) {
    console.log('Error toggling bookmark:', error);
  }
};
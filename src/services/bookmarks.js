//Third-party library external imports
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

/*
  Bookmarks Service
  
  Handles all bookmark-related data operations - manage user bookmarks 
  for collections. It leverages Firestore to store and retrieve 
  bookmark data in the cloud, enabling cross-device synchronization.
  
  The service includes the following functionalities:
  - Retrieving all bookmarks for specific user.
  - Adding new bookmark to the users collection.
  - Removing existing bookmark from the user collection.
  - Toggling the bookmark state (add/remove) for a specific collection.
  
*/

//Helper to get the Firestore document reference for user bookmarks
const getUserBookmarksRef = (userId) => doc(FIREBASE_DB, 'users', userId, 'data', 'bookmarks');

//Get all bookmarks for a user
export const getBookmarks = async (userId) => {
  try {
    const bookmarksDoc = await getDoc(getUserBookmarksRef(userId));
    return bookmarksDoc.exists() ? bookmarksDoc.data().collections || [] : [];
  } 
  catch (error) {
    console.log('Error loading bookmarked collections:', error);
    return [];
  }
};

// Add a bookmark
export const addBookmark = async (userId, collection) => {
  try {
    const bookmarksRef = getUserBookmarksRef(userId);

    // Ensure the document exists before updating
    await setDoc(bookmarksRef, { collections: [] }, { merge: true });

    // Add the bookmark
    await updateDoc(bookmarksRef, {
      collections: arrayUnion(collection),
    });

    return await getBookmarks(userId);
  } 
  catch (error) {
    console.log('Error adding bookmark:', error);
  }
};

//Remove a bookmark
export const removeBookmark = async (userId, collectionId) => {
  try {
    const bookmarksRef = getUserBookmarksRef(userId);

    await setDoc(bookmarksRef, { collections: [] }, { merge: true });

    const currentBookmarks = await getBookmarks(userId);
    const collectionToRemove = currentBookmarks.find((c) => c.id === collectionId);

    if (collectionToRemove) {
      await updateDoc(bookmarksRef, {
        collections: arrayRemove(collectionToRemove),
      });
    }

    return await getBookmarks(userId);
  } 
  catch (error) {
    console.log('Error removing bookmark:', error);
  }
};

//Toggle bookmark state
export const toggleBookmark = async (userId, collection) => {
  try {
    const currentBookmarks = await getBookmarks(userId);
    const isBookmarked = currentBookmarks.some((bookmark) => bookmark.id === collection.id);

    if (isBookmarked) {
      await removeBookmark(userId, collection.id);
      return { bookmarks: await getBookmarks(userId), added: false };
    } else {
      await addBookmark(userId, collection);
      return { bookmarks: await getBookmarks(userId), added: true };
    }
  } 
  catch (error) {
    console.log('Error toggling bookmark:', error);
  }
};
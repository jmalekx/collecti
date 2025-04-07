//Third-party library external imports
import { doc, getDoc, getDocs, collection, addDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
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

// Get reference to user bookmarks collection
const getUserBookmarksCollection = (userId) =>
  collection(FIREBASE_DB, 'users', userId, 'bookmarks');

//Get all bookmarks for user
export const getBookmarks = async (userId) => {
  try {
    const bookmarksCollection = getUserBookmarksCollection(userId);
    const querySnapshot = await getDocs(bookmarksCollection);

    //Map documents to bookmark objects
    return querySnapshot.docs.map(doc => ({
      id: doc.data().collectionId,
      name: doc.data().name,
      ownerId: doc.data().ownerId,
      imageUrl: doc.data().imageUrl || '',
      description: doc.data().description || '',
      addedAt: doc.data().addedAt,
      //Store bookmark document ID for easy deletion
      bookmarkDocId: doc.id
    }));
  }
  catch (error) {
    console.log('Error loading bookmarked collections:', error);
    return [];
  }
};

//Add bookmark
export const addBookmark = async (userId, collection) => {
  try {
    //Validate collection object
    if (!collection || !collection.id || (!collection.name && !collection.title)) {
      throw new Error('Invalid collection object. Ensure it has an id and either name or title.');
    }
    const bookmarksCollection = getUserBookmarksCollection(userId);

    //Check if already exists
    const q = query(
      bookmarksCollection,
      where("collectionId", "==", collection.id)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      //Already exists, return current bookmarks
      return await getBookmarks(userId);
    }

    //Create bookmark document
    await addDoc(bookmarksCollection, {
      collectionId: collection.id,
      name: collection.name || collection.title,
      ownerId: collection.ownerId,
      imageUrl: collection.imageUrl || collection.thumbnail || '',
      description: collection.description || '',
      addedAt: new Date().toISOString()
    });

    return await getBookmarks(userId);
  }
  catch (error) {
    console.log('Error adding bookmark:', error);
    throw error;
  }
};

//Remove bookmark
export const removeBookmark = async (userId, collectionId) => {
  try {
    const bookmarksCollection = getUserBookmarksCollection(userId);

    //Find bookmark document with this collection ID
    const q = query(
      bookmarksCollection,
      where("collectionId", "==", collectionId)
    );

    const querySnapshot = await getDocs(q);

    //Delete doc
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(bookmarksCollection, document.id));
    });

    return await getBookmarks(userId);
  }
  catch (error) {
    console.log('Error removing bookmark:', error);
    throw error;
  }
};

//Toggle bookmark state
export const toggleBookmark = async (userId, collection) => {
  try {
    const bookmarksCollection = getUserBookmarksCollection(userId);

    //Check if already bookmarked
    const q = query(
      bookmarksCollection,
      where("collectionId", "==", collection.id)
    );

    const querySnapshot = await getDocs(q);
    const isBookmarked = !querySnapshot.empty;

    if (isBookmarked) {
      //Remove bookmark
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(bookmarksCollection, document.id));
      });
      return { bookmarks: await getBookmarks(userId), added: false };
    }
    else {
      //Add bookmark
      await addBookmark(userId, collection);
      return { bookmarks: await getBookmarks(userId), added: true };
    }
  }
  catch (error) {
    console.log('Error toggling bookmark:', error);
    throw error;
  }
};
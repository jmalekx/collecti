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

    //Get bookmark references
    const bookmarkRefs = querySnapshot.docs.map(doc => ({
      bookmarkDocId: doc.id,
      collectionId: doc.data().collectionId,
      ownerId: doc.data().ownerId,
      addedAt: doc.data().addedAt
    }));

    //Fetch actual collection data for each bookmark (to ensure updates)
    const bookmarks = await Promise.all(
      bookmarkRefs.map(async (ref) => {
        try {
          const collectionRef = doc(FIREBASE_DB, 'users', ref.ownerId, 'collections', ref.collectionId);
          const collectionSnap = await getDoc(collectionRef);

          if (collectionSnap.exists()) {
            const data = collectionSnap.data();
            return {
              id: ref.collectionId,
              name: data.name,
              ownerId: ref.ownerId,
              imageUrl: data.thumbnail || '',
              description: data.description || '',
              addedAt: ref.addedAt,
              bookmarkDocId: ref.bookmarkDocId
            };
          }
        } 
        catch (error) {
          console.log('Error fetching collection for bookmark:', error);
        }
        //Return null for collections that no longer exist
        return null;
      })
    );

    //Filter out null values (collections that couldt be found)
    return bookmarks.filter(bookmark => bookmark !== null);
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
    if (!collection || !collection.id) {
      throw new Error('Invalid collection object. Ensure it has an id.');
    }
    const bookmarksCollection = getUserBookmarksCollection(userId);

    //Check if already exists
    const q = query(
      bookmarksCollection,
      where("collectionId", "==", collection.id)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      //Already exists return current bookmarks
      return await getBookmarks(userId);
    }

    //Store only minimal reference data
    await addDoc(bookmarksCollection, {
      collectionId: collection.id,
      ownerId: collection.ownerId,
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
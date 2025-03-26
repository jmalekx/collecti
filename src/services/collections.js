//Third-party library external imports
import { getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot, collection, doc } from 'firebase/firestore';

//Project services and utilities
import { FIREBASE_DB } from '../../FirebaseConfig';
import { DEFAULT_THUMBNAIL } from '../constants';
import { getCollectionRef, getCollectionsRef, getPostsRef, getCurrentUserId } from './firebase';

/*
    Collections Service Module

    Implements Firestore CRUD operations for user collections
    Implements realtime listeners for collections
*/

//Retrieving single collection of a user
export const getCollection = async (collectionId, userId = getCurrentUserId()) => {
    try {
        const collectionDoc = await getDoc(getCollectionRef(collectionId, userId));
        return collectionDoc.exists() ? { id: collectionDoc.id, ...collectionDoc.data() } : null;
    } 
    catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
};

//Retrieving all collections of a user
export const getAllCollections = async (userId = getCurrentUserId()) => {
    try {
        const snapshot = await getDocs(getCollectionsRef(userId));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } 
    catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
};

//Creating a new collection
export const createCollection = async (collectionData, userId = getCurrentUserId()) => {
    try {
        //Structuring doc
        const { name, description = '' } = collectionData;
        const newCollection = {
            name,
            description,
            createdAt: new Date().toISOString(),
            thumbnail: DEFAULT_THUMBNAIL,
        };

        const docRef = await addDoc(getCollectionsRef(userId), newCollection);
        return { id: docRef.id, ...newCollection };
    } 
    catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
};

//Updating an existing collection
export const updateCollection = async (collectionId, updateData, userId = getCurrentUserId()) => {
    try {
        await updateDoc(getCollectionRef(collectionId, userId), updateData);
        return true;
    } 
    catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
};

//Deleting a collection
export const deleteCollection = async (collectionId, userId = getCurrentUserId()) => {
    try {
        await deleteDoc(getCollectionRef(collectionId, userId));
        return true;
    } 
    catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
};

//Realtime listener subscription for collections
export const subscribeToCollections = (callback, userId = getCurrentUserId()) => {
    const unsubscribe = onSnapshot(
        getCollectionsRef(userId),
        (snapshot) => {
            //Get all collections from snapshot
            let collections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            //Sort collections to ensure Unsorted is first
            collections = collections.sort((a, b) => {
                // Always put Unsorted at the top
                if (a.name === 'Unsorted') return -1;
                if (b.name === 'Unsorted') return 1;

                //Then sort by creation date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            callback(collections);
        },
        (error) => {
            console.error('Error subscribing to collections:', error);
        }
    );

    return unsubscribe;
};

//Create default unsorted collection for new user
export const createDefaultCollection = async (userId) => {
    try {
        const collectionData = {
            name: 'Unsorted',
            description: 'Posts not yet assigned to a collection',
            createdAt: new Date().toISOString(),
            items: [],
            thumbnail: DEFAULT_THUMBNAIL,
            isPinned: true,
        };
        
        const unsortedCollectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', 'Unsorted');
        await setDoc(unsortedCollectionRef, collectionData);
        
        return {
            id: 'Unsorted',
            ...collectionData
        };
    } catch (error) {
        console.error('Error creating default collection:', error);
        throw error;
    }
};
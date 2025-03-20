import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, doc } from 'firebase/firestore';

// Current user helper
export const getCurrentUserId = () => FIREBASE_AUTH.currentUser?.uid;

// Document reference helpers
export const getUserRef = (userId = getCurrentUserId()) => 
    doc(FIREBASE_DB, 'users', userId);

export const getCollectionRef = (collectionId, userId = getCurrentUserId()) => 
    doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);

export const getCollectionsRef = (userId = getCurrentUserId()) => 
    collection(FIREBASE_DB, 'users', userId, 'collections');

export const getPostRef = (collectionId, postId, userId = getCurrentUserId()) => 
    doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);

export const getPostsRef = (collectionId, userId = getCurrentUserId()) => 
    collection(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts');
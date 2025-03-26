//Third-party library external imports
import { collection, doc } from 'firebase/firestore';

//Project services and utilities
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';

/*
    Firebase Service Module

    Provides standardised firestore doc and collection references with path construction
    Centralises database path defintions to ensure consistencty across application data
    access layer.
*/


//Current user helper
export const getCurrentUserId = () => FIREBASE_AUTH.currentUser?.uid;

//Document reference helpers
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
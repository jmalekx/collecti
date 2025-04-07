//Third-party library external imports
import { getDoc, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc, doc, collection } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

//Project services and utilities
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { getUserRef, getCurrentUserId } from './firebase';
import { DEFAULT_PROFILE_PICTURE } from '../constants';

/*
  User Profile Service Module

  Centralised interface for creating and retrieving user profiles from Firestore
  Provides functions for subscribing to user profile changes, creating new profiles,
  updating existing profiles, and deleting user accounts
  Handles user authentication and reauthentication for sensitive operations
  
*/

//Subscribe to user profile changes
export const subscribeToUserProfile = (callback, userId = getCurrentUserId()) => {
  if (!userId) return () => { };

  return onSnapshot(
    getUserRef(userId),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.log('Error subscribing to user profile:', error);
    }
  );
};

//Retrieving user profile
export const getUserProfile = async (userId = getCurrentUserId()) => {
  try {
    const userDoc = await getDoc(getUserRef(userId));
    return userDoc.exists() ? userDoc.data() : null;
  }
  catch (error) {
    console.log('Error fetching user profile:', error);
  }
};

//Creating new user profile
export const createUserProfile = async (userId, userData) => {
  try {
    //Doc structure
    const userProfile = {
      username: userData.username,
      email: userData.email,
      profilePicture: userData.profilePicture || DEFAULT_PROFILE_PICTURE,
      bio: userData.bio || '',
      createdAt: new Date().toISOString(),
      collections: 0,
      posts: 0,
      isNewUser: true,
      ...userData
    };

    await setDoc(getUserRef(userId), userProfile);
    return userProfile;
  }
  catch (error) {
    console.log('Error creating user profile:', error);
  }
};

//Updating user profile
export const updateUserProfile = async (updateData, userId = getCurrentUserId()) => {
  try {
    await updateDoc(getUserRef(userId), updateData);
    return true;
  }
  catch (error) {
    console.log('Error updating user profile:', error);
  }
};

//Completing onboarding process after signing up
export const completeOnboarding = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to complete onboarding');
    }

    await updateDoc(getUserRef(userId), {
      isNewUser: false,
      onboardingCompletedAt: new Date().toISOString()
    });
    return true;
  }
  catch (error) {
    console.log('Error completing onboarding:', error);
  }
};

//Deleting user account and all associated data
export const deleteUserAccount = async (password) => {
  try {
    //Get the current user
    const auth = FIREBASE_AUTH;
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('No authenticated user found');
      return false;
    }

    //Reauthenticate the user with their password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );

    await reauthenticateWithCredential(currentUser, credential);

    //Get user ID for deleting associated data
    const userId = currentUser.uid;

    //First delete all collections and posts (subcollections of the user document)
    const userCollectionsRef = collection(FIREBASE_DB, 'users', userId, 'collections');
    const collectionsSnapshot = await getDocs(userCollectionsRef);

    //Delete posts in each collection first
    for (const collectionDoc of collectionsSnapshot.docs) {
      const collectionId = collectionDoc.id;
      const postsRef = collection(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts');
      const postsSnapshot = await getDocs(postsRef);

      //Delete all posts in collection
      for (const postDoc of postsSnapshot.docs) {
        await deleteDoc(doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postDoc.id));
      }

      //Delete the collection document
      await deleteDoc(doc(FIREBASE_DB, 'users', userId, 'collections', collectionId));
    }

    //Now delete user document from Firestore
    await deleteDoc(doc(FIREBASE_DB, 'users', userId));

    //Finally delete user account from Firebase Auth
    await deleteUser(currentUser);

    return true;
  }
  catch (error) {
    console.log('Error deleting user account:', error);
    return false;
  }
};
//Third-party library external imports
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserProfile, getUserProfile } from './users';
import { createDefaultCollection } from './collections';

/*
  Auth Service Module

  Implements Firebase authentication services for app.
  Implements user management:
    - Sign in
    - Sign up
    - Sign out
    - Password reset
    - User profile management
    
*/

//Sign in a user with email and password
export const signIn = async (email, password) => {
  try {
    const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return response.user;
  }
  catch (error) {
    console.log('Auth error signin', error);
  }
};

//Create new user account and profile
export const signUp = async (email, password, userData) => {
  try {
    const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = response.user;

    //Create default username from email if not provided
    if (!userData.username || userData.username.trim() === '') {
      userData.username = email.split('@')[0];
    } else {
      userData.username = userData.username.trim();
    }

    //Create user profile document in Firestore
    await createUserProfile(user.uid, {
      email,
      ...userData,
      isNewUser: true
    });

    //Create default "Unsorted" collection
    await createDefaultCollection(user.uid);

    return user;
  }
  catch (error) {
    console.log('Signup error', error);
  }
};

//Sign current user out, terminating session
export const logOut = async () => {
  try {
    await signOut(FIREBASE_AUTH);
    return true;
  }
  catch (error) {
    console.log('Logout error', error);
  }
};

//Get current authenticated user
export const getCurrentUser = () => FIREBASE_AUTH.currentUser;

//Check onboarding status
export const checkNeedsOnboarding = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.isNewUser ?? true;
  }
  catch (error) {
    console.log('Onboard check error', error);
    return true; //Default to show onboarding if error
  }
};

//Authentication Change listener
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(FIREBASE_AUTH, callback);
};
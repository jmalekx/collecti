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
        console.error('Error signing in:', error);
        throw error;
    }
};

//Create new user account and profile
export const signUp = async (email, password, userData) => {
    try {
        const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        const user = response.user;
        
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
        console.error('Error signing up:', error);
        throw error;
    }
};

//Sign current user out, terminating session
export const logOut = async () => {
    try {
        await signOut(FIREBASE_AUTH);
        return true;
    }
    catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// //Send password reset email - not using this rn
// export const resetPassword = async (email) => {
//     try {
//         await sendPasswordResetEmail(FIREBASE_AUTH, email);
//         return true;
//     } catch (error) {
//         console.error('Error sending password reset:', error);
//         throw error;
//     }
// };

//Get current authenticated user
export const getCurrentUser = () => FIREBASE_AUTH.currentUser;

//Check onboarding status
export const checkNeedsOnboarding = async (userId) => {
    try {
        const userProfile = await getUserProfile(userId);
        return userProfile?.isNewUser ?? true;
    }
    catch (error) {
        console.error('Error checking onboarding status:', error);
        return true; //Default to show onboarding if error
    }
};

//Authentication Change listener
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(FIREBASE_AUTH, callback);
};
import { FIREBASE_AUTH } from '../FirebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from './users';

/**
 * Sign in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>} Firebase user object
 */
export const signIn = async (email, password) => {
    try {
        const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        return response.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};

/**
 * Create a new user account and profile
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userData - Additional user data (username, etc.)
 * @returns {Promise<UserCredential>} Firebase user object
 */
export const signUp = async (email, password, userData) => {
    try {
        const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);

        // Create user profile document in Firestore
        await createUserProfile(response.user.uid, {
            email,
            ...userData
        });

        return response.user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logOut = async () => {
    try {
        await signOut(FIREBASE_AUTH);
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Send a password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(FIREBASE_AUTH, email);
        return true;
    } catch (error) {
        console.error('Error sending password reset:', error);
        throw error;
    }
};

/**
 * Get the current authenticated user
 * @returns {User|null} Firebase user object or null if not authenticated
 */
export const getCurrentUser = () => FIREBASE_AUTH.currentUser;

/**
 * Check if user needs onboarding
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether user needs onboarding
 */
export const checkNeedsOnboarding = async (userId) => {
    try {
        const userProfile = await getUserProfile(userId);
        return userProfile?.isNewUser ?? true;
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return true; // Default to showing onboarding if there's an error
    }
};

/**
 * Set up an auth state change listener
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(FIREBASE_AUTH, callback);
};
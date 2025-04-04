//Third-party library external imports
import { getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

//Project services and utilities
import { getUserRef, getCurrentUserId } from './firebase';
import { DEFAULT_PROFILE_PICTURE } from '../constants';

/*
    User Profile Service Module

    Centralised interface for creating and retrieving user profiles from Firestore
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
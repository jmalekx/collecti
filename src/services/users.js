//user profile operations
import { getUserRef, getCurrentUserId } from './firebase';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_PROFILE_PICTURE } from '../constants';

// Get user profile
export const getUserProfile = async (userId = getCurrentUserId()) => {
    try {
        const userDoc = await getDoc(getUserRef(userId));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Create a new user profile
export const createUserProfile = async (userId, userData) => {
    try {
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
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (updateData, userId = getCurrentUserId()) => {
    try {
        await updateDoc(getUserRef(userId), updateData);
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Complete onboarding
export const completeOnboarding = async (userId = getCurrentUserId()) => {
    try {
        await updateDoc(getUserRef(userId), { isNewUser: false });
        return true;
    } catch (error) {
        console.error('Error completing onboarding:', error);
        throw error;
    }
};
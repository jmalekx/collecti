//Third-party library external imports
import { getDoc, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc, query, where, writeBatch, getFirestore } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getUserRef, getCurrentUserId, getPostsRef, getCollectionsRef } from './firebase';
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

        //Delete user data from Firestor
        await deleteDoc(getUserRef(userId));

        //Delete user collections and posts
        const collectionsSnapshot = await getDocs(query(getCollectionsRef(), where("userId", "==", userId)));
        const collectionsDeleteBatch = writeBatch(getFirestore());

        //Track collection IDs to delete associated posts
        const collectionIds = [];

        collectionsSnapshot.forEach(doc => {
            collectionIds.push(doc.id);
            collectionsDeleteBatch.delete(doc.ref);
        });

        //Commit the collections deletion
        await collectionsDeleteBatch.commit();

        //Delete all posts in each collection
        for (const collectionId of collectionIds) {
            const postsSnapshot = await getDocs(getPostsRef(collectionId));

            if (!postsSnapshot.empty) {
                const postsDeleteBatch = writeBatch(getFirestore());
                postsSnapshot.forEach(doc => {
                    postsDeleteBatch.delete(doc.ref);
                });
                await postsDeleteBatch.commit();
            }
        }

        //Finally delete user account from Firebase Auth
        await deleteUser(currentUser);

        return true;
    }
    catch (error) {
        console.log('Error deleting user account:', error);
        return false;
    }
};
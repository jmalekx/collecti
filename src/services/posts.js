//posts crud operations
import {
    getPostRef,
    getPostsRef,
    getCollectionRef,
    getCurrentUserId
} from './firebase';
import {
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { DEFAULT_THUMBNAIL } from '../constants';

// Get a single post
export const getPost = async (collectionId, postId, userId = getCurrentUserId()) => {
    try {
        const postDoc = await getDoc(getPostRef(collectionId, postId, userId));
        return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
};

// Get all posts in a collection
export const getCollectionPosts = async (collectionId, userId = getCurrentUserId()) => {
    try {
        const snapshot = await getDocs(getPostsRef(collectionId, userId));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

// Create a new post
export const createPost = async (collectionId, postData, userId = getCurrentUserId()) => {
    try {
        const postsRef = getPostsRef(collectionId, userId);
        const newPost = {
            ...postData,
            createdAt: new Date().toISOString(),
        };
        
        const docRef = await addDoc(postsRef, newPost);
        
        await updateCollectionThumbnail(collectionId, userId);
        
        return { id: docRef.id, ...newPost };
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

// Update an existing post
export const updatePost = async (collectionId, postId, updateData, userId = getCurrentUserId()) => {
    try {
        await updateDoc(getPostRef(collectionId, postId, userId), updateData);
        return true;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};

// Delete a post
export const deletePost = async (collectionId, postId, userId = getCurrentUserId()) => {
    try {
        await deleteDoc(getPostRef(collectionId, postId, userId));
        await updateCollectionThumbnail(collectionId, userId);
        
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

// Set up a real-time listener for posts
export const subscribeToPosts = (collectionId, callback, userId = getCurrentUserId()) => {
    const postsQuery = query(getPostsRef(collectionId, userId));
    
    const unsubscribe = onSnapshot(
        postsQuery,
        (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(posts);
        },
        (error) => {
            console.error('Error subscribing to posts:', error);
        }
    );
    
    return unsubscribe;
};

// Helper function to update collection thumbnail to most recent post
export const updateCollectionThumbnail = async (collectionId, userId = getCurrentUserId()) => {
    try {
        const postsSnapshot = await getDocs(getPostsRef(collectionId, userId));
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort posts by date to get the most recent one
        const sortedPosts = posts.sort((a, b) => 
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        
        // Update the collection document with new thumbnail
        if (posts.length > 0) {
            await updateDoc(getCollectionRef(collectionId, userId), {
                thumbnail: sortedPosts[0]?.thumbnail || DEFAULT_THUMBNAIL,
                lastUpdated: new Date().toISOString()
            });
        } else {
            await updateDoc(getCollectionRef(collectionId, userId), {
                thumbnail: DEFAULT_THUMBNAIL,
                lastUpdated: new Date().toISOString()
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error updating collection thumbnail:', error);
        throw error;
    }
};
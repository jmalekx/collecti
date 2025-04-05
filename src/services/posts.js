//Third-party library external imports
import { getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

//Project services and utilities
import { getPostRef, getPostsRef, getCollectionRef, getCurrentUserId } from './firebase';
import { DEFAULT_THUMBNAIL } from '../constants';

/*
  Posts Service Module

  Implements Firestore CRUD operations for user posts
  Implements realtime listeners for posts
*/

//Retrieving single post of a user
export const getPost = async (collectionId, postId, userId = getCurrentUserId()) => {
  try {
    const postDoc = await getDoc(getPostRef(collectionId, postId, userId));
    return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
  }
  catch (error) {
    console.log('Error fetching post:', error);
  }
};

//Retrieving all posts within a user collection
export const getCollectionPosts = async (collectionId, userId = getCurrentUserId()) => {
  try {
    const snapshot = await getDocs(getPostsRef(collectionId, userId));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  catch (error) {
    console.log('Error fetching posts:', error);
  }
};

//Creating a new post
export const createPost = async (collectionId, postData, userId = getCurrentUserId()) => {
  try {
    //Doc structure
    const postsRef = getPostsRef(collectionId, userId);
    const newPost = {
      ...postData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(postsRef, newPost);

    await updateCollectionThumbnail(collectionId, userId);

    return { id: docRef.id, ...newPost };
  }
  catch (error) {
    console.log('Error creating post:', error);
  }
};

//Updating existing post
export const updatePost = async (collectionId, postId, updateData, userId = getCurrentUserId()) => {
  try {
    await updateDoc(getPostRef(collectionId, postId, userId), updateData);
    return true;
  }
  catch (error) {
    console.log('Error updating post:', error);
  }
};

//Deleting a post
export const deletePost = async (collectionId, postId, userId = getCurrentUserId()) => {
  try {
    await deleteDoc(getPostRef(collectionId, postId, userId));
    await updateCollectionThumbnail(collectionId, userId);

    return true;
  }
  catch (error) {
    console.log('Error deleting post:', error);
  }
};

//Realtime listener subscription for posts
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
      console.log('Error subscribing to posts:', error);
    }
  );

  return unsubscribe;
};

//Helper function to update collection thumbnail to most recent post
export const updateCollectionThumbnail = async (collectionId, userId = getCurrentUserId()) => {
  try {
    const postsSnapshot = await getDocs(getPostsRef(collectionId, userId));
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    //Sort posts by date to get the most recent one
    const sortedPosts = posts.sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    //Update the collection document with new thumbnail
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
  }
  catch (error) {
    console.log('Error updating collection thumbnail:', error);
  }
};
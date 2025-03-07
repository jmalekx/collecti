import { useState, useEffect } from 'react';
import { collection, doc, getDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../constants';

export const useUserData = () => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const [userProfile, setUserProfile] = useState({});
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user profile: ', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch collections and posts
  useEffect(() => {
    if (!userId) return;

    const collectionsRef = collection(FIREBASE_DB, 'users', userId, 'collections');
    
    const unsubscribe = onSnapshot(collectionsRef, async (querySnapshot) => {
      try {
        // Get all regular collections (excluding Unsorted)
        const collectionsData = await Promise.all(
          querySnapshot.docs
            .filter(doc => doc.id !== 'Unsorted') // Filter out Unsorted collection
            .map(async (doc) => {
              const postsRef = collection(FIREBASE_DB, 'users', userId, 'collections', doc.id, 'posts');
              const postsSnapshot = await getDocs(postsRef);
              const posts = postsSnapshot.docs.map(postDoc => ({
                id: postDoc.id,
                ...postDoc.data()
              }));
              
              // Sort posts by creation date
              const sortedPosts = posts.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );

              return {
                id: doc.id,
                ...doc.data(),
                items: sortedPosts,
                thumbnail: sortedPosts[0]?.thumbnail || DEFAULT_THUMBNAIL,
              };
            })
        );

        // Fetch Unsorted collection separately
        const unsortedPostsRef = collection(FIREBASE_DB, 'users', userId, 'collections', 'Unsorted', 'posts');
        const unsortedSnapshot = await getDocs(unsortedPostsRef);
        const unsortedPosts = unsortedSnapshot.docs.map(postDoc => ({
          id: postDoc.id,
          ...postDoc.data()
        }));
        
        // Sort unsorted posts
        const sortedUnsortedPosts = unsortedPosts.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Create Unsorted collection object
        const unsortedCollection = {
          id: 'Unsorted',
          name: 'Unsorted',
          description: 'Posts not yet assigned to a collection',
          items: sortedUnsortedPosts,
          thumbnail: sortedUnsortedPosts[0]?.thumbnail || DEFAULT_THUMBNAIL,
          isPinned: true,
        };

        // Combine collections with Unsorted at the beginning
        setCollections([unsortedCollection, ...collectionsData]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching collections: ', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { userProfile, collections, loading };
};
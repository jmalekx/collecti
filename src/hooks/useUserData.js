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

    useEffect(() => {
        if (!userId) return;

        const collectionsRef = collection(FIREBASE_DB, 'users', userId, 'collections');
        const unsubscribeCollections = onSnapshot(collectionsRef, (collectionsSnapshot) => {
            const newCollections = [];
            const postsUnsubscribes = [];

            // Process regular collections
            collectionsSnapshot.docs.forEach((collDoc) => {
                if (collDoc.id === 'Unsorted') return;

                const collRef = collDoc.ref;
                const postsRef = collection(collRef, 'posts');
                
                // Set up real-time listener for posts in this collection
                const unsubscribePosts = onSnapshot(postsRef, (postsSnapshot) => {
                    const posts = postsSnapshot.docs.map(postDoc => ({
                        id: postDoc.id,
                        ...postDoc.data()
                    }));
                    const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setCollections(prev => {
                        const existing = prev.find(c => c.id === collDoc.id);
                        const updatedCollection = {
                            id: collDoc.id,
                            ...collDoc.data(),
                            items: sortedPosts,
                            thumbnail: sortedPosts[0]?.thumbnail || DEFAULT_THUMBNAIL
                        };

                        if (existing) {
                            return prev.map(c => c.id === collDoc.id ? updatedCollection : c);
                        } else {
                            return [...prev, updatedCollection];
                        }
                    });
                });

                postsUnsubscribes.push(unsubscribePosts);
            });

            // Handle Unsorted collection
            const unsortedRef = doc(collectionsRef, 'Unsorted');
            const unsortedPostsRef = collection(unsortedRef, 'posts');
            const unsubscribeUnsorted = onSnapshot(unsortedPostsRef, (unsortedSnapshot) => {
                const unsortedPosts = unsortedSnapshot.docs.map(postDoc => ({
                    id: postDoc.id,
                    ...postDoc.data()
                }));
                const sortedUnsorted = unsortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setCollections(prev => {
                    const others = prev.filter(c => c.id !== 'Unsorted');
                    return [{
                        id: 'Unsorted',
                        name: 'Unsorted',
                        items: sortedUnsorted,
                        thumbnail: sortedUnsorted[0]?.thumbnail || DEFAULT_THUMBNAIL
                    }, ...others];
                });
            });

            postsUnsubscribes.push(unsubscribeUnsorted);
            setLoading(false);

            // Cleanup posts listeners when collections change
            return () => postsUnsubscribes.forEach(unsub => unsub());
        });

        return () => unsubscribeCollections();
    }, [userId]);

    return { userProfile, collections, loading };
};
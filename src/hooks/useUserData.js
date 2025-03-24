import { useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../constants';
import { getUserProfile } from '../services/users';
import { subscribeToCollections } from '../services/collections';
import { subscribeToPosts } from '../services/posts';

export const useUserData = () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    const [userProfile, setUserProfile] = useState({});
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user profile
    // Use service methods instead of direct Firebase operations
    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile(userId);
                if (profile) {
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error('Error fetching user profile: ', error);
            }
        };


        fetchUserProfile();
    }, [userId]);

    // Subscribe to collections
    useEffect(() => {
        if (!userId) return;

        let collectionsUnsubscribe;
        let postsUnsubscribes = [];

        const setupCollectionsListener = () => {
            collectionsUnsubscribe = subscribeToCollections((newCollections) => {
                // Update collections without posts first
                const collectionsWithoutPosts = newCollections.map(coll => ({
                    ...coll,
                    items: []
                }));

                setCollections(collectionsWithoutPosts);

                // Clean up any existing post subscriptions
                postsUnsubscribes.forEach(unsub => unsub());
                postsUnsubscribes = [];

                // Set up post listeners for each collection
                newCollections.forEach(collection => {
                    // Include the Unsorted collection in post subscriptions
                    const unsubscribe = subscribeToPosts(collection.id, (posts) => {
                        // When posts update, merge them with the collection
                        setCollections(prev => {
                            const updatedCollections = [...prev];
                            const collIndex = updatedCollections.findIndex(c => c.id === collection.id);

                            if (collIndex !== -1) {
                                updatedCollections[collIndex] = {
                                    ...updatedCollections[collIndex],
                                    items: posts
                                };
                            }

                            return updatedCollections;
                        });
                    });

                    postsUnsubscribes.push(unsubscribe);
                });

                setLoading(false);
            });
        };

        setupCollectionsListener();

        // Cleanup function
        return () => {
            if (collectionsUnsubscribe) collectionsUnsubscribe();
            postsUnsubscribes.forEach(unsub => unsub());
        };
    }, [userId]);

    return {
        userProfile,
        collections,
        loading
    };
};
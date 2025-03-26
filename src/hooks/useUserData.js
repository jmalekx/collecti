//React and React Native core imports
import { useState, useEffect } from 'react';

//Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../constants';
import { getUserProfile } from '../services/users';
import { subscribeToCollections } from '../services/collections';
import { subscribeToPosts } from '../services/posts';

/*
    useUserData Hook

    Provides unified interface to access user-related data - reactive data layer
    between Firebase services and React components

    - Realtime data sync via firebase listeners
    - Cascading data relationships (collections -> posts)
    - Management:
        - User profile
        - Collections
        - Posts
*/

export const useUserData = () => {

    //Auth state
    const userId = FIREBASE_AUTH.currentUser?.uid;

    //State transitions
    const [userProfile, setUserProfile] = useState({});
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    //Fetching user profile using service layer
    useEffect(() => {
        if (!userId) return;

        //Implements async for clean promise handling
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile(userId);
                if (profile) {
                    setUserProfile(profile);
                }
            } 
            catch (error) {
                console.error('Error fetching user profile: ', error);
            }
        };

        fetchUserProfile();
    }, [userId]); //Dependency array = only reruns if userId is changed

    //Subscribing to posts and collections
    useEffect(() => {
        if (!userId) return;

        let collectionsUnsubscribe;
        let postsUnsubscribes = [];

        const setupCollectionsListener = () => {
            collectionsUnsubscribe = subscribeToCollections((newCollections) => {
                //Phase 1: Updates collection with empty post arrays
                const collectionsWithoutPosts = newCollections.map(coll => ({
                    ...coll,
                    items: []
                }));

                setCollections(collectionsWithoutPosts);

                //Cleaning up any existing post subscriptions
                postsUnsubscribes.forEach(unsub => unsub());
                postsUnsubscribes = [];

                //Setting up dynamic post listeners for each collection
                newCollections.forEach(collection => {
                    const unsubscribe = subscribeToPosts(collection.id, (posts) => {
                        //State update - for posts, merge with collection
                        setCollections(prev => {
                            const updatedCollections = [...prev]; //Create new array
                            const collIndex = updatedCollections.findIndex(c => c.id === collection.id);

                            if (collIndex !== -1) {
                                //Replacing collection with updated version containing new posts
                                updatedCollections[collIndex] = {
                                    ...updatedCollections[collIndex], //Preserving properties
                                    items: posts //Adding posts to collection
                                };
                            }

                            return updatedCollections;
                        });
                    });
                    //Storing unsub for cleanup
                    postsUnsubscribes.push(unsubscribe);
                });
                //Phase 2: Loading complete after subscription setup
                setLoading(false);
            });
        };

        setupCollectionsListener();

        //Cleanup
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
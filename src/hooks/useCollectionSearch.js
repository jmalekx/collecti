//React and React Native core imports
import { useState, useCallback } from 'react';

//Third-party library external imports
import { collectionGroup, query, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';

//Project services and utilities
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';

/*
  useCollectionSearch Hook
  
  A custom hook for searching and paginating collections in Firebase Firestore.
  This hook provides functionality to:
  - Fetch recent collections with pagination (server-side)
  - Search collections by term with client-side filtering
  - Handle loading states and pagination
  - Prevent duplicate entries across pagination requests
  - Filter out unsorted collections from other users
  
*/

export const useCollectionSearch = (batchSize = 6) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  //Track loaded collection IDs to prevent duplicates
  const [seenCollectionIds] = useState(new Set());

  //Reset pagination state and clear seen IDs
  const resetPagination = useCallback(() => {
    setLastVisible(null);
    setHasMore(true);
    seenCollectionIds.clear();
    setResults([]);
  }, [seenCollectionIds]);

  //Fetch recent collections
  const fetchRecentCollections = useCallback(async (loadMore = false) => {
    try {
      if (!hasMore && loadMore) return;

      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        //Only clear seen IDs on fresh load, not when loading more
        if (!loadMore) {
          seenCollectionIds.clear();
        }
      }

      //Create the query basedh
      let recentCollectionsQuery;
      if (loadMore && lastVisible) {
        recentCollectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(batchSize)
        );
      } else {
        recentCollectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          orderBy('createdAt', 'desc'),
          limit(batchSize)
        );
      }

      const snapshot = await getDocs(recentCollectionsQuery);

      //Update pagination state based on results
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === batchSize);
      }
      else {
        setHasMore(false);
      }

      //Process the new collections
      const newCollections = [];

      for (const doc of snapshot.docs) {
        const ownerId = doc.ref.parent.parent.id;
        const collectionId = doc.id;
        const uniqueId = `${ownerId}_${collectionId}`;

        //Skip if already seen
        if (seenCollectionIds.has(uniqueId)) {
          continue;
        }

        seenCollectionIds.add(uniqueId);

        //Apply filtering logic
        const name = doc.data().name || '';
        if (ownerId === currentUserId || !name.includes('Unsorted')) {
          newCollections.push({
            id: collectionId,
            ...doc.data(),
            ownerId,
            uniqueId
          });
        }
      }

      //Update results - either replace or append
      setResults(prev => loadMore ? [...prev, ...newCollections] : newCollections);
    }
    catch (error) {
      setHasMore(false);
    }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [batchSize, hasMore, lastVisible, seenCollectionIds, currentUserId]);

  //Search collections by term
  const searchCollections = useCallback(async (term, loadMore = false) => {
    try {
      if (!hasMore && loadMore) return;

      if (loadMore) {
        setLoadingMore(true);
      }
      else {
        setLoading(true);
        if (!loadMore) {
          seenCollectionIds.clear();
        }
      }

      const normalizedSearchTerm = term.toLowerCase().trim();

      //If search term is empty, fallback to recent collections
      if (!normalizedSearchTerm) {
        if (loadMore) {
          setLoadingMore(false);
        }
        else {
          setLoading(false);
        }
        return fetchRecentCollections(loadMore);
      }

      let collectionsQuery;
      if (loadMore && lastVisible) {
        collectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          orderBy('name'),
          startAfter(lastVisible),
          limit(batchSize * 5) //Get more to allow for client filtering
        );
      }
      else {
        collectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          orderBy('name'),
          limit(batchSize * 5) //Get more to allow for client filtering
        );
      }

      const snapshot = await getDocs(collectionsQuery);

      //Process and filter matches
      const matchingCollections = [];
      let lastMatch = null;

      for (const doc of snapshot.docs) {
        const name = (doc.data().name || '').toLowerCase();
        const ownerId = doc.ref.parent.parent.id;
        const collectionId = doc.id;
        const uniqueId = `${ownerId}_${collectionId}`;

        if (seenCollectionIds.has(uniqueId)) {
          continue;
        }

        if (name.includes(normalizedSearchTerm)) {
          if (ownerId !== currentUserId && name.includes('unsorted')) {
            continue;
          }

          seenCollectionIds.add(uniqueId);

          matchingCollections.push({
            id: collectionId,
            ...doc.data(),
            ownerId,
            uniqueId
          });

          lastMatch = doc;
        }
      }

      //Apply batch size limit
      const paginatedResults = matchingCollections.slice(0, batchSize);

      //Update pagination state based on results
      if (paginatedResults.length > 0 && lastMatch) {
        setLastVisible(lastMatch);
        setHasMore(matchingCollections.length > batchSize);
      }
      else {
        setHasMore(false);
      }

      // Update results - either replace or append
      setResults(prev => loadMore ? [...prev, ...paginatedResults] : paginatedResults);
    }
    catch (error) {
      setHasMore(false);
    }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [batchSize, hasMore, lastVisible, seenCollectionIds, currentUserId, fetchRecentCollections]);

  return {
    results,
    loading,
    loadingMore,
    hasMore,
    resetPagination,
    fetchRecentCollections,
    searchCollections
  };
};
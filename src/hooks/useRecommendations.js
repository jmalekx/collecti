//React and React Native core imports
import { useState, useEffect, useCallback } from 'react';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getSimilarCollections, getRecentCollections } from '../services/recommendations';
import { useUserData } from './useUserData';
import { useBookmarks } from './useBookmarks';
import { showToast, TOAST_TYPES } from '../components/Toasts';

/*
  useRecommendations Hook
  
  Implements representaiton layer of reccommendtion system. Serves as
  intemediary between UI components and servie layer:
  - Handles state mamagement for recommendation data
  - Asynchronous data fetching with loading states
  - Error handling and fallback mechanisms
  - Refresh functionality for recommendations
*/

export const useRecommendations = (maxResults = 6) => {

  //State trasnitions
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { collections } = useUserData();
  const { bookmarkedCollections } = useBookmarks();

  //Context states
  const toast = useToast();

  //Async fetching
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);

      //Tier 1: Content-based personalized recommendations - utilising existing collections and bookmarks
      const recommendedCollections = await getSimilarCollections(
        collections,
        bookmarkedCollections,
        maxResults
      );

      //If no matching collections found, get recent
      if (recommendedCollections.length === 0) {
        //Tier 2: Fallback to popularity based recommendations
        const recentCollections = await getRecentCollections(maxResults);
        setRecommendations(recentCollections);
      }
      else {
        setRecommendations(recommendedCollections);
      }
    }
    catch (error) {
      showToast(toast, "Could not load recommendations", { type: TOAST_TYPES.WARNING });

      //Tier 3: Error recovery - fallback to recent collections
      try {
        const popularCollections = await getRecentCollections(maxResults);
        setRecommendations(popularCollections);
      }
      catch (fallbackError) {
        setRecommendations([]);
      }
    }
    finally {
      setLoading(false);
    }
  }, [collections, bookmarkedCollections, maxResults, toast]);

  //Fetch recommendations when collections or bookmarks change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    refreshRecommendations: fetchRecommendations
  };
};
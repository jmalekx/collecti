//React and React Native core imports
import { useState, useCallback, useEffect, useRef } from 'react';

/*
  usePagination Hook

  Custom hook for handling infinite scroll paginatiom.
  - Manages progressive loading of items in list
  - Efficient rendering of large datasetes by loading items in batches as user scrolls
  Initially in collectiondetails, but made hook for reusability across whole app eg bookmarks
  
*/

export const usePagination = (items = [], initialItemsPerPage = 10, incrementAmount = 10) => {

  //State transitions
  const [paginatedItems, setPaginatedItems] = useState([]);
  const [currentLimit, setCurrentLimit] = useState(initialItemsPerPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  //Update if items or limit changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setPaginatedItems(items.slice(0, currentLimit));
      setHasMore(currentLimit < items.length);
      return;
    }

    //Always update paginated items when items array changes
    const newPaginatedItems = items.slice(0, currentLimit);
    setPaginatedItems(newPaginatedItems);
    setHasMore(currentLimit < items.length);
  }, [items, currentLimit]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    //Clear any existing timeout to prevent multiple loads
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    //Use ref for timeout to ensure it can be cleaned up
    loadingTimeoutRef.current = setTimeout(() => {
      setCurrentLimit(prevLimit => {
        const newLimit = prevLimit + incrementAmount;
        //Immediately update paginatedItems for smoother UX
        setPaginatedItems(items.slice(0, newLimit));
        return newLimit;
      });
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, incrementAmount, items]);

  //Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentLimit(initialItemsPerPage);
    setPaginatedItems(items.slice(0, initialItemsPerPage));
    setHasMore(initialItemsPerPage < items.length);
    setIsLoadingMore(false);
    //Also clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [items, initialItemsPerPage]);

  return {
    paginatedItems,
    hasMore,
    isLoadingMore,
    loadMore,
    resetPagination
  };
};
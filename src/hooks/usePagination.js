//React and React Native core imports
import { useState, useCallback, useEffect } from 'react';

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

  //Update if items or limit changes
  useEffect(() => {
    setPaginatedItems(items.slice(0, currentLimit));
    setHasMore(currentLimit < items.length);
  }, [items, currentLimit]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    //Simulating network delay for smoother UX
    setTimeout(() => {
      setCurrentLimit(prevLimit => prevLimit + incrementAmount);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, incrementAmount]);

  //Resetting e.g when filters change
  const resetPagination = useCallback(() => {
    setCurrentLimit(initialItemsPerPage);
    setPaginatedItems(items.slice(0, initialItemsPerPage));
    setHasMore(initialItemsPerPage < items.length);
  }, [items, initialItemsPerPage]);

  return {
    paginatedItems,
    hasMore,
    isLoadingMore,
    loadMore,
    resetPagination
  };
};
import { useState, useMemo } from 'react';

/*
  useSorting Hook

  Manages sorting functionality for collections of items.
  Handles sort option management and applies sorting algorithms to data.
  Provides sorted data and sort state management functions.
*/

export const useSorting = (items, initialSortOption = 'dateDesc') => {
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sort options that can be passed to components
  const sortOptions = [
    { id: 'dateDesc', label: 'Date: Newest First', icon: 'time' },
    { id: 'dateAsc', label: 'Date: Oldest First', icon: 'time-outline' },
    { id: 'nameAsc', label: 'Name: A to Z', icon: 'text' },
    { id: 'nameDesc', label: 'Name: Z to A', icon: 'text-outline' },
  ];

  // Apply sorting to items
  const sortedItems = useMemo(() => {
    if (!items || !items.length) return items;

    let sorted = [...items];

    switch (sortOption) {
      case 'dateDesc':
        return sorted.sort((a, b) => {
          //Use timestamp numbers for proper sorting
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'dateAsc':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      case 'nameAsc':
        return sorted.sort((a, b) => (a.notes || '').localeCompare(b.notes || ''));
      case 'nameDesc':
        return sorted.sort((a, b) => (b.notes || '').localeCompare(a.notes || ''));
      default:
        return sorted;
    }
  }, [items, sortOption]);

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortMenu(false);
  };

  return {
    sortedItems,
    sortOption,
    sortOptions,
    showSortMenu,
    setShowSortMenu,
    handleSortChange
  };
};
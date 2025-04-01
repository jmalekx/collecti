import { useState, useCallback } from 'react';

/**
 * Custom hook for managing selection mode and selected items
 */
export const useSelectionMode = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedItems([]);
  }, []);

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter(id => id !== itemId);
      } else {
        return [...prevSelected, itemId];
      }
    });
  }, []);

  // Select a single item
  const selectSingleItem = useCallback((itemId) => {
    setIsSelectionMode(true);
    setSelectedItems([itemId]);
  }, []);

  // Clear selections
  const clearSelections = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    isSelectionMode,
    selectedItems,
    toggleSelectionMode,
    toggleItemSelection,
    selectSingleItem,
    clearSelections,
    setIsSelectionMode
  };
};
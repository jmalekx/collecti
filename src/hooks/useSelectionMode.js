//React and React Native core imports
import { useState, useCallback } from 'react';

/* 
  useSelectionMode Hook

  Custom hook to manage selection mode and selected items in a list or grid.
  Provides functions to toggle selection mode, select/deselect items, and clear selections.

  - Maintains selection mode state boolean
  - Tracks selected items as an array of IDs
  - Provides memoised callback functions for selection operations
*/

export const useSelectionMode = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  //Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedItems([]);
  }, []);

  //Toggle item selection
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter(id => id !== itemId);
      }
      else {
        return [...prevSelected, itemId];
      }
    });
  }, []);

  //Select a single item
  const selectSingleItem = useCallback((itemId) => {
    setIsSelectionMode(true);
    setSelectedItems([itemId]);
  }, []);

  //Clear selections
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
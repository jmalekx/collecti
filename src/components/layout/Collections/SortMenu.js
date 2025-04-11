//React and React Native core imports
import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import collectionstyles from '../../../styles/collectionstyles';
import { colours } from '../../../styles/commonStyles';

/*
  SortMenu Component

  Displays a modal with various sorting options for collections.
  Allows users to sort posts by date (newest/oldest) or name (A-Z/Z-A).
  Manages its own internal UI state while receiving sort options and handlers from parent.
*/

const SortMenu = ({ 
  visible, 
  onClose, 
  sortOption, 
  onSortChange, 
  sortOptions 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={collectionstyles.sortModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={collectionstyles.sortMenuContainer}>
          <View style={collectionstyles.sortMenuHeader}>
            <Text style={collectionstyles.sortMenuTitle}>Sort by</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colours.mainTexts} />
            </TouchableOpacity>
          </View>

          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                collectionstyles.sortMenuItem,
                sortOption === option.id && collectionstyles.sortMenuItemSelected
              ]}
              onPress={() => onSortChange(option.id)}
            >
              <View style={collectionstyles.sortMenuItemContent}>
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={sortOption === option.id ? colours.buttonsTextPink : colours.mainTexts}
                />
                <Text
                  style={[
                    collectionstyles.sortMenuItemText,
                    sortOption === option.id && collectionstyles.sortMenuItemTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              {sortOption === option.id && (
                <Ionicons name="checkmark" size={18} color={colours.buttonsTextPink} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SortMenu;
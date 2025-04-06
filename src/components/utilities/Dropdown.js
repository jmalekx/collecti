//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { colours } from '../../styles/commonStyles';
import addbuttonstyles from '../../styles/addbuttonstyles';

/*
  CustomDropdown Component

  A reusable styled dropdown selector that uses a modal approach for better
  positioning and visibility within scrollable containers.
*/

const Dropdown = ({
  options = [],
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
  containerStyle,
  highlightedValues = [],
  addNewOption = false,
  addNewLabel = "+ Add New",
  onAddNew,
  disabled = false,
  pinnedOptions = [],
}) => {

  //State management
  const [isOpen, setIsOpen] = useState(false);
  
  //Find  selected option for display
  const selectedOption = [...pinnedOptions, ...options].find(option => option.value === selectedValue);
  
  //Toggle dropdown state
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };
  
  //Handle option selection
  const handleSelect = (value) => {
    onValueChange(value);
    setIsOpen(false);
  };
  
  //Handle add new option
  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    }
    setIsOpen(false);
  };

  return (
    <View style={[addbuttonstyles.dropdownContainer, containerStyle]}>
      {/* Dropdown Header/Selector */}
      <TouchableOpacity 
        style={[addbuttonstyles.dropdownSelector, isOpen && addbuttonstyles.dropdownSelectorOpen]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text 
          style={[
            addbuttonstyles.dropdownSelectedText, 
            !selectedOption && addbuttonstyles.dropdownPlaceholderText,
            // Apply italic style to Unsorted when selected
            selectedOption && selectedOption.label === 'Unsorted' && addbuttonstyles.dropdownUnsortedSelectedText
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colours.buttonsTextPink} 
        />
      </TouchableOpacity>
      
      {/* Modal-based Dropdown Options */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        hardwareAccelerated={true}
      >
        <TouchableOpacity 
          style={addbuttonstyles.dropdownModalOverlay}
          activeOpacity={0.7}
          onPress={() => setIsOpen(false)}
        >
          <View style={addbuttonstyles.dropdownOptionsContainer}>
            <View style={addbuttonstyles.dropdownOptionsHeader}>
              <Text style={addbuttonstyles.dropdownOptionsTitle}>Select Collection</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close-outline" size={24} color={colours.mainTexts} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={addbuttonstyles.dropdownOptionsScroll}
              contentContainerStyle={addbuttonstyles.dropdownOptionsContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Add New Option - Always First */}
              {addNewOption && (
                <TouchableOpacity
                  style={[addbuttonstyles.dropdownOption, addbuttonstyles.dropdownAddNewOption]}
                  onPress={handleAddNew}
                >
                  <View style={addbuttonstyles.dropdownAddNewOptionContent}>
                    <Ionicons name="add-circle" size={18} color={colours.buttonsTextPink} />
                    <Text style={addbuttonstyles.dropdownAddNewOptionText}>{addNewLabel}</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {/* Pinned Options */}
              {pinnedOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    addbuttonstyles.dropdownOption,
                    addbuttonstyles.dropdownPinnedOption,
                    selectedValue === option.value && addbuttonstyles.dropdownSelectedOption,
                    (highlightedValues.includes(option.value) && 
                     selectedValue === option.value) && addbuttonstyles.dropdownHighlightedOption
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text 
                    style={[
                      addbuttonstyles.dropdownOptionText,
                      option.label === 'Unsorted' ? addbuttonstyles.dropdownUnsortedOptionText : null,
                      selectedValue === option.value && addbuttonstyles.dropdownSelectedOptionText,
                      (highlightedValues.includes(option.value) && 
                       selectedValue === option.value) && addbuttonstyles.dropdownHighlightedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedValue === option.value && (
                    <Ionicons name="checkmark" size={20} color={colours.buttonsTextPink} />
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Regular Options */}
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    addbuttonstyles.dropdownOption,
                    selectedValue === option.value && addbuttonstyles.dropdownSelectedOption,
                    (highlightedValues.includes(option.value) && 
                     selectedValue === option.value) && addbuttonstyles.dropdownHighlightedOption
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text 
                    style={[
                      addbuttonstyles.dropdownOptionText,
                      selectedValue === option.value && addbuttonstyles.dropdownSelectedOptionText,
                      (highlightedValues.includes(option.value) && 
                       selectedValue === option.value) && addbuttonstyles.dropdownHighlightedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedValue === option.value && (
                    <Ionicons name="checkmark" size={20} color={colours.buttonsTextPink} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;
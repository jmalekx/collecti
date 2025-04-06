//React and React Native core imports
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import commonStyles, {colours} from '../../styles/commonStyles';

/*
  SearchBar Component

  This component implements a search bar with an icon and a clear button.
  It is used for searching items in the application.
  - The search bar is a controlled component, meaning its value is managed by the parent component.
*/

const SearchBar = ({ value, onChangeText, placeholder = "Search...", style }) => {
  return (
    <View style={[commonStyles.searchContainer, style]}>
      <Ionicons name="search-outline" size={20} color={colours.subTexts} style={commonStyles.searchIcon} />
      <TextInput
        style={commonStyles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colours.darkergrey}
        value={value}
        onChangeText={onChangeText}
      />
      {value !== '' && (
        <TouchableOpacity onPress={() => onChangeText('')} style={commonStyles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colours.subTexts}/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
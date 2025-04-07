//React and React Native core imports
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';

/*
  CustomBackButton Component

  Provides a consistent back navigation button across the app
  Uses Ionicons chevron-back icon and matches the app's design system
  This component handles the navigation.goBack() action automatically
  
  State machine:
  -Pressed: Triggers navigation.goBack()
  -Default: Displays the back icon
  
  Usage:
  -Include in stack navigator's screenOptions to replace default back button
  -Can be used directly in header components or custom headers
  
*/

//List of root tab screen names 
const TAB_SCREENS = ['Home', 'Search', 'Bookmarks', 'Collections'];

const CustomBackButton = () => {
  //Navigation context
  const navigation = useNavigation();
  const route = useRoute();
  const canGoBack = navigation.canGoBack();
  
  //Check if current screen isa tab screen (should not show back button)
  const isTabScreen = TAB_SCREENS.includes(route.name);
  if (!canGoBack || isTabScreen) {
    return null;
  }
  
  return (
    <TouchableOpacity 
      style={commonStyles.headerBackButton}
      onPress={() => navigation.goBack()}
      activeOpacity={0.7} //Feedback on press
    >
      <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
    </TouchableOpacity>
  );
};

export default CustomBackButton;
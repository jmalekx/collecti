//React and React Native core imports
import React from 'react';
import { Text, TouchableOpacity, TextInput, View } from 'react-native';

//Custom component imports and styling
import commonStyles, { typography } from '../styles/commonStyles';

/*
  Typography Component

  Centralised component for text and typography styling for consistency
  across the application - component composition, style inheritance, separation of concerns

  - Consistent font family and size
  - Centralised styling for text components
  - Customisable text components for different use cases
*/

export const AppText = ({ style, children, ...props }) => (
  <Text style={[commonStyles.textRegular, style]} {...props}>
    {children}
  </Text>
);

export const AppHeading = ({ style, children, ...props }) => (
  <Text style={[commonStyles.textHeading, style]} {...props}>
    {children}
  </Text>
);

export const AppSubheading = ({ style, children, ...props }) => (
  <Text style={[commonStyles.textSubheading, style]} {...props}>
    {children}
  </Text>
);

export const AppBoldText = ({ style, children, ...props }) => (
  <Text style={[commonStyles.textBold, style]} {...props}>
    {children}
  </Text>
);

export const AppSmallText = ({ style, children, ...props }) => (
  <Text style={[commonStyles.textSmall, style]} {...props}>
    {children}
  </Text>
);

export const AppButton = ({ style, textStyle, onPress, title, ...props }) => (
  <TouchableOpacity
    style={[commonStyles.button, style]}
    onPress={onPress}
    {...props}
  >
    <Text style={[commonStyles.buttonText, { fontFamily: typography.fontBold }, textStyle]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const AppTextInput = ({ style, placeholderTextColor = "#999", ...props }) => (
  <View style={commonStyles.inputContainer}>
    <TextInput
      style={[commonStyles.input, style]}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  </View>
);
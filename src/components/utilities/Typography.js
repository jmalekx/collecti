//React and React Native core imports
import React, { useState } from 'react';
import { Text, TouchableOpacity, Animated, TextInput, View } from 'react-native';

//Custom component imports and styling
import commonStyles, { typography } from '../../styles/commonStyles';

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

export const AppButton = ({ style, textStyle, onPress, title, ...props }) => {
  const buttonScale = useState(new Animated.Value(1))[0];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPress) {
        onPress();
      }
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }], alignSelf: 'stretch' }}>
      <TouchableOpacity
        style={[commonStyles.button, style]}
        onPress={handlePress}
        {...props}
      >
        <Text style={[commonStyles.buttonText, { fontFamily: typography.fontBold }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AppTextInput = ({ style, placeholderTextColor = "#999", leftIcon, ...props }) => (
  <View style={commonStyles.inputContainer}>
    {leftIcon && <View style={commonStyles.leftIconContainer}>{leftIcon}</View>}
    <TextInput
      style={[commonStyles.input, leftIcon && commonStyles.inputWithIcon, style]}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  </View>
);
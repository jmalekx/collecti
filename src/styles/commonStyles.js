//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Third-party library external imports
import LinearGradient from 'react-native-linear-gradient';

/*
  Common styles for the application
  
  This file contains shared styles, typography, colors, and layout styles used throughout the app.
  It also includes a gradient background component for consistent theming. 
*/

const typography = {
  fontRegular: 'Inter_400Regular',
  fontBold: 'Inter_700Bold',
};

const colours = {
  //===== COLOR PALETTE =====
  primary: '#F5D6E0',
  secondary: '#FCF5E8',
  tertiary: '#fffbf4',

  lighterpink: '#FFF0F5',
  grey: '#c0c0c060',
  darkergrey: '#999',

  //===== TEXT COLORS =====
  mainTexts: '#333',
  subTexts: '#666',

  //===== BUTTON COLORS =====
  buttons: '#f7d89b',
  buttonsHighlight: '#8a6620',
  buttonsText: '#aa790f',
  buttonsTextPink: '#D67A98',
  delete: '#FF3B30',

  //===== MEDIA COLORS =====
  pinterest: '#E60023',
  instagram: '#E1306C',
  tiktok: '#000',
  youtube: '#FF0000',
}

const shadowStyles = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  }
};

const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  signContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  embedContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  divider: {
    height: 2,
    backgroundColor: colours.buttonsTextPink,
    width: '80%',
    marginBottom: 20,
    alignSelf: 'center',
    opacity: 0.4,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});

const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colours.subTexts,
    marginBottom: 20,
  },
  textRegular: {
    fontFamily: typography.fontRegular,
    color: colours.mainTexts,
    fontSize: 14,
  },
  textBold: {
    fontFamily: typography.fontBold,
  },
  textHeading: {
    fontFamily: typography.fontBold,
    fontSize: 24,
  },
  textSubheading: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    fontWeight: 'bold',
    color: colours.mainTexts,
  },
  textBody: {
    fontFamily: typography.fontRegular,
    fontSize: 16,
  },
  textSmall: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  skipText: {
    marginTop: 15,
    color: colours.subTexts,
  },
});

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: colours.buttons,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonText: {
    color: colours.buttonsText,
    fontSize: 16,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  pinkbutton: {
    backgroundColor: colours.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  pinkbuttonText: {
    color: colours.buttonsTextPink,
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  pinterestButton: {
    backgroundColor: colours.buttonsTextPink,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pinterestConnected: {
    backgroundColor: colours.subTexts,
  },

});

const inputStyles = StyleSheet.create({
  inputContainer: {
    width: 320,
    marginVertical: 8,
    borderRadius: 15,
    ...shadowStyles.light,
  },
  input: {
    backgroundColor: 'white',
    height: 55,
    borderColor: colours.secondary,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: typography.fontRegular,
    fontSize: 16,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 16,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 46,
  }
});

const searchStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    height: 42,
    paddingHorizontal: 16,
    marginVertical: 10,
    ...shadowStyles.medium,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  }
});

const loadingStyles = StyleSheet.create({
  loadCirclesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 4,
    color: '#666',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});

const componentStyles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginHorizontal: 2,
  },
  progressActiveBar: {
    backgroundColor: colours.buttonsTextPink,
  },
  progressInactiveBar: {
    backgroundColor: colours.tertiary,
  },
  renderThmbContain: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
});

const Bg = React.memo(({ children, style }) => {
  return (
    <LinearGradient
      colors={[colours.primary, colours.secondary, colours.tertiary,]}
      style={[{ flex: 1 }, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
});

const headerStyles = {
  defaultHeaderOptions: {
    headerTitleStyle: {
      fontFamily: typography.fontBold || 'Inter_700Bold',
      fontSize: 22,
    },
    headerStyle: {
      backgroundColor: colours.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerTintColor: colours.mainTexts,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

//Merge all style objects for export
const commonStyles = {
  ...layoutStyles,
  ...textStyles,
  ...buttonStyles,
  ...inputStyles,
  ...headerStyles,
  ...searchStyles,
  ...shadowStyles,
  ...loadingStyles,
  ...componentStyles,
  Bg,
};

export { typography, headerStyles, colours, shadowStyles };
export default commonStyles;
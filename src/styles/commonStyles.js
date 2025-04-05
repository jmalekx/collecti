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
  primary: '#F5D6E0',
  secondary: '#FCF5E8',
  tertiary: '#fffbf4',

  buttons: '#f7d89b',
  buttonsHighlight: '#8a6620',
  buttonsText: '#aa790f',
  buttonsTextPink: '#D67A98',
}

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
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  signContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    zIndex: 1,
  },
  embedContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
    color: '#666',
    marginBottom: 20,
  },
  textRegular: {
    fontFamily: typography.fontRegular,
    color: '#333',
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
    color: '#333',
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
    color: '#666',
  },
});

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
    backgroundColor: '#E60023',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pinterestConnected: {
    backgroundColor: '#666',
  },

});

const inputStyles = StyleSheet.create({
  inputContainer: {
    width: 320,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
});

const optionStyles = StyleSheet.create({
  option: {
    backgroundColor: "#FFDCDC",
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: "#D54B4B",
    fontWeight: "bold",
  },
  optionSelected: {
    backgroundColor: '#c0c0c0',
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
  }
};

const authStyles = {
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 28,
    color: '#333',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    opacity: 0.85,
  },
  authButton: {
    backgroundColor: colours.buttons,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authButtonText: {
    color: colours.buttonsText,
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  authLink: {
    ...textStyles.textBold,
    color: colours.buttonsTextPink,
  }
};

//Merge all style objects for export
const commonStyles = {
  ...layoutStyles,
  ...textStyles,
  ...buttonStyles,
  ...inputStyles,
  ...optionStyles,
  ...headerStyles,
  ...authStyles,
  Bg,
};

export { typography, headerStyles, colours };
export default commonStyles;
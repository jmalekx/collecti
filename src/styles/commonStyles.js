import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
  signLink: {
    fontFamily: 'Inter_700Bold',
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
  authButton:{
    backgroundColor: colours.buttons,
  },
  authButtonText:{
    color: colours.buttonsText,
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
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

//Merge all style objects for export
const commonStyles = {
  ...layoutStyles,
  ...textStyles,
  ...buttonStyles,
  ...inputStyles,
  ...optionStyles,
  ...headerStyles,
  Bg,
};

export { typography, headerStyles, colours};
export default commonStyles;
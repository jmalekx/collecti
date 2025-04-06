//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const registerstyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 40,
  },

  //SignUp
  UpheaderContainer: {
    ...commonStyles.headerContainer,
    marginBottom: 8,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginLeft: 40,
    marginTop: 30,
  },
  thumbnail: {
    position: 'absolute',
    bottom: -30,
    right: -80,
    width: 200,
    height: 200,
    opacity: 0.9,
    zIndex: 0,
  },

  //SignIn
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
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
    color: colours.mainTexts,
  },
  subHeaderText: {
    fontSize: 16,
    color: colours.mainTexts,
    textAlign: 'center',
    opacity: 0.85,
  },
  authButton: {
    backgroundColor: colours.buttons,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: colours.mainTexts,
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
    ...commonStyles.textBold,
    color: colours.buttonsTextPink,
  },

  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: -10,
  },
  logo: {
    width: 150,
    height: 150,
    maxWidth: 200,
    marginTop: -70,
  },
  nameImage: {
    marginLeft: 20,
  },
  headerText: {
    ...commonStyles.headerText,
    fontSize: 32,
  },
  subHeaderText: {
    ...commonStyles.subHeaderText,
    marginTop: 0,
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    marginBottom: 8,
    alignItems: 'flex-start',
    marginLeft: 40,
    alignSelf: 'stretch',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  }

});

export default registerstyles;
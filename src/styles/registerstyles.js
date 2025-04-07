//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const registerstyles = StyleSheet.create({
  //===== COMMON CONTAINER STYLES =====
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
  //===== SIGNUP SPECIFIC STYLES =====
  UpheaderContainer: {
    marginBottom: 8,
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '80%',
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
  //===== SIGNIN FORM STYLES =====
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  //===== TEXT STYLES =====
  headerText: {
    fontSize: 32,
    color: colours.mainTexts,
  },
  subHeaderText: {
    fontSize: 16,
    color: colours.mainTexts,
    textAlign: 'left',
    opacity: 0.85,
    marginTop: -4,
  },
  //===== BUTTON STYLES =====
  authButton: {
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: colours.buttons,
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
  //===== LOGO STYLES =====
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
  glowContainer: {
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingTop: 10,
    overflow: 'visible',
  },
  glowOuter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    shadowColor: '#FFDD00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 60,
    elevation: 30,
  },
  glowInner: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 100,
    shadowColor: '#FFC933',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 15,
  },
  //===== BOTTOM SECTION STYLES =====
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
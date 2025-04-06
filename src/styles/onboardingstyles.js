//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const onboardingstyles = StyleSheet.create({
  //===== COMMON STYLES =====
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    ...commonStyles.authButton,
    marginBottom: 20,
    margin: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  //===== HEADER STYLES =====
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '90%',
  },
  heading: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
    color: colours.mainTexts,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: colours.subTexts,
    marginBottom: 12,
  },
  //===== OPTION SELECTION STYLES =====
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: -16,
    margin: 10,
  },
  option: {
    backgroundColor: colours.grey,
    padding: 12,
    borderRadius: 20,
    margin: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colours.primary,
  },
  optionText: {
    color: colours.mainTexts,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colours.buttonsTextPink,
  },
  //===== SCREEN 1: WELCOME SCREEN =====
  shareImage: {
    position: 'absolute',
    top: 80,
    left: -60,
    height: 350,
    width: 320,
    zIndex: 1,
  },
  nameImage: {
    width: 150,
    height: 50,
  },
  onboardHeading: {
    marginRight: 20,
    marginTop: 100,
    marginBottom: 0,
  },
  welcomeText: {
    textAlign: 'right',
    fontSize: 40,
    width: '100%',
    color: colours.mainTexts,
  },
  toNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
    justifyContent: 'flex-end',
    color: colours.mainTexts,
  },
  toText: {
    marginRight: 5,
    fontSize: 24,
  },
  howItWorksContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 40,
  },
  headerTexts: {
    textAlign: 'right',
    width: '60%',
    color: colours.mainTexts,
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  SubTexts: {
    width: '55%',
  },
  SubText: {
    color: colours.mainTexts,
    fontStyle: 'italic',
    textAlign: 'right',
    marginBottom: 12,
  },
  centerContent: {
    alignItems: 'flex-end',
    marginTop: 8,
    paddingRight: 20,
    width: '100%',
  },
  //===== SCREEN 2: CATEGORIES SELECTION =====
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  //===== SCREEN 4: FINAL SCREEN =====
  disabled: {
    opacity: 0.7,
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipText: {
    marginBottom: -10,
    color: colours.subTexts,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default onboardingstyles;
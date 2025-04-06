//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const onboardingstyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 40,
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
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: colours.subTexts,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },

  //Screen1 
  shareImage: {
    position: 'absolute',
    top: 80,
    left: -60,
    height: 350,
    width: 320,
    zIndex: 1,
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
  nameImage: {
    width: 150,
    height: 50,
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

  //Screen2
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.tertiary,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    width: 95,
    height: 95,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  optionSelected: {
    backgroundColor: colours.lighterpink,
    borderColor: colours.buttonsTextPink,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
    color: colours.mainTexts,
  },
  optionTextSelected: {
    color: colours.buttonsTextPink,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },

  //Screen3
  pinterestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
    marginTop: 30,
  },
  pinterestHeading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 15,
    color: colours.mainTexts,
  },
  pinterestDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: colours.subTexts,
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  pinterestButton: {
    marginTop: 15,
  },
  almostThereContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
    marginTop: 50,
  },
  almostThereImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  almostThereText: {
    fontSize: 28,
    textAlign: 'center',
    color: colours.mainTexts,
    marginBottom: 20,
  },
});

export default onboardingstyles;
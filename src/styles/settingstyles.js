//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const settingstyles = StyleSheet.create({
  //settings
  settingsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: colours.tertiary, 
  },
  lastSettingButton: {
    borderBottomWidth: 0,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    color: colours.mainTexts,
  },
  iconContainer: {
    marginRight: 12,
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    color: colours.darkergrey,
  },
  deleteButton: {
    backgroundColor: '#ffe6e6',
  },
  deleteText: {
    color: '#e53935',
  },
  versionText: {
    textAlign: 'center',
    color: colours.darkergrey,
    fontSize: 12,
    paddingVertical: 20,
  },

  //confirm modal
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconsContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryIcon: {
    backgroundColor: colours.buttons,
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  warningIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#585f6e',
    lineHeight: 20,
  },
  // Input field styles
  inputContainer: {
    width: '100%',
    marginVertical: 15,
    marginTop:-5,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
    color: colours.subTexts,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: colours.mainTexts,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colours.buttonsText,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default settingstyles;
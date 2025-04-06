//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import { colours, shadowStyles, typography } from './commonStyles';

const settingstyles = StyleSheet.create({
  //===== MAIN SETTINGS SCREEN STYLES =====
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
  versionText: {
    textAlign: 'center',
    color: colours.darkergrey,
    fontSize: 12,
    paddingVertical: 20,
  },
  //===== SETTING BUTTON STYLES =====
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
  //===== DELETE ACCOUNT STYLES =====
  deleteButton: {
    backgroundColor: '#ffe6e6',
  },
  deleteText: {
    color: '#e53935',
  },
  //===== MODAL STYLES =====
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
    ...shadowStyles.medium,
  },
  //Modal icon styles
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
  //Modal text styles
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
  //===== INPUT FIELD STYLES =====
  inputContainer: {
    width: '100%',
    marginVertical: 15,
    marginTop: -5,
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
  //===== BUTTON STYLES =====
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  //Cancel button
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  //Action buttons
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

  //===== PROFILE EDITOR STYLES =====
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profilePictureSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  pickImageButton: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,

    ...shadowStyles.light,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: colours.buttonsTextPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,  
    shadowRadius: 22,     
    elevation: 15,  
  },
  pickImageText: {
    color: colours.subTexts,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //Profile image control buttons
  removeImageButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    ...shadowStyles.medium,
  },
  changeImageButton: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    ...shadowStyles.medium,
  },
  removeProfilePictureButton: {
    position: 'absolute',
    left: -5,
    bottom: -5,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    ...shadowStyles.medium,
  },
  //Save button and loading state
  saveButton: {
    backgroundColor: colours.buttonsTextPink,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: 'rgba(214, 122, 152, 0.6)',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: typography.fontRegular,
  },
  //Form input styles
  profileInputContainer: {
    marginBottom: 20,
  },
});

export default settingstyles;
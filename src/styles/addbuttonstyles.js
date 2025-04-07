//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Third-party library external imports
import commonStyles, { colours, typography, shadowStyles } from './commonStyles';
import settingstyles from './settingstyles';

const addbuttonstyles = StyleSheet.create({
  //===== CONTAINER AND BACKDROP STYLES =====
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    pointerEvents: 'auto',
  },
  //===== MODAL STYLES =====
  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    width: '92%',
    maxHeight: '85%',
    ...shadowStyles.heavy,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colours.mainTexts,
  },
  scrollContainer: {
    maxHeight: '75%',
  },
  //===== TAB STYLES =====
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: colours.grey,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: 'white',
    ...shadowStyles.light,
  },
  tabButtonText: {
    color: colours.subTexts,
    fontWeight: '500',
    fontSize: 15,
  },
  activeTabButtonText: {
    color: colours.buttonsTextPink,
    fontWeight: '600',
  },
  //===== FORM SECTION STYLES =====
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colours.subTexts,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  //===== IMAGE SECTION STYLES =====
  imageSection: {
    marginBottom: 8,
    alignItems: 'center',
  },
  pickImageButton: {
    width: '100%',
    height: 160,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  pickImageText: {
    marginTop: 12,
    color: colours.subTexts,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...shadowStyles.light,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    ...shadowStyles.heavy,
  },
  //===== URL SECTION STYLES =====
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: -10,
    marginRight:4,
  },
  platformText: {
    marginRight: 4,
    color: colours.subTexts,
    fontSize: 13,
    fontWeight: '500',
  },
  //===== COLLECTION SELECTOR STYLES =====
  collectionSelectorSection: {
    marginBottom: 16,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colours.mainTexts,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: colours.secondary,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    paddingHorizontal: 5,
    ...shadowStyles.light,
  },
  picker: {
    height: 50,
    color: colours.mainTexts,
    fontFamily: typography.fontBold,
  },
  newCollectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  newCollectionInput: {
    flex: 1,
    fontSize: 15,
  },
  checkmarkButton: {
    backgroundColor: colours.buttonsTextPink,
    borderRadius: 12,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyles.light,
  },
  //===== BUTTON STYLES =====
  buttonRow: {
    ...settingstyles.buttonRow,
  },
  actionButton: {
    ...settingstyles.actionButton,
  },
  cancelButton: {
    ...settingstyles.cancelButton,
  },
  confirmButton: {
    backgroundColor: colours.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colours.mainTexts,
  },
  buttonTextWhite: {
    ...settingstyles.actionButtonText,
    color: colours.buttonsTextPink,
  },
  //===== FLOATING ADD BUTTON STYLES =====
  btnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, 
    alignItems: 'center',
    pointerEvents: 'box-none'
  },
  addBtn: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    marginLeft: -30,
    backgroundColor: colours.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyles.medium,
    zIndex: 1001,
    pointerEvents: 'auto',
  },
  //===== MENU ITEM STYLES =====
  menuItemContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column-reverse',
    marginBottom: 0,
    marginTop: 10,
  },
  menuItemButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colours.buttonsTextPink,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyles.medium,
  },
  menuItemLabel: {
    marginBottom: 4,
    fontSize: 14,
    color: colours.mainTexts,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    ...shadowStyles.light,
  },
  //===== LOADING STYLES =====
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  //===== INPUT STYLES =====
  standardInputContainer: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 15,
    ...shadowStyles.light,
  },
  standardInput: {
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
  //===== DROPDOWN STYLES =====
  customDropdownSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  //===== DROPDOWN STYLES =====
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 16,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colours.secondary,
    borderRadius: 16,
    backgroundColor: 'white',
    ...shadowStyles.light,
  },
  dropdownSelectorOpen: {
    borderColor: colours.buttonsTextPink,
  },
  dropdownSelectedText: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontRegular,
    color: colours.mainTexts,
  },
  dropdownPlaceholderText: {
    color: colours.subTexts,
    fontFamily: typography.fontRegular,
  },
  dropdownUnsortedSelectedText: {
    fontFamily: typography.fontItalic,
  },
  dropdownModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
  },
  dropdownOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxHeight: 400,
    ...shadowStyles.heavy,
    overflow: 'hidden',
  },
  dropdownOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colours.secondary,
  },
  dropdownOptionsTitle: {
    fontSize: 18,
    fontFamily: typography.fontBold,
    color: colours.mainTexts,
  },
  dropdownOptionsScroll: {
    maxHeight: 330,
  },
  dropdownOptionsContent: {
    padding: 0,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colours.secondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownPinnedOption: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  dropdownSelectedOption: {
    backgroundColor: 'rgba(214, 122, 152, 0.1)',
  },
  dropdownHighlightedOption: {
    backgroundColor: 'rgba(214, 122, 152, 0.05)',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: typography.fontRegular,
    color: colours.mainTexts,
  },
  dropdownSelectedOptionText: {
    fontFamily: typography.fontBold,
    color: colours.buttonsTextPink,
  },
  dropdownHighlightedOptionText: {
    fontWeight: '500',
  },
  dropdownUnsortedOptionText: {
    fontFamily: typography.fontItalic,
  },
  dropdownAddNewOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colours.secondary,
    backgroundColor: 'rgba(214, 122, 152, 0.05)',
  },
  dropdownAddNewOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownAddNewOptionText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: typography.fontBold,
    color: colours.buttonsTextPink,
  },
});

export default addbuttonstyles;
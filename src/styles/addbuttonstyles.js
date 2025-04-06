//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Third-party library external imports
import commonStyles, { colours } from './commonStyles';

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#f5f5f5',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  //===== IMAGE SECTION STYLES =====
  imageSection: {
    marginBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  //===== URL SECTION STYLES =====
  urlSection: {
    marginBottom: 20,
  },
  urlInput: {
    height: 50,
    fontSize: 15,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: 4,
  },
  platformText: {
    marginRight: 8,
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  //===== NOTES AND TAGS STYLES =====
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 18,
    fontSize: 15,
  },
  tagsInput: {
    marginBottom: 18,
    fontSize: 15,
  },
  //===== COLLECTION SELECTOR STYLES =====
  collectionSelectorSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    paddingHorizontal: 5,
  },
  picker: {
    height: 50,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  //===== BUTTON STYLES =====
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: colours.buttonsTextPink,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonTextWhite: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  //===== FLOATING ADD BUTTON STYLES =====
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  //===== LOADING STYLES =====
  loadingContainer: {
    ...commonStyles.loadingContainer,
  }
});

export default addbuttonstyles;
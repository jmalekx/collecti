//Common styling for all AddButton components
import { StyleSheet } from 'react-native';
import { colours } from './commonStyles';

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    maxHeight: '70%',
  },
  //===== TAB STYLES =====
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#007AFF',
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
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  //===== IMAGE SECTION STYLES =====
  imageSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  pickImageButton: {
    width: '100%',
    height: 150,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  pickImageText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  selectedImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  //===== URL SECTION STYLES =====
  urlSection: {
    marginBottom: 15,
  },
  urlInput: {
    height: 50,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  platformText: {
    marginRight: 8,
    color: '#666',
    fontSize: 14,
  },
  //===== NOTES AND TAGS STYLES =====
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  tagsInput: {
    marginBottom: 15,
  },
  //===== COLLECTION SELECTOR STYLES =====
  collectionSelectorSection: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
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
  },
  checkmarkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //===== BUTTON STYLES =====
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#F5D6E0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  menuItemLabel: {
    marginBottom: 4,
    fontSize: 12,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  //===== LOADING STYLES =====
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  }
});

export default addbuttonstyles;
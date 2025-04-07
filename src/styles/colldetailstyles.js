//React and React Native core imports
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { shadowStyles, colours } from './commonStyles';
import addbuttonstyles from './addbuttonstyles';

const colldetailstyles = StyleSheet.create({
  //===== HEADER STYLES =====
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  collectionName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 8,
    color: colours.mainTexts,
  },
  collectionDescription: {
    fontSize: 15,
    color: colours.subTexts,
    flex: 1,
    marginRight: 16,
  },
  postCount: {
    fontSize: 16,
    color: colours.darkergrey,
    fontWeight: '500',
  },
  //===== POST CARD STYLES =====
  postCard: {
    marginBottom: 6,
    padding: 16,
    backgroundColor: colours.lightestpink,
    borderRadius: 12,
    ...shadowStyles.light,
    position: 'relative',
    width: '48%',
    margin: '1%',
  },
  selectedPostCard: {
    backgroundColor: '#ebdec5',
    borderWidth: 2,
    borderColor: colours.buttons,
  },
  postTitle: {
    fontSize: 1,
    fontWeight: 'bold',
    color: colours.mainTexts,
    overflow: 'hidden',
    marginTop:8,
    marginBottom: -6,
  },
  postContentContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  //===== BUTTON STYLES =====
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  selectionButton: {
    padding: 6,
  },
  //===== SELECTION AND CHECKBOX STYLES =====
  selectionCount: {
    marginLeft: 2,
    marginTop: 10,
    fontSize: 14,
    color: colours.subTexts,
    fontWeight: '500',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  platformIconContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  //===== MODAL STYLES =====
  menuModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    ...shadowStyles.medium,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colours.secondary,
  },
  menuText: {
    fontSize: 16,
    color: colours.mainTexts,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colours.subTexts,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  //===== EMPTY STATE STYLES =====
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: colours.subTexts,
    marginTop: 16,
  },
  noCollectionsContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: colours.secondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  noCollectionsText: {
    fontSize: 16,
    color: colours.subTexts,
  },
  disabledIcon: {
    opacity: 0.4,
  },
});

export default colldetailstyles;
//React and React Native core imports
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { shadowStyles, colours } from './commonStyles';

const bookmarkstyles = StyleSheet.create({
  //===== CONTENT STYLES =====
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  //===== COLLECTION CARD STYLES =====
  collectionCard: {
    flexDirection: 'row',
    backgroundColor: colours.lightestpink,
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    ...shadowStyles.light,
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colours.mainTexts,
  },
  collectionDescription: {
    fontSize: 14,
    color: colours.subTexts,
    marginRight: 8,
  },
  bookmarkButton: {
    justifyContent: 'center',
    padding: 8,
  },
  //===== THUMBNAIL STYLES =====
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colours.grey,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  //===== EMPTY STATE STYLES =====
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colours.subTexts,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  //===== LOADING STYLES =====
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default bookmarkstyles;
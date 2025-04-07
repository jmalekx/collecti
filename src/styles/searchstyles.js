//React Native core imports
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import { colours, shadowStyles } from './commonStyles';

const searchstyles = StyleSheet.create({
  //===== SEARCH BAR STYLES =====
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.search,
    borderRadius: 25,
    height: 42,
    paddingHorizontal: 16,
    marginVertical: 10,
    ...shadowStyles.medium
  },
  searchIcon: {
    marginRight: 10,
    color: colours.subTexts,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colours.mainTexts,
    padding: 0,
  },

  //===== COLLECTION GRID STYLES =====
  resultGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  collectionCard: {
    width: '48%',
    backgroundColor: 'white',  
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadowStyles.light, 
  },
  thumbnailContainer: {
    height: 120,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 0,
  },
  //===== COLLECTION CARD CONTENT STYLES =====
  cardContent: {
    padding: 10, 
    backgroundColor: 'white', 
  },
  collectionName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colours.mainTexts, 
    marginBottom: 2,
  },
  collectionSubtext: {
    fontSize: 12,
    color: colours.subTexts, 
    marginBottom: 4,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0, 
  },
  bookmarkText: {
    fontSize: 13, 
    color: colours.buttonsTextPink, 
    marginLeft: 4,
  },
  unbookmarkableText: {
    fontSize: 13,
    color: colours.darkergrey,
  },
  //===== LOADING AND EMPTY STATE STYLES =====
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: colours.subTexts,
    maxWidth: '80%',
  },
});

export default searchstyles;
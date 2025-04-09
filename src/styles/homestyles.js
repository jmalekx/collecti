//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import { shadowStyles } from './commonStyles';

const homestyles = StyleSheet.create({
  //===== HEADER STYLES =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 22,
    color: '#666',
    marginTop: -2.5,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  fillerImage: {
    width: '100%',
    alignSelf: 'center', 
    height: 95,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  //===== SUGGESTED COLLECTIONS =====
  container: {
    marginVertical: 16,
    width: '100%',
    height: 170,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  collectionCard: {
    width: 130,
    height: 130,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...shadowStyles.light,
  },
  thumbnailContainer: {
    height: 90,
    width: '100%',
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionStats: {
    fontSize: 12,
    color: '#666',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
  //===== STATS CARDS =====
  statsCollage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 180,
    gap: 12,
  },
  statsColumn: {
    width: '48%',
    justifyContent: 'space-between',
    height: '100%',
    gap: 12,
  },
  statsCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    justifyContent: 'space-between',
  },
  statsCardLarge: {
    width: '48%',
    height: '100%',
    padding: 18,
  },
  statsCardSmall: {
    height: '48%',
    padding: 12,
  },
  statsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: -1,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginRight: 8,
  },
  statsNumberLarge: {
    fontSize: 38,
    marginRight: -1,
  },
  statsLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
    textAlign: 'left',
  },
  statsLabelLarge: {
    fontSize: 25,
    marginBottom: 6,
  },
  iconContainerLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  iconContainerSmall: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
});

export default homestyles;
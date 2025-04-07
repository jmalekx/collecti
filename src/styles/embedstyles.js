//React Native core imports
import { StyleSheet } from 'react-native';
import { colours } from './commonStyles';

const embedstyles = StyleSheet.create({
  //===== CONTAINER STYLES =====
  container: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: colours.lightestpink,
  },
  largeContainer: {
    width: '100%',
    height: 350,
    backgroundColor: colours.lightestpink,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  //===== WEBVIEW STYLES =====
  webview: {
    width: '100%',
    height: '100%',
  },
  //===== ERROR STYLES =====
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.lightestpink,
  },
  errorText: {
    color: colours.subTexts,
    fontSize: 14,
    marginBottom: 10,
  },
  //===== BUTTON STYLES =====
  retryButton: {
    backgroundColor: colours.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: colours.buttonsTextPink,
    fontWeight: '500',
  },
  //===== FALLBACK STYLES =====
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colours.lightestpink,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: colours.mainTextsexts,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: colours.subTexts,
    marginTop: 8,
    textAlign: 'center',
  },
  //===== IMAGE STYLES =====
  image: {
    width: '100%',
    height: '100%',
  },
  pinterestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colours.pinterest,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //===== OVERLAY STYLES =====
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});

export default embedstyles;
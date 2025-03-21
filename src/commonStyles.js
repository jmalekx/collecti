import { StyleSheet } from 'react-native';

const typography = {
  fontRegular: 'Inter_400Regular',
  fontBold: 'Inter_700Bold',
};

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F6F2',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    marginTop: 15,
    color: '#666',
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  option: {
    backgroundColor: "#FFDCDC",
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: "#D54B4B",
    fontWeight: "bold",
  },
  optionSelected: {
    backgroundColor: '#c0c0c0',
  },
  pinterestButton: {
    backgroundColor: '#E60023',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pinterestConnected: {
    backgroundColor: '#666',
  },
  textRegular: {
    fontFamily: typography.fontRegular,
  },
  textBold: {
    fontFamily: typography.fontBold,
  },
  textHeading: {
    fontFamily: typography.fontBold,
    fontSize: 24,
  },
  textSubheading: {
    fontFamily: typography.fontBold,
    fontSize: 18,
  },
  textBody: {
    fontFamily: typography.fontRegular,
    fontSize: 16,
  },
  textSmall: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  input: {
    backgroundColor: 'white',
    width: 300,
    height: 50,
    borderColor: '#e8e8e8',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  signContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signLink: {
      fontFamily: 'Inter_700Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
});


export { typography };
export default commonStyles;
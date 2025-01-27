import { View, Text, Button } from 'react-native';
import React from 'react';

//HEADER SECTION:
//small profile image, username/displayname, short stats (no. of collections, no. of saved posts)
//edit profile button

//MAIN SECTION:
//grid layout of collection cards (2 columns? or just stacked 1 col each)
//each collection has thmb image(of posts inside preview? or recently saved post), name, no. of posts in col
//small menu btn for edit, delete, pin
//drag and drop to reorganise collections
//create new colleciton button


const Collections = ({ navigation }) => {
  return (
    <View>
      <Text>Profile and collections here</Text>
    </View>
  );
};

export default Collections;

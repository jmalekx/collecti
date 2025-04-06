//React and React Native core imports
import React from 'react';
import { Text, Linking } from 'react-native';

//Third-party library external imports
import LinkifyIt from 'linkify-it';

//Custom component imports and styling
import { colours } from '../../styles/commonStyles';
/*
  LinkTexts Component

  Utility component rendering text with clickable URL links.
  If user chooses to paste a link into description field of a post or collection,
  uses linkify-it library to detect the urls and render as touchabele elements.
*/

//Initialise linkify-it instance
const linkify = LinkifyIt();

const LinkTexts = ({ text, style }) => {
  if (!text) return null;

  //URL detection
  const matches = linkify.match(text);
  //No URL case
  if (!matches) {
    return <Text style={style}>{text}</Text>;
  }

  const elements = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    //Add text before link as normal text
    if (match.index > lastIndex) {
      elements.push(
        <Text key={`text-${i}`} style={style}>
          {text.substring(lastIndex, match.index)}
        </Text>
      );
    }

    //Add the link element
    elements.push(
      <Text
        key={`link-${i}`}
        style={[style, { color: colours.buttonsTextPink, textDecorationLine: 'underline' }]}
        onPress={() => Linking.openURL(match.url)}
      >
        {match.text}
      </Text>
    );

    lastIndex = match.lastIndex;
  });

  //Add text after the last link as normall text
  if (lastIndex < text.length) {
    elements.push(
      <Text key={`text-last`} style={style}>
        {text.substring(lastIndex)}
      </Text>
    );
  }

  return <Text>{elements}</Text>;
};

export default LinkTexts;
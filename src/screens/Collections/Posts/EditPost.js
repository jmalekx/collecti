//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { loadPostForEditing, saveEditedPost } from '../../../services/postActionService';

//Custom component imports and styling
import commonStyles, { colours } from '../../../styles/commonStyles';
import LoadingIndicator from '../../../components/utilities/LoadingIndicator';
import { AppText, AppSubheading } from '../../../components/utilities/Typography';
import poststyles from '../../../styles/poststyles';

/*
  EditPost Screen

  Implements (MVC) Model-View-Controller pattern for post editing with proper
  service abstraction and CRUD operations, separating concerns between UI and data.
  Manages editing post metadata using service layer.
*/

const EditPost = ({ route, navigation }) => {

  //State transitions
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  //Content managing
  const { collectionId, postId } = route.params;
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  //Context states
  const toast = useToast();

  //Fetch post data on load
  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);

      // Use service to load post data
      const postData = await loadPostForEditing(collectionId, postId, toast);

      if (postData) {
        setNotes(postData.notes);
        setTags(postData.tags);
      } else {
        navigation.goBack();
      }

      setLoading(false);
    };

    fetchPostData();
  }, [collectionId, postId, toast, navigation]);

  //Form submission handler
  const handleSave = async () => {
    setIsSaving(true);

    // Use service to save post data
    const success = await saveEditedPost(
      collectionId,
      postId,
      { notes, tags },
      toast
    );

    setIsSaving(false);
    if (success) {
      navigation.goBack();
    }
  };

  //Conditional loading render while data being fetched
  if (loading) {
    return (
      <commonStyles.Bg>
        <View style={commonStyles.loadingContainer}>
          <LoadingIndicator />
        </View>
      </commonStyles.Bg>
    );
  }

  return (
    <commonStyles.Bg>
      <View style={commonStyles.container}>
        <View style={poststyles.header}>
          <TouchableOpacity
            style={poststyles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          <AppSubheading style={poststyles.headerTitle}>Edit Post Details</AppSubheading>
          <TouchableOpacity
            style={[poststyles.headerButton, poststyles.saveButton, isSaving && poststyles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingIndicator size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={poststyles.scrollContainer}>
          <View style={poststyles.formContainer}>
            <View style={poststyles.section}>
              <AppSubheading style={commonStyles.textSubheading}>Notes</AppSubheading>
              <View style={[poststyles.standardInputContainer, { minHeight: 120 }]}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={[poststyles.standardInput, poststyles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Add notes about this post..."
                    placeholderTextColor={colours.subTexts}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={poststyles.section}>
              <AppSubheading style={commonStyles.textSubheading}>Tags</AppSubheading>
              <View style={poststyles.standardInputContainer}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={poststyles.standardInput}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="Add tags (comma separated)"
                    placeholderTextColor={colours.subTexts}
                  />
                </TouchableOpacity>
              </View>
              <AppText style={poststyles.helperText}>
                Separate tags with commas (e.g., travel, inspiration, ideas)
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </commonStyles.Bg>
  );
};

export default EditPost;
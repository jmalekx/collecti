//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { loadPostForEditing, saveEditedPost } from '../../../services/postActionService';

//Custom component imports and styling
import commonStyles, { colours, shadowStyles } from '../../../styles/commonStyles';
import addbuttonstyles from '../../../styles/addbuttonstyles';
import LoadingIndicator from '../../../components/utilities/LoadingIndicator';
import { AppText, AppSubheading } from '../../../components/utilities/Typography';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          <AppSubheading style={styles.headerTitle}>Edit Post</AppSubheading>
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.section}>
              <AppSubheading style={commonStyles.textSubheading}>Notes</AppSubheading>
              <View style={styles.standardInputContainer}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={[styles.standardInput, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Add notes about this post..."
                    placeholderTextColor={colours.subTexts}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
            <AppSubheading style={commonStyles.textSubheading}>Tags</AppSubheading>
              <View style={styles.standardInputContainer}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={styles.standardInput}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="Add tags (comma separated)"
                    placeholderTextColor={colours.subTexts}
                  />
                </TouchableOpacity>
              </View>
              <AppText style={styles.helperText}>
                Separate tags with commas (e.g., travel, inspiration, ideas)
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colours.mainTexts,
  },
  saveButton: {
    backgroundColor: colours.buttonsTextPink,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    ...shadowStyles.light,
  },
  disabledButton: {
    opacity: 0.7,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 4,
  },
  section: {
    ...addbuttonstyles.section,
    marginBottom: 40,
  },
  sectionTitle: {
    ...addbuttonstyles.sectionTitle,
  },
  standardInputContainer: {
    ...addbuttonstyles.standardInputContainer,
  },
  standardInput: {
    ...addbuttonstyles.standardInput,
  },
  textArea: {
    ...addbuttonstyles.textArea,
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: colours.subTexts,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default EditPost;
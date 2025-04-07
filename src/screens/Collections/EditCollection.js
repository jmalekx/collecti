//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { getCurrentUserId } from '../../services/firebase';
import { getCollection, updateCollection } from '../../services/collections';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import commonStyles, { colours } from '../../styles/commonStyles';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
import { AppText, AppSubheading } from '../../components/utilities/Typography';
import poststyles from '../../styles/poststyles';

/*
  EditCollection Screen

  Implements (MVC) Model-View-Controller pattern for collection editing with proper
  service abstraction and CRUD operations, separating concerns between UI and data.
  Manages editing collection metadata using service layer.
*/

const EditCollection = ({ route, navigation }) => {

  //Route parameters
  const { collectionId } = route.params;

  //State transitions
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  //Context states
  const toast = useToast();

  //Initial data fetch
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setLoading(true);
        //Get current user from service
        const userId = getCurrentUserId();

        if (!userId) {
          showToast(toast, "Authentication error", { type: TOAST_TYPES.DANGER });
          navigation.goBack();
          return;
        }
        const collection = await getCollection(collectionId, userId);

        if (collection) {
          setCollectionName(collection.name);
          setCollectionDescription(collection.description || '');
        }
        else {
          showToast(toast, "Collection not found", { type: TOAST_TYPES.WARNING });
          navigation.goBack();
        }
      }
      catch (error) {
        showToast(toast, "Failed to load collection details", { type: TOAST_TYPES.DANGER });
      }
      finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [collectionId, navigation, toast]);

  //Save collection changes
  const saveChanges = async () => {
    //Input validation
    if (!collectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      setIsSaving(true);
      const userId = getCurrentUserId();

      if (!userId) {
        showToast(toast, "Authentication error", { type: TOAST_TYPES.DANGER });
        return;
      }

      await updateCollection(collectionId, {
        name: collectionName,
        description: collectionDescription,
        updatedAt: new Date().toISOString(),
      }, userId);

      showToast(toast, "Collection updated successfully", { type: TOAST_TYPES.SUCCESS });
      navigation.goBack();
    }
    catch (error) {
      showToast(toast, "Failed to update collection", { type: TOAST_TYPES.DANGER });
    }
    finally {
      setIsSaving(false);
    }
  };

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
      <View style={[commonStyles.container, {marginTop:-10}] }>
        <View style={commonStyles.customHeader}>
          <TouchableOpacity
            style={commonStyles.customHeaderBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          <AppSubheading style={commonStyles.customHeaderTitle}>Edit Collection</AppSubheading>
          <TouchableOpacity
            style={[commonStyles.customHeaderActions, poststyles.saveButton, isSaving && poststyles.disabledButton]}
            onPress={saveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingIndicator size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color={colours.tertiary}/>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={poststyles.scrollContainer}>
          <View style={poststyles.formContainer}>
            <View style={poststyles.section}>
              <AppSubheading style={commonStyles.textSubheading}>Collection Name</AppSubheading>
              <View style={poststyles.standardInputContainer}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={poststyles.standardInput}
                    value={collectionName}
                    onChangeText={setCollectionName}
                    placeholder="Enter collection name..."
                    placeholderTextColor={colours.subTexts}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={poststyles.section}>
              <AppSubheading style={commonStyles.textSubheading}>Collection Description</AppSubheading>
              <View style={[poststyles.standardInputContainer, { minHeight: 120 }]}>
                <TouchableOpacity activeOpacity={1}>
                  <TextInput
                    style={[poststyles.standardInput, poststyles.textArea]}
                    value={collectionDescription}
                    onChangeText={setCollectionDescription}
                    placeholder="Enter collection description..."
                    placeholderTextColor={colours.subTexts}
                    multiline
                    numberOfLines={4}
                  />
                </TouchableOpacity>
              </View>
              <AppText style={poststyles.helperText}>
                Add details about what this collection contains
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </commonStyles.Bg>
  );
};

export default EditCollection;
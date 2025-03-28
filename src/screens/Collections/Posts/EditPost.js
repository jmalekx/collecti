//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { loadPostForEditing, saveEditedPost } from '../../../services/postActionService';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';

//Custom component imports and styling
import commonStyles from '../../../styles/commonStyles';
import { AppHeading } from '../../../components/Typography';

/*
    EditPost Screen

    Implements (MVC) Model-View-Controller pattern for post editing with proper
    service abstraction and CRUD operations, separating concerns between UI and data.
    Manages editing post metadata using service layer.
*/

const EditPost = ({ route, navigation }) => {

    //State transitions
    const [loading, setLoading] = useState(true);

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
        // Use service to save post data
        const success = await saveEditedPost(
            collectionId, 
            postId, 
            { notes, tags }, 
            toast
        );
        
        if (success) {
            navigation.goBack();
        }
    };

    //Conditional loading render while data being fetched
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                    <Ionicons name="checkmark" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Add notes about this post..."
                />

                <Text style={styles.label}>Tags</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="Add tags (comma separated)"
                />
            </View>
        </View>
    );
};

// styles remain the same
const styles = StyleSheet.create({
    ...commonStyles,
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
});

export default EditPost;
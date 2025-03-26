//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getPost, updatePost } from '../../../services/posts';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';

//Custom component imports and styling
import commonStyles from '../../../commonStyles';
import { AppHeading } from '../../../components/Typography';

/*
    EditPost Screen

    Implements (MVC) Model-View-Controller pattern for post editing with proper
    service abstraction and CRUD operations, separating cocnerns betrween UI and data.
    Manages editing post metadata using service layer.
*/

const EditPost = ({ route, navigation }) => {

    //State transitions
    const [loading, setLoading] = useState(true);

    //Content managing
    const { collectionId, postId } = route.params;
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');

    //Contex states
    const toast = useToast();

    //Fetch post data on load
    useEffect(() => {
        //Async function to fetch post data
        const fetchPost = async () => {
            try {
                setLoading(true);
                
                //Using post service data layer
                const post = await getPost(collectionId, postId);

                if (post) {
                    //Populating form fields with post data
                    setNotes(post.notes || '');
                    setTags(post.tags?.join(', ') || '');
                } 
                else {
                    showToast(toast, "Post not found", { type: TOAST_TYPES.DANGER });
                    navigation.goBack();
                }
            } 
            catch (error) {
                console.error('Error fetching post:', error);
                showToast(toast, "Failed to load post", { type: TOAST_TYPES.DANGER });
            } 
            finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, collectionId, toast, navigation]);

    //Form submission handler
    const handleSave = async () => {
        try {
            //Prepare update data
            const updateData = {
                notes: notes,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                updatedAt: new Date().toISOString()
            };

            await updatePost(collectionId, postId, updateData);

            showToast(toast, "Post updated", { type: TOAST_TYPES.INFO });
            navigation.goBack();
        } 
        catch (error) {
            console.error('Error updating post:', error);
            showToast(toast, "Failed to update post", { type: TOAST_TYPES.DANGER });
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